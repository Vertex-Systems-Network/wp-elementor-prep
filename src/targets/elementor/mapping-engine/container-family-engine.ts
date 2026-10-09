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

/** Manifest keys every family carries besides its base digest, entries field and authority flags. */
const MANIFEST_ENVELOPE_KEYS = [
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

/** Manifest/result field naming the candidate a family writes on top of. */
function digestFieldOf(family: AnyFamily): string {
  return family.chain?.digestField ?? 'baseCandidateIdentityDigest';
}

/** Issue suffixes this family can emit: the shared set, adjusted for a chained base, plus its own. */
function issueSuffixesOf(family: AnyFamily): string[] {
  const chain = family.chain;
  const shared: string[] = chain
    ? ISSUE_SUFFIXES.map((suffix) => suffix === 'UPSTREAM_GENERATION_NOT_READY' ? chain.blockedSuffix
      : suffix.startsWith('BASE_CANDIDATE_IDENTITY_') ? suffix.replace('BASE_CANDIDATE_IDENTITY', chain.digestIssueStem) : suffix)
    : [...ISSUE_SUFFIXES];
  return [...shared, targetOf(family).notTargetSuffix, ...(family.extraIssueSuffixes ?? [])];
}

/** Every status a family result can carry, used to validate a chained prerequisite status. */
function statusesOf(family: AnyFamily): string[] {
  return ['BLOCKED_INVALID_SOURCE_IR', family.chain?.blockedStatus ?? 'BLOCKED_UPSTREAM_GENERATION',
    'REJECTED_INVALID_MANIFEST', family.statuses.none, family.statuses.resolved];
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
  prerequisiteStatus: string | null = null,
): ContainerFamilyResult {
  return {
    schemaVersion: 1,
    resultVersion: family.resultVersion,
    status,
    ...(family.chain ? { [family.chain.statusField]: prerequisiteStatus } : {}),
    sourceIrFingerprint,
    [digestFieldOf(family)]: baseCandidateIdentityDigest,
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

/** The candidate a family writes on top of: the generated base, or a chained prerequisite's result. */
type FamilyBase =
  | { ready: true; template: ElementorTemplateV04; candidate: ElementorTemplateCandidateArtifactV1; digest: string; prerequisite: ContainerFamilyResult | null }
  | { ready: false; blocked: ContainerFamilyResult };

/**
 * Resolve one family. A chained family (`family.chain`) takes the prerequisite family's manifest as
 * `prerequisiteManifestValue` and binds to that family's exact resolved candidate.
 */
export function resolveContainerPropertyFamily<Entry extends { sourceNodeId: string }, Summary extends { sourceNodeId: string }>(
  typedFamily: ContainerPropertyFamily<Entry, Summary>,
  sourceValue: unknown,
  manifestValue: unknown,
  prerequisiteManifestValue?: unknown,
): ContainerFamilyResult {
  const family = typedFamily as unknown as AnyFamily;
  const subject = family.subject;
  const manifestSubject = family.messages?.manifestSubject ?? subject;
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
  const resolvedBase = resolveBase(family, source, sourceIrFingerprint, sourceContainers.size, prerequisiteManifestValue);
  if (!resolvedBase.ready) return resolvedBase.blocked;
  const baseDigest = resolvedBase.digest;
  const prerequisite = resolvedBase.prerequisite;
  const prerequisiteStatus = prerequisite?.status ?? null;
  const digestField = digestFieldOf(family);
  const digestStem = family.chain?.digestIssueStem ?? 'BASE_CANDIDATE_IDENTITY';
  const baseNoun = family.chain?.baseNoun ?? 'base candidate';

  const issues: ContainerFamilyIssue[] = [];
  const resolutions = new Map<string, { sourceNodeId: string }>();
  const rejected = (list: ContainerFamilyIssue[]): ContainerFamilyResult => baseResult(
    family, 'REJECTED_INVALID_MANIFEST', sourceIrFingerprint, baseDigest, null, sourceContainers.size, [], list, null, null, prerequisiteStatus,
  );

  if (!isRecord(manifestValue)) {
    issues.push({ code: code(family, 'MANIFEST_NOT_OBJECT'), path: '$manifest', message: `${manifestSubject} manifest must be an object.` });
  } else {
    if (!exactKeys(manifestValue, [...MANIFEST_ENVELOPE_KEYS, digestField, target.entriesField, ...authorityFlags(family)])) {
      issues.push({ code: code(family, 'MANIFEST_FIELDS_INVALID'), path: '$manifest', message: `${manifestSubject} manifest contains unknown or missing fields.` });
    }
    if (manifestValue.schemaVersion !== 1 || manifestValue.manifestVersion !== family.manifestVersion) {
      issues.push({ code: code(family, 'MANIFEST_VERSION_INVALID'), path: '$manifest.manifestVersion', message: `${manifestSubject} manifest schema/version is unsupported.` });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({ code: code(family, 'SOURCE_FINGERPRINT_INVALID'), path: '$manifest.sourceIrFingerprint', message: 'sourceIrFingerprint must be a SHA-256 fingerprint.' });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({ code: code(family, 'SOURCE_FINGERPRINT_MISMATCH'), path: '$manifest.sourceIrFingerprint', message: 'Manifest is not bound to the exact current neutral IR.' });
    }
    if (!validFingerprint(manifestValue[digestField])) {
      issues.push({ code: code(family, `${digestStem}_INVALID`), path: `$manifest.${digestField}`, message: `${digestField} must be a SHA-256 candidate identity digest.` });
    } else if (manifestValue[digestField] !== baseDigest) {
      issues.push({ code: code(family, `${digestStem}_MISMATCH`), path: `$manifest.${digestField}`, message: `Manifest is not bound to the exact current ${baseNoun} identity.` });
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
        const parsed = family.parseEntry(raw as Record<string, unknown> & { sourceNodeId: string }, node, prerequisite ?? undefined);
        if (!parsed.ok) {
          for (const failure of 'failures' in parsed ? parsed.failures : [parsed]) {
            issues.push({ code: code(family, failure.code), path: `${path}${failure.pathSuffix ?? ''}`, message: failure.message });
          }
          continue;
        }
        resolutions.set(sourceNodeId, parsed.entry);
      }
    }
  }

  if (issues.length > 0) return rejected(issues);

  if (resolutions.size === 0) {
    return baseResult(family, family.statuses.none, sourceIrFingerprint, baseDigest, baseDigest, sourceContainers.size, [], [], resolvedBase.template, resolvedBase.candidate, prerequisiteStatus);
  }

  const template = cloneP15ReadyElementorTemplate(resolvedBase.candidate);
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
    if (family.conflictScan) {
      const scanned = family.conflictScan(settings);
      if (scanned !== null) {
        issues.push({ code: code(family, 'EXISTING_OVERRIDE_CONFLICT'), path: `$source.${sourceNodeId}`, message: scanned });
        continue;
      }
      for (const write of writes) settings[write.settingKey] = write.value;
      continue;
    }
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
  return baseResult(family, family.statuses.resolved, sourceIrFingerprint, baseDigest, resolvedIdentity.digest, sourceContainers.size, summaries, [], template, candidate, prerequisiteStatus);
}

/** The generated review-free base, or the chained prerequisite's exact ready result. */
function resolveBase(family: AnyFamily, source: P15NeutralExportDocumentV1, sourceIrFingerprint: string,
  sourceCount: number, prerequisiteManifestValue: unknown): FamilyBase {
  const chain = family.chain;
  if (chain) {
    const prerequisite = resolveContainerPropertyFamily(chain.prerequisite, source, prerequisiteManifestValue);
    const digest = prerequisite.resolvedCandidateIdentityDigest;
    if ((prerequisite.status !== chain.prerequisite.statuses.none && prerequisite.status !== chain.prerequisite.statuses.resolved)
      || prerequisite.template === null || prerequisite.candidate === null || !validFingerprint(digest)) {
      return { ready: false, blocked: baseResult(family, chain.blockedStatus, sourceIrFingerprint, null, null, sourceCount, [], [{
        code: code(family, chain.blockedSuffix), path: chain.blockedPath, message: chain.blockedMessage,
      }], null, null, prerequisite.status) };
    }
    return { ready: true, template: prerequisite.template, candidate: prerequisite.candidate, digest, prerequisite };
  }
  const generation = generateElementorV3TemplateCandidate(source);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE' || generation.template === null || generation.candidate === null) {
    return { ready: false, blocked: baseResult(family, 'BLOCKED_UPSTREAM_GENERATION', sourceIrFingerprint, null, null, sourceCount, [], [{
      code: code(family, 'UPSTREAM_GENERATION_NOT_READY'),
      path: '$source',
      message: family.messages?.upstream ?? `${family.subject} resolution requires an existing review-free generated local candidate.`,
    }], null, null) };
  }
  return { ready: true, template: generation.template, candidate: generation.candidate,
    digest: buildElementorTemplateCandidateIdentity(generation.candidate).digest, prerequisite: null };
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
  const issueCodes = new Set<string>(issueSuffixesOf(family).map((suffix) => code(family, suffix)));
  const chain = family.chain;
  const blockedStatus = chain?.blockedStatus ?? 'BLOCKED_UPSTREAM_GENERATION';
  const digestField = digestFieldOf(family);
  const baseDigest = result[digestField];
  const prerequisiteStatus = chain ? result[chain.statusField] : null;
  const validStatus = statusesOf(family).includes(result.status);
  const validPrerequisiteStatus = !chain || prerequisiteStatus === null
    || statusesOf(chain.prerequisite as AnyFamily).includes(prerequisiteStatus as string);
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
    && result.status !== blockedStatus;
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(baseDigest)
    : baseDigest === null;
  const resolvedDigestRequired = result.status === family.statuses.none || result.status === family.statuses.resolved;
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === family.statuses.resolved
    ? resolvedCount > 0 && baseDigest !== result.resolvedCandidateIdentityDigest
    : result.status === family.statuses.none
      ? resolvedCount === 0 && baseDigest === result.resolvedCandidateIdentityDigest
      : resolvedCount === 0;
  const accepted = result.status === family.statuses.none || result.status === family.statuses.resolved;
  const validIssues = Array.isArray(result.issues)
    && (accepted ? result.issues.length === 0 : result.issues.length > 0)
    && result.issues.every((issue) => isRecord(issue)
    && exactKeys(issue, ['code', 'message', 'path'])
    && typeof issue.message === 'string'
    && typeof issue.code === 'string'
    && issueCodes.has(issue.code)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024);

  if (!validStatus
    || !validPrerequisiteStatus
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
    ...(chain ? { [chain.statusField]: prerequisiteStatus } : {}),
    sourceIrFingerprint: result.sourceIrFingerprint,
    [digestField]: baseDigest,
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

