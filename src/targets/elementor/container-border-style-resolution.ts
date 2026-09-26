import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
} from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import { bindP15NeutralSourceToGeneratedContainers, cloneP15ReadyElementorTemplate, collectP15NeutralContainerNodes } from './responsive-container-binding';
import type { ElementorTemplateV04 } from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION =
  'p15-elementor-container-border-style-manifest-v1' as const;
export const P15_ELEMENTOR_CONTAINER_BORDER_STYLE_RESULT_VERSION =
  'p15-elementor-container-border-style-result-v1' as const;
export const P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_CONTAINER_BORDER_WIDTH_MAX_PX = 100 as const;

export const P15_ELEMENTOR_CONTAINER_BORDER_TYPES = [
  'solid',
  'double',
  'dotted',
  'dashed',
  'groove',
] as const;

export const P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  groupBaseSourcePath: 'includes/controls/groups/base.php',
  groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  borderGroupSourcePath: 'includes/controls/groups/border.php',
  borderGroupSourceBlobSha: 'eac53e6b1014a985d1d17f90a4044cfb0c6c33c5',
  dimensionsControlSourcePath: 'includes/controls/dimensions.php',
  dimensionsControlSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  groupName: 'border',
  groupPrefixRule: '{{ControlName}}_',
  borderTypeFieldName: 'border',
  borderTypeSettingKey: 'border_border',
  borderWidthFieldName: 'width',
  borderWidthSettingKey: 'border_width',
  borderWidthTabletSettingKey: 'border_width_tablet',
  borderWidthMobileSettingKey: 'border_width_mobile',
  borderColorFieldName: 'color',
  borderColorSettingKey: 'border_color',
  selector: '{{WRAPPER}}',
  acceptedUnit: 'px',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  borderWidthMinPx: 0,
  borderWidthMaxPx: P15_ELEMENTOR_CONTAINER_BORDER_WIDTH_MAX_PX,
  acceptedBorderTypes: P15_ELEMENTOR_CONTAINER_BORDER_TYPES,
});

export type P15ElementorContainerBorderType =
  typeof P15_ELEMENTOR_CONTAINER_BORDER_TYPES[number];

export interface P15ElementorContainerBorderWidthPxV1 {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface P15ElementorContainerBorderStyleEntryV1 {
  sourceNodeId: string;
  borderType: P15ElementorContainerBorderType;
  widthPx: P15ElementorContainerBorderWidthPxV1;
  tabletWidthPx?: P15ElementorContainerBorderWidthPxV1;
  mobileWidthPx?: P15ElementorContainerBorderWidthPxV1;
  color: string;
}

export interface P15ElementorContainerBorderStyleManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorContainerBorderStyleEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorContainerBorderStyleIssueCode =
  | 'P15_CONTAINER_BORDER_STYLE_SOURCE_IR_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_CONTAINER_BORDER_STYLE_MANIFEST_NOT_OBJECT'
  | 'P15_CONTAINER_BORDER_STYLE_MANIFEST_FIELDS_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_MANIFEST_VERSION_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_SOURCE_FINGERPRINT_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_CONTAINER_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_CONTAINER_BORDER_STYLE_ENTRIES_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_ENTRY_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_DUPLICATE_SOURCE_ID'
  | 'P15_CONTAINER_BORDER_STYLE_SOURCE_NOT_CONTAINER'
  | 'P15_CONTAINER_BORDER_STYLE_TYPE_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_WIDTH_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_COLOR_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_AUTHORITY_FLAGS_INVALID'
  | 'P15_CONTAINER_BORDER_STYLE_GENERATOR_BINDING_MISMATCH'
  | 'P15_CONTAINER_BORDER_STYLE_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_CONTAINER_BORDER_STYLE_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorContainerBorderStyleIssueV1 {
  code: P15ElementorContainerBorderStyleIssueCode;
  path: string;
  message: string;
}

export type P15ElementorContainerBorderStyleStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_CONTAINER_BORDER_STYLE_OVERRIDES'
  | 'CONTAINER_BORDER_STYLES_RESOLVED';

export interface P15ElementorContainerBorderStyleResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_BORDER_STYLE_RESULT_VERSION;
  status: P15ElementorContainerBorderStyleStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedBorderStyles: P15ElementorContainerBorderStyleEntryV1[];
  issues: P15ElementorContainerBorderStyleIssueV1[];
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

const MANIFEST_KEYS = [
  'baseCandidateIdentityDigest',
  'containers',
  'downloadEnabled',
  'figmaMutation',
  'manifestVersion',
  'networkAccess',
  'productionAcceptance',
  'responsiveClosureClaim',
  'responsiveInferencePerformed',
  'schemaVersion',
  'sourceIrFingerprint',
  'styleInferencePerformed',
  'targetCompatibilityClaim',
] as const;

