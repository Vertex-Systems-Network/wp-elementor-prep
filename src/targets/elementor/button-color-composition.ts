import { buildElementorTemplateCandidateArtifact, type ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import { validateP15NeutralExportDocument, type P15NeutralExportDocumentV1 } from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import { cloneP15ReadyElementorTemplate } from './responsive-container-binding';
import { resolveP15ElementorButtonTextColors } from './button-text-color-resolution';
import { resolveP15ElementorButtonBackgroundColors } from './button-background-color-resolution';
import { resolveP15ElementorButtonHoverTextColors } from './button-hover-text-color-resolution';
import { resolveP15ElementorButtonHoverBackgroundColors } from './button-hover-background-color-resolution';
import { resolveP15ElementorButtonHoverBorderColors } from './button-hover-border-color-resolution';
import type { ElementorElementV04, ElementorTemplateV04 } from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_BUTTON_COLOR_COMPOSITION_VERSION = 'p15-button-color-composition-v1' as const;
export const P15_BUTTON_COLOR_FAMILIES = ['normalText', 'normalBackground', 'hoverText', 'hoverBackground', 'hoverBorder'] as const;
export type P15ButtonColorFamily = typeof P15_BUTTON_COLOR_FAMILIES[number];
const keys: Record<P15ButtonColorFamily, readonly string[]> = {
  normalText: ['button_text_color'], normalBackground: ['background_background', 'background_color'],
  hoverText: ['hover_color'], hoverBackground: ['button_background_hover_background', 'button_background_hover_color'],
  hoverBorder: ['button_hover_border_color'],
};
const statuses: Record<P15ButtonColorFamily, string> = {
  normalText: 'BUTTON_TEXT_COLORS_RESOLVED', normalBackground: 'BUTTON_BACKGROUND_COLORS_RESOLVED',
  hoverText: 'BUTTON_HOVER_TEXT_COLORS_RESOLVED', hoverBackground: 'BUTTON_HOVER_BACKGROUND_COLORS_RESOLVED',
  hoverBorder: 'BUTTON_HOVER_BORDER_COLORS_RESOLVED',
};
type FamilyResult = { status: string; sourceIrFingerprint: string | null; baseCandidateIdentityDigest: string | null;
  template: ElementorTemplateV04 | null; candidate: ElementorTemplateCandidateArtifactV1 | null; issues: readonly unknown[];
  responsiveInferencePerformed: false; targetCompatibilityClaim: false; productionAcceptance: false; downloadEnabled: false };
const resolvers: Record<P15ButtonColorFamily, (source: unknown, manifest: unknown) => FamilyResult> = {
  normalText: resolveP15ElementorButtonTextColors, normalBackground: resolveP15ElementorButtonBackgroundColors,
  hoverText: resolveP15ElementorButtonHoverTextColors, hoverBackground: resolveP15ElementorButtonHoverBackgroundColors,
  hoverBorder: resolveP15ElementorButtonHoverBorderColors,
};
const manifestKeys = ['schemaVersion', 'compositionVersion', 'sourceIrFingerprint', 'baseCandidateIdentityDigest', 'families',
  'responsiveInferencePerformed', 'figmaMutation', 'networkAccess', 'responsiveClosureClaim', 'targetCompatibilityClaim',
  'productionAcceptance', 'downloadEnabled'];
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function exactKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).length === allowed.length && Object.keys(value).every(key => allowed.includes(key));
}
function digest(value: unknown): value is string { return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value); }

export interface P15ButtonColorCompositionManifestV1 {
  schemaVersion: 1; compositionVersion: typeof P15_BUTTON_COLOR_COMPOSITION_VERSION;
  sourceIrFingerprint: string; baseCandidateIdentityDigest: string;
  families: Partial<Record<P15ButtonColorFamily, unknown>>;
  responsiveInferencePerformed: false; figmaMutation: false; networkAccess: false; responsiveClosureClaim: false;
  targetCompatibilityClaim: false; productionAcceptance: false; downloadEnabled: false;
}
export type P15ButtonColorCompositionIssueCode = 'SOURCE_INVALID' | 'BASE_NOT_READY' | 'MANIFEST_INVALID'
  | 'FAMILY_REJECTED' | 'FAMILY_DRIFT' | 'KEY_CONFLICT' | 'TARGET_INVALID';
