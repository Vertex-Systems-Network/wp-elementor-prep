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

export const P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-button-stretch-content-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-button-stretch-content-alignment-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_BUTTON_CONTENT_ALIGNMENTS = [
  'start',
  'center',
  'end',
  'space-between',
] as const;

export const P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  positionControlName: 'align',
  stretchSettingKey: 'align',
  stretchValue: 'justify',
  contentAlignmentControlName: 'content_align',
  desktopContentAlignmentSettingKey: 'content_align',
  tabletContentAlignmentSettingKey: 'content_align_tablet',
  mobileContentAlignmentSettingKey: 'content_align_mobile',
  acceptedContentAlignments: P15_ELEMENTOR_BUTTON_CONTENT_ALIGNMENTS,
});

export type P15ElementorButtonContentAlignment =
  typeof P15_ELEMENTOR_BUTTON_CONTENT_ALIGNMENTS[number];

export interface P15ElementorButtonStretchContentAlignmentEntryV1 {
  sourceNodeId: string;
  stretch: true;
  desktopContentAlign?: P15ElementorButtonContentAlignment;
  tabletContentAlign?: P15ElementorButtonContentAlignment;
  mobileContentAlign?: P15ElementorButtonContentAlignment;
}

export interface P15ElementorButtonStretchContentAlignmentManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonStretchContentAlignmentEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonStretchContentAlignmentIssueCode =
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_IR_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_ENTRIES_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_ENTRY_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_ALIGNMENT_CONFLICT'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_STRETCH_REQUIRED'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_VALUE_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonStretchContentAlignmentIssueV1 {
  code: P15ElementorButtonStretchContentAlignmentIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonStretchContentAlignmentStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_STRETCH_CONTENT_ALIGNMENT_OVERRIDES'
  | 'BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED';

export interface P15ElementorButtonStretchContentAlignmentResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorButtonStretchContentAlignmentStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedAlignments: P15ElementorButtonStretchContentAlignmentEntryV1[];
  issues: P15ElementorButtonStretchContentAlignmentIssueV1[];
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

const ENTRY_KEYS = [
  'desktopContentAlign',
  'mobileContentAlign',
  'sourceNodeId',
  'stretch',
  'tabletContentAlign',
] as const;

const ISSUE_CODES: readonly P15ElementorButtonStretchContentAlignmentIssueCode[] = [
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_IR_INVALID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_NOT_OBJECT',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_FIELDS_INVALID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION_INVALID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_FINGERPRINT_INVALID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_ENTRIES_INVALID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_ENTRY_INVALID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_DUPLICATE_SOURCE_ID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_NOT_BUTTON',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_ALIGNMENT_CONFLICT',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_STRETCH_REQUIRED',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_VALUE_INVALID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_AUTHORITY_FLAGS_INVALID',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_GENERATOR_BINDING_MISMATCH',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
  'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESOLVED_CANDIDATE_INVALID',
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

function validContentAlignment(value: unknown): value is P15ElementorButtonContentAlignment {
  return typeof value === 'string'
    && (P15_ELEMENTOR_BUTTON_CONTENT_ALIGNMENTS as readonly string[]).includes(value);
}

function cloneEntry(
  value: P15ElementorButtonStretchContentAlignmentEntryV1,
): P15ElementorButtonStretchContentAlignmentEntryV1 {
  return {
    sourceNodeId: value.sourceNodeId,
    stretch: true,
    ...(value.desktopContentAlign !== undefined
      ? { desktopContentAlign: value.desktopContentAlign }
      : {}),
    ...(value.tabletContentAlign !== undefined
      ? { tabletContentAlign: value.tabletContentAlign }
      : {}),
    ...(value.mobileContentAlign !== undefined
      ? { mobileContentAlign: value.mobileContentAlign }
      : {}),
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

function expectedWidgetType(
  node: Exclude<P15NeutralExportNode, { kind: 'container' | 'review' }>,
): string {
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
  if (expectedAlign === undefined ? hasAlign : !hasAlign || settings.align !== expectedAlign) {
    return false;
  }

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
        push(path, 'Review nodes cannot participate in Button stretch/content alignment binding.');
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
  status: P15ElementorButtonStretchContentAlignmentStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceButtonCount: number,
  resolvedAlignments: P15ElementorButtonStretchContentAlignmentEntryV1[],
  issues: P15ElementorButtonStretchContentAlignmentIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorButtonStretchContentAlignmentResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceButtonCount,
    resolvedButtonCount: resolvedAlignments.length,
    resolvedAlignments: resolvedAlignments.map(cloneEntry),
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

export function resolveP15ElementorButtonStretchContentAlignments(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonStretchContentAlignmentResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR',
      null, null, null, 0, [],
      validation.issues.map((issue) => ({
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_IR_INVALID' as const,
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
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Button stretch/content alignment requires an existing review-free generated local candidate.',
      }],
      null, null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorButtonStretchContentAlignmentIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorButtonStretchContentAlignmentEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Button stretch/content alignment manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Button stretch/content alignment manifest contains unknown or missing fields.',
      });
    }

    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Button stretch/content alignment manifest schema/version is unsupported.',
      });
    }

    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }

    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Button stretch/content alignment cannot grant inference/mutation/network/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.buttons)
      || manifestValue.buttons.length > P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MAX_ENTRIES) {
      issues.push({
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_ENTRIES_INVALID',
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
            code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_ENTRY_INVALID',
            path,
            message: 'Each entry may contain only sourceNodeId, stretch and bounded desktop/tablet/mobile content alignment.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_DUPLICATE_SOURCE_ID',
            path: path + '.sourceNodeId',
            message: 'Button stretch/content alignment sourceNodeId must be unique.',
          });
          continue;
        }

        const sourceButton = sourceButtons.get(sourceNodeId);
        if (!sourceButton) {
          issues.push({
            code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_NOT_BUTTON',
            path: path + '.sourceNodeId',
            message: 'sourceNodeId must identify an existing neutral Button node.',
          });
          continue;
        }

        if (sourceButton.align !== undefined) {
          issues.push({
            code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_SOURCE_ALIGNMENT_CONFLICT',
            path: path + '.sourceNodeId',
            message: 'Stretch is rejected when the neutral Button already declares explicit alignment.',
          });
          continue;
        }

        if (raw.stretch !== true) {
          issues.push({
            code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_STRETCH_REQUIRED',
            path: path + '.stretch',
            message: 'stretch must be explicitly true for this target-specific layout mutation.',
          });
          continue;
        }

        const desktopProvided = raw.desktopContentAlign !== undefined;
        const tabletProvided = raw.tabletContentAlign !== undefined;
        const mobileProvided = raw.mobileContentAlign !== undefined;

        if ((desktopProvided && !validContentAlignment(raw.desktopContentAlign))
          || (tabletProvided && !validContentAlignment(raw.tabletContentAlign))
          || (mobileProvided && !validContentAlignment(raw.mobileContentAlign))) {
          issues.push({
            code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_VALUE_INVALID',
            path,
            message: 'Content alignment must be one of start, center, end or space-between.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          stretch: true,
          ...(desktopProvided
            ? { desktopContentAlign: raw.desktopContentAlign as P15ElementorButtonContentAlignment }
            : {}),
          ...(tabletProvided
            ? { tabletContentAlign: raw.tabletContentAlign as P15ElementorButtonContentAlignment }
            : {}),
          ...(mobileProvided
            ? { mobileContentAlign: raw.mobileContentAlign as P15ElementorButtonContentAlignment }
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
      'NO_BUTTON_STRETCH_CONTENT_ALIGNMENT_OVERRIDES',
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
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: 'Generated Button binding missing for sourceNodeId ' + sourceNodeId + '.',
      });
      continue;
    }

    const requestedKeys = [
      P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE.stretchSettingKey,
      ...(resolution.desktopContentAlign !== undefined
        ? [P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE.desktopContentAlignmentSettingKey]
        : []),
      ...(resolution.tabletContentAlign !== undefined
        ? [P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE.tabletContentAlignmentSettingKey]
        : []),
      ...(resolution.mobileContentAlign !== undefined
        ? [P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE.mobileContentAlignmentSettingKey]
        : []),
    ];

    const conflictingKey = requestedKeys.find(
      (key) => Object.prototype.hasOwnProperty.call(target.settings, key),
    );
    if (conflictingKey) {
      issues.push({
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
        path: '$source.' + sourceNodeId,
        message: 'Generated base candidate already contains Button setting ' + conflictingKey + '.',
      });
      continue;
    }

    target.settings[P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE.stretchSettingKey] =
      P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE.stretchValue;

    if (resolution.desktopContentAlign !== undefined) {
      target.settings[
        P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE.desktopContentAlignmentSettingKey
      ] = resolution.desktopContentAlign;
    }
    if (resolution.tabletContentAlign !== undefined) {
      target.settings[
        P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE.tabletContentAlignmentSettingKey
      ] = resolution.tabletContentAlign;
    }
    if (resolution.mobileContentAlign !== undefined) {
      target.settings[
        P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE.mobileContentAlignmentSettingKey
      ] = resolution.mobileContentAlign;
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
        code: 'P15_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Button stretch/content alignment output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null, null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedAlignments = [...resolutions.values()]
    .map(cloneEntry)
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED',
    sourceIrFingerprint, baseIdentity.digest, resolvedIdentity.digest, sourceButtons.size,
    resolvedAlignments, [], template, candidate,
  );
}

