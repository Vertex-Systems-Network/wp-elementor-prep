import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from '../candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from '../import-validation-contract';
import { validateP15NeutralExportDocument, type P15NeutralExportDocumentV1 } from '../neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../neutral-export-ir-identity';
import { bindP15NeutralSourceToGeneratedContainers, cloneP15ReadyElementorTemplate } from '../responsive-container-binding';
import type { ElementorElementV04, ElementorTemplateV04 } from '../template-v04';
import { generateElementorV3TemplateCandidate } from '../v3-template-generator';
import { exactKeys, hasOwn as own, isRecord, validFingerprint as digest } from './shared-validation';

/**
 * One ordered composer for applying several independently validated property families to one tree.
 *
 * Each family still runs its own exact resolver against the same source and base candidate. The
 * composer then proves the family changed nothing but its own allowlisted setting keys, and merges
 * those additions into one shared candidate in a fixed family order. Key ownership is single: a
 * setting key belongs to the base candidate or to exactly one family, and a second writer is a
 * KEY_CONFLICT, never an overwrite. Any refusal rejects the whole composition with no template.
 */

export const COMPOSITION_ISSUE_KINDS = [
  'SOURCE_INVALID',
  'BASE_NOT_READY',
  'MANIFEST_INVALID',
  'BINDING_MISMATCH',
  'FAMILY_REJECTED',
  'FAMILY_DRIFT',
  'KEY_CONFLICT',
  'TARGET_INVALID',
] as const;
export type CompositionIssueKind = typeof COMPOSITION_ISSUE_KINDS[number];

const AUTHORITY_FLAGS = [
  'responsiveInferencePerformed',
  'figmaMutation',
  'networkAccess',
  'responsiveClosureClaim',
  'targetCompatibilityClaim',
  'productionAcceptance',
  'downloadEnabled',
] as const;

const MANIFEST_KEYS = ['schemaVersion', 'compositionVersion', 'sourceIrFingerprint', 'baseCandidateIdentityDigest',
  'families', ...AUTHORITY_FLAGS] as const;