export interface P15ButtonColorCompositionResultV1 {
  schemaVersion: 1; compositionVersion: typeof P15_BUTTON_COLOR_COMPOSITION_VERSION;
  status: 'BLOCKED' | 'REJECTED' | 'RESOLVED'; sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null; resolvedCandidateIdentityDigest: string | null;
  appliedFamilies: P15ButtonColorFamily[];
  issues: Array<{ code: P15ButtonColorCompositionIssueCode; family: P15ButtonColorFamily | null }>;
  template: ElementorTemplateV04 | null; candidate: ElementorTemplateCandidateArtifactV1 | null;
  responsiveInferencePerformed: false; figmaMutation: false; networkAccess: false; responsiveClosureClaim: false;
  targetCompatibilityClaim: false; productionAcceptance: false; downloadEnabled: false; internalReviewRequired: true;
}
function result(status: P15ButtonColorCompositionResultV1['status'], source: string | null, base: string | null,
  resolved: string | null, applied: P15ButtonColorFamily[], code: P15ButtonColorCompositionIssueCode | null,
  family: P15ButtonColorFamily | null, template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null): P15ButtonColorCompositionResultV1 {
  return { schemaVersion: 1, compositionVersion: P15_BUTTON_COLOR_COMPOSITION_VERSION, status,
    sourceIrFingerprint: source, baseCandidateIdentityDigest: base, resolvedCandidateIdentityDigest: resolved,
    appliedFamilies: [...applied], issues: code ? [{ code, family }] : [], template, candidate,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
    targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false, internalReviewRequired: true };
}

/** Compare the entire generated tree and apply only new, exact Button keys. */
function mergeTree(base: readonly ElementorElementV04[], family: readonly ElementorElementV04[],
  target: ElementorElementV04[], allowed: readonly string[]): 'FAMILY_DRIFT' | 'KEY_CONFLICT' | null {
  if (base.length !== family.length || base.length !== target.length) return 'FAMILY_DRIFT';
  for (let i = 0; i < base.length; i += 1) {
    const a = base[i], b = family[i], c = target[i];
    if (!a || !b || !c || a.id !== b.id || a.id !== c.id || a.elType !== b.elType || a.elType !== c.elType
      || a.isInner !== b.isInner || a.isInner !== c.isInner
      || !record(a.settings) || !record(b.settings) || !record(c.settings)) return 'FAMILY_DRIFT';
    const shape = (node: ElementorElementV04): unknown => ({ ...node, settings: null, elements: null });
    if (JSON.stringify(shape(a)) !== JSON.stringify(shape(b)) || JSON.stringify(shape(a)) !== JSON.stringify(shape(c))) return 'FAMILY_DRIFT';
    for (const [key, value] of Object.entries(a.settings)) {
      if (!Object.prototype.hasOwnProperty.call(b.settings, key) || JSON.stringify(value) !== JSON.stringify(b.settings[key])) return 'FAMILY_DRIFT';
    }
    for (const [key, value] of Object.entries(b.settings)) {
      if (Object.prototype.hasOwnProperty.call(a.settings, key)) continue;
      if (a.elType !== 'widget' || a.widgetType !== 'button' || !allowed.includes(key)) return 'FAMILY_DRIFT';
      if (Object.prototype.hasOwnProperty.call(c.settings, key)) return 'KEY_CONFLICT';
      c.settings[key] = value;
    }
    const childIssue = mergeTree(a.elements, b.elements, c.elements, allowed);
    if (childIssue) return childIssue;
  }
  return null;
}

