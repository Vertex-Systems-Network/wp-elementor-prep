import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  validateP15NeutralExportDocument,
  type P15NeutralButtonNode,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
} from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import { cloneP15ReadyElementorTemplate } from './responsive-container-binding';
import type {
  ElementorElementV04,
  ElementorTemplateV04,
  ElementorWidgetV04,
} from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-responsive-button-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-responsive-button-alignment-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  controlName: 'align',
  desktopSettingKey: 'align',
  tabletSettingKey: 'align_tablet',
  mobileSettingKey: 'align_mobile',
  targetValues: ['left', 'center', 'right', 'justify'] as const,
});

export type P15ElementorResponsiveButtonAlignment =
  typeof P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE.targetValues[number];

export interface P15ElementorResponsiveButtonAlignmentEntryV1 {
  sourceNodeId: string;
  tabletAlign?: P15ElementorResponsiveButtonAlignment;
  mobileAlign?: P15ElementorResponsiveButtonAlignment;
}

export interface P15ElementorResponsiveButtonAlignmentManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  widgets: P15ElementorResponsiveButtonAlignmentEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveButtonAlignmentIssueCode =
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_ENTRY_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_NOT_BUTTON'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_VALUE_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_BUTTON_ALIGNMENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveButtonAlignmentIssueV1 {
  code: P15ElementorResponsiveButtonAlignmentIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveButtonAlignmentStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES'
  | 'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED';

export interface P15ElementorResponsiveButtonAlignmentSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlign: P15ElementorResponsiveButtonAlignment | null;
  mobileAlign: P15ElementorResponsiveButtonAlignment | null;
}

export interface P15ElementorResponsiveButtonAlignmentResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorResponsiveButtonAlignmentStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonWidgetCount: number;
  resolvedWidgetCount: number;
  resolvedAlignments: P15ElementorResponsiveButtonAlignmentSummaryEntryV1[];
  issues: P15ElementorResponsiveButtonAlignmentIssueV1[];
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

type ButtonWidgetBinding = {
  source: P15NeutralButtonNode;
  target: ElementorWidgetV04;
};

type ButtonWidgetBindingIssue = {
  path: string;
  message: string;
};

const MANIFEST_KEYS = [
  'baseCandidateIdentityDigest',
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
  'widgets',
] as const;

const ENTRY_KEYS = ['mobileAlign', 'sourceNodeId', 'tabletAlign'] as const;
const ALIGN_VALUES: readonly P15ElementorResponsiveButtonAlignment[] =
  P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE.targetValues;

