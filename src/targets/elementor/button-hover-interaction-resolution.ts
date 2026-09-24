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

export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION =
  'p15-elementor-button-hover-interaction-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_RESULT_VERSION =
  'p15-elementor-button-hover-interaction-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS = [
  'grow',
  'shrink',
  'pulse',
  'pulse-grow',
  'pulse-shrink',
  'push',
  'pop',
  'bounce-in',
  'bounce-out',
  'rotate',
  'grow-rotate',
  'float',
  'sink',
  'bob',
  'hang',
  'skew',
  'skew-forward',
  'skew-backward',
  'wobble-vertical',
  'wobble-horizontal',
  'wobble-to-bottom-right',
  'wobble-to-top-right',
  'wobble-top',
  'wobble-bottom',
  'wobble-skew',
  'buzz',
  'buzz-out',
] as const;

export const P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  groupBaseSourcePath: 'includes/controls/groups/base.php',
  groupBaseSourceBlobSha: '6117c06b286dbec336eefe63475c747e2fda0234',
  boxShadowGroupSourcePath: 'includes/controls/groups/box-shadow.php',
  boxShadowGroupSourceBlobSha: '1c068c900db0ff2593089028d67fb6d897dbaa33',
  boxShadowControlSourcePath: 'includes/controls/box-shadow.php',
  boxShadowControlSourceBlobSha: 'e55cf9af34db5cc3e73dc295cd9f35b437da6fa7',
  hoverAnimationControlSourcePath: 'includes/controls/hover-animation.php',
  hoverAnimationControlSourceBlobSha: '157399fddae46264f07654bc178373a2c1050c4e',
  hoverTabName: 'tab_button_hover',
  buttonSelector: '{{WRAPPER}} .elementor-button:hover, {{WRAPPER}} .elementor-button:focus',
  boxShadowGroupName: 'button_hover_box_shadow',
  boxShadowTypeSettingKey: 'button_hover_box_shadow_box_shadow_type',
  boxShadowSettingKey: 'button_hover_box_shadow_box_shadow',
  boxShadowPositionSettingKey: 'button_hover_box_shadow_box_shadow_position',
  boxShadowEnabledValue: 'yes',
  transitionControlName: 'button_hover_transition_duration',
  transitionSettingKey: 'button_hover_transition_duration',
  transitionUnit: 's',
  transitionSecondsMin: 0,
  transitionSecondsMax: 10,
  animationControlName: 'hover_animation',
  animationSettingKey: 'hover_animation',
  animationClassPrefix: 'elementor-animation-',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
  coreAnimations: P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS,
});

export type P15ElementorButtonHoverCoreAnimation =
  typeof P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS[number];

export interface P15ElementorButtonHoverBoxShadowV1 {
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
  position: 'outline' | 'inset';
}

export interface P15ElementorButtonHoverInteractionEntryV1 {
  sourceNodeId: string;
  boxShadow?: P15ElementorButtonHoverBoxShadowV1;
  transitionSeconds?: number;
  animation?: P15ElementorButtonHoverCoreAnimation;
}

export interface P15ElementorButtonHoverInteractionManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonHoverInteractionEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonHoverInteractionIssueCode =
  | 'P15_BUTTON_HOVER_INTERACTION_SOURCE_IR_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_HOVER_INTERACTION_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_HOVER_INTERACTION_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_HOVER_INTERACTION_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_HOVER_INTERACTION_ENTRIES_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_ENTRY_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_HOVER_INTERACTION_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_HOVER_INTERACTION_BOX_SHADOW_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_TRANSITION_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_ANIMATION_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_HOVER_INTERACTION_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_HOVER_INTERACTION_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_HOVER_INTERACTION_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonHoverInteractionIssueV1 {
  code: P15ElementorButtonHoverInteractionIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonHoverInteractionStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_HOVER_INTERACTION_OVERRIDES'
  | 'BUTTON_HOVER_INTERACTIONS_RESOLVED';

export interface P15ElementorButtonHoverInteractionResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_RESULT_VERSION;
  status: P15ElementorButtonHoverInteractionStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedInteractions: P15ElementorButtonHoverInteractionEntryV1[];
  issues: P15ElementorButtonHoverInteractionIssueV1[];
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

const ENTRY_KEYS = ['animation', 'boxShadow', 'sourceNodeId', 'transitionSeconds'] as const;
const BOX_SHADOW_KEYS = ['blur', 'color', 'horizontal', 'position', 'spread', 'vertical'] as const;

