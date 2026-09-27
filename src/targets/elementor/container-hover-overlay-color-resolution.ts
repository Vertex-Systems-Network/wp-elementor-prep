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
import {
  bindP15NeutralSourceToGeneratedContainers,
  cloneP15ReadyElementorTemplate,
  collectP15NeutralContainerNodes,
} from './responsive-container-binding';
import type { ElementorTemplateV04 } from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION =
  'p15-elementor-container-hover-overlay-color-manifest-v1' as const;
export const P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_RESULT_VERSION =
  'p15-elementor-container-hover-overlay-color-result-v1' as const;
export const P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  backgroundGroupSourcePath: 'includes/controls/groups/background.php',
  backgroundGroupSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
  groupName: 'background_overlay_hover',
  typeSettingKey: 'background_overlay_hover_background',
  colorSettingKey: 'background_overlay_hover_color',
  selector: '{{WRAPPER}}:hover::before, {{WRAPPER}}:hover > .elementor-background-video-container::before, {{WRAPPER}}:hover > .e-con-inner > .elementor-background-video-container::before, {{WRAPPER}} > .elementor-background-slideshow:hover::before, {{WRAPPER}} > .e-con-inner > .elementor-background-slideshow:hover::before',
  acceptedBackgroundType: 'classic',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});

export type P15ElementorContainerHoverOverlayColorValue = string;

export interface P15ElementorContainerHoverOverlayColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorContainerHoverOverlayColorValue;
}

export interface P15ElementorContainerHoverOverlayColorManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorContainerHoverOverlayColorEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorContainerHoverOverlayColorIssueCode =
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_IR_INVALID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_NOT_OBJECT'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_FIELDS_INVALID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION_INVALID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_FINGERPRINT_INVALID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_ENTRIES_INVALID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_ENTRY_INVALID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_DUPLICATE_SOURCE_ID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_NOT_CONTAINER'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_VALUE_INVALID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_AUTHORITY_FLAGS_INVALID'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_GENERATOR_BINDING_MISMATCH'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorContainerHoverOverlayColorIssueV1 {
  code: P15ElementorContainerHoverOverlayColorIssueCode;
  path: string;
  message: string;
}

export type P15ElementorContainerHoverOverlayColorStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_CONTAINER_HOVER_OVERLAY_COLOR_OVERRIDES'
  | 'CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED';

export interface P15ElementorContainerHoverOverlayColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorContainerHoverOverlayColorValue;
}

export interface P15ElementorContainerHoverOverlayColorResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_RESULT_VERSION;
  status: P15ElementorContainerHoverOverlayColorStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedHoverOverlayColors: P15ElementorContainerHoverOverlayColorSummaryEntryV1[];
  issues: P15ElementorContainerHoverOverlayColorIssueV1[];
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
  'targetCompatibilityClaim',
] as const;

const ENTRY_KEYS = ['color', 'sourceNodeId'] as const;