function validIssue(issue: P15ElementorButtonStretchContentAlignmentIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorButtonStretchContentAlignmentIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorButtonStretchContentAlignmentEntryV1): boolean {
  if (!isRecord(entry)
    || !onlyAllowedKeys(entry, ENTRY_KEYS)
    || !validSourceNodeId(entry.sourceNodeId)
    || entry.stretch !== true) return false;

  return (entry.desktopContentAlign === undefined || validContentAlignment(entry.desktopContentAlign))
    && (entry.tabletContentAlign === undefined || validContentAlignment(entry.tabletContentAlign))
    && (entry.mobileContentAlign === undefined || validContentAlignment(entry.mobileContentAlign));
}

export function serializeP15ElementorButtonStretchContentAlignmentSummary(
  result: P15ElementorButtonStretchContentAlignmentResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_BUTTON_STRETCH_CONTENT_ALIGNMENT_OVERRIDES'
    || result.status === 'BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED';

  const validCounts = Number.isSafeInteger(result.sourceButtonCount)
    && result.sourceButtonCount >= 0
    && Number.isSafeInteger(result.resolvedButtonCount)
    && result.resolvedButtonCount >= 0
    && result.resolvedButtonCount <= result.sourceButtonCount
    && result.resolvedButtonCount === result.resolvedAlignments.length;

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
  const resolvedDigestRequired = result.status === 'NO_BUTTON_STRETCH_CONTENT_ALIGNMENT_OVERRIDES'
    || result.status === 'BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'BUTTON_STRETCH_CONTENT_ALIGNMENTS_RESOLVED'
    ? result.resolvedButtonCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_BUTTON_STRETCH_CONTENT_ALIGNMENT_OVERRIDES'
      ? result.resolvedButtonCount === 0
        && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedButtonCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedAlignments.every(validSummaryEntry)
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
    throw new Error('Invalid or authority-inflated P15 button-stretch-content-alignment result.');
  }

  return JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceButtonCount: result.sourceButtonCount,
    resolvedButtonCount: result.resolvedButtonCount,
    resolvedAlignments: result.resolvedAlignments.map(cloneEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_EVIDENCE,
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