const ISSUE_CODES: readonly P15ElementorButtonHoverInteractionIssueCode[] = [
  'P15_BUTTON_HOVER_INTERACTION_SOURCE_IR_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_UPSTREAM_GENERATION_NOT_READY',
  'P15_BUTTON_HOVER_INTERACTION_MANIFEST_NOT_OBJECT',
  'P15_BUTTON_HOVER_INTERACTION_MANIFEST_FIELDS_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_SOURCE_FINGERPRINT_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_SOURCE_FINGERPRINT_MISMATCH',
  'P15_BUTTON_HOVER_INTERACTION_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_BUTTON_HOVER_INTERACTION_ENTRIES_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_ENTRY_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_DUPLICATE_SOURCE_ID',
  'P15_BUTTON_HOVER_INTERACTION_SOURCE_NOT_BUTTON',
  'P15_BUTTON_HOVER_INTERACTION_BOX_SHADOW_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_TRANSITION_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_ANIMATION_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_AUTHORITY_FLAGS_INVALID',
  'P15_BUTTON_HOVER_INTERACTION_GENERATOR_BINDING_MISMATCH',
  'P15_BUTTON_HOVER_INTERACTION_EXISTING_OVERRIDE_CONFLICT',
  'P15_BUTTON_HOVER_INTERACTION_RESOLVED_CANDIDATE_INVALID',
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

function validIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number'
    && Number.isInteger(value)
    && Number.isFinite(value)
    && value >= min
    && value <= max;
}

function validBoxShadow(value: unknown): value is P15ElementorButtonHoverBoxShadowV1 {
  if (!isRecord(value) || !exactKeys(value, BOX_SHADOW_KEYS)) return false;
  return validIntegerInRange(value.horizontal, -100, 100)
    && validIntegerInRange(value.vertical, -100, 100)
    && validIntegerInRange(value.blur, 0, 100)
    && validIntegerInRange(value.spread, -100, 100)
    && validColor(value.color)
    && (value.position === 'outline' || value.position === 'inset');
}

function validTransitionSeconds(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.transitionSecondsMin
    && value <= P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.transitionSecondsMax;
}

function validAnimation(value: unknown): value is P15ElementorButtonHoverCoreAnimation {
  return typeof value === 'string'
    && (P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_CORE_ANIMATIONS as readonly string[]).includes(value);
}

function cloneBoxShadow(
  value: P15ElementorButtonHoverBoxShadowV1 | undefined,
): P15ElementorButtonHoverBoxShadowV1 | undefined {
  return value === undefined ? undefined : { ...value };
}

function cloneEntry(
  value: P15ElementorButtonHoverInteractionEntryV1,
): P15ElementorButtonHoverInteractionEntryV1 {
  return {
    sourceNodeId: value.sourceNodeId,
    ...(value.boxShadow === undefined ? {} : { boxShadow: cloneBoxShadow(value.boxShadow) }),
    ...(value.transitionSeconds === undefined ? {} : { transitionSeconds: value.transitionSeconds }),
    ...(value.animation === undefined ? {} : { animation: value.animation }),
  };
}

