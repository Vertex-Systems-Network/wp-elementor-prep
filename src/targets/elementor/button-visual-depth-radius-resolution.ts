import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  P15_NEUTRAL_EXPORT_MAX_RADIUS_PX,
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

export const P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION =
  'p15-elementor-button-visual-depth-radius-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_RESULT_VERSION =
  'p15-elementor-button-visual-depth-radius-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  groupBaseSourcePath: 'includes/controls/groups/base.php',
  groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  textShadowGroupSourcePath: 'includes/controls/groups/text-shadow.php',
  textShadowGroupSourceBlobSha: 'd587b60ada0e4303e8168b334354c8c04fcccd84',
  textShadowControlSourcePath: 'includes/controls/text-shadow.php',
  textShadowControlSourceBlobSha: 'c6d9615d280e20de8356a90351f95d8a36c18d2f',
  boxShadowGroupSourcePath: 'includes/controls/groups/box-shadow.php',
  boxShadowGroupSourceBlobSha: '1c068c900db0ff2593089028d67fb6d897dbaa33',
  boxShadowControlSourcePath: 'includes/controls/box-shadow.php',
  boxShadowControlSourceBlobSha: 'e55cf9af34db5cc3e73dc295cd9f35b437da6fa7',
  dimensionsControlSourcePath: 'includes/controls/dimensions.php',
  dimensionsControlSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  buttonSelector: '{{WRAPPER}} .elementor-button',
  textShadowGroupName: 'text_shadow',
  textShadowTypeSettingKey: 'text_shadow_text_shadow_type',
  textShadowSettingKey: 'text_shadow_text_shadow',
  textShadowEnabledValue: 'yes',
  boxShadowGroupName: 'button_box_shadow',
  boxShadowTypeSettingKey: 'button_box_shadow_box_shadow_type',
  boxShadowSettingKey: 'button_box_shadow_box_shadow',
  boxShadowPositionSettingKey: 'button_box_shadow_box_shadow_position',
  boxShadowEnabledValue: 'yes',
  borderRadiusControlName: 'border_radius',
  borderRadiusDesktopSettingKey: 'border_radius',
  borderRadiusTabletSettingKey: 'border_radius_tablet',
  borderRadiusMobileSettingKey: 'border_radius_mobile',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  radiusMinPx: 0,
  radiusMaxPx: P15_NEUTRAL_EXPORT_MAX_RADIUS_PX,
});

export interface P15ElementorButtonTextShadowV1 {
  horizontal: number;
  vertical: number;
  blur: number;
  color: string;
}

export interface P15ElementorButtonBoxShadowV1 {
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
  position: 'outline' | 'inset';
}

export interface P15ElementorButtonResponsiveRadiusPxV1 {
  desktop: number;
  tablet: number;
  mobile: number;
}

export interface P15ElementorButtonVisualDepthRadiusEntryV1 {
  sourceNodeId: string;
  textShadow?: P15ElementorButtonTextShadowV1;
  boxShadow?: P15ElementorButtonBoxShadowV1;
  borderRadiusPx?: P15ElementorButtonResponsiveRadiusPxV1;
}

export interface P15ElementorButtonVisualDepthRadiusManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonVisualDepthRadiusEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonVisualDepthRadiusIssueCode =
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_IR_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_ENTRIES_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_ENTRY_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_TEXT_SHADOW_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_BOX_SHADOW_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_RADIUS_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonVisualDepthRadiusIssueV1 {
  code: P15ElementorButtonVisualDepthRadiusIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonVisualDepthRadiusStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_VISUAL_DEPTH_RADIUS_OVERRIDES'
  | 'BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED';

export interface P15ElementorButtonVisualDepthRadiusResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_RESULT_VERSION;
  status: P15ElementorButtonVisualDepthRadiusStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedStyles: P15ElementorButtonVisualDepthRadiusEntryV1[];
  issues: P15ElementorButtonVisualDepthRadiusIssueV1[];
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

type ButtonBinding = { source: P15NeutralButtonNode; target: ElementorWidgetV04 };
type ButtonBindingIssue = { path: string; message: string };

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
const ENTRY_KEYS = ['borderRadiusPx', 'boxShadow', 'sourceNodeId', 'textShadow'] as const;
const TEXT_SHADOW_KEYS = ['blur', 'color', 'horizontal', 'vertical'] as const;
const BOX_SHADOW_KEYS = ['blur', 'color', 'horizontal', 'position', 'spread', 'vertical'] as const;
const RADIUS_KEYS = ['desktop', 'mobile', 'tablet'] as const;

const ISSUE_CODES: readonly P15ElementorButtonVisualDepthRadiusIssueCode[] = [
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_IR_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_UPSTREAM_GENERATION_NOT_READY',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_NOT_OBJECT',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_FIELDS_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_FINGERPRINT_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_FINGERPRINT_MISMATCH',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_ENTRIES_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_ENTRY_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_DUPLICATE_SOURCE_ID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_NOT_BUTTON',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_TEXT_SHADOW_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_BOX_SHADOW_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_RADIUS_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_AUTHORITY_FLAGS_INVALID',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_GENERATOR_BINDING_MISMATCH',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_EXISTING_OVERRIDE_CONFLICT',
  'P15_BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED_CANDIDATE_INVALID',
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

function validColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/.test(value);
}

function validIntegerRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && Number.isInteger(value)
    && value >= min
    && value <= max;
}