const ENTRY_KEYS = ['borderType', 'color', 'sourceNodeId', 'widthPx'] as const;
const OPTIONAL_ENTRY_KEYS = ['mobileWidthPx', 'tabletWidthPx'] as const;
const WIDTH_KEYS = ['bottom', 'left', 'right', 'top'] as const;

const ISSUE_CODES: readonly P15ElementorContainerBorderStyleIssueCode[] = [
  'P15_CONTAINER_BORDER_STYLE_SOURCE_IR_INVALID',
  'P15_CONTAINER_BORDER_STYLE_UPSTREAM_GENERATION_NOT_READY',
  'P15_CONTAINER_BORDER_STYLE_MANIFEST_NOT_OBJECT',
  'P15_CONTAINER_BORDER_STYLE_MANIFEST_FIELDS_INVALID',
  'P15_CONTAINER_BORDER_STYLE_MANIFEST_VERSION_INVALID',
  'P15_CONTAINER_BORDER_STYLE_SOURCE_FINGERPRINT_INVALID',
  'P15_CONTAINER_BORDER_STYLE_SOURCE_FINGERPRINT_MISMATCH',
  'P15_CONTAINER_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_CONTAINER_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_CONTAINER_BORDER_STYLE_ENTRIES_INVALID',
  'P15_CONTAINER_BORDER_STYLE_ENTRY_INVALID',
  'P15_CONTAINER_BORDER_STYLE_DUPLICATE_SOURCE_ID',
  'P15_CONTAINER_BORDER_STYLE_SOURCE_NOT_CONTAINER',
  'P15_CONTAINER_BORDER_STYLE_TYPE_INVALID',
  'P15_CONTAINER_BORDER_STYLE_WIDTH_INVALID',
  'P15_CONTAINER_BORDER_STYLE_COLOR_INVALID',
  'P15_CONTAINER_BORDER_STYLE_AUTHORITY_FLAGS_INVALID',
  'P15_CONTAINER_BORDER_STYLE_GENERATOR_BINDING_MISMATCH',
  'P15_CONTAINER_BORDER_STYLE_EXISTING_OVERRIDE_CONFLICT',
  'P15_CONTAINER_BORDER_STYLE_RESOLVED_CANDIDATE_INVALID',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return actual.length === canonical.length
    && actual.every((key, index) => key === canonical[index]);
}