function collectButtonNodes(document: P15NeutralExportDocumentV1): Map<string, P15NeutralButtonNode> {
  const result = new Map<string, P15NeutralButtonNode>();

  function visit(nodes: readonly P15NeutralExportNode[]): void {
    for (const node of nodes) {
      if (node.kind === 'container') {
        visit(node.children);
      } else if (node.kind === 'button') {
        result.set(node.sourceNodeId, node);
      }
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

function expectedButtonLink(
  node: P15NeutralButtonNode,
): Record<string, unknown> | undefined {
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
      const path = `${targetPath}[${index}]`;

      if (!sourceNode || !target) {
        push(path, 'Generated source/target element pair is missing.');
        continue;
      }

      if (sourceNode.kind === 'review') {
        push(path, 'Review nodes cannot participate in Button hover interaction binding.');
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
  status: P15ElementorButtonHoverInteractionStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceButtonCount: number,
  resolvedInteractions: P15ElementorButtonHoverInteractionEntryV1[],
  issues: P15ElementorButtonHoverInteractionIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorButtonHoverInteractionResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceButtonCount,
    resolvedButtonCount: resolvedInteractions.length,
    resolvedInteractions: resolvedInteractions.map(cloneEntry),
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

function elementorTransitionSlider(seconds: number): Record<string, unknown> {
  return { unit: 's', size: seconds, sizes: [] };
}

function elementorBoxShadow(value: P15ElementorButtonHoverBoxShadowV1): Record<string, unknown> {
  return {
    horizontal: value.horizontal,
    vertical: value.vertical,
    blur: value.blur,
    spread: value.spread,
    color: value.color,
  };
}

export function resolveP15ElementorButtonHoverInteractions(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonHoverInteractionResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR', null, null, null, 0, [],
      validation.issues.map((issue) => ({
        code: 'P15_BUTTON_HOVER_INTERACTION_SOURCE_IR_INVALID' as const,
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
        code: 'P15_BUTTON_HOVER_INTERACTION_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Button hover interaction resolution requires an existing review-free generated local candidate.',
      }],
      null, null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorButtonHoverInteractionIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorButtonHoverInteractionEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_BUTTON_HOVER_INTERACTION_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Button hover interaction manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_BUTTON_HOVER_INTERACTION_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Button hover interaction manifest contains unknown or missing fields.',
      });
    }

    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Button hover interaction manifest schema/version is unsupported.',
      });
    }

    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_BUTTON_HOVER_INTERACTION_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_BUTTON_HOVER_INTERACTION_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }

    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_BUTTON_HOVER_INTERACTION_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_BUTTON_HOVER_INTERACTION_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_BUTTON_HOVER_INTERACTION_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Button hover interaction resolution cannot grant inference, mutation, network, closure, compatibility, production or download authority.',
      });
    }

    if (!Array.isArray(manifestValue.buttons)
      || manifestValue.buttons.length > P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MAX_ENTRIES) {
      issues.push({
        code: 'P15_BUTTON_HOVER_INTERACTION_ENTRIES_INVALID',
        path: '$manifest.buttons',
        message: `buttons must be an array of at most ${P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.buttons.length; index += 1) {
        const raw = manifestValue.buttons[index];
        const path = `$manifest.buttons[${index}]`;

        if (!isRecord(raw) || !onlyAllowedKeys(raw, ENTRY_KEYS) || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_HOVER_INTERACTION_ENTRY_INVALID',
            path,
            message: 'Each entry may contain only sourceNodeId, boxShadow, transitionSeconds and animation.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_HOVER_INTERACTION_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Button hover interaction sourceNodeId must be unique.',
          });
          continue;
        }

        if (!sourceButtons.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_HOVER_INTERACTION_SOURCE_NOT_BUTTON',
            path: `${path}.sourceNodeId`,
            message: 'sourceNodeId must identify an existing neutral Button node.',
          });
          continue;
        }

        const hasBoxShadow = Object.prototype.hasOwnProperty.call(raw, 'boxShadow');
        const hasTransition = Object.prototype.hasOwnProperty.call(raw, 'transitionSeconds');
        const hasAnimation = Object.prototype.hasOwnProperty.call(raw, 'animation');

        if (!hasBoxShadow && !hasTransition && !hasAnimation) {
          issues.push({
            code: 'P15_BUTTON_HOVER_INTERACTION_ENTRY_INVALID',
            path,
            message: 'Each Button entry must request at least one bounded hover interaction capability.',
          });
          continue;
        }

        if (hasBoxShadow && !validBoxShadow(raw.boxShadow)) {
          issues.push({
            code: 'P15_BUTTON_HOVER_INTERACTION_BOX_SHADOW_INVALID',
            path: `${path}.boxShadow`,
            message: 'Box shadow must use bounded integer sliders, lowercase six-digit hex color and outline|inset position.',
          });
          continue;
        }

        if (hasTransition && !validTransitionSeconds(raw.transitionSeconds)) {
          issues.push({
            code: 'P15_BUTTON_HOVER_INTERACTION_TRANSITION_INVALID',
            path: `${path}.transitionSeconds`,
            message: 'transitionSeconds must be a finite explicit number from 0 through 10 seconds.',
          });
          continue;
        }

        if (hasAnimation && !validAnimation(raw.animation)) {
          issues.push({
            code: 'P15_BUTTON_HOVER_INTERACTION_ANIMATION_INVALID',
            path: `${path}.animation`,
            message: 'animation must be one of Elementor 4.2.4 core default hover animations.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(hasBoxShadow ? { boxShadow: { ...(raw.boxShadow as P15ElementorButtonHoverBoxShadowV1) } } : {}),
          ...(hasTransition ? { transitionSeconds: raw.transitionSeconds as number } : {}),
          ...(hasAnimation ? { animation: raw.animation as P15ElementorButtonHoverCoreAnimation } : {}),
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
      'NO_BUTTON_HOVER_INTERACTION_OVERRIDES',
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
        code: 'P15_BUTTON_HOVER_INTERACTION_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_BUTTON_HOVER_INTERACTION_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated Button binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    const requestedKeys: string[] = [];
    if (resolution.boxShadow !== undefined) {
      requestedKeys.push(
        P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.boxShadowTypeSettingKey,
        P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.boxShadowSettingKey,
        P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.boxShadowPositionSettingKey,
      );
    }
    if (resolution.transitionSeconds !== undefined) {
      requestedKeys.push(P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.transitionSettingKey);
    }
    if (resolution.animation !== undefined) {
      requestedKeys.push(P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.animationSettingKey);
    }

    const conflictingKey = requestedKeys.find((key) => Object.prototype.hasOwnProperty.call(target.settings, key));
    if (conflictingKey) {
      issues.push({
        code: 'P15_BUTTON_HOVER_INTERACTION_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: `Generated base candidate already contains requested Button hover setting ${conflictingKey}.`,
      });
      continue;
    }

    if (resolution.boxShadow !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.boxShadowTypeSettingKey] =
        P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.boxShadowEnabledValue;
      target.settings[P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.boxShadowSettingKey] =
        elementorBoxShadow(resolution.boxShadow);
      target.settings[P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.boxShadowPositionSettingKey] =
        resolution.boxShadow.position === 'inset' ? 'inset' : ' ';
    }
    if (resolution.transitionSeconds !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.transitionSettingKey] =
        elementorTransitionSlider(resolution.transitionSeconds);
    }
    if (resolution.animation !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE.animationSettingKey] =
        resolution.animation;
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
        code: 'P15_BUTTON_HOVER_INTERACTION_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Button hover interaction output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null, null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedInteractions = [...resolutions.values()]
    .map(cloneEntry)
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'BUTTON_HOVER_INTERACTIONS_RESOLVED',
    sourceIrFingerprint, baseIdentity.digest, resolvedIdentity.digest, sourceButtons.size,
    resolvedInteractions, [], template, candidate,
  );
}

function validIssue(issue: P15ElementorButtonHoverInteractionIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorButtonHoverInteractionIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorButtonHoverInteractionEntryV1): boolean {
  if (!isRecord(entry) || !onlyAllowedKeys(entry, ENTRY_KEYS) || !validSourceNodeId(entry.sourceNodeId)) {
    return false;
  }
  const hasBoxShadow = Object.prototype.hasOwnProperty.call(entry, 'boxShadow');
  const hasTransition = Object.prototype.hasOwnProperty.call(entry, 'transitionSeconds');
  const hasAnimation = Object.prototype.hasOwnProperty.call(entry, 'animation');
  if (!hasBoxShadow && !hasTransition && !hasAnimation) return false;
  if (hasBoxShadow && !validBoxShadow(entry.boxShadow)) return false;
  if (hasTransition && !validTransitionSeconds(entry.transitionSeconds)) return false;
  if (hasAnimation && !validAnimation(entry.animation)) return false;
  return true;
}

export function serializeP15ElementorButtonHoverInteractionSummary(
  result: P15ElementorButtonHoverInteractionResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_BUTTON_HOVER_INTERACTION_OVERRIDES'
    || result.status === 'BUTTON_HOVER_INTERACTIONS_RESOLVED';

  const validCounts = Number.isSafeInteger(result.sourceButtonCount)
    && result.sourceButtonCount >= 0
    && Number.isSafeInteger(result.resolvedButtonCount)
    && result.resolvedButtonCount >= 0
    && result.resolvedButtonCount <= result.sourceButtonCount
    && result.resolvedButtonCount === result.resolvedInteractions.length;

  const uniqueIds = new Set(result.resolvedInteractions.map((entry) => entry.sourceNodeId)).size
    === result.resolvedInteractions.length;

  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_BUTTON_HOVER_INTERACTION_OVERRIDES'
    || result.status === 'BUTTON_HOVER_INTERACTIONS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'BUTTON_HOVER_INTERACTIONS_RESOLVED'
    ? result.resolvedButtonCount > 0 && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_BUTTON_HOVER_INTERACTION_OVERRIDES'
      ? result.resolvedButtonCount === 0 && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedButtonCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedInteractions.every(validSummaryEntry)
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
    throw new Error('Invalid or authority-inflated P15 button-hover-interaction result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceButtonCount: result.sourceButtonCount,
    resolvedButtonCount: result.resolvedButtonCount,
    resolvedInteractions: result.resolvedInteractions.map(cloneEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_EVIDENCE,
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
