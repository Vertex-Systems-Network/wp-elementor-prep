import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralButtonNode,
} from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import { cloneP15ReadyElementorTemplate } from './responsive-container-binding';
import type {
  ElementorElementV04,
  ElementorTemplateV04,
  ElementorWidgetV04,
} from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION =
  'p15-elementor-button-typography-metrics-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_RESULT_VERSION =
  'p15-elementor-button-typography-metrics-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_FONT_FAMILY_MAX_LENGTH = 128 as const;
export const P15_ELEMENTOR_BUTTON_FONT_SIZE_MIN_PX = 1 as const;
export const P15_ELEMENTOR_BUTTON_FONT_SIZE_MAX_PX = 200 as const;
export const P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MIN_PX = 1 as const;
export const P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MAX_PX = 400 as const;
export const P15_ELEMENTOR_BUTTON_LETTER_SPACING_MIN_PX = -5 as const;
export const P15_ELEMENTOR_BUTTON_LETTER_SPACING_MAX_PX = 10 as const;
export const P15_ELEMENTOR_BUTTON_LETTER_SPACING_STEP_PX = 0.1 as const;
export const P15_ELEMENTOR_BUTTON_WORD_SPACING_MIN_PX = 0 as const;
export const P15_ELEMENTOR_BUTTON_WORD_SPACING_MAX_PX = 50 as const;

export const P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  typographyGroupSourcePath: 'includes/controls/groups/typography.php',
  typographyGroupSourceBlobSha: 'eea951b6331bd84c80e24b7fb6ab249e5c4c41a1',
  groupBaseSourcePath: 'includes/controls/groups/base.php',
  groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  groupName: 'typography',
  groupPrefixRule: '{{ControlName}}_',
  starterFieldName: 'typography',
  starterSettingKey: 'typography_typography',
  starterValue: 'custom',
  fontFamilyFieldName: 'font_family',
  fontFamilySettingKey: 'typography_font_family',
  fontFamilyMaxLength: P15_ELEMENTOR_BUTTON_FONT_FAMILY_MAX_LENGTH,
  fontSizeFieldName: 'font_size',
  fontSizeSettingKey: 'typography_font_size',
  fontSizeUnit: 'px',
  fontSizeMinPx: P15_ELEMENTOR_BUTTON_FONT_SIZE_MIN_PX,
  fontSizeMaxPx: P15_ELEMENTOR_BUTTON_FONT_SIZE_MAX_PX,
  lineHeightFieldName: 'line_height',
  lineHeightSettingKey: 'typography_line_height',
  lineHeightUnit: 'px',
  lineHeightMinPx: P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MIN_PX,
  lineHeightMaxPx: P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MAX_PX,
  letterSpacingFieldName: 'letter_spacing',
  letterSpacingSettingKey: 'typography_letter_spacing',
  letterSpacingUnit: 'px',
  letterSpacingMinPx: P15_ELEMENTOR_BUTTON_LETTER_SPACING_MIN_PX,
  letterSpacingMaxPx: P15_ELEMENTOR_BUTTON_LETTER_SPACING_MAX_PX,
  letterSpacingStepPx: P15_ELEMENTOR_BUTTON_LETTER_SPACING_STEP_PX,
  wordSpacingFieldName: 'word_spacing',
  wordSpacingSettingKey: 'typography_word_spacing',
  wordSpacingUnit: 'px',
  wordSpacingMinPx: P15_ELEMENTOR_BUTTON_WORD_SPACING_MIN_PX,
  wordSpacingMaxPx: P15_ELEMENTOR_BUTTON_WORD_SPACING_MAX_PX,
  sourceResponsiveFields: ['font_size', 'line_height', 'letter_spacing', 'word_spacing'] as const,
  responsiveWritesIncluded: false,
  globalFontResolutionIncluded: false,
  variableFontAxesIncluded: false,
});

export interface P15ElementorButtonTypographyMetricsEntryV1 {
  sourceNodeId: string;
  fontFamily?: string;
  fontSizePx?: number;
  lineHeightPx?: number;
  letterSpacingPx?: number;
  wordSpacingPx?: number;
}

export interface P15ElementorButtonTypographyMetricsManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonTypographyMetricsEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonTypographyMetricsIssueCode =
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_IR_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_ENTRIES_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_ENTRY_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_FONT_FAMILY_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_FONT_SIZE_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_LINE_HEIGHT_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_LETTER_SPACING_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_WORD_SPACING_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_OVERRIDE_REQUIRED'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_TYPOGRAPHY_METRICS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonTypographyMetricsIssueV1 {
  code: P15ElementorButtonTypographyMetricsIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonTypographyMetricsStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES'
  | 'BUTTON_TYPOGRAPHY_METRICS_RESOLVED';

export interface P15ElementorButtonTypographyMetricsResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_RESULT_VERSION;
  status: P15ElementorButtonTypographyMetricsStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedTypographyMetrics: P15ElementorButtonTypographyMetricsEntryV1[];
  issues: P15ElementorButtonTypographyMetricsIssueV1[];
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

type ButtonBinding = {
  source: P15NeutralButtonNode;
  target: ElementorWidgetV04;
};

type ButtonBindingIssue = {
  path: string;
  message: string;
};

const MANIFEST_KEYS = [
  'baseCandidateIdentityDigest',
  'buttons',
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

const ENTRY_KEYS = ['fontFamily', 'fontSizePx', 'letterSpacingPx', 'lineHeightPx', 'sourceNodeId', 'wordSpacingPx'] as const;

const ISSUE_CODES: readonly P15ElementorButtonTypographyMetricsIssueCode[] = [
  'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_IR_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_UPSTREAM_GENERATION_NOT_READY',
  'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_NOT_OBJECT',
  'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_FIELDS_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_MISMATCH',
  'P15_BUTTON_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_BUTTON_TYPOGRAPHY_METRICS_ENTRIES_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_ENTRY_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_DUPLICATE_SOURCE_ID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_NOT_BUTTON',
  'P15_BUTTON_TYPOGRAPHY_METRICS_FONT_FAMILY_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_FONT_SIZE_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_LINE_HEIGHT_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_LETTER_SPACING_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_WORD_SPACING_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_OVERRIDE_REQUIRED',
  'P15_BUTTON_TYPOGRAPHY_METRICS_AUTHORITY_FLAGS_INVALID',
  'P15_BUTTON_TYPOGRAPHY_METRICS_GENERATOR_BINDING_MISMATCH',
  'P15_BUTTON_TYPOGRAPHY_METRICS_EXISTING_OVERRIDE_CONFLICT',
  'P15_BUTTON_TYPOGRAPHY_METRICS_RESOLVED_CANDIDATE_INVALID',
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

function validFontFamily(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= P15_ELEMENTOR_BUTTON_FONT_FAMILY_MAX_LENGTH
    && value.trim() === value
    && /^[A-Za-z0-9][A-Za-z0-9 ._+-]*$/.test(value);
}

function validIntegerRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= min
    && value <= max;
}

function validLetterSpacing(value: unknown): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)
    || value < P15_ELEMENTOR_BUTTON_LETTER_SPACING_MIN_PX
    || value > P15_ELEMENTOR_BUTTON_LETTER_SPACING_MAX_PX) return false;
  const scaled = value / P15_ELEMENTOR_BUTTON_LETTER_SPACING_STEP_PX;
  return Math.abs(scaled - Math.round(scaled)) < 1e-9;
}

function elementorSliderPx(value: number): Record<string, unknown> {
  return { unit: 'px', size: value, sizes: [] };
}

