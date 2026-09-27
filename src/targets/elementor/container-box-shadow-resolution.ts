import { buildElementorTemplateCandidateArtifact, type ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import { validateP15NeutralExportDocument, type P15NeutralExportDocumentV1 } from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import { bindP15NeutralSourceToGeneratedContainers, cloneP15ReadyElementorTemplate,
  collectP15NeutralContainerNodes } from './responsive-container-binding';
import type { ElementorTemplateV04 } from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION = 'p15-container-box-shadow-manifest-v1' as const;
export const P15_CONTAINER_BOX_SHADOW_RESULT_VERSION = 'p15-container-box-shadow-result-v1' as const;
export const P15_CONTAINER_BOX_SHADOW_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4', elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  groupSourcePath: 'includes/controls/groups/box-shadow.php',
  groupSourceBlobSha: '1c068c900db0ff2593089028d67fb6d897dbaa33',
  controlSourcePath: 'includes/controls/box-shadow.php',
  controlSourceBlobSha: 'e55cf9af34db5cc3e73dc295cd9f35b437da6fa7',
  normalGroup: 'box_shadow', hoverGroup: 'box_shadow_hover',
  normalKeys: ['box_shadow_box_shadow_type', 'box_shadow_box_shadow', 'box_shadow_box_shadow_position'] as const,
  hoverKeys: ['box_shadow_hover_box_shadow_type', 'box_shadow_hover_box_shadow', 'box_shadow_hover_box_shadow_position'] as const,
  enabledValue: 'yes', normalSelector: '{{WRAPPER}}', hoverSelector: '{{WRAPPER}}:hover',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});
export interface P15ContainerBoxShadowValueV1 {
  horizontal: number; vertical: number; blur: number; spread: number;
  color: string; position: 'outline' | 'inset';
}
export interface P15ContainerBoxShadowEntryV1 {
  sourceNodeId: string;
  normal?: P15ContainerBoxShadowValueV1;
  hover?: P15ContainerBoxShadowValueV1;
}
export interface P15ContainerBoxShadowManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ContainerBoxShadowEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}
export type P15ContainerBoxShadowIssueCode =
  | 'P15_CONTAINER_SHADOW_SOURCE_INVALID' | 'P15_CONTAINER_SHADOW_BASE_NOT_READY'
  | 'P15_CONTAINER_SHADOW_MANIFEST_INVALID' | 'P15_CONTAINER_SHADOW_ENTRY_INVALID'
  | 'P15_CONTAINER_SHADOW_SOURCE_NOT_CONTAINER' | 'P15_CONTAINER_SHADOW_DUPLICATE_SOURCE_ID'
  | 'P15_CONTAINER_SHADOW_VALUE_INVALID' | 'P15_CONTAINER_SHADOW_BINDING_MISMATCH'
  | 'P15_CONTAINER_SHADOW_KEY_CONFLICT' | 'P15_CONTAINER_SHADOW_TARGET_INVALID';
export interface P15ContainerBoxShadowIssueV1 { code: P15ContainerBoxShadowIssueCode; path: string; }
export interface P15ContainerBoxShadowResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_CONTAINER_BOX_SHADOW_RESULT_VERSION;
  status: 'BLOCKED' | 'REJECTED' | 'NO_OVERRIDES' | 'RESOLVED';
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedShadows: P15ContainerBoxShadowEntryV1[];
  issues: P15ContainerBoxShadowIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}
const manifestKeys = ['schemaVersion', 'manifestVersion', 'sourceIrFingerprint', 'baseCandidateIdentityDigest',
  'containers', 'styleInferencePerformed', 'responsiveInferencePerformed', 'figmaMutation', 'networkAccess',
  'responsiveClosureClaim', 'targetCompatibilityClaim', 'productionAcceptance', 'downloadEnabled'];