/** The fields of a family resolver result the composer relies on. */
export interface ComposedFamilyResult {
  status: string;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  issues: readonly unknown[];
  responsiveInferencePerformed: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

/** One composable family: its exact resolver, its resolved status and the only keys it may add. */
export interface CompositionStep {
  resolve(source: unknown, manifest: unknown): ComposedFamilyResult;
  resolvedStatus: string;
  keys: readonly string[];
}

/**
 * How family additions are located and merged:
 * - `containers`: through the neutral-source container binding; every other node must stay byte-identical.
 * - `widgets`: by walking the whole generated tree in parallel; only nodes accepted by `accepts` may change.
 */
export type CompositionMerge =
  | { kind: 'containers' }
  | { kind: 'widgets'; accepts(node: ElementorElementV04): boolean };

export interface CompositionSpec<Family extends string> {
  readonly version: string;
  /** Application order; the manifest's key order never changes it. */
  readonly families: readonly Family[];
  readonly steps: Readonly<Record<Family, CompositionStep>>;
  readonly merge: CompositionMerge;
  /** Prefix for issue codes, e.g. `P15_CONTAINER_COMPOSITION_` (or empty). */
  readonly issuePrefix: string;
  /** Subject of the serializer refusal, e.g. `Container style`. */
  readonly subject: string;
  /** Non-resolved results carry exactly one issue (`one`) or at least one (`some`). */
  readonly refusalIssueCount: 'one' | 'some';
}

export interface CompositionIssue<Family extends string> {
  code: string;
  family: Family | null;
}

export interface CompositionResult<Family extends string> {
  schemaVersion: 1;
  compositionVersion: string;
  status: 'BLOCKED' | 'REJECTED' | 'RESOLVED';
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  appliedFamilies: Family[];
  issues: CompositionIssue<Family>[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

function result<Family extends string>(spec: CompositionSpec<Family>, status: CompositionResult<Family>['status'],
  source: string | null, base: string | null, resolved: string | null, applied: Family[],
  issues: CompositionIssue<Family>[], template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null): CompositionResult<Family> {
  return { schemaVersion: 1, compositionVersion: spec.version, status,
    sourceIrFingerprint: source, baseCandidateIdentityDigest: base, resolvedCandidateIdentityDigest: resolved,
    appliedFamilies: [...applied], issues: issues.map((issue) => ({ ...issue })), template, candidate,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false,
    productionAcceptance: false, downloadEnabled: false, internalReviewRequired: true };
}

type MergeOutcome = 'FAMILY_DRIFT' | 'KEY_CONFLICT' | null;

/** Merge one family's new keys on one bound node pair; base keys must be unchanged in the family output. */
function mergeSettings(base: Record<string, unknown>, family: Record<string, unknown>, target: Record<string, unknown>,
  allowed: readonly string[], accepts: boolean): MergeOutcome {
  if (Object.keys(base).some((key) => !own(family, key) || !same(base[key], family[key]))) return 'FAMILY_DRIFT';
  for (const [key, value] of Object.entries(family)) {
    if (own(base, key)) continue;
    if (!accepts || !allowed.includes(key)) return 'FAMILY_DRIFT';
    if (own(target, key)) return 'KEY_CONFLICT';
    target[key] = value;
  }
  return null;
}

/** Parallel walk of the whole generated tree: shape and ids must match; only accepted nodes may change. */
function mergeTree(base: readonly ElementorElementV04[], family: readonly ElementorElementV04[], target: ElementorElementV04[],
  allowed: readonly string[], accepts: (node: ElementorElementV04) => boolean): MergeOutcome {
  if (base.length !== family.length || base.length !== target.length) return 'FAMILY_DRIFT';
  for (let i = 0; i < base.length; i += 1) {
    const a = base[i], b = family[i], c = target[i];
    if (!a || !b || !c || a.id !== b.id || a.id !== c.id || a.elType !== b.elType || a.elType !== c.elType
      || a.isInner !== b.isInner || a.isInner !== c.isInner
      || !isRecord(a.settings) || !isRecord(b.settings) || !isRecord(c.settings)) return 'FAMILY_DRIFT';
    const shape = (node: ElementorElementV04): unknown => ({ ...node, settings: null, elements: null });
    if (!same(shape(a), shape(b)) || !same(shape(a), shape(c))) return 'FAMILY_DRIFT';
    const merged = mergeSettings(a.settings, b.settings, c.settings, allowed, accepts(a));
    if (merged) return merged;
    const child = mergeTree(a.elements, b.elements, c.elements, allowed, accepts);
    if (child) return child;
  }
  return null;
}

/** Merge through the container binding, then require the family tree minus its additions to equal the base. */
function mergeContainers(source: P15NeutralExportDocumentV1, baseTemplate: ElementorTemplateV04,
  baseBinding: ReturnType<typeof bindP15NeutralSourceToGeneratedContainers>,
  targetBinding: ReturnType<typeof bindP15NeutralSourceToGeneratedContainers>,
  resolved: ComposedFamilyResult & { template: ElementorTemplateV04; candidate: ElementorTemplateCandidateArtifactV1 },
  allowed: readonly string[]): MergeOutcome {
  const familyBinding = bindP15NeutralSourceToGeneratedContainers(source, resolved.template);
  if (familyBinding.issues.length || familyBinding.containers.size !== baseBinding.containers.size) return 'FAMILY_DRIFT';
  for (const [id, baseNode] of baseBinding.containers) {
    const familyNode = familyBinding.containers.get(id);
    const targetNode = targetBinding.containers.get(id);
    if (!familyNode || !targetNode || !isRecord(baseNode.settings) || !isRecord(familyNode.settings)
      || !isRecord(targetNode.settings)) return 'FAMILY_DRIFT';
    const merged = mergeSettings(baseNode.settings, familyNode.settings, targetNode.settings, allowed, true);
    if (merged) return merged;
  }
  const normalized = cloneP15ReadyElementorTemplate(resolved.candidate);
  for (const [id, node] of bindP15NeutralSourceToGeneratedContainers(source, normalized).containers) {
    const baseNode = baseBinding.containers.get(id);
    if (!baseNode) return 'FAMILY_DRIFT';
    node.settings = JSON.parse(JSON.stringify(baseNode.settings)) as typeof node.settings;
  }
  return same(normalized, baseTemplate) ? null : 'FAMILY_DRIFT';
}

/** Apply the manifest's families in spec order to one candidate built from the review-free base. */
export function composeFamilies<Family extends string>(spec: CompositionSpec<Family>, sourceValue: unknown,
  manifestValue: unknown): CompositionResult<Family> {
  const refuse = (kind: CompositionIssueKind, source: string | null, base: string | null, family: Family | null = null,
    status: 'BLOCKED' | 'REJECTED' = 'REJECTED') =>
    result(spec, status, source, base, null, [], [{ code: `${spec.issuePrefix}${kind}`, family }], null, null);
  if (!validateP15NeutralExportDocument(sourceValue).valid) return refuse('SOURCE_INVALID', null, null, null, 'BLOCKED');
  const source = sourceValue as P15NeutralExportDocumentV1;
  const fingerprint = fingerprintP15NeutralExportDocument(source);
  const generation = generateElementorV3TemplateCandidate(source);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE' || !generation.candidate || !generation.template) {
    return refuse('BASE_NOT_READY', fingerprint, null, null, 'BLOCKED');
  }
  const base = buildElementorTemplateCandidateIdentity(generation.candidate).digest;
  if (!isRecord(manifestValue) || !exactKeys(manifestValue, MANIFEST_KEYS)
    || manifestValue.schemaVersion !== 1 || manifestValue.compositionVersion !== spec.version
    || manifestValue.sourceIrFingerprint !== fingerprint || manifestValue.baseCandidateIdentityDigest !== base
    || AUTHORITY_FLAGS.some((flag) => manifestValue[flag] !== false)
    || !isRecord(manifestValue.families) || Object.keys(manifestValue.families).length === 0
    || Object.keys(manifestValue.families).some((key) => !spec.families.includes(key as Family))) {
    return refuse('MANIFEST_INVALID', fingerprint, base);
  }
  const families = manifestValue.families;
  const template = cloneP15ReadyElementorTemplate(generation.candidate);
  const merge = spec.merge;
  const bindings = merge.kind === 'containers'
    ? { base: bindP15NeutralSourceToGeneratedContainers(source, generation.template),
      target: bindP15NeutralSourceToGeneratedContainers(source, template) }
    : null;
  if (bindings && (bindings.base.issues.length || bindings.target.issues.length)) return refuse('BINDING_MISMATCH', fingerprint, base);
  const applied: Family[] = [];
  for (const family of spec.families) {
    if (!own(families, family)) continue;
    const step = spec.steps[family];
    const resolved = step.resolve(source, families[family]);
    if (resolved.status !== step.resolvedStatus || !resolved.candidate || !resolved.template || resolved.issues.length
      || resolved.sourceIrFingerprint !== fingerprint || resolved.baseCandidateIdentityDigest !== base
      || resolved.responsiveInferencePerformed !== false || resolved.targetCompatibilityClaim !== false
      || resolved.productionAcceptance !== false || resolved.downloadEnabled !== false) {
      return refuse('FAMILY_REJECTED', fingerprint, base, family);
    }
    // The merged template must be exactly the family's candidate, so the merge and the drift check see one tree.
    if (resolved.candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
      || !same(cloneP15ReadyElementorTemplate(resolved.candidate), resolved.template)) return refuse('FAMILY_DRIFT', fingerprint, base, family);
    const outcome = bindings
      ? mergeContainers(source, generation.template, bindings.base, bindings.target,
        resolved as typeof resolved & { template: ElementorTemplateV04; candidate: ElementorTemplateCandidateArtifactV1 }, step.keys)
      : mergeTree(generation.template.content, resolved.template.content, template.content, step.keys,
        (merge as Extract<CompositionMerge, { kind: 'widgets' }>).accepts);
    if (outcome) return refuse(outcome, fingerprint, base, family);
    applied.push(family);
  }
  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || !candidate.validation.valid) {
    return refuse('TARGET_INVALID', fingerprint, base);
  }
  return result(spec, 'RESOLVED', fingerprint, base, buildElementorTemplateCandidateIdentity(candidate).digest,
    applied, [], template, candidate);
}

/** Serialize only identities, applied families and issue codes: no source text, candidate bytes or nested manifests. */
export function serializeCompositionSummary<Family extends string>(spec: CompositionSpec<Family>,
  value: CompositionResult<Family>): string {
  const codes = COMPOSITION_ISSUE_KINDS.map((kind) => `${spec.issuePrefix}${kind}`);
  const known = (family: unknown): boolean => spec.families.includes(family as Family);
  const issuesValid = Array.isArray(value.issues) && value.issues.every((issue) => isRecord(issue)
    && exactKeys(issue, ['code', 'family']) && codes.includes(issue.code as string) && (issue.family === null || known(issue.family)));
  const appliedValid = Array.isArray(value.appliedFamilies) && value.appliedFamilies.every(known)
    && new Set(value.appliedFamilies).size === value.appliedFamilies.length;
  const refusalCountValid = spec.refusalIssueCount === 'one' ? value.issues?.length === 1 : value.issues?.length > 0;
  if (value.schemaVersion !== 1 || value.compositionVersion !== spec.version
    || !['BLOCKED', 'REJECTED', 'RESOLVED'].includes(value.status)
    || (value.sourceIrFingerprint !== null && !digest(value.sourceIrFingerprint))
    || (value.baseCandidateIdentityDigest !== null && !digest(value.baseCandidateIdentityDigest))
    || (value.resolvedCandidateIdentityDigest !== null && !digest(value.resolvedCandidateIdentityDigest))
    || !appliedValid || !issuesValid
    || (value.status === 'RESOLVED' && (!digest(value.sourceIrFingerprint) || !digest(value.baseCandidateIdentityDigest)
      || !digest(value.resolvedCandidateIdentityDigest) || value.appliedFamilies.length === 0 || value.issues.length !== 0))
    || (value.status !== 'RESOLVED' && (value.resolvedCandidateIdentityDigest !== null
      || value.appliedFamilies.length !== 0 || !refusalCountValid))
    || AUTHORITY_FLAGS.some((flag) => value[flag] !== false) || value.internalReviewRequired !== true) {
    throw new Error(`Invalid or authority-inflated ${spec.subject} composition result.`);
  }
  return `${JSON.stringify({ schemaVersion: 1, compositionVersion: spec.version,
    status: value.status, sourceIrFingerprint: value.sourceIrFingerprint,
    baseCandidateIdentityDigest: value.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: value.resolvedCandidateIdentityDigest,
    appliedFamilies: value.appliedFamilies, issues: value.issues,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false, productionAcceptance: false,
    downloadEnabled: false, internalReviewRequired: true }, null, 2)}\n`;
}