function cloneEntry(
  value: P15ElementorButtonTypographyMetricsEntryV1,
): P15ElementorButtonTypographyMetricsEntryV1 {
  return {
    sourceNodeId: value.sourceNodeId,
    ...(value.fontFamily !== undefined ? { fontFamily: value.fontFamily } : {}),
    ...(value.fontSizePx !== undefined ? { fontSizePx: value.fontSizePx } : {}),
    ...(value.lineHeightPx !== undefined ? { lineHeightPx: value.lineHeightPx } : {}),
    ...(value.letterSpacingPx !== undefined ? { letterSpacingPx: value.letterSpacingPx } : {}),
    ...(value.wordSpacingPx !== undefined ? { wordSpacingPx: value.wordSpacingPx } : {}),
  };
}

function collectButtonNodes(document: P15NeutralExportDocumentV1): Map<string, P15NeutralButtonNode> {
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

function expectedButtonLink(node: P15NeutralButtonNode): Record<string, unknown> | undefined {
  if (node.url === undefined) return undefined;
  return {
    url: node.url,
    is_external: node.openInNewTab ? 'on' : '',
    nofollow: node.nofollow ? 'on' : '',
    custom_attributes: '',
  };
}

function buttonBaseSettingsMatch(
  node: P15NeutralButtonNode,
  settings: Record<string, unknown>,
): boolean {
  if (settings.text !== node.text) return false;

  const expectedAlign = expectedDesktopButtonAlignment(node.align);
  const hasAlign = Object.prototype.hasOwnProperty.call(settings, 'align');
  if (expectedAlign === undefined ? hasAlign : !hasAlign || settings.align !== expectedAlign) return false;

  const expectedLink = expectedButtonLink(node);
  const hasLink = Object.prototype.hasOwnProperty.call(settings, 'link');
  if (expectedLink === undefined) return !hasLink;
  if (!hasLink
    || !isRecord(settings.link)
    || !exactKeys(settings.link, ['custom_attributes', 'is_external', 'nofollow', 'url'])) {
    return false;
  }

  return settings.link.url === expectedLink.url
    && settings.link.is_external === expectedLink.is_external
    && settings.link.nofollow === expectedLink.nofollow
    && settings.link.custom_attributes === expectedLink.custom_attributes;
}

function bindButtonWidgets(
  source: P15NeutralExportDocumentV1,
  template: ElementorTemplateV04,
): { buttons: Map<string, ButtonBinding>; issues: ButtonBindingIssue[] } {
  const buttons = new Map<string, ButtonBinding>();
  const issues: ButtonBindingIssue[] = [];

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
      const path = targetPath + '[' + index + ']';

      if (!sourceNode || !target) {
        push(path, 'Generated source/target element pair is missing.');
        continue;
      }
      if (sourceNode.kind === 'review') {
        push(path, 'Review nodes cannot participate in Button typography binding.');
        continue;
      }
      if (sourceNode.kind === 'container') {
        if (target.elType !== 'container') {
          push(path, 'Neutral container did not bind to a generated Elementor container.');
          continue;
        }
        if (!isRecord(target.settings) || target.settings.flex_direction !== sourceNode.direction) {
          push(path + '.settings.flex_direction', 'Generated container base direction drifted from the neutral source.');
          continue;
        }
        visit(sourceNode.children, target.elements, path + '.elements');
        continue;
      }

      const widgetType = expectedWidgetType(sourceNode);
      if (target.elType !== 'widget' || target.widgetType !== widgetType) {
        push(path, 'Neutral widget did not bind to the expected generated Elementor core widget.');
        continue;
      }

      if (sourceNode.kind === 'button') {
        if (!isRecord(target.settings) || !buttonBaseSettingsMatch(sourceNode, target.settings)) {
          push(path + '.settings', 'Generated Button base settings drifted from the exact neutral source.');
          continue;
        }
        buttons.set(sourceNode.sourceNodeId, { source: sourceNode, target });
      }
    }
  }

  visit(source.nodes, template.content, '$.content');
  return { buttons, issues };
}

