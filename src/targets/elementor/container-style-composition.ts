import { buildElementorTemplateCandidateArtifact, type ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import { validateP15NeutralExportDocument, type P15NeutralExportDocumentV1 } from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import {
  bindP15NeutralSourceToGeneratedContainers,
  cloneP15ReadyElementorTemplate,
} from './responsive-container-binding';
import { resolveP15ElementorContainerBorderStyles } from './container-border-style-resolution';
import { resolveP15ElementorContainerHoverBorderStyles } from './container-hover-border-style-resolution';
import { resolveP15ElementorContainerOverlayColor } from './container-overlay-color-resolution';
import { resolveP15ElementorContainerHoverOverlayColor } from './container-hover-overlay-color-resolution';
import type { ElementorTemplateV04 } from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_CONTAINER_STYLE_COMPOSITION_VERSION = 'p15-container-style-composition-v1' as const;
export const P15_CONTAINER_STYLE_FAMILIES = [
  'normalBorder', 'hoverBorder', 'normalOverlay', 'hoverOverlay',
] as const;
export type P15ContainerStyleFamily = typeof P15_CONTAINER_STYLE_FAMILIES[number];

export interface P15ContainerStyleCompositionManifestV1 {
  schemaVersion: 1;
  compositionVersion: typeof P15_CONTAINER_STYLE_COMPOSITION_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  families: Partial<Record<P15ContainerStyleFamily, unknown>>;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ContainerStyleCompositionIssueCode =
  | 'P15_CONTAINER_COMPOSITION_SOURCE_INVALID'
  | 'P15_CONTAINER_COMPOSITION_BASE_NOT_READY'
  | 'P15_CONTAINER_COMPOSITION_MANIFEST_INVALID'
  | 'P15_CONTAINER_COMPOSITION_BINDING_MISMATCH'
  | 'P15_CONTAINER_COMPOSITION_FAMILY_REJECTED'
  | 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT'
  | 'P15_CONTAINER_COMPOSITION_KEY_CONFLICT'
  | 'P15_CONTAINER_COMPOSITION_TARGET_INVALID';

export interface P15ContainerStyleCompositionIssueV1 {
  code: P15ContainerStyleCompositionIssueCode;
  family: P15ContainerStyleFamily | null;
}

export interface P15ContainerStyleCompositionResultV1 {
  schemaVersion: 1;
  compositionVersion: typeof P15_CONTAINER_STYLE_COMPOSITION_VERSION;
  status: 'BLOCKED' | 'REJECTED' | 'RESOLVED';
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  appliedFamilies: P15ContainerStyleFamily[];
  issues: P15ContainerStyleCompositionIssueV1[];
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

type FamilyResult = {
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
};

const resolvers: Record<P15ContainerStyleFamily, (source: unknown, manifest: unknown) => FamilyResult> = {
  normalBorder: resolveP15ElementorContainerBorderStyles,
  hoverBorder: resolveP15ElementorContainerHoverBorderStyles,
  normalOverlay: resolveP15ElementorContainerOverlayColor,
  hoverOverlay: resolveP15ElementorContainerHoverOverlayColor,
};

const allowedKeys: Record<P15ContainerStyleFamily, readonly string[]> = {
  normalBorder: ['border_border', 'border_color', 'border_width', 'border_width_tablet', 'border_width_mobile'],
  hoverBorder: ['border_hover_border', 'border_hover_color', 'border_hover_width', 'border_hover_width_tablet', 'border_hover_width_mobile'],
  normalOverlay: ['background_overlay_background', 'background_overlay_color', 'background_overlay_opacity', 'background_overlay_opacity_tablet', 'background_overlay_opacity_mobile'],
  hoverOverlay: ['background_overlay_hover_background', 'background_overlay_hover_color', 'background_overlay_hover_opacity', 'background_overlay_hover_opacity_tablet', 'background_overlay_hover_opacity_mobile'],
};

const manifestKeys = ['schemaVersion', 'compositionVersion', 'sourceIrFingerprint', 'baseCandidateIdentityDigest',
  'families', 'responsiveInferencePerformed', 'figmaMutation', 'networkAccess', 'responsiveClosureClaim',
  'targetCompatibilityClaim', 'productionAcceptance', 'downloadEnabled'];

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && Object.keys(value).every(key => keys.includes(key));
}
function digest(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}
function result(status: P15ContainerStyleCompositionResultV1['status'], source: string | null,
  base: string | null, resolved: string | null, applied: P15ContainerStyleFamily[],
  issues: P15ContainerStyleCompositionIssueV1[], template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null): P15ContainerStyleCompositionResultV1 {
  return { schemaVersion: 1, compositionVersion: P15_CONTAINER_STYLE_COMPOSITION_VERSION,
    status, sourceIrFingerprint: source, baseCandidateIdentityDigest: base,
    resolvedCandidateIdentityDigest: resolved, appliedFamilies: [...applied],
    issues: issues.map(issue => ({ ...issue })), template, candidate,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false,
    productionAcceptance: false, downloadEnabled: false, internalReviewRequired: true };
}

/** Re-run each exact resolver against one source and merge only its newly added, allowlisted Container settings. */
export function composeP15ContainerStyles(sourceValue: unknown, manifestValue: unknown): P15ContainerStyleCompositionResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) return result('BLOCKED', null, null, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_SOURCE_INVALID', family: null }], null, null);
  const source = sourceValue as P15NeutralExportDocumentV1;
  const fingerprint = fingerprintP15NeutralExportDocument(source);
  const generation = generateElementorV3TemplateCandidate(source);
  if (generation.status !== 'GENERATED_LOCAL_CANDIDATE' || !generation.candidate || !generation.template) {
    return result('BLOCKED', fingerprint, null, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_BASE_NOT_READY', family: null }], null, null);
  }
  const baseIdentity = buildElementorTemplateCandidateIdentity(generation.candidate).digest;
  if (!record(manifestValue) || !exactKeys(manifestValue, manifestKeys)
    || manifestValue.schemaVersion !== 1 || manifestValue.compositionVersion !== P15_CONTAINER_STYLE_COMPOSITION_VERSION
    || manifestValue.sourceIrFingerprint !== fingerprint || manifestValue.baseCandidateIdentityDigest !== baseIdentity
    || manifestValue.responsiveInferencePerformed !== false || manifestValue.figmaMutation !== false
    || manifestValue.networkAccess !== false || manifestValue.responsiveClosureClaim !== false
    || manifestValue.targetCompatibilityClaim !== false || manifestValue.productionAcceptance !== false
    || manifestValue.downloadEnabled !== false || !record(manifestValue.families)
    || Object.keys(manifestValue.families).length === 0
    || Object.keys(manifestValue.families).some(key => !P15_CONTAINER_STYLE_FAMILIES.includes(key as P15ContainerStyleFamily))) {
    return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_MANIFEST_INVALID', family: null }], null, null);
  }

  const template = cloneP15ReadyElementorTemplate(generation.candidate);
  const baseBinding = bindP15NeutralSourceToGeneratedContainers(source, generation.template);
  const targetBinding = bindP15NeutralSourceToGeneratedContainers(source, template);
  if (baseBinding.issues.length || targetBinding.issues.length) {
    return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_BINDING_MISMATCH', family: null }], null, null);
  }
  const applied: P15ContainerStyleFamily[] = [];
  for (const family of P15_CONTAINER_STYLE_FAMILIES) {
    if (!Object.prototype.hasOwnProperty.call(manifestValue.families, family)) continue;
    const resolved = resolvers[family](source, manifestValue.families[family]);
    if (!resolved.candidate || !resolved.template || resolved.issues.length
      || !['CONTAINER_BORDER_STYLES_RESOLVED', 'CONTAINER_HOVER_BORDER_STYLES_RESOLVED',
        'CONTAINER_OVERLAY_COLOR_RESOLVED', 'CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED'].includes(resolved.status)
      || resolved.sourceIrFingerprint !== fingerprint || resolved.baseCandidateIdentityDigest !== baseIdentity
      || resolved.responsiveInferencePerformed !== false || resolved.targetCompatibilityClaim !== false
      || resolved.productionAcceptance !== false || resolved.downloadEnabled !== false) {
      return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_FAMILY_REJECTED', family }], null, null);
    }
    const familyBinding = bindP15NeutralSourceToGeneratedContainers(source, resolved.template);
    if (familyBinding.issues.length || familyBinding.containers.size !== baseBinding.containers.size) {
      return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT', family }], null, null);
    }
    for (const [id, baseNode] of baseBinding.containers) {
      const familyNode = familyBinding.containers.get(id);
      const targetNode = targetBinding.containers.get(id);
      if (!familyNode || !targetNode || !record(baseNode.settings) || !record(familyNode.settings) || !record(targetNode.settings)) {
        return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT', family }], null, null);
      }
      if (Object.keys(baseNode.settings).some(key => !Object.prototype.hasOwnProperty.call(familyNode.settings, key))) {
        return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT', family }], null, null);
      }
      for (const [key, value] of Object.entries(familyNode.settings)) {
        if (Object.prototype.hasOwnProperty.call(baseNode.settings, key)) {
          if (JSON.stringify(baseNode.settings[key]) !== JSON.stringify(value)) {
            return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT', family }], null, null);
          }
          continue;
        }
        if (!allowedKeys[family].includes(key)) {
          return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT', family }], null, null);
        }
        if (Object.prototype.hasOwnProperty.call(targetNode.settings, key)) {
          return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_KEY_CONFLICT', family }], null, null);
        }
        targetNode.settings[key] = value;
      }
    }
    // Remove exactly the permitted setting additions and require the rest of the family tree to equal the base.
    const normalized = cloneP15ReadyElementorTemplate(resolved.candidate);
    const normalizedBinding = bindP15NeutralSourceToGeneratedContainers(source, normalized);
    for (const [id, node] of normalizedBinding.containers) {
      const baseNode = baseBinding.containers.get(id);
      if (!baseNode) return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT', family }], null, null);
      node.settings = JSON.parse(JSON.stringify(baseNode.settings)) as typeof node.settings;
    }
    if (JSON.stringify(normalized) !== JSON.stringify(generation.template)) {
      return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT', family }], null, null);
    }
    applied.push(family);
  }
  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || !candidate.validation.valid) {
    return result('REJECTED', fingerprint, baseIdentity, null, [], [{ code: 'P15_CONTAINER_COMPOSITION_TARGET_INVALID', family: null }], null, null);
  }
  return result('RESOLVED', fingerprint, baseIdentity, buildElementorTemplateCandidateIdentity(candidate).digest,
    applied, [], template, candidate);
}

/** No source text, candidate bytes, or raw caller-supplied evidence is serialized. */
export function serializeP15ContainerStyleCompositionSummary(value: P15ContainerStyleCompositionResultV1): string {
  if (value.schemaVersion !== 1 || value.compositionVersion !== P15_CONTAINER_STYLE_COMPOSITION_VERSION
    || !['BLOCKED', 'REJECTED', 'RESOLVED'].includes(value.status)
    || (value.sourceIrFingerprint !== null && !digest(value.sourceIrFingerprint))
    || (value.baseCandidateIdentityDigest !== null && !digest(value.baseCandidateIdentityDigest))
    || (value.resolvedCandidateIdentityDigest !== null && !digest(value.resolvedCandidateIdentityDigest))
    || (value.status === 'RESOLVED' && (!digest(value.sourceIrFingerprint)
      || !digest(value.baseCandidateIdentityDigest) || !digest(value.resolvedCandidateIdentityDigest)
      || value.appliedFamilies.length === 0 || value.issues.length !== 0))
    || (value.status !== 'RESOLVED' && (value.resolvedCandidateIdentityDigest !== null
      || value.appliedFamilies.length !== 0 || value.issues.length === 0))
    || value.responsiveInferencePerformed !== false || value.figmaMutation !== false
    || value.networkAccess !== false || value.responsiveClosureClaim !== false
    || value.targetCompatibilityClaim !== false || value.productionAcceptance !== false
    || value.downloadEnabled !== false || value.internalReviewRequired !== true
    || !Array.isArray(value.appliedFamilies) || value.appliedFamilies.some(family => !P15_CONTAINER_STYLE_FAMILIES.includes(family))
    || new Set(value.appliedFamilies).size !== value.appliedFamilies.length
    || !Array.isArray(value.issues) || value.issues.some(issue => !record(issue) || !exactKeys(issue, ['code', 'family']) || ![
      'P15_CONTAINER_COMPOSITION_SOURCE_INVALID', 'P15_CONTAINER_COMPOSITION_BASE_NOT_READY',
      'P15_CONTAINER_COMPOSITION_MANIFEST_INVALID', 'P15_CONTAINER_COMPOSITION_BINDING_MISMATCH',
      'P15_CONTAINER_COMPOSITION_FAMILY_REJECTED', 'P15_CONTAINER_COMPOSITION_FAMILY_DRIFT',
      'P15_CONTAINER_COMPOSITION_KEY_CONFLICT', 'P15_CONTAINER_COMPOSITION_TARGET_INVALID',
    ].includes(issue.code as string) || (issue.family !== null && !P15_CONTAINER_STYLE_FAMILIES.includes(issue.family as P15ContainerStyleFamily)))) {
    throw new Error('Invalid or authority-inflated Container style composition result.');
  }
  return `${JSON.stringify({ schemaVersion: 1, compositionVersion: P15_CONTAINER_STYLE_COMPOSITION_VERSION,
    status: value.status, sourceIrFingerprint: value.sourceIrFingerprint,
    baseCandidateIdentityDigest: value.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: value.resolvedCandidateIdentityDigest,
    appliedFamilies: value.appliedFamilies, issues: value.issues,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false,
    productionAcceptance: false, downloadEnabled: false, internalReviewRequired: true }, null, 2)}\n`;
}
