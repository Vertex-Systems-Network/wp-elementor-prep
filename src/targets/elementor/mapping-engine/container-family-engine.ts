import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from '../candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from '../import-validation-contract';
import { validateP15NeutralExportDocument, type P15NeutralExportDocumentV1 } from '../neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../neutral-export-ir-identity';
import {
  bindP15NeutralSourceToGeneratedContainers,
  cloneP15ReadyElementorTemplate,
  collectP15NeutralContainerNodes,
} from '../responsive-container-binding';
import type { ElementorTemplateV04 } from '../template-v04';
import { generateElementorV3TemplateCandidate } from '../v3-template-generator';
import type { ContainerPropertyFamily, FamilyTarget } from './property-family';
import {
  exactKeys,
  hasOwn,
  isRecord,
  onlyAllowedKeys,
  validFingerprint,
  validSourceNodeId,
} from './shared-validation';

/**
 * Shared engine for explicit, manifest-bound container property families.
 *
 * It reproduces the exact contract every P15 container resolver implemented by hand: validate the
 * neutral IR, require a review-free base candidate, bind the manifest to the exact IR fingerprint
 * and base candidate identity, refuse authority inflation, validate entries, bind entries to the
 * generated containers, refuse existing overrides, write settings, rebuild a canonical candidate and
 * report sorted summaries. Families only declare data and small parse/write hooks.
 */

export const MANIFEST_AUTHORITY_FLAGS = [
  'responsiveInferencePerformed',
  'figmaMutation',
  'networkAccess',
  'responsiveClosureClaim',
  'targetCompatibilityClaim',
  'productionAcceptance',
  'downloadEnabled',
] as const;

/** Manifest keys every family carries besides its entries field and authority flags. */
const MANIFEST_ENVELOPE_KEYS = [
  'baseCandidateIdentityDigest',
  'manifestVersion',
  'schemaVersion',
  'sourceIrFingerprint',
] as const;

export const ISSUE_SUFFIXES = [
  'SOURCE_IR_INVALID',
  'UPSTREAM_GENERATION_NOT_READY',
  'MANIFEST_NOT_OBJECT',
  'MANIFEST_FIELDS_INVALID',
  'MANIFEST_VERSION_INVALID',
  'SOURCE_FINGERPRINT_INVALID',
  'SOURCE_FINGERPRINT_MISMATCH',
  'BASE_CANDIDATE_IDENTITY_INVALID',
  'BASE_CANDIDATE_IDENTITY_MISMATCH',
  'ENTRIES_INVALID',
  'ENTRY_INVALID',
  'DUPLICATE_SOURCE_ID',
  'SOURCE_NOT_CONTAINER',
  'VALUE_INVALID',
  'OVERRIDE_REQUIRED',
  'AUTHORITY_FLAGS_INVALID',
  'GENERATOR_BINDING_MISMATCH',
  'EXISTING_OVERRIDE_CONFLICT',
  'RESOLVED_CANDIDATE_INVALID',
] as const;
export type IssueSuffix = typeof ISSUE_SUFFIXES[number];

export interface ContainerFamilyIssue {
  code: string;
  path: string;
  message: string;
}

export type ContainerFamilyStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | string;

