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

export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION =
  'p15-elementor-responsive-full-width-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_RESULT_VERSION =
  'p15-elementor-responsive-full-width-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX = 500 as const;
export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX = 1600 as const;

export const P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  sliderSourcePath: 'includes/controls/slider.php',
  sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
  fixtureSourcePath: 'tests/jest/unit/modules/container-converter/assets/js/editor/commands/convert.test.js',
  fixtureSourceBlobSha: '27c8d0eadae77a9c4e33258111829f47ed9e217b',
  conditionControlName: 'content_width',
  conditionDefaultValue: 'boxed',
  conditionRequiredValue: 'full',
  controlName: 'width',
  desktopSettingKey: 'width',
  tabletSettingKey: 'width_tablet',
  mobileSettingKey: 'width_mobile',
  unit: 'px',
  minPx: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX,
  maxPx: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX,
});

export interface P15ElementorResponsiveFullWidthEntryV1 {
  sourceNodeId: string;
  contentWidthMode: 'full';
  tabletWidthPx?: number;
  mobileWidthPx?: number;
}

export interface P15ElementorResponsiveFullWidthManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFullWidthEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFullWidthIssueCode =
  | 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FULL_WIDTH_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FULL_WIDTH_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FULL_WIDTH_CONDITION_MISMATCH'
  | 'P15_RESPONSIVE_FULL_WIDTH_VALUE_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FULL_WIDTH_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FULL_WIDTH_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FULL_WIDTH_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FULL_WIDTH_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFullWidthIssueV1 {
  code: P15ElementorResponsiveFullWidthIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFullWidthStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FULL_WIDTH_OVERRIDES'
  | 'RESPONSIVE_FULL_WIDTH_RESOLVED';

export interface P15ElementorResponsiveFullWidthSummaryEntryV1 {
  sourceNodeId: string;
  contentWidthMode: 'full';
  tabletWidthPx: number | null;
  mobileWidthPx: number | null;
}

export interface P15ElementorResponsiveFullWidthResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_RESULT_VERSION;
  status: P15ElementorResponsiveFullWidthStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedWidths: P15ElementorResponsiveFullWidthSummaryEntryV1[];
  issues: P15ElementorResponsiveFullWidthIssueV1[];
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