function baseResult(
  status: P15ElementorButtonTypographyMetricsStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceButtonCount: number,
  resolvedTypographyMetrics: P15ElementorButtonTypographyMetricsEntryV1[],
  issues: P15ElementorButtonTypographyMetricsIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorButtonTypographyMetricsResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceButtonCount,
    resolvedButtonCount: resolvedTypographyMetrics.length,
    resolvedTypographyMetrics: resolvedTypographyMetrics.map(cloneEntry),
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

export function resolveP15ElementorButtonTypographyMetrics(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonTypographyMetricsResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR',
      null, null, null, 0, [],
      validation.issues.map((issue) => ({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null, null,
    );
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const sourceButtons = collectButtonNodes(source);
  const baseGeneration = generateElementorV3TemplateCandidate(source);

  if (baseGeneration.status !== 'GENERATED_LOCAL_CANDIDATE'
    || baseGeneration.template === null
    || baseGeneration.candidate === null) {
    return baseResult(
      'BLOCKED_UPSTREAM_GENERATION',
      sourceIrFingerprint, null, null, sourceButtons.size, [],
      [{
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Button typography metrics resolution requires an existing review-free generated local candidate.',
      }],
      null, null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorButtonTypographyMetricsIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorButtonTypographyMetricsEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Button typography metrics manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Button typography metrics manifest contains unknown or missing fields.',
      });
    }

    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Button typography metrics manifest schema/version is unsupported.',
      });
    }

    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }

    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Button typography metrics resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
      });
    }

    if (!Array.isArray(manifestValue.buttons)
      || manifestValue.buttons.length > P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MAX_ENTRIES) {
      issues.push({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_ENTRIES_INVALID',
        path: '$manifest.buttons',
        message: 'buttons must be a bounded array.',
      });
    } else {
      for (let index = 0; index < manifestValue.buttons.length; index += 1) {
        const raw = manifestValue.buttons[index];
        const path = '$manifest.buttons[' + index + ']';

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_TYPOGRAPHY_METRICS_ENTRY_INVALID',
            path,
            message: 'Each entry may contain only sourceNodeId and explicit fontFamily/fontSizePx/lineHeightPx/letterSpacingPx/wordSpacingPx values.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_TYPOGRAPHY_METRICS_DUPLICATE_SOURCE_ID',
            path: path + '.sourceNodeId',
            message: 'Button typography sourceNodeId must be unique.',
          });
          continue;
        }

        if (!sourceButtons.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_TYPOGRAPHY_METRICS_SOURCE_NOT_BUTTON',
            path: path + '.sourceNodeId',
            message: 'sourceNodeId must identify an existing neutral Button node.',
          });
          continue;
        }

        const fontFamilyProvided = raw.fontFamily !== undefined;
        const fontSizeProvided = raw.fontSizePx !== undefined;
        const lineHeightProvided = raw.lineHeightPx !== undefined;
        const letterSpacingProvided = raw.letterSpacingPx !== undefined;
        const wordSpacingProvided = raw.wordSpacingPx !== undefined;

        if (!fontFamilyProvided && !fontSizeProvided && !lineHeightProvided
          && !letterSpacingProvided && !wordSpacingProvided) {
          issues.push({ code: 'P15_BUTTON_TYPOGRAPHY_METRICS_OVERRIDE_REQUIRED', path,
            message: 'Each entry must explicitly provide at least one typography metric capability.' });
          continue;
        }
        if (fontFamilyProvided && !validFontFamily(raw.fontFamily)) {
          issues.push({ code: 'P15_BUTTON_TYPOGRAPHY_METRICS_FONT_FAMILY_INVALID', path: path + '.fontFamily',
            message: 'fontFamily must be one bounded literal family name with no quotes, commas, escapes, tokens or fallback list.' });
          continue;
        }
        if (fontSizeProvided && !validIntegerRange(raw.fontSizePx, P15_ELEMENTOR_BUTTON_FONT_SIZE_MIN_PX, P15_ELEMENTOR_BUTTON_FONT_SIZE_MAX_PX)) {
          issues.push({ code: 'P15_BUTTON_TYPOGRAPHY_METRICS_FONT_SIZE_INVALID', path: path + '.fontSizePx',
            message: 'fontSizePx must be an integer px value in the exact Elementor 4.2.4 range 1..200.' });
          continue;
        }
        if (lineHeightProvided && !validIntegerRange(raw.lineHeightPx, P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MIN_PX, P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MAX_PX)) {
          issues.push({ code: 'P15_BUTTON_TYPOGRAPHY_METRICS_LINE_HEIGHT_INVALID', path: path + '.lineHeightPx',
            message: 'lineHeightPx must be a bounded integer px value in 1..400.' });
          continue;
        }
        if (letterSpacingProvided && !validLetterSpacing(raw.letterSpacingPx)) {
          issues.push({ code: 'P15_BUTTON_TYPOGRAPHY_METRICS_LETTER_SPACING_INVALID', path: path + '.letterSpacingPx',
            message: 'letterSpacingPx must be a finite px value in -5..10 using 0.1 increments.' });
          continue;
        }
        if (wordSpacingProvided && !validIntegerRange(raw.wordSpacingPx, P15_ELEMENTOR_BUTTON_WORD_SPACING_MIN_PX, P15_ELEMENTOR_BUTTON_WORD_SPACING_MAX_PX)) {
          issues.push({ code: 'P15_BUTTON_TYPOGRAPHY_METRICS_WORD_SPACING_INVALID', path: path + '.wordSpacingPx',
            message: 'wordSpacingPx must be a bounded integer px value in 0..50.' });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(fontFamilyProvided ? { fontFamily: raw.fontFamily as string } : {}),
          ...(fontSizeProvided ? { fontSizePx: raw.fontSizePx as number } : {}),
          ...(lineHeightProvided ? { lineHeightPx: raw.lineHeightPx as number } : {}),
          ...(letterSpacingProvided ? { letterSpacingPx: raw.letterSpacingPx as number } : {}),
          ...(wordSpacingProvided ? { wordSpacingPx: raw.wordSpacingPx as number } : {}),
        });
      }
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint, baseIdentity.digest, null, sourceButtons.size, [], issues, null, null,
    );
  }

  if (resolutions.size === 0) {
    return baseResult(
      'NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES',
      sourceIrFingerprint, baseIdentity.digest, baseIdentity.digest, sourceButtons.size, [], [],
      baseGeneration.template, baseGeneration.candidate,
    );
  }

  const template = cloneP15ReadyElementorTemplate(baseGeneration.candidate);
  const binding = bindButtonWidgets(source, template);

  if (binding.issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint, baseIdentity.digest, null, sourceButtons.size, [],
      binding.issues.map((issue) => ({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_GENERATOR_BINDING_MISMATCH' as const,
        path: issue.path,
        message: issue.message,
      })),
      null, null,
    );
  }

  for (const [sourceNodeId, resolution] of resolutions) {
    const target = binding.buttons.get(sourceNodeId)?.target;
    if (!target || !isRecord(target.settings)) {
      issues.push({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: 'Generated Button binding missing for sourceNodeId ' + sourceNodeId + '.',
      });
      continue;
    }

    const conflictingKey = Object.keys(target.settings).find((key) => key.startsWith('typography_'));
    if (conflictingKey) {
      issues.push({
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_EXISTING_OVERRIDE_CONFLICT',
        path: '$source.' + sourceNodeId,
        message: 'Generated base candidate already contains Button typography setting ' + conflictingKey + '.',
      });
      continue;
    }

    target.settings[P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE.starterSettingKey] =
      P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE.starterValue;

    if (resolution.fontFamily !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE.fontFamilySettingKey] = resolution.fontFamily;
    }
    if (resolution.fontSizePx !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE.fontSizeSettingKey] = elementorSliderPx(resolution.fontSizePx);
    }
    if (resolution.lineHeightPx !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE.lineHeightSettingKey] = elementorSliderPx(resolution.lineHeightPx);
    }
    if (resolution.letterSpacingPx !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE.letterSpacingSettingKey] = elementorSliderPx(resolution.letterSpacingPx);
    }
    if (resolution.wordSpacingPx !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE.wordSpacingSettingKey] = elementorSliderPx(resolution.wordSpacingPx);
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint, baseIdentity.digest, null, sourceButtons.size, [], issues, null, null,
    );
  }

  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
    || !candidate.validation.valid
    || candidate.templateJson === null) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint, baseIdentity.digest, null, sourceButtons.size, [],
      [{
        code: 'P15_BUTTON_TYPOGRAPHY_METRICS_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Button typography metrics output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null, null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedTypographyMetrics = [...resolutions.values()]
    .map(cloneEntry)
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'BUTTON_TYPOGRAPHY_METRICS_RESOLVED',
    sourceIrFingerprint, baseIdentity.digest, resolvedIdentity.digest, sourceButtons.size,
    resolvedTypographyMetrics, [], template, candidate,
  );
}