function entryKeysValid(value: Record<string, unknown>): boolean {
  return Object.keys(value).every((key) =>
    (ENTRY_KEYS as readonly string[]).includes(key) || (OPTIONAL_ENTRY_KEYS as readonly string[]).includes(key))
    && ENTRY_KEYS.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function validFingerprint(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function validSourceNodeId(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 512
    && value.trim() === value;
}

function validBorderType(value: unknown): value is P15ElementorContainerBorderType {
  return typeof value === 'string'
    && (P15_ELEMENTOR_CONTAINER_BORDER_TYPES as readonly string[]).includes(value);
}

function validColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/.test(value);
}

function validWidth(value: unknown): value is P15ElementorContainerBorderWidthPxV1 {
  if (!isRecord(value) || !exactKeys(value, WIDTH_KEYS)) return false;
  return [value.top, value.right, value.bottom, value.left].every((side) =>
    typeof side === 'number'
      && Number.isInteger(side)
      && Number.isFinite(side)
      && side >= P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderWidthMinPx
      && side <= P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderWidthMaxPx);
}

function cloneWidth(value: P15ElementorContainerBorderWidthPxV1): P15ElementorContainerBorderWidthPxV1 {
  return { ...value };
}

function cloneEntry(value: P15ElementorContainerBorderStyleEntryV1): P15ElementorContainerBorderStyleEntryV1 {
  return {
    sourceNodeId: value.sourceNodeId,
    borderType: value.borderType,
    widthPx: cloneWidth(value.widthPx),
    ...(value.tabletWidthPx === undefined ? {} : { tabletWidthPx: cloneWidth(value.tabletWidthPx) }),
    ...(value.mobileWidthPx === undefined ? {} : { mobileWidthPx: cloneWidth(value.mobileWidthPx) }),
    color: value.color,
  };
}

function baseResult(
  status: P15ElementorContainerBorderStyleStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedBorderStyles: P15ElementorContainerBorderStyleEntryV1[],
  issues: P15ElementorContainerBorderStyleIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorContainerBorderStyleResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_CONTAINER_BORDER_STYLE_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedBorderStyles.length,
    resolvedBorderStyles: resolvedBorderStyles.map(cloneEntry),
    issues: issues.map((issue) => ({ ...issue })),
    template,
    candidate,
    styleInferencePerformed: false,
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    responsiveClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

function elementorDimensions(value: P15ElementorContainerBorderWidthPxV1): Record<string, unknown> {
  return {
    unit: 'px',
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.top === value.right
      && value.right === value.bottom
      && value.bottom === value.left,
  };
}

export function resolveP15ElementorContainerBorderStyles(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorContainerBorderStyleResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR',
      null, null, null, 0, [],
      validation.issues.map((issue) => ({
        code: 'P15_CONTAINER_BORDER_STYLE_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null, null,
    );
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const sourceContainers = collectP15NeutralContainerNodes(source);
  const baseGeneration = generateElementorV3TemplateCandidate(source);

  if (baseGeneration.status !== 'GENERATED_LOCAL_CANDIDATE'
    || baseGeneration.template === null
    || baseGeneration.candidate === null) {
    return baseResult(
      'BLOCKED_UPSTREAM_GENERATION',
      sourceIrFingerprint, null, null, sourceContainers.size, [],
      [{
        code: 'P15_CONTAINER_BORDER_STYLE_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Container border-style resolution requires an existing review-free generated local candidate.',
      }],
      null, null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorContainerBorderStyleIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorContainerBorderStyleEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_CONTAINER_BORDER_STYLE_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Container border-style manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Container border-style manifest contains unknown or missing fields.',
      });
    }

    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Container border-style manifest schema/version is unsupported.',
      });
    }

    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }

    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_MISMATCH',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'Manifest is not bound to the exact current base candidate identity.',
      });
    }

    if (manifestValue.styleInferencePerformed !== false
      || manifestValue.responsiveInferencePerformed !== false
      || manifestValue.figmaMutation !== false
      || manifestValue.networkAccess !== false
      || manifestValue.responsiveClosureClaim !== false
      || manifestValue.targetCompatibilityClaim !== false
      || manifestValue.productionAcceptance !== false
      || manifestValue.downloadEnabled !== false) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Container border-style resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MAX_ENTRIES) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !entryKeysValid(raw)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_CONTAINER_BORDER_STYLE_ENTRY_INVALID',
            path,
            message: 'Each entry must contain exactly sourceNodeId, borderType, widthPx and color.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_CONTAINER_BORDER_STYLE_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Container border-style sourceNodeId must be unique.',
          });
          continue;
        }

        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_CONTAINER_BORDER_STYLE_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'sourceNodeId must identify an existing neutral Container node.',
          });
          continue;
        }

        if (!validBorderType(raw.borderType)) {
          issues.push({
            code: 'P15_CONTAINER_BORDER_STYLE_TYPE_INVALID',
            path: `${path}.borderType`,
            message: 'borderType must be one visible Elementor 4.2.4 border style: solid, double, dotted, dashed or groove.',
          });
          continue;
        }

        if (!validWidth(raw.widthPx)) {
          issues.push({
            code: 'P15_CONTAINER_BORDER_STYLE_WIDTH_INVALID',
            path: `${path}.widthPx`,
            message: `widthPx must contain integer px sides from 0 through ${P15_ELEMENTOR_CONTAINER_BORDER_WIDTH_MAX_PX}.`,
          });
          continue;
        }

        if ((Object.prototype.hasOwnProperty.call(raw, 'tabletWidthPx') && !validWidth(raw.tabletWidthPx))
          || (Object.prototype.hasOwnProperty.call(raw, 'mobileWidthPx') && !validWidth(raw.mobileWidthPx))) {
          issues.push({
            code: 'P15_CONTAINER_BORDER_STYLE_WIDTH_INVALID',
            path: `${path}.responsiveWidthPx`,
            message: 'Each supplied responsive width must contain four integer px sides from 0 through 100.',
          });
          continue;
        }

        if (!validColor(raw.color)) {
          issues.push({
            code: 'P15_CONTAINER_BORDER_STYLE_COLOR_INVALID',
            path: `${path}.color`,
            message: 'color must be a lowercase six-digit hex value such as #1a2b3c.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          borderType: raw.borderType,
          widthPx: { ...raw.widthPx },
          ...(raw.tabletWidthPx === undefined ? {} : { tabletWidthPx: cloneWidth(raw.tabletWidthPx as P15ElementorContainerBorderWidthPxV1) }),
          ...(raw.mobileWidthPx === undefined ? {} : { mobileWidthPx: cloneWidth(raw.mobileWidthPx as P15ElementorContainerBorderWidthPxV1) }),
          color: raw.color,
        });
      }
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint, baseIdentity.digest, null, sourceContainers.size, [], issues, null, null,
    );
  }

  if (resolutions.size === 0) {
    return baseResult(
      'NO_CONTAINER_BORDER_STYLE_OVERRIDES',
      sourceIrFingerprint, baseIdentity.digest, baseIdentity.digest, sourceContainers.size, [], [],
      baseGeneration.template, baseGeneration.candidate,
    );
  }

  const template = cloneP15ReadyElementorTemplate(baseGeneration.candidate);
  const binding = bindP15NeutralSourceToGeneratedContainers(source, template);

  if (binding.issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint, baseIdentity.digest, null, sourceContainers.size, [],
      binding.issues.map((issue) => ({
        code: 'P15_CONTAINER_BORDER_STYLE_GENERATOR_BINDING_MISMATCH' as const,
        path: issue.path,
        message: issue.message,
      })),
      null, null,
    );
  }

  for (const [sourceNodeId, resolution] of resolutions) {
    const target = binding.containers.get(sourceNodeId);
    if (!target || !isRecord(target.settings)) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated Container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    const requestedKeys = [
      P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderTypeSettingKey,
      P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderWidthSettingKey,
      P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderColorSettingKey,
      ...(resolution.tabletWidthPx === undefined ? [] : [P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderWidthTabletSettingKey]),
      ...(resolution.mobileWidthPx === undefined ? [] : [P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderWidthMobileSettingKey]),
    ];

    const conflictingKey = requestedKeys.find((key) =>
      Object.prototype.hasOwnProperty.call(target.settings, key));
    if (conflictingKey) {
      issues.push({
        code: 'P15_CONTAINER_BORDER_STYLE_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: `Generated base candidate already contains requested Container border setting ${conflictingKey}.`,
      });
      continue;
    }

    target.settings[P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderTypeSettingKey] =
      resolution.borderType;
    target.settings[P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderWidthSettingKey] =
      elementorDimensions(resolution.widthPx);
    if (resolution.tabletWidthPx !== undefined) {
      target.settings[P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderWidthTabletSettingKey] =
        elementorDimensions(resolution.tabletWidthPx);
    }
    if (resolution.mobileWidthPx !== undefined) {
      target.settings[P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderWidthMobileSettingKey] =
        elementorDimensions(resolution.mobileWidthPx);
    }
    target.settings[P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE.borderColorSettingKey] =
      resolution.color;
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint, baseIdentity.digest, null, sourceContainers.size, [], issues, null, null,
    );
  }

  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
    || !candidate.validation.valid
    || candidate.templateJson === null) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint, baseIdentity.digest, null, sourceContainers.size, [],
      [{
        code: 'P15_CONTAINER_BORDER_STYLE_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Container border-style output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null, null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedBorderStyles = [...resolutions.values()]
    .map(cloneEntry)
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'CONTAINER_BORDER_STYLES_RESOLVED',
    sourceIrFingerprint, baseIdentity.digest, resolvedIdentity.digest, sourceContainers.size,
    resolvedBorderStyles, [], template, candidate,
  );
}