const ISSUE_CODES: readonly P15ElementorResponsiveButtonAlignmentIssueCode[] = [
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_ENTRIES_INVALID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_ENTRY_INVALID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_NOT_BUTTON',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_VALUE_INVALID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_BUTTON_ALIGNMENT_RESOLVED_CANDIDATE_INVALID',
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

function validAlignment(value: unknown): value is P15ElementorResponsiveButtonAlignment {
  return typeof value === 'string'
    && ALIGN_VALUES.includes(value as P15ElementorResponsiveButtonAlignment);
}

function collectButtonWidgets(document: P15NeutralExportDocumentV1): Map<string, P15NeutralButtonNode> {
  const result = new Map<string, P15NeutralButtonNode>();
  function visit(nodes: readonly P15NeutralExportNode[]): void {
    for (const node of nodes) {
      if (node.kind === 'container') visit(node.children);
      else if (node.kind === 'button') result.set(node.sourceNodeId, node);
    }
  }
  visit(document.nodes);
  return result;
}

function expectedWidgetType(node: Exclude<P15NeutralExportNode, { kind: 'container' | 'review' }>): string {
  if (node.kind === 'heading') return 'heading';
  if (node.kind === 'text') return 'text-editor';
  if (node.kind === 'button') return 'button';
  return 'image';
}

function expectedDesktopButtonAlignment(
  value: P15NeutralButtonNode['align'],
): 'left' | 'center' | 'right' | undefined {
  if (value === 'start') return 'left';
  if (value === 'end') return 'right';
  return value;
}

function desktopAlignmentMatches(
  node: P15NeutralButtonNode,
  settings: Record<string, unknown>,
): boolean {
  const expected = expectedDesktopButtonAlignment(node.align);
  const hasAlign = Object.prototype.hasOwnProperty.call(settings, 'align');
  return expected === undefined ? !hasAlign : hasAlign && settings.align === expected;
}

function bindButtonWidgets(
  source: P15NeutralExportDocumentV1,
  template: ElementorTemplateV04,
): { widgets: Map<string, ButtonWidgetBinding>; issues: ButtonWidgetBindingIssue[] } {
  const widgets = new Map<string, ButtonWidgetBinding>();
  const issues: ButtonWidgetBindingIssue[] = [];
  function push(path: string, message: string): void {
    issues.push({ path, message });
  }
  function visit(
    sourceNodes: readonly P15NeutralExportNode[],
    targetElements: readonly ElementorElementV04[],
    targetPath: string,
  ): void {
    if (sourceNodes.length !== targetElements.length) {
      push(targetPath, 'Generated Elementor tree length does not match the exact review-free neutral source tree.');
      return;
    }
    for (let index = 0; index < sourceNodes.length; index += 1) {
      const sourceNode = sourceNodes[index];
      const target = targetElements[index];
      const path = `${targetPath}[${index}]`;
      if (!sourceNode || !target) {
        push(path, 'Generated source/target element pair is missing.');
        continue;
      }
      if (sourceNode.kind === 'review') {
        push(path, 'Review nodes cannot participate in responsive Button binding.');
        continue;
      }
      if (sourceNode.kind === 'container') {
        if (target.elType !== 'container') {
          push(path, 'Neutral container did not bind to a generated Elementor container.');
          continue;
        }
        if (!isRecord(target.settings) || target.settings.flex_direction !== sourceNode.direction) {
          push(`${path}.settings.flex_direction`, 'Generated container base direction drifted from the neutral source.');
          continue;
        }
        visit(sourceNode.children, target.elements, `${path}.elements`);
        continue;
      }
      const widgetType = expectedWidgetType(sourceNode);
      if (target.elType !== 'widget' || target.widgetType !== widgetType) {
        push(path, 'Neutral widget did not bind to the expected generated Elementor core widget.');
        continue;
      }
      if (sourceNode.kind === 'button') {
        if (!isRecord(target.settings) || !desktopAlignmentMatches(sourceNode, target.settings)) {
          push(`${path}.settings.align`, 'Generated Button desktop alignment drifted from the exact normalized target vocabulary.');
          continue;
        }
        widgets.set(sourceNode.sourceNodeId, { source: sourceNode, target });
      }
    }
  }
  visit(source.nodes, template.content, '$.content');
  return { widgets, issues };
}

function cloneSummaryEntry(
  entry: P15ElementorResponsiveButtonAlignmentSummaryEntryV1,
): P15ElementorResponsiveButtonAlignmentSummaryEntryV1 {
  return {
    sourceNodeId: entry.sourceNodeId,
    tabletAlign: entry.tabletAlign,
    mobileAlign: entry.mobileAlign,
  };
}

function baseResult(
  status: P15ElementorResponsiveButtonAlignmentStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceButtonWidgetCount: number,
  resolvedAlignments: P15ElementorResponsiveButtonAlignmentSummaryEntryV1[],
  issues: P15ElementorResponsiveButtonAlignmentIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveButtonAlignmentResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceButtonWidgetCount,
    resolvedWidgetCount: resolvedAlignments.length,
    resolvedAlignments: resolvedAlignments.map(cloneSummaryEntry),
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
 * Apply only explicit default tablet/mobile alignment overrides to exact generated Button bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive values,
 * alter normalized desktop alignment, add custom breakpoints, or claim responsive closure.
 */
export function resolveP15ElementorResponsiveButtonAlignments(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveButtonAlignmentResultV1 {
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
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const sourceButtons = collectButtonWidgets(source);
  const baseGeneration = generateElementorV3TemplateCandidate(source);

  if (baseGeneration.status !== 'GENERATED_LOCAL_CANDIDATE'
    || baseGeneration.template === null
    || baseGeneration.candidate === null) {
    return baseResult(
      'BLOCKED_UPSTREAM_GENERATION',
      sourceIrFingerprint,
      null,
      null,
      sourceButtons.size,
      [],
      [{
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive Button alignment requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveButtonAlignmentIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveButtonAlignmentEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive Button alignment manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive Button alignment manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive Button alignment manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive Button alignment cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.widgets)
      || manifestValue.widgets.length > P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_ENTRIES_INVALID',
        path: '$manifest.widgets',
        message: `widgets must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.widgets.length; index += 1) {
        const raw = manifestValue.widgets[index];
        const path = `$manifest.widgets[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_ENTRY_INVALID',
            path,
            message: 'Each responsive Button alignment entry may contain only sourceNodeId plus tablet/mobile alignment values.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive Button alignment sourceNodeId must be unique.',
          });
          continue;
        }
        const sourceNode = sourceButtons.get(sourceNodeId);
        if (!sourceNode) {
          issues.push({
            code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_SOURCE_NOT_BUTTON',
            path: `${path}.sourceNodeId`,
            message: 'Responsive Button alignment sourceNodeId must identify an existing neutral Button node.',
          });
          continue;
        }

        const tabletProvided = raw.tabletAlign !== undefined;
        const mobileProvided = raw.mobileAlign !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive Button alignment entry must explicitly provide tabletAlign and/or mobileAlign.',
          });
          continue;
        }

        if ((tabletProvided && !validAlignment(raw.tabletAlign))
          || (mobileProvided && !validAlignment(raw.mobileAlign))) {
          issues.push({
            code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_VALUE_INVALID',
            path,
            message: 'Button responsive alignment must be left, center, right or justify.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletProvided ? { tabletAlign: raw.tabletAlign as P15ElementorResponsiveButtonAlignment } : {}),
          ...(mobileProvided ? { mobileAlign: raw.mobileAlign as P15ElementorResponsiveButtonAlignment } : {}),
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
      sourceButtons.size,
      [],
      issues,
      null,
      null,
    );
  }

  if (resolutions.size === 0) {
    return baseResult(
      'NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES',
      sourceIrFingerprint,
      baseIdentity.digest,
      baseIdentity.digest,
      sourceButtons.size,
      [],
      [],
      baseGeneration.template,
      baseGeneration.candidate,
    );
  }

  const template = cloneP15ReadyElementorTemplate(baseGeneration.candidate);
  const binding = bindButtonWidgets(source, template);
  if (binding.issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceButtons.size,
      [],
      binding.issues.map((issue) => ({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_GENERATOR_BINDING_MISMATCH' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  for (const [sourceNodeId, resolution] of resolutions) {
    const bound = binding.widgets.get(sourceNodeId);
    if (!bound || !isRecord(bound.target.settings)) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated Button binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (resolution.tabletAlign !== undefined
      && Object.prototype.hasOwnProperty.call(
        bound.target.settings,
        P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE.tabletSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a tablet alignment override.',
      });
      continue;
    }
    if (resolution.mobileAlign !== undefined
      && Object.prototype.hasOwnProperty.call(
        bound.target.settings,
        P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE.mobileSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a mobile alignment override.',
      });
      continue;
    }

    if (resolution.tabletAlign !== undefined) {
      bound.target.settings[P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE.tabletSettingKey] =
        resolution.tabletAlign;
    }
    if (resolution.mobileAlign !== undefined) {
      bound.target.settings[P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE.mobileSettingKey] =
        resolution.mobileAlign;
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceButtons.size,
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
      sourceButtons.size,
      [],
      [{
        code: 'P15_RESPONSIVE_BUTTON_ALIGNMENT_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive Button alignment output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedAlignments = [...resolutions.values()]
    .map((entry) => {
      if (!sourceButtons.has(entry.sourceNodeId)) {
        throw new Error('Responsive Button alignment source binding disappeared.');
      }
      return {
        sourceNodeId: entry.sourceNodeId,
        tabletAlign: entry.tabletAlign ?? null,
        mobileAlign: entry.mobileAlign ?? null,
      };
    })
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceButtons.size,
    resolvedAlignments,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveButtonAlignmentIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveButtonAlignmentIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveButtonAlignmentSummaryEntryV1): boolean {
  if (!isRecord(entry)) return false;
  return exactKeys(entry, ['mobileAlign', 'sourceNodeId', 'tabletAlign'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletAlign === null || validAlignment(entry.tabletAlign))
    && (entry.mobileAlign === null || validAlignment(entry.mobileAlign))
    && (entry.tabletAlign !== null || entry.mobileAlign !== null);
}

/** Serialize only sanitized alignment metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveButtonAlignmentSummary(
  result: P15ElementorResponsiveButtonAlignmentResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES'
    || result.status === 'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceButtonWidgetCount)
    && result.sourceButtonWidgetCount >= 0
    && Number.isSafeInteger(result.resolvedWidgetCount)
    && result.resolvedWidgetCount >= 0
    && result.resolvedWidgetCount <= result.sourceButtonWidgetCount
    && result.resolvedWidgetCount === result.resolvedAlignments.length;
  const uniqueIds = new Set(result.resolvedAlignments.map((entry) => entry.sourceNodeId)).size
    === result.resolvedAlignments.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES'
    || result.status === 'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_BUTTON_ALIGNMENTS_RESOLVED'
    ? result.resolvedWidgetCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_BUTTON_ALIGNMENT_OVERRIDES'
      ? result.resolvedWidgetCount === 0
        && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedWidgetCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedAlignments.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-button-alignment result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceButtonWidgetCount: result.sourceButtonWidgetCount,
    resolvedWidgetCount: result.resolvedWidgetCount,
    resolvedAlignments: result.resolvedAlignments.map(cloneSummaryEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_EVIDENCE,
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