function validIssue(issue: P15ElementorButtonTypographyMetricsIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorButtonTypographyMetricsIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorButtonTypographyMetricsEntryV1): boolean {
  if (!isRecord(entry) || !onlyAllowedKeys(entry, ENTRY_KEYS) || !validSourceNodeId(entry.sourceNodeId)) return false;
  const fontFamilyProvided = entry.fontFamily !== undefined;
  const fontSizeProvided = entry.fontSizePx !== undefined;
  const lineHeightProvided = entry.lineHeightPx !== undefined;
  const letterSpacingProvided = entry.letterSpacingPx !== undefined;
  const wordSpacingProvided = entry.wordSpacingPx !== undefined;
  return (fontFamilyProvided || fontSizeProvided || lineHeightProvided || letterSpacingProvided || wordSpacingProvided)
    && (!fontFamilyProvided || validFontFamily(entry.fontFamily))
    && (!fontSizeProvided || validIntegerRange(entry.fontSizePx, P15_ELEMENTOR_BUTTON_FONT_SIZE_MIN_PX, P15_ELEMENTOR_BUTTON_FONT_SIZE_MAX_PX))
    && (!lineHeightProvided || validIntegerRange(entry.lineHeightPx, P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MIN_PX, P15_ELEMENTOR_BUTTON_LINE_HEIGHT_MAX_PX))
    && (!letterSpacingProvided || validLetterSpacing(entry.letterSpacingPx))
    && (!wordSpacingProvided || validIntegerRange(entry.wordSpacingPx, P15_ELEMENTOR_BUTTON_WORD_SPACING_MIN_PX, P15_ELEMENTOR_BUTTON_WORD_SPACING_MAX_PX));
}

