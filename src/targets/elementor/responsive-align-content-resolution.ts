import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  fingerprintP15NeutralExportDocument,
} from './neutral-export-ir-identity';
import {
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
} from './neutral-export-ir';
import {
  bindP15NeutralSourceToGeneratedContainers,
  cloneP15ReadyElementorTemplate,
  collectP15NeutralContainerNodes,
} from './responsive-container-binding';
import {
  resolveP15ElementorResponsiveContainerWraps,
  type P15ElementorResponsiveWrapResultV1,
  type P15ElementorResponsiveWrapStatus,
} from './responsive-wrap-resolution';
import type { ElementorTemplateV04 } from './template-v04';

export const P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION =
  'p15-elementor-responsive-align-content-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_RESULT_VERSION =
  'p15-elementor-responsive-align-content-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: 'flex',
  controlName: 'align_content',
  prerequisiteControlName: 'wrap',
  prerequisiteValue: 'wrap',
  desktopSettingKey: 'container_align_content',
  tabletSettingKey: 'container_align_content_tablet',
  mobileSettingKey: 'container_align_content_mobile',
  supportedValues: [
    'flex-start',
    'center',
    'flex-end',
    'space-between',
    'space-around',
    'space-evenly',
  ] as const,
});

export type P15ElementorResponsiveAlignContent =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export interface P15ElementorResponsiveAlignContentEntryV1 {
  sourceNodeId: string;
  tabletAlignContent?: P15ElementorResponsiveAlignContent;
  mobileAlignContent?: P15ElementorResponsiveAlignContent;
}

export interface P15ElementorResponsiveAlignContentManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  wrappedCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveAlignContentEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveAlignContentIssueCode =
  | 'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_WRAP_PREREQUISITE_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_WRAPPED_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_WRAPPED_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_ENTRY_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_VALUE_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_WRAP_REQUIRED'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_ALIGN_CONTENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveAlignContentIssueV1 {
  code: P15ElementorResponsiveAlignContentIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveAlignContentStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_WRAP_PREREQUISITE'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_ALIGN_CONTENT_OVERRIDES'
  | 'RESPONSIVE_ALIGN_CONTENT_RESOLVED';

export interface P15ElementorResponsiveAlignContentSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlignContent: P15ElementorResponsiveAlignContent | null;
  mobileAlignContent: P15ElementorResponsiveAlignContent | null;
}

export interface P15ElementorResponsiveAlignContentResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_RESULT_VERSION;
  status: P15ElementorResponsiveAlignContentStatus;
  wrapPrerequisiteStatus: P15ElementorResponsiveWrapStatus | null;
  sourceIrFingerprint: string | null;
  wrappedCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedAlignContents: P15ElementorResponsiveAlignContentSummaryEntryV1[];
  issues: P15ElementorResponsiveAlignContentIssueV1[];
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
  'wrappedCandidateIdentityDigest',
] as const;

const ENTRY_KEYS = [
  'mobileAlignContent',
  'sourceNodeId',
  'tabletAlignContent',
] as const;

const ALIGN_CONTENT_VALUES: readonly P15ElementorResponsiveAlignContent[] =
  P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE.supportedValues;

const ISSUE_CODES: readonly P15ElementorResponsiveAlignContentIssueCode[] = [
  'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_WRAP_PREREQUISITE_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_ALIGN_CONTENT_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_ALIGN_CONTENT_WRAPPED_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_WRAPPED_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_ALIGN_CONTENT_ENTRIES_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_ENTRY_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_ALIGN_CONTENT_VALUE_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_ALIGN_CONTENT_WRAP_REQUIRED',
  'P15_RESPONSIVE_ALIGN_CONTENT_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_ALIGN_CONTENT_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_ALIGN_CONTENT_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_ALIGN_CONTENT_RESOLVED_CANDIDATE_INVALID',
];