/** Result shape shared by every container family; `summaryField` holds the sorted summaries. */
export type ContainerFamilyResult = {
  schemaVersion: 1;
  resultVersion: string;
  status: ContainerFamilyStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  /** Target counts live under the target's count fields (e.g. `sourceContainerCount`). */
  issues: ContainerFamilyIssue[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  /** Authority flags (all `false`) follow, in the family's contract order. */
  internalReviewRequired: true;
} & Record<string, unknown>;

type AnyFamily = ContainerPropertyFamily<{ sourceNodeId: string }, { sourceNodeId: string }>;

/** The default target: generated Elementor containers bound to neutral container nodes. */
export const CONTAINER_TARGET: FamilyTarget = {
  entriesField: 'containers',
  sourceCountField: 'sourceContainerCount',
  resolvedCountField: 'resolvedContainerCount',
  notTargetSuffix: 'SOURCE_NOT_CONTAINER',
  notTargetMessage: (subject) => `${subject} sourceNodeId must identify an existing neutral container node.`,
  collect: (source) => collectP15NeutralContainerNodes(source),
  bind(source, template) {
    const binding = bindP15NeutralSourceToGeneratedContainers(source, template);
    return { targets: binding.containers, issues: binding.issues };
  },
  bindingMissingMessage: (sourceNodeId) => `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
};

function targetOf(family: AnyFamily): FamilyTarget {
  return family.target ?? CONTAINER_TARGET;
}

function code(family: AnyFamily, suffix: IssueSuffix | string): string {
  return family.issueCodes?.[suffix] ?? `${family.issuePrefix}_${suffix}`;
}

/** The family's authority flags in contract order: its leading flags, then the shared ones it carries. */
function authorityFlags(family: AnyFamily): readonly string[] {
  if (family.authorityFlags) return family.authorityFlags;
  const omitted = family.omittedAuthorityFlags ?? [];
  return [...(family.leadingAuthorityFlags ?? []), ...MANIFEST_AUTHORITY_FLAGS.filter((flag) => !omitted.includes(flag))];
}

function authorityFlagValues(family: AnyFamily): Record<string, false> {
  return Object.fromEntries(authorityFlags(family).map((flag) => [flag, false]));
}

function baseResult(
  family: AnyFamily,
  status: ContainerFamilyStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  summaries: Array<{ sourceNodeId: string }>,
  issues: ContainerFamilyIssue[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): ContainerFamilyResult {
  return {
    schemaVersion: 1,
    resultVersion: family.resultVersion,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    [targetOf(family).sourceCountField]: sourceContainerCount,
    [targetOf(family).resolvedCountField]: summaries.length,
    [family.summaryField]: summaries,
    issues: issues.map((issue) => ({ ...issue })),
    template,
    candidate,
    ...authorityFlagValues(family),
    internalReviewRequired: true,
  } as ContainerFamilyResult;
}

export function resolveContainerPropertyFamily<Entry extends { sourceNodeId: string }, Summary extends { sourceNodeId: string }>(
  typedFamily: ContainerPropertyFamily<Entry, Summary>,
  sourceValue: unknown,
  manifestValue: unknown,
): ContainerFamilyResult {
  const family = typedFamily as unknown as AnyFamily;
  const subject = family.subject;
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(family, 'BLOCKED_INVALID_SOURCE_IR', null, null, null, 0, [], validation.issues.map((issue) => ({
      code: code(family, 'SOURCE_IR_INVALID'),
      path: issue.path,
      message: issue.message,
    })), null, null);
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const target = targetOf(family);
  const sourceContainers = target.collect(source);
  const baseGeneration = generateElementorV3TemplateCandidate(source);
  if (baseGeneration.status !== 'GENERATED_LOCAL_CANDIDATE'
    || baseGeneration.template === null
    || baseGeneration.candidate === null) {
    return baseResult(family, 'BLOCKED_UPSTREAM_GENERATION', sourceIrFingerprint, null, null, sourceContainers.size, [], [{
      code: code(family, 'UPSTREAM_GENERATION_NOT_READY'),
      path: '$source',
      message: family.messages?.upstream ?? `${subject} resolution requires an existing review-free generated local candidate.`,
    }], null, null);
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: ContainerFamilyIssue[] = [];
  const resolutions = new Map<string, { sourceNodeId: string }>();
  const rejected = (list: ContainerFamilyIssue[]): ContainerFamilyResult => baseResult(
    family, 'REJECTED_INVALID_MANIFEST', sourceIrFingerprint, baseIdentity.digest, null, sourceContainers.size, [], list, null, null,
  );

  if (!isRecord(manifestValue)) {
    issues.push({ code: code(family, 'MANIFEST_NOT_OBJECT'), path: '$manifest', message: `${subject} manifest must be an object.` });
  } else {
    if (!exactKeys(manifestValue, [...MANIFEST_ENVELOPE_KEYS, target.entriesField, ...authorityFlags(family)])) {
      issues.push({ code: code(family, 'MANIFEST_FIELDS_INVALID'), path: '$manifest', message: `${subject} manifest contains unknown or missing fields.` });
    }
    if (manifestValue.schemaVersion !== 1 || manifestValue.manifestVersion !== family.manifestVersion) {
      issues.push({ code: code(family, 'MANIFEST_VERSION_INVALID'), path: '$manifest.manifestVersion', message: `${subject} manifest schema/version is unsupported.` });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({ code: code(family, 'SOURCE_FINGERPRINT_INVALID'), path: '$manifest.sourceIrFingerprint', message: 'sourceIrFingerprint must be a SHA-256 fingerprint.' });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({ code: code(family, 'SOURCE_FINGERPRINT_MISMATCH'), path: '$manifest.sourceIrFingerprint', message: 'Manifest is not bound to the exact current neutral IR.' });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({ code: code(family, 'BASE_CANDIDATE_IDENTITY_INVALID'), path: '$manifest.baseCandidateIdentityDigest', message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.' });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({ code: code(family, 'BASE_CANDIDATE_IDENTITY_MISMATCH'), path: '$manifest.baseCandidateIdentityDigest', message: 'Manifest is not bound to the exact current base candidate identity.' });
    }
    if (authorityFlags(family).some((flag) => manifestValue[flag] !== false)) {
      issues.push({
        code: code(family, 'AUTHORITY_FLAGS_INVALID'),
        path: '$manifest',
        message: family.messages?.authority ?? `${subject} resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.`,
      });
    }

    const entries = manifestValue[target.entriesField];
    if (!Array.isArray(entries) || entries.length > family.maxEntries) {
      issues.push({ code: code(family, 'ENTRIES_INVALID'), path: `$manifest.${target.entriesField}`, message: family.messages?.entriesInvalid ?? `${target.entriesField} must be an array of at most ${family.maxEntries} entries.` });
    } else {
      for (let index = 0; index < entries.length; index += 1) {
        const raw: unknown = entries[index];
        const path = `$manifest.${target.entriesField}[${index}]`;
        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, family.entryKeys)
          || !(family.requiredEntryKeys ?? []).every((key) => hasOwn(raw, key))
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({ code: code(family, 'ENTRY_INVALID'), path, message: family.entryEnvelopeMessage });
          continue;
        }
        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({ code: code(family, 'DUPLICATE_SOURCE_ID'), path: `${path}.sourceNodeId`, message: family.messages?.duplicate ?? `${subject} sourceNodeId must be unique.` });
          continue;
        }
        const node = sourceContainers.get(sourceNodeId);
        if (node === undefined) {
          issues.push({ code: code(family, target.notTargetSuffix), path: `${path}.sourceNodeId`, message: family.messages?.notContainer ?? target.notTargetMessage(subject) });
          continue;
        }
        const parsed = family.parseEntry(raw as Record<string, unknown> & { sourceNodeId: string }, node);
        if (!parsed.ok) {
          issues.push({ code: code(family, parsed.code), path: `${path}${parsed.pathSuffix ?? ''}`, message: parsed.message });
          continue;
        }
        resolutions.set(sourceNodeId, parsed.entry);
      }
    }
  }

  if (issues.length > 0) return rejected(issues);

  if (resolutions.size === 0) {
    return baseResult(family, family.statuses.none, sourceIrFingerprint, baseIdentity.digest, baseIdentity.digest, sourceContainers.size, [], [], baseGeneration.template, baseGeneration.candidate);
  }

  const template = cloneP15ReadyElementorTemplate(baseGeneration.candidate);
  const binding = target.bind(source, template);
  if (binding.issues.length > 0) {
    return rejected(binding.issues.map((issue) => ({
      code: code(family, 'GENERATOR_BINDING_MISMATCH'),
      path: issue.path,
      message: issue.message,
    })));
  }

  const bindingIssues: ContainerFamilyIssue[] = [];
  for (const [sourceNodeId, entry] of resolutions) {
    const bound = binding.targets.get(sourceNodeId);
    if (!bound || !isRecord(bound.settings)) {
      (family.bindingIssuesLast ? bindingIssues : issues).push({ code: code(family, 'GENERATOR_BINDING_MISMATCH'), path: '$.content', message: family.bindingMissingMessage?.(sourceNodeId) ?? target.bindingMissingMessage(sourceNodeId) });
      continue;
    }
    const settings = bound.settings as Record<string, unknown>;
    const precondition = family.precondition?.(settings) ?? null;
    if (precondition) {
      issues.push({ code: code(family, precondition.code), path: `$source.${sourceNodeId}`, message: precondition.message });
      continue;
    }
    const writes = family.writes(entry);
    const conflicts = writes
      .map((write, order) => ({ write, rank: write.conflictRank ?? order }))
      .filter(({ write }) => write.checkConflict !== false && hasOwn(settings, write.settingKey))
      .sort((left, right) => left.rank - right.rank)
      .map(({ write }) => write);
    const reported = family.conflictMode === 'all' ? conflicts : conflicts.slice(0, 1);
    for (const conflict of reported) {
      issues.push({
        code: code(family, 'EXISTING_OVERRIDE_CONFLICT'),
        path: `$source.${sourceNodeId}`,
        message: conflict.conflictMessage ?? `Generated base candidate already contains a ${conflict.conflictSubject} override.`,
      });
    }
    if (conflicts.length > 0) continue;
    for (const write of writes) settings[write.settingKey] = write.value;
  }

  if (issues.length > 0 || bindingIssues.length > 0) return rejected([...issues, ...bindingIssues]);

  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
    || !candidate.validation.valid
    || candidate.templateJson === null) {
    return rejected([{
      code: code(family, 'RESOLVED_CANDIDATE_INVALID'),
      path: '$resolvedCandidate',
      message: family.messages?.resolvedInvalid ?? `${subject} output did not rebuild into a canonical ready Elementor candidate.`,
    }]);
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const summaries = [...resolutions.values()]
    .map((entry) => family.summarize(entry, sourceContainers.get(entry.sourceNodeId)))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));
  return baseResult(family, family.statuses.resolved, sourceIrFingerprint, baseIdentity.digest, resolvedIdentity.digest, sourceContainers.size, summaries, [], template, candidate);
}

/** Serialize only sanitized family metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeContainerPropertyFamilySummary<Entry extends { sourceNodeId: string }, Summary extends { sourceNodeId: string }>(
  typedFamily: ContainerPropertyFamily<Entry, Summary>,
  result: ContainerFamilyResult,
): string {
  const family = typedFamily as unknown as AnyFamily;
  const target = targetOf(family);
  const sourceCount = result[target.sourceCountField] as number;
  const resolvedCount = result[target.resolvedCountField] as number;
  const summaries = result[family.summaryField];
  const list = Array.isArray(summaries) ? summaries as Array<{ sourceNodeId: string }> : null;
  const issueCodes = new Set<string>([...ISSUE_SUFFIXES, target.notTargetSuffix, ...(family.extraIssueSuffixes ?? [])].map((suffix) => code(family, suffix)));
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === family.statuses.none
    || result.status === family.statuses.resolved;
  const validCounts = list !== null
    && Number.isSafeInteger(sourceCount)
    && sourceCount >= 0
    && Number.isSafeInteger(resolvedCount)
    && resolvedCount >= 0
    && resolvedCount <= sourceCount
    && resolvedCount === list.length;
  const uniqueIds = list !== null && new Set(list.map((entry) => entry.sourceNodeId)).size === list.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === family.statuses.none || result.status === family.statuses.resolved;
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === family.statuses.resolved
    ? resolvedCount > 0 && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === family.statuses.none
      ? resolvedCount === 0 && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : resolvedCount === 0;
  const validIssues = result.issues.every((issue) => isRecord(issue)
    && typeof issue.code === 'string'
    && issueCodes.has(issue.code)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024);

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !(list ?? []).every((entry) => family.validSummary(entry))
    || !validIssues
    || authorityFlags(family).some((flag) => result[flag] !== false)
    || result.internalReviewRequired !== true) {
    throw new Error(`Invalid or authority-inflated P15 ${family.serializerId ?? family.id} result.`);
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: family.resultVersion,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    [target.sourceCountField]: sourceCount,
    [target.resolvedCountField]: resolvedCount,
    [family.summaryField]: list ?? [],
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: family.evidence,
    ...authorityFlagValues(family),
    internalReviewRequired: true,
  }, null, 2)}\n`;
}