export function serializeP15ElementorButtonTypographyMetricsSummary(
  result: P15ElementorButtonTypographyMetricsResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES'
    || result.status === 'BUTTON_TYPOGRAPHY_METRICS_RESOLVED';

  const validCounts = Number.isSafeInteger(result.sourceButtonCount)
    && result.sourceButtonCount >= 0
    && Number.isSafeInteger(result.resolvedButtonCount)
    && result.resolvedButtonCount >= 0
    && result.resolvedButtonCount <= result.sourceButtonCount
    && result.resolvedButtonCount === result.resolvedTypographyMetrics.length;

  const uniqueIds = new Set(result.resolvedTypographyMetrics.map((entry) => entry.sourceNodeId)).size
    === result.resolvedTypographyMetrics.length;

  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES'
    || result.status === 'BUTTON_TYPOGRAPHY_METRICS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'BUTTON_TYPOGRAPHY_METRICS_RESOLVED'
    ? result.resolvedButtonCount > 0 && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_BUTTON_TYPOGRAPHY_METRICS_OVERRIDES'
      ? result.resolvedButtonCount === 0 && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedButtonCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedTypographyMetrics.every(validSummaryEntry)
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
    throw new Error('Invalid or authority-inflated P15 button-typography-metrics result.');
  }

  return JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceButtonCount: result.sourceButtonCount,
    resolvedButtonCount: result.resolvedButtonCount,
    resolvedTypographyMetrics: result.resolvedTypographyMetrics.map(cloneEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_EVIDENCE,
    styleInferencePerformed: false,
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    responsiveClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2) + '\n';
}