const shadowKeys = ['horizontal', 'vertical', 'blur', 'spread', 'color', 'position'];
const issueCodes: readonly P15ContainerBoxShadowIssueCode[] = [
  'P15_CONTAINER_SHADOW_SOURCE_INVALID', 'P15_CONTAINER_SHADOW_BASE_NOT_READY',
  'P15_CONTAINER_SHADOW_MANIFEST_INVALID', 'P15_CONTAINER_SHADOW_ENTRY_INVALID',
  'P15_CONTAINER_SHADOW_SOURCE_NOT_CONTAINER', 'P15_CONTAINER_SHADOW_DUPLICATE_SOURCE_ID',
  'P15_CONTAINER_SHADOW_VALUE_INVALID', 'P15_CONTAINER_SHADOW_BINDING_MISMATCH',
  'P15_CONTAINER_SHADOW_KEY_CONFLICT', 'P15_CONTAINER_SHADOW_TARGET_INVALID',
];
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && Object.keys(value).every(key => keys.includes(key));
}
function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}
function validShadow(value: unknown): value is P15ContainerBoxShadowValueV1 {
  return record(value) && exactKeys(value, shadowKeys)
    && integer(value.horizontal, -100, 100) && integer(value.vertical, -100, 100)
    && integer(value.blur, 0, 100) && integer(value.spread, -100, 100)
    && typeof value.color === 'string' && /^#[0-9a-f]{6}$/.test(value.color)
    && (value.position === 'outline' || value.position === 'inset');
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 512 && value.trim() === value;
}
function digest(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}
function cloneEntry(entry: P15ContainerBoxShadowEntryV1): P15ContainerBoxShadowEntryV1 {
  return { sourceNodeId: entry.sourceNodeId,
    ...(entry.normal === undefined ? {} : { normal: { ...entry.normal } }),
    ...(entry.hover === undefined ? {} : { hover: { ...entry.hover } }) };
}
function result(status: P15ContainerBoxShadowResultV1['status'], source: string | null,
  base: string | null, resolved: string | null, sourceContainerCount: number,
  entries: P15ContainerBoxShadowEntryV1[], issues: P15ContainerBoxShadowIssueV1[],
  template: ElementorTemplateV04 | null, candidate: ElementorTemplateCandidateArtifactV1 | null): P15ContainerBoxShadowResultV1 {
  return { schemaVersion: 1, resultVersion: P15_CONTAINER_BOX_SHADOW_RESULT_VERSION, status,
    sourceIrFingerprint: source, baseCandidateIdentityDigest: base, resolvedCandidateIdentityDigest: resolved,
    sourceContainerCount, resolvedShadows: entries.map(cloneEntry), issues: issues.map(issue => ({ ...issue })),
    template, candidate, styleInferencePerformed: false, responsiveInferencePerformed: false,
    figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
    targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false,
    internalReviewRequired: true };
}
function boxValue(shadow: P15ContainerBoxShadowValueV1): Record<string, unknown> {
  return { horizontal: shadow.horizontal, vertical: shadow.vertical,
    blur: shadow.blur, spread: shadow.spread, color: shadow.color };
}