function validTextShadow(value: unknown): value is P15ElementorButtonTextShadowV1 {
  if (!isRecord(value) || !exactKeys(value, TEXT_SHADOW_KEYS)) return false;
  return validIntegerRange(value.horizontal, -100, 100)
    && validIntegerRange(value.vertical, -100, 100)
    && validIntegerRange(value.blur, 0, 100)
    && validColor(value.color);
}

function validBoxShadow(value: unknown): value is P15ElementorButtonBoxShadowV1 {
  if (!isRecord(value) || !exactKeys(value, BOX_SHADOW_KEYS)) return false;
  return validIntegerRange(value.horizontal, -100, 100)
    && validIntegerRange(value.vertical, -100, 100)
    && validIntegerRange(value.blur, 0, 100)
    && validIntegerRange(value.spread, -100, 100)
    && validColor(value.color)
    && (value.position === 'outline' || value.position === 'inset');
}

function validRadius(value: unknown): value is P15ElementorButtonResponsiveRadiusPxV1 {
  if (!isRecord(value) || !exactKeys(value, RADIUS_KEYS)) return false;
  return validIntegerRange(value.desktop, 0, P15_NEUTRAL_EXPORT_MAX_RADIUS_PX)
    && validIntegerRange(value.tablet, 0, P15_NEUTRAL_EXPORT_MAX_RADIUS_PX)
    && validIntegerRange(value.mobile, 0, P15_NEUTRAL_EXPORT_MAX_RADIUS_PX);
}

