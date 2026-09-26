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

export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION =
  'p15-elementor-button-radial-gradient-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_RESULT_VERSION =
  'p15-elementor-button-radial-gradient-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS = Object.freeze([
  'center center',
  'center left',
  'center right',
  'top center',
  'top left',
  'top right',
  'bottom center',
  'bottom left',
  'bottom right',
] as const);

export type P15ElementorButtonRadialGradientPosition =
  (typeof P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS)[number];

export const P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  backgroundGroupControlSourcePath: 'includes/controls/groups/background.php',
  backgroundGroupControlSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
  normalGroupName: 'background',
  hoverGroupName: 'button_background_hover',
  backgroundTypeSuffix: 'background',
  colorASuffix: 'color',
  colorAStopSuffix: 'color_stop',
  colorAStopTabletSuffix: 'color_stop_tablet',
  colorAStopMobileSuffix: 'color_stop_mobile',
  colorBSuffix: 'color_b',
  colorBStopSuffix: 'color_b_stop',
  colorBStopTabletSuffix: 'color_b_stop_tablet',
  colorBStopMobileSuffix: 'color_b_stop_mobile',
  gradientTypeSuffix: 'gradient_type',
  gradientPositionSuffix: 'gradient_position',
  gradientPositionTabletSuffix: 'gradient_position_tablet',
  gradientPositionMobileSuffix: 'gradient_position_mobile',
  acceptedBackgroundType: 'gradient',
  acceptedGradientType: 'radial',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  stopUnit: '%',
  stopMin: 0,
  stopMax: 100,
  acceptedPositions: P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS,
});

export interface P15ElementorButtonRadialGradientV1 {
  colorA: string;
  colorB: string;
  stopA: number;
  stopB: number;
  tabletStopA?: number;
  tabletStopB?: number;
  mobileStopA?: number;
  mobileStopB?: number;
  position: P15ElementorButtonRadialGradientPosition;
  tabletPosition?: P15ElementorButtonRadialGradientPosition;
  mobilePosition?: P15ElementorButtonRadialGradientPosition;
}

export interface P15ElementorButtonRadialGradientEntryV1 {
  sourceNodeId: string;
  normal?: P15ElementorButtonRadialGradientV1;
  hover?: P15ElementorButtonRadialGradientV1;
}

export interface P15ElementorButtonRadialGradientManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonRadialGradientEntryV1[];
  gradientInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonRadialGradientIssueCode =
  | 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_IR_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_RADIAL_GRADIENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_RADIAL_GRADIENT_ENTRIES_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_ENTRY_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_RADIAL_GRADIENT_VALUE_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_RADIAL_GRADIENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_RADIAL_GRADIENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_RADIAL_GRADIENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonRadialGradientIssueV1 {
  code: P15ElementorButtonRadialGradientIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonRadialGradientStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_RADIAL_GRADIENT_OVERRIDES'
  | 'BUTTON_RADIAL_GRADIENTS_RESOLVED';

export interface P15ElementorButtonRadialGradientSummaryEntryV1 {
  sourceNodeId: string;
  normal?: P15ElementorButtonRadialGradientV1;
  hover?: P15ElementorButtonRadialGradientV1;
}

export interface P15ElementorButtonRadialGradientResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_RESULT_VERSION;
  status: P15ElementorButtonRadialGradientStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedGradients: P15ElementorButtonRadialGradientSummaryEntryV1[];
  issues: P15ElementorButtonRadialGradientIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  gradientInferencePerformed: false;
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
  'gradientInferencePerformed',
  'manifestVersion',
  'networkAccess',
  'productionAcceptance',
  'responsiveClosureClaim',
  'responsiveInferencePerformed',
  'schemaVersion',
  'sourceIrFingerprint',
  'targetCompatibilityClaim',
] as const;

const ENTRY_KEYS = ['hover', 'normal', 'sourceNodeId'] as const;
const GRADIENT_KEYS = ['colorA', 'colorB', 'mobilePosition', 'mobileStopA', 'mobileStopB', 'position', 'stopA', 'stopB', 'tabletPosition', 'tabletStopA', 'tabletStopB'] as const;