function validIssue(issue: P15ElementorContainerBorderStyleIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorContainerBorderStyleIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorContainerBorderStyleEntryV1): boolean {
  return isRecord(entry)
    && entryKeysValid(entry)
    && validSourceNodeId(entry.sourceNodeId)
    && validBorderType(entry.borderType)
    && validWidth(entry.widthPx)
    && (!Object.prototype.hasOwnProperty.call(entry, 'tabletWidthPx') || validWidth(entry.tabletWidthPx))
    && (!Object.prototype.hasOwnProperty.call(entry, 'mobileWidthPx') || validWidth(entry.mobileWidthPx))
    && validColor(entry.color);
}

export function serializeP15ElementorContainerBorderStyleSummary(
  result: P15ElementorContainerBorderStyleResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_CONTAINER_BORDER_STYLE_OVERRIDES'
    || result.status === 'CONTAINER_BORDER_STYLES_RESOLVED';

  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedBorderStyles.length;

  const uniqueIds = new Set(result.resolvedBorderStyles.map((entry) => entry.sourceNodeId)).size
    === result.resolvedBorderStyles.length;

  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_CONTAINER_BORDER_STYLE_OVERRIDES'
    || result.status === 'CONTAINER_BORDER_STYLES_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'CONTAINER_BORDER_STYLES_RESOLVED'
    ? result.resolvedContainerCount > 0 && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_CONTAINER_BORDER_STYLE_OVERRIDES'
      ? result.resolvedContainerCount === 0 && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedContainerCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedBorderStyles.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.styleInferencePerformed !== false
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 container-border-style result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_CONTAINER_BORDER_STYLE_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedBorderStyles: result.resolvedBorderStyles.map(cloneEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_CONTAINER_BORDER_STYLE_EVIDENCE,
    styleInferencePerformed: false,
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    responsiveClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