/** Resolve only explicit Container normal/hover shadow groups from the exact 4.2.4 controls. */
export function resolveP15ContainerBoxShadows(sourceValue: unknown, manifestValue: unknown): P15ContainerBoxShadowResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) return result('BLOCKED', null, null, null, 0, [], [{ code: 'P15_CONTAINER_SHADOW_SOURCE_INVALID', path: '$source' }], null, null);
  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const sourceContainers = collectP15NeutralContainerNodes(source);
  const generated = generateElementorV3TemplateCandidate(source);
  if (generated.status !== 'GENERATED_LOCAL_CANDIDATE' || !generated.candidate || !generated.template) {
    return result('BLOCKED', sourceIrFingerprint, null, null, sourceContainers.size, [], [{ code: 'P15_CONTAINER_SHADOW_BASE_NOT_READY', path: '$source' }], null, null);
  }
  const baseDigest = buildElementorTemplateCandidateIdentity(generated.candidate).digest;
  if (!record(manifestValue) || !exactKeys(manifestValue, manifestKeys)
    || manifestValue.schemaVersion !== 1 || manifestValue.manifestVersion !== P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION
    || !digest(manifestValue.sourceIrFingerprint) || manifestValue.sourceIrFingerprint !== sourceIrFingerprint
    || !digest(manifestValue.baseCandidateIdentityDigest) || manifestValue.baseCandidateIdentityDigest !== baseDigest
    || !Array.isArray(manifestValue.containers) || manifestValue.containers.length > 10_000
    || manifestValue.styleInferencePerformed !== false || manifestValue.responsiveInferencePerformed !== false
    || manifestValue.figmaMutation !== false || manifestValue.networkAccess !== false
    || manifestValue.responsiveClosureClaim !== false || manifestValue.targetCompatibilityClaim !== false
    || manifestValue.productionAcceptance !== false || manifestValue.downloadEnabled !== false) {
    return result('REJECTED', sourceIrFingerprint, baseDigest, null, sourceContainers.size, [], [{ code: 'P15_CONTAINER_SHADOW_MANIFEST_INVALID', path: '$manifest' }], null, null);
  }
  const entries = new Map<string, P15ContainerBoxShadowEntryV1>();
  const issues: P15ContainerBoxShadowIssueV1[] = [];
  for (let index = 0; index < manifestValue.containers.length; index += 1) {
    const raw = manifestValue.containers[index]; const path = `$manifest.containers[${index}]`;
    if (!record(raw) || !validId(raw.sourceNodeId)
      || Object.keys(raw).some(key => !['sourceNodeId', 'normal', 'hover'].includes(key))
      || (!Object.prototype.hasOwnProperty.call(raw, 'normal') && !Object.prototype.hasOwnProperty.call(raw, 'hover'))) {
      issues.push({ code: 'P15_CONTAINER_SHADOW_ENTRY_INVALID', path }); continue;
    }
    const id = raw.sourceNodeId;
    if (entries.has(id)) { issues.push({ code: 'P15_CONTAINER_SHADOW_DUPLICATE_SOURCE_ID', path }); continue; }
    if (!sourceContainers.has(id)) { issues.push({ code: 'P15_CONTAINER_SHADOW_SOURCE_NOT_CONTAINER', path }); continue; }
    if ((Object.prototype.hasOwnProperty.call(raw, 'normal') && !validShadow(raw.normal))
      || (Object.prototype.hasOwnProperty.call(raw, 'hover') && !validShadow(raw.hover))) {
      issues.push({ code: 'P15_CONTAINER_SHADOW_VALUE_INVALID', path }); continue;
    }
    entries.set(id, { sourceNodeId: id,
      ...(raw.normal === undefined ? {} : { normal: { ...(raw.normal as P15ContainerBoxShadowValueV1) } }),
      ...(raw.hover === undefined ? {} : { hover: { ...(raw.hover as P15ContainerBoxShadowValueV1) } }) });
  }
  if (issues.length) return result('REJECTED', sourceIrFingerprint, baseDigest, null, sourceContainers.size, [], issues, null, null);
  if (!entries.size) return result('NO_OVERRIDES', sourceIrFingerprint, baseDigest, baseDigest, sourceContainers.size, [], [], generated.template, generated.candidate);
  const template = cloneP15ReadyElementorTemplate(generated.candidate);
  const binding = bindP15NeutralSourceToGeneratedContainers(source, template);
  if (binding.issues.length || binding.containers.size !== sourceContainers.size) {
    return result('REJECTED', sourceIrFingerprint, baseDigest, null, sourceContainers.size, [], [{ code: 'P15_CONTAINER_SHADOW_BINDING_MISMATCH', path: '$.content' }], null, null);
  }
  for (const [id, entry] of entries) {
    const target = binding.containers.get(id);
    if (!target || !record(target.settings)) {
      issues.push({ code: 'P15_CONTAINER_SHADOW_BINDING_MISMATCH', path: '$.content' }); continue;
    }
    const requested = [...(entry.normal ? P15_CONTAINER_BOX_SHADOW_EVIDENCE.normalKeys : []),
      ...(entry.hover ? P15_CONTAINER_BOX_SHADOW_EVIDENCE.hoverKeys : [])];
    if (requested.some(key => Object.prototype.hasOwnProperty.call(target.settings, key))) {
      issues.push({ code: 'P15_CONTAINER_SHADOW_KEY_CONFLICT', path: '$.content' }); continue;
    }
    for (const [shadow, keys] of [[entry.normal, P15_CONTAINER_BOX_SHADOW_EVIDENCE.normalKeys],
      [entry.hover, P15_CONTAINER_BOX_SHADOW_EVIDENCE.hoverKeys]] as const) {
      if (!shadow) continue;
      target.settings[keys[0]] = 'yes';
      target.settings[keys[1]] = boxValue(shadow);
      target.settings[keys[2]] = shadow.position === 'inset' ? 'inset' : ' ';
    }
  }
  if (issues.length) return result('REJECTED', sourceIrFingerprint, baseDigest, null, sourceContainers.size, [], issues, null, null);
  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || !candidate.validation.valid) {
    return result('REJECTED', sourceIrFingerprint, baseDigest, null, sourceContainers.size, [], [{ code: 'P15_CONTAINER_SHADOW_TARGET_INVALID', path: '$candidate' }], null, null);
  }
  return result('RESOLVED', sourceIrFingerprint, baseDigest, buildElementorTemplateCandidateIdentity(candidate).digest,
    sourceContainers.size, [...entries.values()].map(cloneEntry).sort((a, b) => a.sourceNodeId.localeCompare(b.sourceNodeId)), [], template, candidate);
}