const ISSUE_CODES: readonly P15ElementorButtonRadialGradientIssueCode[] = [
  'P15_BUTTON_RADIAL_GRADIENT_SOURCE_IR_INVALID',
  'P15_BUTTON_RADIAL_GRADIENT_UPSTREAM_GENERATION_NOT_READY',
  'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_NOT_OBJECT',
  'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_FIELDS_INVALID',
  'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION_INVALID',
  'P15_BUTTON_RADIAL_GRADIENT_SOURCE_FINGERPRINT_INVALID',
  'P15_BUTTON_RADIAL_GRADIENT_SOURCE_FINGERPRINT_MISMATCH',
  'P15_BUTTON_RADIAL_GRADIENT_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_BUTTON_RADIAL_GRADIENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_BUTTON_RADIAL_GRADIENT_ENTRIES_INVALID',
  'P15_BUTTON_RADIAL_GRADIENT_ENTRY_INVALID',
  'P15_BUTTON_RADIAL_GRADIENT_DUPLICATE_SOURCE_ID',
  'P15_BUTTON_RADIAL_GRADIENT_SOURCE_NOT_BUTTON',
  'P15_BUTTON_RADIAL_GRADIENT_VALUE_INVALID',
  'P15_BUTTON_RADIAL_GRADIENT_AUTHORITY_FLAGS_INVALID',
  'P15_BUTTON_RADIAL_GRADIENT_GENERATOR_BINDING_MISMATCH',
  'P15_BUTTON_RADIAL_GRADIENT_EXISTING_OVERRIDE_CONFLICT',
  'P15_BUTTON_RADIAL_GRADIENT_RESOLVED_CANDIDATE_INVALID',
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

function validStop(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= 100;
}

function validPosition(value: unknown): value is P15ElementorButtonRadialGradientPosition {
  return typeof value === 'string'
    && P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_POSITIONS.includes(
      value as P15ElementorButtonRadialGradientPosition,
    );
}

function validGradient(value: unknown): value is P15ElementorButtonRadialGradientV1 {
  if (!isRecord(value) || !onlyAllowedKeys(value, GRADIENT_KEYS)) return false;
  if (!Object.prototype.hasOwnProperty.call(value, 'colorA')
    || !Object.prototype.hasOwnProperty.call(value, 'colorB')
    || !Object.prototype.hasOwnProperty.call(value, 'stopA')
    || !Object.prototype.hasOwnProperty.call(value, 'stopB')
    || !Object.prototype.hasOwnProperty.call(value, 'position')) return false;
  if (!validColor(value.colorA) || !validColor(value.colorB)) return false;
  if (!validStop(value.stopA) || !validStop(value.stopB) || Number(value.stopA) > Number(value.stopB)) return false;

  const hasTabletStopA = value.tabletStopA !== undefined;
  const hasTabletStopB = value.tabletStopB !== undefined;
  if (hasTabletStopA !== hasTabletStopB) return false;
  if (hasTabletStopA
    && (!validStop(value.tabletStopA)
      || !validStop(value.tabletStopB)
      || Number(value.tabletStopA) > Number(value.tabletStopB))) return false;

  const hasMobileStopA = value.mobileStopA !== undefined;
  const hasMobileStopB = value.mobileStopB !== undefined;
  if (hasMobileStopA !== hasMobileStopB) return false;
  if (hasMobileStopA
    && (!validStop(value.mobileStopA)
      || !validStop(value.mobileStopB)
      || Number(value.mobileStopA) > Number(value.mobileStopB))) return false;

  if (!validPosition(value.position)) return false;
  if (value.tabletPosition !== undefined && !validPosition(value.tabletPosition)) return false;
  return value.mobilePosition === undefined || validPosition(value.mobilePosition);
}

function cloneGradient(value: P15ElementorButtonRadialGradientV1): P15ElementorButtonRadialGradientV1 {
  return {
    colorA: value.colorA,
    colorB: value.colorB,
    stopA: value.stopA,
    stopB: value.stopB,
    ...(value.tabletStopA === undefined ? {} : { tabletStopA: value.tabletStopA, tabletStopB: value.tabletStopB }),
    ...(value.mobileStopA === undefined ? {} : { mobileStopA: value.mobileStopA, mobileStopB: value.mobileStopB }),
    position: value.position,
    ...(value.tabletPosition === undefined ? {} : { tabletPosition: value.tabletPosition }),
    ...(value.mobilePosition === undefined ? {} : { mobilePosition: value.mobilePosition }),
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
  if (!hasLink || !isRecord(settings.link)
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

  function visit(
    sourceNodes: readonly P15NeutralExportNode[],
    targetElements: readonly ElementorElementV04[],
    targetPath: string,
  ): void {
    if (sourceNodes.length !== targetElements.length) {
      issues.push({ path: targetPath, message: 'Generated Elementor tree length does not match the exact review-free neutral source tree.' });
      return;
    }

    for (let index = 0; index < sourceNodes.length; index += 1) {
      const sourceNode = sourceNodes[index];
      const target = targetElements[index];
      const path = `${targetPath}[${index}]`;
      if (!sourceNode || !target) {
        issues.push({ path, message: 'Generated source/target element pair is missing.' });
        continue;
      }
      if (sourceNode.kind === 'review') {
        issues.push({ path, message: 'Review nodes cannot participate in Button gradient binding.' });
        continue;
      }
      if (sourceNode.kind === 'container') {
        if (target.elType !== 'container') {
          issues.push({ path, message: 'Neutral container did not bind to a generated Elementor container.' });
          continue;
        }
        if (!isRecord(target.settings) || target.settings.flex_direction !== sourceNode.direction) {
          issues.push({ path: `${path}.settings.flex_direction`, message: 'Generated container base direction drifted from the neutral source.' });
          continue;
        }
        visit(sourceNode.children, target.elements, `${path}.elements`);
        continue;
      }

      const widgetType = expectedWidgetType(sourceNode);
      if (target.elType !== 'widget' || target.widgetType !== widgetType) {
        issues.push({ path, message: 'Neutral widget did not bind to the expected generated Elementor core widget.' });
        continue;
      }
      if (sourceNode.kind === 'button') {
        if (!isRecord(target.settings) || !buttonBaseSettingsMatch(sourceNode, target.settings)) {
          issues.push({ path: `${path}.settings`, message: 'Generated Button base settings drifted from the exact neutral source.' });
          continue;
        }
        buttons.set(sourceNode.sourceNodeId, { source: sourceNode, target });
      }
    }
  }

  visit(source.nodes, template.content, '$.content');
  return { buttons, issues };
}

function slider(unit: '%', size: number): Record<string, unknown> {
  return { unit, size, sizes: [] };
}

function gradientSettingKeys(
  prefix: 'background' | 'button_background_hover',
  gradient: P15ElementorButtonRadialGradientV1,
): string[] {
  const suffixes = [
    'background',
    'color',
    'color_stop',
    'color_b',
    'color_b_stop',
    'gradient_type',
    'gradient_position',
  ];
  if (gradient.tabletStopA !== undefined) suffixes.push('color_stop_tablet', 'color_b_stop_tablet');
  if (gradient.mobileStopA !== undefined) suffixes.push('color_stop_mobile', 'color_b_stop_mobile');
  if (gradient.tabletPosition !== undefined) suffixes.push('gradient_position_tablet');
  if (gradient.mobilePosition !== undefined) suffixes.push('gradient_position_mobile');
  return suffixes.map((suffix) => `${prefix}_${suffix}`);
}

function applyGradient(
  settings: Record<string, unknown>,
  prefix: 'background' | 'button_background_hover',
  gradient: P15ElementorButtonRadialGradientV1,
): void {
  settings[`${prefix}_background`] = 'gradient';
  settings[`${prefix}_color`] = gradient.colorA;
  settings[`${prefix}_color_stop`] = slider('%', gradient.stopA);
  settings[`${prefix}_color_b`] = gradient.colorB;
  settings[`${prefix}_color_b_stop`] = slider('%', gradient.stopB);
  if (gradient.tabletStopA !== undefined && gradient.tabletStopB !== undefined) {
    settings[`${prefix}_color_stop_tablet`] = slider('%', gradient.tabletStopA);
    settings[`${prefix}_color_b_stop_tablet`] = slider('%', gradient.tabletStopB);
  }
  if (gradient.mobileStopA !== undefined && gradient.mobileStopB !== undefined) {
    settings[`${prefix}_color_stop_mobile`] = slider('%', gradient.mobileStopA);
    settings[`${prefix}_color_b_stop_mobile`] = slider('%', gradient.mobileStopB);
  }
  settings[`${prefix}_gradient_type`] = 'radial';
  settings[`${prefix}_gradient_position`] = gradient.position;
  if (gradient.tabletPosition !== undefined) {
    settings[`${prefix}_gradient_position_tablet`] = gradient.tabletPosition;
  }
  if (gradient.mobilePosition !== undefined) {
    settings[`${prefix}_gradient_position_mobile`] = gradient.mobilePosition;
  }
}

function baseResult(
  status: P15ElementorButtonRadialGradientStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceButtonCount: number,
  resolvedGradients: P15ElementorButtonRadialGradientSummaryEntryV1[],
  issues: P15ElementorButtonRadialGradientIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorButtonRadialGradientResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceButtonCount,
    resolvedButtonCount: resolvedGradients.length,
    resolvedGradients: resolvedGradients.map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      ...(entry.normal === undefined ? {} : { normal: cloneGradient(entry.normal) }),
      ...(entry.hover === undefined ? {} : { hover: cloneGradient(entry.hover) }),
    })),
    issues: issues.map((issue) => ({ ...issue })),
    template,
    candidate,
    gradientInferencePerformed: false,
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

export function resolveP15ElementorButtonRadialGradients(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonRadialGradientResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR', null, null, null, 0, [],
      validation.issues.map((issue) => ({
        code: 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_IR_INVALID' as const,
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
      'BLOCKED_UPSTREAM_GENERATION', sourceIrFingerprint, null, null, sourceButtons.size, [],
      [{
        code: 'P15_BUTTON_RADIAL_GRADIENT_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Button radial-gradient resolution requires an existing review-free generated local candidate.',
      }],
      null, null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorButtonRadialGradientIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorButtonRadialGradientEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Button radial-gradient manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Button radial-gradient manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Button radial-gradient manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_BUTTON_RADIAL_GRADIENT_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_BUTTON_RADIAL_GRADIENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'Manifest is not bound to the exact current base candidate identity.',
      });
    }

    if (manifestValue.gradientInferencePerformed !== false
      || manifestValue.responsiveInferencePerformed !== false
      || manifestValue.figmaMutation !== false
      || manifestValue.networkAccess !== false
      || manifestValue.responsiveClosureClaim !== false
      || manifestValue.targetCompatibilityClaim !== false
      || manifestValue.productionAcceptance !== false
      || manifestValue.downloadEnabled !== false) {
      issues.push({
        code: 'P15_BUTTON_RADIAL_GRADIENT_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Button radial-gradient resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
      });
    }

    if (!Array.isArray(manifestValue.buttons)
      || manifestValue.buttons.length > P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MAX_ENTRIES) {
      issues.push({
        code: 'P15_BUTTON_RADIAL_GRADIENT_ENTRIES_INVALID',
        path: '$manifest.buttons',
        message: `buttons must be an array of at most ${P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.buttons.length; index += 1) {
        const raw = manifestValue.buttons[index];
        const path = `$manifest.buttons[${index}]`;
        if (!isRecord(raw) || !onlyAllowedKeys(raw, ENTRY_KEYS) || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_RADIAL_GRADIENT_ENTRY_INVALID',
            path,
            message: 'Each entry may contain only sourceNodeId plus optional normal and hover radial-gradient profiles.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_RADIAL_GRADIENT_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Button radial-gradient sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceButtons.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_RADIAL_GRADIENT_SOURCE_NOT_BUTTON',
            path: `${path}.sourceNodeId`,
            message: 'Button radial-gradient sourceNodeId must identify an existing neutral Button node.',
          });
          continue;
        }

        const hasNormal = Object.prototype.hasOwnProperty.call(raw, 'normal');
        const hasHover = Object.prototype.hasOwnProperty.call(raw, 'hover');
        if (!hasNormal && !hasHover) {
          issues.push({
            code: 'P15_BUTTON_RADIAL_GRADIENT_ENTRY_INVALID',
            path,
            message: 'Each Button entry must request normal, hover, or both gradient states.',
          });
          continue;
        }
        if ((hasNormal && !validGradient(raw.normal)) || (hasHover && !validGradient(raw.hover))) {
          issues.push({
            code: 'P15_BUTTON_RADIAL_GRADIENT_VALUE_INVALID',
            path,
            message: 'Gradient colors must be lowercase #rrggbb, stops integer 0..100 in order, desktop position must be one exact Elementor radial value, and optional tablet/mobile positions must use the same exact enum.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(hasNormal ? { normal: cloneGradient(raw.normal as P15ElementorButtonRadialGradientV1) } : {}),
          ...(hasHover ? { hover: cloneGradient(raw.hover as P15ElementorButtonRadialGradientV1) } : {}),
        });
      }
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST', sourceIrFingerprint, baseIdentity.digest, null,
      sourceButtons.size, [], issues, null, null,
    );
  }

  if (resolutions.size === 0) {
    return baseResult(
      'NO_BUTTON_RADIAL_GRADIENT_OVERRIDES',
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
      'REJECTED_INVALID_MANIFEST', sourceIrFingerprint, baseIdentity.digest, null,
      sourceButtons.size, [],
      binding.issues.map((issue) => ({
        code: 'P15_BUTTON_RADIAL_GRADIENT_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_BUTTON_RADIAL_GRADIENT_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated Button binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    const requestedKeys = [
      ...(resolution.normal === undefined ? [] : gradientSettingKeys('background', resolution.normal)),
      ...(resolution.hover === undefined ? [] : gradientSettingKeys('button_background_hover', resolution.hover)),
    ];
    const conflict = requestedKeys.find((key) => Object.prototype.hasOwnProperty.call(target.settings, key));
    if (conflict) {
      issues.push({
        code: 'P15_BUTTON_RADIAL_GRADIENT_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: `Generated base candidate already contains requested Button gradient setting ${conflict}.`,
      });
      continue;
    }

    if (resolution.normal !== undefined) applyGradient(target.settings, 'background', resolution.normal);
    if (resolution.hover !== undefined) applyGradient(target.settings, 'button_background_hover', resolution.hover);
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST', sourceIrFingerprint, baseIdentity.digest, null,
      sourceButtons.size, [], issues, null, null,
    );
  }

  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
    || !candidate.validation.valid
    || candidate.templateJson === null) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST', sourceIrFingerprint, baseIdentity.digest, null,
      sourceButtons.size, [],
      [{
        code: 'P15_BUTTON_RADIAL_GRADIENT_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Button radial-gradient output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null, null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedGradients = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      ...(entry.normal === undefined ? {} : { normal: cloneGradient(entry.normal) }),
      ...(entry.hover === undefined ? {} : { hover: cloneGradient(entry.hover) }),
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'BUTTON_RADIAL_GRADIENTS_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceButtons.size,
    resolvedGradients,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorButtonRadialGradientIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorButtonRadialGradientIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorButtonRadialGradientSummaryEntryV1): boolean {
  if (!isRecord(entry) || !onlyAllowedKeys(entry, ENTRY_KEYS) || !validSourceNodeId(entry.sourceNodeId)) return false;
  const hasNormal = Object.prototype.hasOwnProperty.call(entry, 'normal');
  const hasHover = Object.prototype.hasOwnProperty.call(entry, 'hover');
  return (hasNormal || hasHover)
    && (!hasNormal || validGradient(entry.normal))
    && (!hasHover || validGradient(entry.hover));
}

export function serializeP15ElementorButtonRadialGradientSummary(
  result: P15ElementorButtonRadialGradientResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_BUTTON_RADIAL_GRADIENT_OVERRIDES'
    || result.status === 'BUTTON_RADIAL_GRADIENTS_RESOLVED';

  const validCounts = Number.isSafeInteger(result.sourceButtonCount)
    && result.sourceButtonCount >= 0
    && Number.isSafeInteger(result.resolvedButtonCount)
    && result.resolvedButtonCount >= 0
    && result.resolvedButtonCount <= result.sourceButtonCount
    && result.resolvedButtonCount === result.resolvedGradients.length;

  const uniqueIds = new Set(result.resolvedGradients.map((entry) => entry.sourceNodeId)).size
    === result.resolvedGradients.length;

  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);

  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;

  const resolvedDigestRequired = result.status === 'NO_BUTTON_RADIAL_GRADIENT_OVERRIDES'
    || result.status === 'BUTTON_RADIAL_GRADIENTS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;

  const statusShapeValid = result.status === 'BUTTON_RADIAL_GRADIENTS_RESOLVED'
    ? result.resolvedButtonCount > 0 && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_BUTTON_RADIAL_GRADIENT_OVERRIDES'
      ? result.resolvedButtonCount === 0 && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedButtonCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedGradients.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.gradientInferencePerformed !== false
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 button-radial-gradient result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceButtonCount: result.sourceButtonCount,
    resolvedButtonCount: result.resolvedButtonCount,
    resolvedGradients: result.resolvedGradients.map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      ...(entry.normal === undefined ? {} : { normal: cloneGradient(entry.normal) }),
      ...(entry.hover === undefined ? {} : { hover: cloneGradient(entry.hover) }),
    })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_EVIDENCE,
    gradientInferencePerformed: false,
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