const WRAP_STATUSES: readonly P15ElementorResponsiveWrapStatus[] = [
  'BLOCKED_INVALID_SOURCE_IR',
  'BLOCKED_UPSTREAM_GENERATION',
  'REJECTED_INVALID_MANIFEST',
  'NO_RESPONSIVE_WRAP_OVERRIDES',
  'RESPONSIVE_WRAPS_RESOLVED',
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

function validAlignContent(value: unknown): value is P15ElementorResponsiveAlignContent {
  return typeof value === 'string'
    && ALIGN_CONTENT_VALUES.includes(value as P15ElementorResponsiveAlignContent);
}

function baseResult(
  status: P15ElementorResponsiveAlignContentStatus,
  wrapPrerequisiteStatus: P15ElementorResponsiveWrapStatus | null,
  sourceIrFingerprint: string | null,
  wrappedCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedAlignContents: P15ElementorResponsiveAlignContentSummaryEntryV1[],
  issues: P15ElementorResponsiveAlignContentIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveAlignContentResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_RESULT_VERSION,
    status,
    wrapPrerequisiteStatus,
    sourceIrFingerprint,
    wrappedCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedAlignContents.length,
    resolvedAlignContents: resolvedAlignContents.map((entry) => ({ ...entry })),
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

function resolvedWrapFor(
  wrapResult: P15ElementorResponsiveWrapResultV1,
  sourceNodeId: string,
): P15ElementorResponsiveWrapResultV1['resolvedWraps'][number] | null {
  return wrapResult.resolvedWraps.find((entry) => entry.sourceNodeId === sourceNodeId) ?? null;
}

/**
 * Apply explicit responsive align-content overrides only on top of the exact #576 wrap result.
 *
 * Elementor 4.2.4 conditions align_content on wrap=wrap. This resolver therefore requires an
 * explicit same-container, same-breakpoint wrap value of "wrap"; it never infers wrap inheritance
 * or promotes nowrap/missing wrap state.
 */
export function resolveP15ElementorResponsiveContainerAlignContent(
  sourceValue: unknown,
  wrapManifestValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveAlignContentResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR',
      null,
      null,
      null,
      null,
      0,
      [],
      validation.issues.map((issue) => ({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_IR_INVALID' as const,
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
  const wrapResult = resolveP15ElementorResponsiveContainerWraps(source, wrapManifestValue);
  const wrapReady = (wrapResult.status === 'NO_RESPONSIVE_WRAP_OVERRIDES'
      || wrapResult.status === 'RESPONSIVE_WRAPS_RESOLVED')
    && wrapResult.candidate !== null
    && wrapResult.template !== null
    && validFingerprint(wrapResult.resolvedCandidateIdentityDigest);

  if (!wrapReady) {
    return baseResult(
      'BLOCKED_WRAP_PREREQUISITE',
      wrapResult.status,
      sourceIrFingerprint,
      null,
      null,
      sourceContainers.size,
      [],
      [{
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_WRAP_PREREQUISITE_INVALID',
        path: '$wrapManifest',
        message: 'Align-content resolution requires a valid exact responsive-wrap prerequisite result.',
      }],
      null,
      null,
    );
  }

  const wrappedCandidateIdentityDigest = wrapResult.resolvedCandidateIdentityDigest as string;
  const issues: P15ElementorResponsiveAlignContentIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveAlignContentEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_ALIGN_CONTENT_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive align-content manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive align-content manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive align-content manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.wrappedCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_WRAPPED_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.wrappedCandidateIdentityDigest',
        message: 'wrappedCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.wrappedCandidateIdentityDigest !== wrappedCandidateIdentityDigest) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_WRAPPED_CANDIDATE_IDENTITY_MISMATCH',
        path: '$manifest.wrappedCandidateIdentityDigest',
        message: 'Manifest is not bound to the exact current wrapped candidate identity.',
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
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive align-content resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGN_CONTENT_ENTRY_INVALID',
            path,
            message: 'Each responsive align-content entry may contain only sourceNodeId plus tablet/mobile align-content overrides.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGN_CONTENT_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive align-content sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGN_CONTENT_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive align-content sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletProvided = raw.tabletAlignContent !== undefined;
        const mobileProvided = raw.mobileAlignContent !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGN_CONTENT_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive align-content entry must explicitly provide tabletAlignContent and/or mobileAlignContent.',
          });
          continue;
        }

        if ((tabletProvided && !validAlignContent(raw.tabletAlignContent))
          || (mobileProvided && !validAlignContent(raw.mobileAlignContent))) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGN_CONTENT_VALUE_INVALID',
            path,
            message: 'Responsive align-content value is not supported by the exact Elementor 4.2.4 control.',
          });
          continue;
        }

        const wrapEntry = resolvedWrapFor(wrapResult, sourceNodeId);
        if (tabletProvided && wrapEntry?.tabletWrap !== 'wrap') {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGN_CONTENT_WRAP_REQUIRED',
            path: `${path}.tabletAlignContent`,
            message: 'Tablet align-content requires an explicit tabletWrap="wrap" prerequisite on the same container.',
          });
        }
        if (mobileProvided && wrapEntry?.mobileWrap !== 'wrap') {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGN_CONTENT_WRAP_REQUIRED',
            path: `${path}.mobileAlignContent`,
            message: 'Mobile align-content requires an explicit mobileWrap="wrap" prerequisite on the same container.',
          });
        }
        if ((tabletProvided && wrapEntry?.tabletWrap !== 'wrap')
          || (mobileProvided && wrapEntry?.mobileWrap !== 'wrap')) {
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletProvided
            ? { tabletAlignContent: raw.tabletAlignContent as P15ElementorResponsiveAlignContent }
            : {}),
          ...(mobileProvided
            ? { mobileAlignContent: raw.mobileAlignContent as P15ElementorResponsiveAlignContent }
            : {}),
        });
      }
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      wrapResult.status,
      sourceIrFingerprint,
      wrappedCandidateIdentityDigest,
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
      'NO_RESPONSIVE_ALIGN_CONTENT_OVERRIDES',
      wrapResult.status,
      sourceIrFingerprint,
      wrappedCandidateIdentityDigest,
      wrappedCandidateIdentityDigest,
      sourceContainers.size,
      [],
      [],
      wrapResult.template,
      wrapResult.candidate,
    );
  }

  const template = cloneP15ReadyElementorTemplate(wrapResult.candidate);
  const binding = bindP15NeutralSourceToGeneratedContainers(source, template);
  if (binding.issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      wrapResult.status,
      sourceIrFingerprint,
      wrappedCandidateIdentityDigest,
      null,
      sourceContainers.size,
      [],
      binding.issues.map((issue) => ({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_GENERATOR_BINDING_MISMATCH' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  const targetContainers = binding.containers;
  const bindingIssues: P15ElementorResponsiveAlignContentIssueV1[] = [];

  for (const [sourceNodeId, resolution] of resolutions) {
    const target = targetContainers.get(sourceNodeId);
    if (!target || !isRecord(target.settings)) {
      bindingIssues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (resolution.tabletAlignContent !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE.tabletSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Wrapped candidate already contains a tablet align-content override.',
      });
      continue;
    }
    if (resolution.mobileAlignContent !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE.mobileSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Wrapped candidate already contains a mobile align-content override.',
      });
      continue;
    }

    if (resolution.tabletAlignContent !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE.tabletSettingKey] =
        resolution.tabletAlignContent;
    }
    if (resolution.mobileAlignContent !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE.mobileSettingKey] =
        resolution.mobileAlignContent;
    }
  }

  if (bindingIssues.length > 0 || issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      wrapResult.status,
      sourceIrFingerprint,
      wrappedCandidateIdentityDigest,
      null,
      sourceContainers.size,
      [],
      [...issues, ...bindingIssues],
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
      wrapResult.status,
      sourceIrFingerprint,
      wrappedCandidateIdentityDigest,
      null,
      sourceContainers.size,
      [],
      [{
        code: 'P15_RESPONSIVE_ALIGN_CONTENT_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive align-content output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedAlignContents = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletAlignContent: entry.tabletAlignContent ?? null,
      mobileAlignContent: entry.mobileAlignContent ?? null,
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_ALIGN_CONTENT_RESOLVED',
    wrapResult.status,
    sourceIrFingerprint,
    wrappedCandidateIdentityDigest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedAlignContents,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveAlignContentIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveAlignContentIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveAlignContentSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileAlignContent', 'sourceNodeId', 'tabletAlignContent'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletAlignContent === null || validAlignContent(entry.tabletAlignContent))
    && (entry.mobileAlignContent === null || validAlignContent(entry.mobileAlignContent))
    && (entry.tabletAlignContent !== null || entry.mobileAlignContent !== null);
}

/** Serialize only sanitized responsive metadata; source text, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveAlignContentSummary(
  result: P15ElementorResponsiveAlignContentResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_WRAP_PREREQUISITE'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_ALIGN_CONTENT_OVERRIDES'
    || result.status === 'RESPONSIVE_ALIGN_CONTENT_RESOLVED';

  const validWrapStatus = result.wrapPrerequisiteStatus === null
    || WRAP_STATUSES.includes(result.wrapPrerequisiteStatus);
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedAlignContents.length;
  const uniqueIds = new Set(result.resolvedAlignContents.map((entry) => entry.sourceNodeId)).size
    === result.resolvedAlignContents.length;

  const sourceFingerprintRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR';
  const validSourceFingerprint = sourceFingerprintRequired
    ? validFingerprint(result.sourceIrFingerprint)
    : result.sourceIrFingerprint === null;

  const wrappedDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_WRAP_PREREQUISITE';
  const validWrappedDigest = wrappedDigestRequired
    ? validFingerprint(result.wrappedCandidateIdentityDigest)
    : result.wrappedCandidateIdentityDigest === null;

  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_ALIGN_CONTENT_OVERRIDES'
    || result.status === 'RESPONSIVE_ALIGN_CONTENT_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;

  const statusShapeValid = result.status === 'RESPONSIVE_ALIGN_CONTENT_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.wrappedCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_ALIGN_CONTENT_OVERRIDES'
      ? result.resolvedContainerCount === 0
        && result.wrappedCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedContainerCount === 0;

  if (!validStatus
    || !validWrapStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validWrappedDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedAlignContents.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-align-content result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_RESULT_VERSION,
    status: result.status,
    wrapPrerequisiteStatus: result.wrapPrerequisiteStatus,
    sourceIrFingerprint: result.sourceIrFingerprint,
    wrappedCandidateIdentityDigest: result.wrappedCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedAlignContents: result.resolvedAlignContents.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_EVIDENCE,
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