function cloneTextShadow(value: P15ElementorButtonTextShadowV1): P15ElementorButtonTextShadowV1 {
  return { ...value };
}
function cloneBoxShadow(value: P15ElementorButtonBoxShadowV1): P15ElementorButtonBoxShadowV1 {
  return { ...value };
}
function cloneRadius(value: P15ElementorButtonResponsiveRadiusPxV1): P15ElementorButtonResponsiveRadiusPxV1 {
  return { ...value };
}
function cloneEntry(value: P15ElementorButtonVisualDepthRadiusEntryV1): P15ElementorButtonVisualDepthRadiusEntryV1 {
  return {
    sourceNodeId: value.sourceNodeId,
    ...(value.textShadow === undefined ? {} : { textShadow: cloneTextShadow(value.textShadow) }),
    ...(value.boxShadow === undefined ? {} : { boxShadow: cloneBoxShadow(value.boxShadow) }),
    ...(value.borderRadiusPx === undefined ? {} : { borderRadiusPx: cloneRadius(value.borderRadiusPx) }),
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

function buttonBaseSettingsMatch(node: P15NeutralButtonNode, settings: Record<string, unknown>): boolean {
  if (settings.text !== node.text) return false;
  const expectedAlign = expectedDesktopButtonAlignment(node.align);
  const hasAlign = Object.prototype.hasOwnProperty.call(settings, 'align');
  if (expectedAlign === undefined ? hasAlign : !hasAlign || settings.align !== expectedAlign) return false;
  const expectedLink = expectedButtonLink(node);
  const hasLink = Object.prototype.hasOwnProperty.call(settings, 'link');
  if (expectedLink === undefined) return !hasLink;
  if (!hasLink
    || !isRecord(settings.link)
    || !exactKeys(settings.link, ['custom_attributes', 'is_external', 'nofollow', 'url'])) return false;
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
  function push(path: string, message: string): void { issues.push({ path, message }); }
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
        push(path, 'Review nodes cannot participate in Button visual-depth/radius binding.');
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
        if (!isRecord(target.settings) || !buttonBaseSettingsMatch(sourceNode, target.settings)) {
          push(`${path}.settings`, 'Generated Button base settings drifted from the exact neutral source.');
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
  status: P15ElementorButtonVisualDepthRadiusStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceButtonCount: number,
  resolvedStyles: P15ElementorButtonVisualDepthRadiusEntryV1[],
  issues: P15ElementorButtonVisualDepthRadiusIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorButtonVisualDepthRadiusResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceButtonCount,
    resolvedButtonCount: resolvedStyles.length,
    resolvedStyles: resolvedStyles.map(cloneEntry),
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

function elementorTextShadow(value: P15ElementorButtonTextShadowV1): Record<string, unknown> {
  return {
    horizontal: value.horizontal,
    vertical: value.vertical,
    blur: value.blur,
    color: value.color,
  };
}

function elementorBoxShadow(value: P15ElementorButtonBoxShadowV1): Record<string, unknown> {
  return {
    horizontal: value.horizontal,
    vertical: value.vertical,
    blur: value.blur,
    spread: value.spread,
    color: value.color,
  };
}

function elementorRadius(value: number): Record<string, unknown> {
  return {
    unit: 'px',
    top: String(value),
    right: String(value),
    bottom: String(value),
    left: String(value),
    isLinked: true,
  };
}

export function resolveP15ElementorButtonVisualDepthRadius(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonVisualDepthRadiusResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR', null, null, null, 0, [],
      validation.issues.map((issue) => ({
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_IR_INVALID' as const,
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
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Button visual-depth/radius resolution requires an existing review-free generated local candidate.',
      }],
      null, null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorButtonVisualDepthRadiusIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorButtonVisualDepthRadiusEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Button visual-depth/radius manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Button visual-depth/radius manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Button visual-depth/radius manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Button visual-depth/radius resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
      });
    }
    if (!Array.isArray(manifestValue.buttons)
      || manifestValue.buttons.length > P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MAX_ENTRIES) {
      issues.push({
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_ENTRIES_INVALID',
        path: '$manifest.buttons',
        message: `buttons must be an array of at most ${P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.buttons.length; index += 1) {
        const raw = manifestValue.buttons[index];
        const path = `$manifest.buttons[${index}]`;
        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_ENTRY_INVALID',
            path,
            message: 'Each entry may contain only sourceNodeId, textShadow, boxShadow and borderRadiusPx.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Button visual-depth/radius sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceButtons.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_SOURCE_NOT_BUTTON',
            path: `${path}.sourceNodeId`,
            message: 'sourceNodeId must identify an existing neutral Button node.',
          });
          continue;
        }

        const hasTextShadow = Object.prototype.hasOwnProperty.call(raw, 'textShadow');
        const hasBoxShadow = Object.prototype.hasOwnProperty.call(raw, 'boxShadow');
        const hasRadius = Object.prototype.hasOwnProperty.call(raw, 'borderRadiusPx');
        if (!hasTextShadow && !hasBoxShadow && !hasRadius) {
          issues.push({
            code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_ENTRY_INVALID',
            path,
            message: 'Each Button entry must request at least one bounded visual-depth/radius capability.',
          });
          continue;
        }
        if (hasTextShadow && !validTextShadow(raw.textShadow)) {
          issues.push({
            code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_TEXT_SHADOW_INVALID',
            path: `${path}.textShadow`,
            message: 'Text shadow must use bounded integer sliders and strict lowercase six-digit hex color.',
          });
          continue;
        }
        if (hasBoxShadow && !validBoxShadow(raw.boxShadow)) {
          issues.push({
            code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_BOX_SHADOW_INVALID',
            path: `${path}.boxShadow`,
            message: 'Box shadow must use bounded integer sliders, strict lowercase six-digit hex color and outline|inset position.',
          });
          continue;
        }
        if (hasRadius && !validRadius(raw.borderRadiusPx)) {
          issues.push({
            code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_RADIUS_INVALID',
            path: `${path}.borderRadiusPx`,
            message: `borderRadiusPx must explicitly provide integer desktop/tablet/mobile px values from 0 through ${P15_NEUTRAL_EXPORT_MAX_RADIUS_PX}.`,
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(hasTextShadow
            ? { textShadow: { ...(raw.textShadow as P15ElementorButtonTextShadowV1) } }
            : {}),
          ...(hasBoxShadow
            ? { boxShadow: { ...(raw.boxShadow as P15ElementorButtonBoxShadowV1) } }
            : {}),
          ...(hasRadius
            ? { borderRadiusPx: { ...(raw.borderRadiusPx as P15ElementorButtonResponsiveRadiusPxV1) } }
            : {}),
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
      'NO_BUTTON_VISUAL_DEPTH_RADIUS_OVERRIDES',
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
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated Button binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    const requestedKeys: string[] = [];
    if (resolution.textShadow !== undefined) {
      requestedKeys.push(
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.textShadowTypeSettingKey,
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.textShadowSettingKey,
      );
    }
    if (resolution.boxShadow !== undefined) {
      requestedKeys.push(
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.boxShadowTypeSettingKey,
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.boxShadowSettingKey,
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.boxShadowPositionSettingKey,
      );
    }
    if (resolution.borderRadiusPx !== undefined) {
      requestedKeys.push(
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.borderRadiusDesktopSettingKey,
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.borderRadiusTabletSettingKey,
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.borderRadiusMobileSettingKey,
      );
    }

    const conflictingKey = requestedKeys.find((key) =>
      Object.prototype.hasOwnProperty.call(target.settings, key));
    if (conflictingKey) {
      issues.push({
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: `Generated base candidate already contains requested Button style setting ${conflictingKey}.`,
      });
      continue;
    }

    if (resolution.textShadow !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.textShadowTypeSettingKey] =
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.textShadowEnabledValue;
      target.settings[P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.textShadowSettingKey] =
        elementorTextShadow(resolution.textShadow);
    }
    if (resolution.boxShadow !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.boxShadowTypeSettingKey] =
        P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.boxShadowEnabledValue;
      target.settings[P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.boxShadowSettingKey] =
        elementorBoxShadow(resolution.boxShadow);
      target.settings[P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.boxShadowPositionSettingKey] =
        resolution.boxShadow.position === 'inset' ? 'inset' : ' ';
    }
    if (resolution.borderRadiusPx !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.borderRadiusDesktopSettingKey] =
        elementorRadius(resolution.borderRadiusPx.desktop);
      target.settings[P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.borderRadiusTabletSettingKey] =
        elementorRadius(resolution.borderRadiusPx.tablet);
      target.settings[P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE.borderRadiusMobileSettingKey] =
        elementorRadius(resolution.borderRadiusPx.mobile);
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
        code: 'P15_BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Button visual-depth/radius output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null, null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedStyles = [...resolutions.values()]
    .map(cloneEntry)
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED',
    sourceIrFingerprint, baseIdentity.digest, resolvedIdentity.digest, sourceButtons.size,
    resolvedStyles, [], template, candidate,
  );
}

function validIssue(issue: P15ElementorButtonVisualDepthRadiusIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorButtonVisualDepthRadiusIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorButtonVisualDepthRadiusEntryV1): boolean {
  if (!isRecord(entry)
    || !onlyAllowedKeys(entry, ENTRY_KEYS)
    || !validSourceNodeId(entry.sourceNodeId)) return false;
  const hasTextShadow = Object.prototype.hasOwnProperty.call(entry, 'textShadow');
  const hasBoxShadow = Object.prototype.hasOwnProperty.call(entry, 'boxShadow');
  const hasRadius = Object.prototype.hasOwnProperty.call(entry, 'borderRadiusPx');
  if (!hasTextShadow && !hasBoxShadow && !hasRadius) return false;
  if (hasTextShadow && !validTextShadow(entry.textShadow)) return false;
  if (hasBoxShadow && !validBoxShadow(entry.boxShadow)) return false;
  if (hasRadius && !validRadius(entry.borderRadiusPx)) return false;
  return true;
}

export function serializeP15ElementorButtonVisualDepthRadiusSummary(
  result: P15ElementorButtonVisualDepthRadiusResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_BUTTON_VISUAL_DEPTH_RADIUS_OVERRIDES'
    || result.status === 'BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceButtonCount)
    && result.sourceButtonCount >= 0
    && Number.isSafeInteger(result.resolvedButtonCount)
    && result.resolvedButtonCount >= 0
    && result.resolvedButtonCount <= result.sourceButtonCount
    && result.resolvedButtonCount === result.resolvedStyles.length;
  const uniqueIds = new Set(result.resolvedStyles.map((entry) => entry.sourceNodeId)).size
    === result.resolvedStyles.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_BUTTON_VISUAL_DEPTH_RADIUS_OVERRIDES'
    || result.status === 'BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'BUTTON_VISUAL_DEPTH_RADIUS_RESOLVED'
    ? result.resolvedButtonCount > 0 && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_BUTTON_VISUAL_DEPTH_RADIUS_OVERRIDES'
      ? result.resolvedButtonCount === 0 && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedButtonCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedStyles.every(validSummaryEntry)
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
    throw new Error('Invalid or authority-inflated P15 button-visual-depth-radius result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceButtonCount: result.sourceButtonCount,
    resolvedButtonCount: result.resolvedButtonCount,
    resolvedStyles: result.resolvedStyles.map(cloneEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_EVIDENCE,
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