/** Only bounded facts are emitted; private source text and candidate bytes stay out. */
export function serializeP15ContainerBoxShadowSummary(value: P15ContainerBoxShadowResultV1): string {
  if (value.schemaVersion !== 1 || value.resultVersion !== P15_CONTAINER_BOX_SHADOW_RESULT_VERSION
    || !['BLOCKED', 'REJECTED', 'NO_OVERRIDES', 'RESOLVED'].includes(value.status)
    || !Number.isSafeInteger(value.sourceContainerCount) || value.sourceContainerCount < 0
    || !Array.isArray(value.resolvedShadows) || value.resolvedShadows.length > value.sourceContainerCount
    || value.resolvedShadows.some(entry => !record(entry) || !validId(entry.sourceNodeId)
      || Object.keys(entry).some(key => !['sourceNodeId', 'normal', 'hover'].includes(key))
      || (!entry.normal && !entry.hover) || (entry.normal !== undefined && !validShadow(entry.normal))
      || (entry.hover !== undefined && !validShadow(entry.hover)))
    || new Set(value.resolvedShadows.map(entry => entry.sourceNodeId)).size !== value.resolvedShadows.length
    || !Array.isArray(value.issues) || value.issues.some(issue => !record(issue) || !exactKeys(issue, ['code', 'path'])
      || !issueCodes.includes(issue.code as P15ContainerBoxShadowIssueCode)
      || typeof issue.path !== 'string' || issue.path.length > 1024 || !/^\$(?:\.[a-zA-Z]+|\[\d+\])*$/.test(issue.path))
    || (value.sourceIrFingerprint !== null && !digest(value.sourceIrFingerprint))
    || (value.baseCandidateIdentityDigest !== null && !digest(value.baseCandidateIdentityDigest))
    || (value.resolvedCandidateIdentityDigest !== null && !digest(value.resolvedCandidateIdentityDigest))
    || value.styleInferencePerformed !== false || value.responsiveInferencePerformed !== false
    || value.figmaMutation !== false || value.networkAccess !== false
    || value.responsiveClosureClaim !== false || value.targetCompatibilityClaim !== false
    || value.productionAcceptance !== false || value.downloadEnabled !== false
    || value.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated Container box shadow result.');
  }
  return `${JSON.stringify({ schemaVersion: 1, resultVersion: P15_CONTAINER_BOX_SHADOW_RESULT_VERSION,
    status: value.status, sourceIrFingerprint: value.sourceIrFingerprint,
    baseCandidateIdentityDigest: value.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: value.resolvedCandidateIdentityDigest,
    sourceContainerCount: value.sourceContainerCount,
    resolvedShadows: value.resolvedShadows.map(cloneEntry),
    issues: value.issues.map(issue => ({ ...issue })), evidence: P15_CONTAINER_BOX_SHADOW_EVIDENCE,
    styleInferencePerformed: false, responsiveInferencePerformed: false, figmaMutation: false,
    networkAccess: false, responsiveClosureClaim: false, targetCompatibilityClaim: false,
    productionAcceptance: false, downloadEnabled: false, internalReviewRequired: true }, null, 2)}\n`;
}