export function composeP15ButtonColors(sourceValue: unknown, manifestValue: unknown): P15ButtonColorCompositionResultV1 {
  const invalid = (code: P15ButtonColorCompositionIssueCode, source: string | null, base: string | null,
    family: P15ButtonColorFamily | null = null, status: 'BLOCKED' | 'REJECTED' = 'REJECTED') =>
    result(status, source, base, null, [], code, family, null, null);
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) return invalid('SOURCE_INVALID', null, null, null, 'BLOCKED');
  const source = sourceValue as P15NeutralExportDocumentV1;
  const fingerprint = fingerprintP15NeutralExportDocument(source);
  const generated = generateElementorV3TemplateCandidate(source);
  if (generated.status !== 'GENERATED_LOCAL_CANDIDATE' || !generated.candidate || !generated.template)
    return invalid('BASE_NOT_READY', fingerprint, null, null, 'BLOCKED');
  const base = buildElementorTemplateCandidateIdentity(generated.candidate).digest;
  if (!record(manifestValue) || !exactKeys(manifestValue, manifestKeys) || manifestValue.schemaVersion !== 1
    || manifestValue.compositionVersion !== P15_BUTTON_COLOR_COMPOSITION_VERSION
    || manifestValue.sourceIrFingerprint !== fingerprint || manifestValue.baseCandidateIdentityDigest !== base
    || !record(manifestValue.families) || Object.keys(manifestValue.families).length === 0
    || Object.keys(manifestValue.families).some(key => !P15_BUTTON_COLOR_FAMILIES.includes(key as P15ButtonColorFamily))
    || manifestValue.responsiveInferencePerformed !== false || manifestValue.figmaMutation !== false
    || manifestValue.networkAccess !== false || manifestValue.responsiveClosureClaim !== false
    || manifestValue.targetCompatibilityClaim !== false || manifestValue.productionAcceptance !== false
    || manifestValue.downloadEnabled !== false) return invalid('MANIFEST_INVALID', fingerprint, base);
  const template = cloneP15ReadyElementorTemplate(generated.candidate);
  const applied: P15ButtonColorFamily[] = [];
  for (const family of P15_BUTTON_COLOR_FAMILIES) {
    if (!Object.prototype.hasOwnProperty.call(manifestValue.families, family)) continue;
    const resolved = resolvers[family](source, manifestValue.families[family]);
    if (resolved.status !== statuses[family] || !resolved.candidate || !resolved.template || resolved.issues.length
      || resolved.sourceIrFingerprint !== fingerprint || resolved.baseCandidateIdentityDigest !== base
      || resolved.responsiveInferencePerformed !== false || resolved.targetCompatibilityClaim !== false
      || resolved.productionAcceptance !== false || resolved.downloadEnabled !== false)
      return invalid('FAMILY_REJECTED', fingerprint, base, family);
    const drift = mergeTree(generated.template.content, resolved.template.content, template.content, keys[family]);
    if (drift) return invalid(drift, fingerprint, base, family);
    applied.push(family);
  }
  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || !candidate.validation.valid)
    return invalid('TARGET_INVALID', fingerprint, base);
  return result('RESOLVED', fingerprint, base, buildElementorTemplateCandidateIdentity(candidate).digest,
    applied, null, null, template, candidate);
}

/** Never serialize source text, candidate bytes or caller-provided nested manifests. */
export function serializeP15ButtonColorCompositionSummary(value: P15ButtonColorCompositionResultV1): string {
  const codes: P15ButtonColorCompositionIssueCode[] = ['SOURCE_INVALID', 'BASE_NOT_READY', 'MANIFEST_INVALID',
    'FAMILY_REJECTED', 'FAMILY_DRIFT', 'KEY_CONFLICT', 'TARGET_INVALID'];
  if (value.schemaVersion !== 1 || value.compositionVersion !== P15_BUTTON_COLOR_COMPOSITION_VERSION
    || !['BLOCKED', 'REJECTED', 'RESOLVED'].includes(value.status)
    || (value.sourceIrFingerprint !== null && !digest(value.sourceIrFingerprint))
    || (value.baseCandidateIdentityDigest !== null && !digest(value.baseCandidateIdentityDigest))
    || (value.resolvedCandidateIdentityDigest !== null && !digest(value.resolvedCandidateIdentityDigest))
    || !Array.isArray(value.appliedFamilies) || value.appliedFamilies.some(x => !P15_BUTTON_COLOR_FAMILIES.includes(x))
    || new Set(value.appliedFamilies).size !== value.appliedFamilies.length
    || !Array.isArray(value.issues) || value.issues.some(x => !record(x) || !exactKeys(x, ['code', 'family'])
      || !codes.includes(x.code as P15ButtonColorCompositionIssueCode)
      || (x.family !== null && !P15_BUTTON_COLOR_FAMILIES.includes(x.family as P15ButtonColorFamily)))
    || (value.status === 'RESOLVED' && (!digest(value.sourceIrFingerprint) || !digest(value.baseCandidateIdentityDigest)
      || !digest(value.resolvedCandidateIdentityDigest) || !value.appliedFamilies.length || value.issues.length))
    || (value.status !== 'RESOLVED' && (value.resolvedCandidateIdentityDigest !== null || value.appliedFamilies.length || value.issues.length !== 1))
    || value.responsiveInferencePerformed !== false || value.figmaMutation !== false || value.networkAccess !== false
    || value.responsiveClosureClaim !== false || value.targetCompatibilityClaim !== false
    || value.productionAcceptance !== false || value.downloadEnabled !== false || value.internalReviewRequired !== true)
    throw new Error('Invalid or authority-inflated Button color composition result.');
  return `${JSON.stringify({ schemaVersion: 1, compositionVersion: P15_BUTTON_COLOR_COMPOSITION_VERSION,
    status: value.status, sourceIrFingerprint: value.sourceIrFingerprint,
    baseCandidateIdentityDigest: value.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: value.resolvedCandidateIdentityDigest,
    appliedFamilies: value.appliedFamilies, issues: value.issues,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false, productionAcceptance: false,
    downloadEnabled: false, internalReviewRequired: true }, null, 2)}\n`;
}