const ISSUE_CODES: readonly P15ElementorContainerHoverOverlayColorIssueCode[] = [
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_IR_INVALID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_UPSTREAM_GENERATION_NOT_READY',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_NOT_OBJECT',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_FIELDS_INVALID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION_INVALID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_FINGERPRINT_INVALID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_FINGERPRINT_MISMATCH',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_ENTRIES_INVALID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_ENTRY_INVALID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_DUPLICATE_SOURCE_ID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_NOT_CONTAINER',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_VALUE_INVALID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_AUTHORITY_FLAGS_INVALID',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_GENERATOR_BINDING_MISMATCH',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_EXISTING_OVERRIDE_CONFLICT',
  'P15_CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED_CANDIDATE_INVALID',
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

function onlyAllowedKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
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

function validHoverOverlayColor(value: unknown): value is P15ElementorContainerHoverOverlayColorValue {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/.test(value);
}

function baseResult(
  status: P15ElementorContainerHoverOverlayColorStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedHoverOverlayColors: P15ElementorContainerHoverOverlayColorSummaryEntryV1[],
  issues: P15ElementorContainerHoverOverlayColorIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorContainerHoverOverlayColorResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedHoverOverlayColors.length,
    resolvedHoverOverlayColors: resolvedHoverOverlayColors.map((entry) => ({ ...entry })),
    issues: issues.map((issue) => ({ ...issue })),
    template,
    candidate,
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

/**
 * Apply only explicit Container hover overlay color values to exact generated Container bindings.
 *
 * Only canonical lowercase six-digit hex is accepted. This does not infer
 * responsive values, parse CSS/global tokens, or claim import/production authority.
 */
export function resolveP15ElementorContainerHoverOverlayColor(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorContainerHoverOverlayColorResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR',
      null,
      null,
      null,
      0,
      [],
      validation.issues.map((issue) => ({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
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
      sourceIrFingerprint,
      null,
      null,
      sourceContainers.size,
      [],
      [{
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Container hover overlay color resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorContainerHoverOverlayColorIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorContainerHoverOverlayColorEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Container hover overlay color manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Container hover overlay color manifest contains unknown or missing fields.',
      });
    }

    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Container hover overlay color manifest schema/version is unsupported.',
      });
    }

    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }

    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'Manifest is not bound to the exact current base candidate identity.',
      });
    }

    if (manifestValue.responsiveInferencePerformed !== false
      || manifestValue.figmaMutation !== false
      || manifestValue.networkAccess !== false
      || manifestValue.responsiveClosureClaim !== false
      || manifestValue.targetCompatibilityClaim !== false
      || manifestValue.productionAcceptance !== false
      || manifestValue.downloadEnabled !== false) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Container hover overlay color resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MAX_ENTRIES) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_ENTRY_INVALID',
            path,
            message: 'Each Container hover overlay color entry may contain only sourceNodeId and color.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Container hover overlay color sourceNodeId must be unique.',
          });
          continue;
        }

        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Container hover overlay color sourceNodeId must identify an existing neutral Container node.',
          });
          continue;
        }

        if (!validHoverOverlayColor(raw.color)) {
          issues.push({
            code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_VALUE_INVALID',
            path: `${path}.color`,
            message: 'Container hover overlay color must be a lowercase six-digit hex value such as #1a2b3c.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          color: raw.color,
        });
      }
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceContainers.size,
      [],
      issues,
      null,
      null,
    );
  }

  if (resolutions.size === 0) {
    return baseResult(
      'NO_CONTAINER_HOVER_OVERLAY_COLOR_OVERRIDES',
      sourceIrFingerprint,
      baseIdentity.digest,
      baseIdentity.digest,
      sourceContainers.size,
      [],
      [],
      baseGeneration.template,
      baseGeneration.candidate,
    );
  }

  const template = cloneP15ReadyElementorTemplate(baseGeneration.candidate);
  const binding = bindP15NeutralSourceToGeneratedContainers(source, template);

  if (binding.issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceContainers.size,
      [],
      binding.issues.map((issue) => ({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_GENERATOR_BINDING_MISMATCH' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  for (const [sourceNodeId, resolution] of resolutions) {
    const target = binding.containers.get(sourceNodeId);
    if (!target || !isRecord(target.settings)) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated Container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(
      target.settings,
      P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE.typeSettingKey,
    ) || Object.prototype.hasOwnProperty.call(
      target.settings,
      P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE.colorSettingKey,
    )) {
      issues.push({
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a Container hover overlay color setting.',
      });
      continue;
    }

    target.settings[P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE.typeSettingKey] = 'classic';
    target.settings[P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE.colorSettingKey] = resolution.color;
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceContainers.size,
      [],
      issues,
      null,
      null,
    );
  }

  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
    || !candidate.validation.valid
    || candidate.templateJson === null) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceContainers.size,
      [],
      [{
        code: 'P15_CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Container hover overlay color output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedHoverOverlayColors = [...resolutions.values()]
    .map((entry) => ({ ...entry }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedHoverOverlayColors,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorContainerHoverOverlayColorIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorContainerHoverOverlayColorIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorContainerHoverOverlayColorSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['color', 'sourceNodeId'])
    && validSourceNodeId(entry.sourceNodeId)
    && validHoverOverlayColor(entry.color);
}

/** Serialize only sanitized color metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorContainerHoverOverlayColorSummary(
  result: P15ElementorContainerHoverOverlayColorResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_CONTAINER_HOVER_OVERLAY_COLOR_OVERRIDES'
    || result.status === 'CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED';

  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedHoverOverlayColors.length;

  const uniqueIds = new Set(result.resolvedHoverOverlayColors.map((entry) => entry.sourceNodeId)).size
    === result.resolvedHoverOverlayColors.length;

  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);

  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';

  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;

  const resolvedDigestRequired = result.status === 'NO_CONTAINER_HOVER_OVERLAY_COLOR_OVERRIDES'
    || result.status === 'CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED';

  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;

  const statusShapeValid = result.status === 'CONTAINER_HOVER_OVERLAY_COLOR_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_CONTAINER_HOVER_OVERLAY_COLOR_OVERRIDES'
      ? result.resolvedContainerCount === 0
        && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedContainerCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedHoverOverlayColors.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 container-hover-overlay-color result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedHoverOverlayColors: result.resolvedHoverOverlayColors.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_EVIDENCE,
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