const ENTRY_KEYS = ['contentWidthMode', 'mobileWidthPx', 'sourceNodeId', 'tabletWidthPx'] as const;
const ISSUE_CODES: readonly P15ElementorResponsiveFullWidthIssueCode[] = [
  'P15_RESPONSIVE_FULL_WIDTH_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_FULL_WIDTH_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_FULL_WIDTH_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_FULL_WIDTH_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_FULL_WIDTH_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_FULL_WIDTH_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_FULL_WIDTH_ENTRIES_INVALID',
  'P15_RESPONSIVE_FULL_WIDTH_ENTRY_INVALID',
  'P15_RESPONSIVE_FULL_WIDTH_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_FULL_WIDTH_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_FULL_WIDTH_CONDITION_MISMATCH',
  'P15_RESPONSIVE_FULL_WIDTH_VALUE_INVALID',
  'P15_RESPONSIVE_FULL_WIDTH_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_FULL_WIDTH_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_FULL_WIDTH_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_FULL_WIDTH_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_FULL_WIDTH_RESOLVED_CANDIDATE_INVALID',
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

function validWidthPx(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && Number.isInteger(value)
    && value >= P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX
    && value <= P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX;
}

function snapshotWidth(value: number): number {
  return value;
}

function elementorSlider(value: number): Record<string, unknown> {
  return {
    unit: 'px',
    size: value,
    sizes: [],
  };
}

function cloneSummaryEntry(
  entry: P15ElementorResponsiveFullWidthSummaryEntryV1,
): P15ElementorResponsiveFullWidthSummaryEntryV1 {
  return {
    sourceNodeId: entry.sourceNodeId,
    contentWidthMode: 'full',
    tabletWidthPx: entry.tabletWidthPx === null ? null : snapshotWidth(entry.tabletWidthPx),
    mobileWidthPx: entry.mobileWidthPx === null ? null : snapshotWidth(entry.mobileWidthPx),
  };
}

function baseResult(
  status: P15ElementorResponsiveFullWidthStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedWidths: P15ElementorResponsiveFullWidthSummaryEntryV1[],
  issues: P15ElementorResponsiveFullWidthIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveFullWidthResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedWidths.length,
    resolvedWidths: resolvedWidths.map(cloneSummaryEntry),
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
 * Apply an explicit Elementor content_width=full condition plus only explicit default tablet/mobile integer-px width overrides to exact generated container bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive full width, synthesize inheritance,
 * convert units, parse CSS/custom values, change desktop full width, permit negative/fractional values,
 * or claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerFullWidth(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFullWidthResultV1 {
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
        code: 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_IR_INVALID' as const,
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
        code: 'P15_RESPONSIVE_FULL_WIDTH_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive full width resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveFullWidthIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveFullWidthEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive full width manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive full width manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive full width manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_FULL_WIDTH_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive full width resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FULL_WIDTH_ENTRY_INVALID',
            path,
            message: 'Each responsive full width entry may contain only sourceNodeId plus tablet/mobile full width values.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FULL_WIDTH_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive full width sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FULL_WIDTH_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive full width sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        if (raw.contentWidthMode !== 'full') {
          issues.push({
            code: 'P15_RESPONSIVE_FULL_WIDTH_CONDITION_MISMATCH',
            path: `${path}.contentWidthMode`,
            message: 'Responsive full width requires explicit contentWidthMode=full.',
          });
          continue;
        }

        const tabletProvided = raw.tabletWidthPx !== undefined;
        const mobileProvided = raw.mobileWidthPx !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_FULL_WIDTH_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive full width entry must explicitly provide tabletWidthPx and/or mobileWidthPx.',
          });
          continue;
        }

        if ((tabletProvided && !validWidthPx(raw.tabletWidthPx))
          || (mobileProvided && !validWidthPx(raw.mobileWidthPx))) {
          issues.push({
            code: 'P15_RESPONSIVE_FULL_WIDTH_VALUE_INVALID',
            path,
            message: `Responsive full width must be an integer px value between ${P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MIN_PX} and ${P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MAX_PX}.`,
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          contentWidthMode: 'full',
          ...(tabletProvided
            ? { tabletWidthPx: snapshotWidth(raw.tabletWidthPx as number) }
            : {}),
          ...(mobileProvided
            ? { mobileWidthPx: snapshotWidth(raw.mobileWidthPx as number) }
            : {}),
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
      'NO_RESPONSIVE_FULL_WIDTH_OVERRIDES',
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
        code: 'P15_RESPONSIVE_FULL_WIDTH_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_FULL_WIDTH_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    const contentWidth = target.settings.content_width;
    if (contentWidth !== undefined && contentWidth !== 'boxed' && contentWidth !== 'full') {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_CONDITION_MISMATCH',
        path: `$source.${sourceNodeId}`,
        message: 'Responsive full width can transition only an unset/boxed/full Elementor content_width state.',
      });
      continue;
    }

    if (resolution.tabletWidthPx !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE.tabletSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a tablet full width override.',
      });
      continue;
    }
    if (resolution.mobileWidthPx !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE.mobileSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_FULL_WIDTH_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a mobile full width override.',
      });
      continue;
    }

    target.settings[P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE.conditionControlName] = 'full';

    if (resolution.tabletWidthPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE.tabletSettingKey] =
        elementorSlider(resolution.tabletWidthPx);
    }
    if (resolution.mobileWidthPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE.mobileSettingKey] =
        elementorSlider(resolution.mobileWidthPx);
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
        code: 'P15_RESPONSIVE_FULL_WIDTH_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive full width output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedWidths = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      contentWidthMode: 'full' as const,
      tabletWidthPx: entry.tabletWidthPx === undefined ? null : snapshotWidth(entry.tabletWidthPx),
      mobileWidthPx: entry.mobileWidthPx === undefined ? null : snapshotWidth(entry.mobileWidthPx),
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_FULL_WIDTH_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedWidths,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveFullWidthIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveFullWidthIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveFullWidthSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['contentWidthMode', 'mobileWidthPx', 'sourceNodeId', 'tabletWidthPx'])
    && validSourceNodeId(entry.sourceNodeId)
    && entry.contentWidthMode === 'full'
    && (entry.tabletWidthPx === null || validWidthPx(entry.tabletWidthPx))
    && (entry.mobileWidthPx === null || validWidthPx(entry.mobileWidthPx))
    && (entry.tabletWidthPx !== null || entry.mobileWidthPx !== null);
}

/** Serialize only sanitized full width metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFullWidthSummary(
  result: P15ElementorResponsiveFullWidthResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_FULL_WIDTH_OVERRIDES'
    || result.status === 'RESPONSIVE_FULL_WIDTH_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedWidths.length;
  const uniqueIds = new Set(result.resolvedWidths.map((entry) => entry.sourceNodeId)).size
    === result.resolvedWidths.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_FULL_WIDTH_OVERRIDES'
    || result.status === 'RESPONSIVE_FULL_WIDTH_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_FULL_WIDTH_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_FULL_WIDTH_OVERRIDES'
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
    || !result.resolvedWidths.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-full-width result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedWidths: result.resolvedWidths.map(cloneSummaryEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_EVIDENCE,
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
