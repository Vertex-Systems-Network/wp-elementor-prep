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

export const P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION =
  'p15-elementor-button-icon-basics-manifest-v1' as const;
export const P15_ELEMENTOR_BUTTON_ICON_BASICS_RESULT_VERSION =
  'p15-elementor-button-icon-basics-result-v1' as const;
export const P15_ELEMENTOR_BUTTON_ICON_BASICS_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_BUTTON_ICON_INDENT_MAX_PX = 50 as const;

export const P15_ELEMENTOR_BUTTON_ICON_LIBRARIES = [
  'fa-solid',
  'fa-regular',
  'fa-brands',
] as const;

export const P15_ELEMENTOR_BUTTON_ICON_ALIGNMENTS = [
  'row',
  'row-reverse',
] as const;

export const P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  buttonTraitSourcePath: 'includes/widgets/traits/button-trait.php',
  buttonTraitSourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  iconsControlSourcePath: 'includes/controls/icons.php',
  iconsControlSourceBlobSha: 'd7d9445cb94c852bbb4731e076667fd97dec0554',
  buttonIconFixturePath: 'tests/playwright/sanity/templates/button-icon-styling.json',
  buttonIconFixtureBlobSha: 'ba4b5b444ab41fa69f982dc74af655aa03417783',
  selectedIconControlName: 'selected_icon',
  selectedIconSettingKey: 'selected_icon',
  iconAlignControlName: 'icon_align',
  iconAlignSettingKey: 'icon_align',
  iconIndentControlName: 'icon_indent',
  iconIndentSettingKey: 'icon_indent',
  acceptedIconLibraries: P15_ELEMENTOR_BUTTON_ICON_LIBRARIES,
  acceptedIconAlignments: P15_ELEMENTOR_BUTTON_ICON_ALIGNMENTS,
  iconIndentUnit: 'px',
  iconIndentMinPx: 0,
  iconIndentMaxPx: P15_ELEMENTOR_BUTTON_ICON_INDENT_MAX_PX,
  svgImportAllowed: false,
});

export type P15ElementorButtonIconLibrary =
  typeof P15_ELEMENTOR_BUTTON_ICON_LIBRARIES[number];
export type P15ElementorButtonIconAlignment =
  typeof P15_ELEMENTOR_BUTTON_ICON_ALIGNMENTS[number];

export interface P15ElementorButtonSelectedIconV1 {
  value: string;
  library: P15ElementorButtonIconLibrary;
}

export interface P15ElementorButtonIconBasicsEntryV1 {
  sourceNodeId: string;
  selectedIcon: P15ElementorButtonSelectedIconV1;
  iconAlign?: P15ElementorButtonIconAlignment;
  iconIndentPx?: number;
}

export interface P15ElementorButtonIconBasicsManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  buttons: P15ElementorButtonIconBasicsEntryV1[];
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  iconInferencePerformed: false;
  svgImportPerformed: false;
  figmaMutation: false;
  networkAccess: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorButtonIconBasicsIssueCode =
  | 'P15_BUTTON_ICON_BASICS_SOURCE_IR_INVALID'
  | 'P15_BUTTON_ICON_BASICS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_BUTTON_ICON_BASICS_MANIFEST_NOT_OBJECT'
  | 'P15_BUTTON_ICON_BASICS_MANIFEST_FIELDS_INVALID'
  | 'P15_BUTTON_ICON_BASICS_MANIFEST_VERSION_INVALID'
  | 'P15_BUTTON_ICON_BASICS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_BUTTON_ICON_BASICS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_BUTTON_ICON_BASICS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_BUTTON_ICON_BASICS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_BUTTON_ICON_BASICS_ENTRIES_INVALID'
  | 'P15_BUTTON_ICON_BASICS_ENTRY_INVALID'
  | 'P15_BUTTON_ICON_BASICS_DUPLICATE_SOURCE_ID'
  | 'P15_BUTTON_ICON_BASICS_SOURCE_NOT_BUTTON'
  | 'P15_BUTTON_ICON_BASICS_ICON_INVALID'
  | 'P15_BUTTON_ICON_BASICS_ICON_ALIGNMENT_INVALID'
  | 'P15_BUTTON_ICON_BASICS_ICON_INDENT_INVALID'
  | 'P15_BUTTON_ICON_BASICS_AUTHORITY_FLAGS_INVALID'
  | 'P15_BUTTON_ICON_BASICS_GENERATOR_BINDING_MISMATCH'
  | 'P15_BUTTON_ICON_BASICS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_BUTTON_ICON_BASICS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorButtonIconBasicsIssueV1 {
  code: P15ElementorButtonIconBasicsIssueCode;
  path: string;
  message: string;
}

export type P15ElementorButtonIconBasicsStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_BUTTON_ICON_OVERRIDES'
  | 'BUTTON_ICON_BASICS_RESOLVED';

export interface P15ElementorButtonIconBasicsResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_BUTTON_ICON_BASICS_RESULT_VERSION;
  status: P15ElementorButtonIconBasicsStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceButtonCount: number;
  resolvedButtonCount: number;
  resolvedIcons: P15ElementorButtonIconBasicsEntryV1[];
  issues: P15ElementorButtonIconBasicsIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  styleInferencePerformed: false;
  responsiveInferencePerformed: false;
  iconInferencePerformed: false;
  svgImportPerformed: false;
  figmaMutation: false;
  networkAccess: false;
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
  'iconInferencePerformed',
  'manifestVersion',
  'networkAccess',
  'productionAcceptance',
  'responsiveInferencePerformed',
  'schemaVersion',
  'sourceIrFingerprint',
  'styleInferencePerformed',
  'svgImportPerformed',
  'targetCompatibilityClaim',
] as const;

const ENTRY_KEYS = ['iconAlign', 'iconIndentPx', 'selectedIcon', 'sourceNodeId'] as const;
const ICON_KEYS = ['library', 'value'] as const;

const ISSUE_CODES: readonly P15ElementorButtonIconBasicsIssueCode[] = [
  'P15_BUTTON_ICON_BASICS_SOURCE_IR_INVALID',
  'P15_BUTTON_ICON_BASICS_UPSTREAM_GENERATION_NOT_READY',
  'P15_BUTTON_ICON_BASICS_MANIFEST_NOT_OBJECT',
  'P15_BUTTON_ICON_BASICS_MANIFEST_FIELDS_INVALID',
  'P15_BUTTON_ICON_BASICS_MANIFEST_VERSION_INVALID',
  'P15_BUTTON_ICON_BASICS_SOURCE_FINGERPRINT_INVALID',
  'P15_BUTTON_ICON_BASICS_SOURCE_FINGERPRINT_MISMATCH',
  'P15_BUTTON_ICON_BASICS_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_BUTTON_ICON_BASICS_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_BUTTON_ICON_BASICS_ENTRIES_INVALID',
  'P15_BUTTON_ICON_BASICS_ENTRY_INVALID',
  'P15_BUTTON_ICON_BASICS_DUPLICATE_SOURCE_ID',
  'P15_BUTTON_ICON_BASICS_SOURCE_NOT_BUTTON',
  'P15_BUTTON_ICON_BASICS_ICON_INVALID',
  'P15_BUTTON_ICON_BASICS_ICON_ALIGNMENT_INVALID',
  'P15_BUTTON_ICON_BASICS_ICON_INDENT_INVALID',
  'P15_BUTTON_ICON_BASICS_AUTHORITY_FLAGS_INVALID',
  'P15_BUTTON_ICON_BASICS_GENERATOR_BINDING_MISMATCH',
  'P15_BUTTON_ICON_BASICS_EXISTING_OVERRIDE_CONFLICT',
  'P15_BUTTON_ICON_BASICS_RESOLVED_CANDIDATE_INVALID',
];

const LIBRARY_PREFIX: Record<P15ElementorButtonIconLibrary, string> = {
  'fa-solid': 'fas',
  'fa-regular': 'far',
  'fa-brands': 'fab',
};

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

function validIconLibrary(value: unknown): value is P15ElementorButtonIconLibrary {
  return typeof value === 'string'
    && (P15_ELEMENTOR_BUTTON_ICON_LIBRARIES as readonly string[]).includes(value);
}

function validSelectedIcon(value: unknown): value is P15ElementorButtonSelectedIconV1 {
  if (!isRecord(value) || !exactKeys(value, ICON_KEYS) || !validIconLibrary(value.library)) {
    return false;
  }
  if (typeof value.value !== 'string' || value.value.length > 128) return false;
  const match = /^(fas|far|fab) (fa-[a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(value.value);
  return match !== null && match[1] === LIBRARY_PREFIX[value.library];
}

function validIconAlignment(value: unknown): value is P15ElementorButtonIconAlignment {
  return typeof value === 'string'
    && (P15_ELEMENTOR_BUTTON_ICON_ALIGNMENTS as readonly string[]).includes(value);
}

function validIconIndent(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= P15_ELEMENTOR_BUTTON_ICON_INDENT_MAX_PX;
}

function cloneEntry(value: P15ElementorButtonIconBasicsEntryV1): P15ElementorButtonIconBasicsEntryV1 {
  return {
    sourceNodeId: value.sourceNodeId,
    selectedIcon: { ...value.selectedIcon },
    ...(value.iconAlign !== undefined ? { iconAlign: value.iconAlign } : {}),
    ...(value.iconIndentPx !== undefined ? { iconIndentPx: value.iconIndentPx } : {}),
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

  function visit(
    sourceNodes: readonly P15NeutralExportNode[],
    targetElements: readonly ElementorElementV04[],
    targetPath: string,
  ): void {
    if (sourceNodes.length !== targetElements.length) {
      issues.push({
        path: targetPath,
        message: 'Generated Elementor tree length does not match the exact review-free neutral source tree.',
      });
      return;
    }

    for (let index = 0; index < sourceNodes.length; index += 1) {
      const sourceNode = sourceNodes[index];
      const target = targetElements[index];
      const path = targetPath + '[' + index + ']';

      if (!sourceNode || !target) {
        issues.push({ path, message: 'Generated source/target element pair is missing.' });
        continue;
      }
      if (sourceNode.kind === 'review') {
        issues.push({ path, message: 'Review nodes cannot participate in Button icon binding.' });
        continue;
      }
      if (sourceNode.kind === 'container') {
        if (target.elType !== 'container') {
          issues.push({ path, message: 'Neutral container did not bind to an Elementor container.' });
          continue;
        }
        if (!isRecord(target.settings) || target.settings.flex_direction !== sourceNode.direction) {
          issues.push({
            path: path + '.settings.flex_direction',
            message: 'Generated container base direction drifted from the neutral source.',
          });
          continue;
        }
        visit(sourceNode.children, target.elements, path + '.elements');
        continue;
      }

      const widgetType = expectedWidgetType(sourceNode);
      if (target.elType !== 'widget' || target.widgetType !== widgetType) {
        issues.push({
          path,
          message: 'Neutral widget did not bind to the expected generated Elementor core widget.',
        });
        continue;
      }

      if (sourceNode.kind === 'button') {
        if (!isRecord(target.settings) || !buttonBaseSettingsMatch(sourceNode, target.settings)) {
          issues.push({
            path: path + '.settings',
            message: 'Generated Button base settings drifted from the exact neutral source.',
          });
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
  status: P15ElementorButtonIconBasicsStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceButtonCount: number,
  resolvedIcons: P15ElementorButtonIconBasicsEntryV1[],
  issues: P15ElementorButtonIconBasicsIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorButtonIconBasicsResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_ICON_BASICS_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceButtonCount,
    resolvedButtonCount: resolvedIcons.length,
    resolvedIcons: resolvedIcons.map(cloneEntry),
    issues: issues.map((issue) => ({ ...issue })),
    template,
    candidate,
    styleInferencePerformed: false,
    responsiveInferencePerformed: false,
    iconInferencePerformed: false,
    svgImportPerformed: false,
    figmaMutation: false,
    networkAccess: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

export function resolveP15ElementorButtonIconBasics(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorButtonIconBasicsResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR',
      null, null, null, 0, [],
      validation.issues.map((issue) => ({
        code: 'P15_BUTTON_ICON_BASICS_SOURCE_IR_INVALID' as const,
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
        code: 'P15_BUTTON_ICON_BASICS_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Button icon resolution requires an existing review-free generated local candidate.',
      }],
      null, null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorButtonIconBasicsIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorButtonIconBasicsEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_BUTTON_ICON_BASICS_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Button icon manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_BUTTON_ICON_BASICS_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Button icon manifest contains unknown or missing fields.',
      });
    }

    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_BUTTON_ICON_BASICS_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Button icon manifest schema/version is unsupported.',
      });
    }

    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_BUTTON_ICON_BASICS_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_BUTTON_ICON_BASICS_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }

    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_BUTTON_ICON_BASICS_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_BUTTON_ICON_BASICS_BASE_CANDIDATE_IDENTITY_MISMATCH',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'Manifest is not bound to the exact current base candidate identity.',
      });
    }

    if (manifestValue.styleInferencePerformed !== false
      || manifestValue.responsiveInferencePerformed !== false
      || manifestValue.iconInferencePerformed !== false
      || manifestValue.svgImportPerformed !== false
      || manifestValue.figmaMutation !== false
      || manifestValue.networkAccess !== false
      || manifestValue.targetCompatibilityClaim !== false
      || manifestValue.productionAcceptance !== false
      || manifestValue.downloadEnabled !== false) {
      issues.push({
        code: 'P15_BUTTON_ICON_BASICS_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Button icon resolution cannot grant inference/SVG/network/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.buttons)
      || manifestValue.buttons.length > P15_ELEMENTOR_BUTTON_ICON_BASICS_MAX_ENTRIES) {
      issues.push({
        code: 'P15_BUTTON_ICON_BASICS_ENTRIES_INVALID',
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
            code: 'P15_BUTTON_ICON_BASICS_ENTRY_INVALID',
            path,
            message: 'Each entry may contain only sourceNodeId, selectedIcon, iconAlign and iconIndentPx.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_ICON_BASICS_DUPLICATE_SOURCE_ID',
            path: path + '.sourceNodeId',
            message: 'Button icon sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceButtons.has(sourceNodeId)) {
          issues.push({
            code: 'P15_BUTTON_ICON_BASICS_SOURCE_NOT_BUTTON',
            path: path + '.sourceNodeId',
            message: 'sourceNodeId must identify an existing neutral Button node.',
          });
          continue;
        }

        if (!validSelectedIcon(raw.selectedIcon)) {
          issues.push({
            code: 'P15_BUTTON_ICON_BASICS_ICON_INVALID',
            path: path + '.selectedIcon',
            message: 'selectedIcon must be one exact bounded Font Awesome class/library pair; SVG/URL/custom payloads are rejected.',
          });
          continue;
        }

        if (raw.iconAlign !== undefined && !validIconAlignment(raw.iconAlign)) {
          issues.push({
            code: 'P15_BUTTON_ICON_BASICS_ICON_ALIGNMENT_INVALID',
            path: path + '.iconAlign',
            message: 'iconAlign must be row or row-reverse.',
          });
          continue;
        }

        if (raw.iconIndentPx !== undefined && !validIconIndent(raw.iconIndentPx)) {
          issues.push({
            code: 'P15_BUTTON_ICON_BASICS_ICON_INDENT_INVALID',
            path: path + '.iconIndentPx',
            message: 'iconIndentPx must be a finite px value from 0 through 50.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          selectedIcon: { ...raw.selectedIcon },
          ...(raw.iconAlign !== undefined
            ? { iconAlign: raw.iconAlign as P15ElementorButtonIconAlignment }
            : {}),
          ...(raw.iconIndentPx !== undefined ? { iconIndentPx: raw.iconIndentPx as number } : {}),
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
      'NO_BUTTON_ICON_OVERRIDES',
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
        code: 'P15_BUTTON_ICON_BASICS_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_BUTTON_ICON_BASICS_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: 'Generated Button binding missing for sourceNodeId ' + sourceNodeId + '.',
      });
      continue;
    }

    const requestedKeys = [
      P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE.selectedIconSettingKey,
      ...(resolution.iconAlign !== undefined
        ? [P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE.iconAlignSettingKey]
        : []),
      ...(resolution.iconIndentPx !== undefined
        ? [P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE.iconIndentSettingKey]
        : []),
    ];

    const conflictingKey = requestedKeys.find(
      (key) => Object.prototype.hasOwnProperty.call(target.settings, key),
    );
    if (conflictingKey) {
      issues.push({
        code: 'P15_BUTTON_ICON_BASICS_EXISTING_OVERRIDE_CONFLICT',
        path: '$source.' + sourceNodeId,
        message: 'Generated base candidate already contains Button setting ' + conflictingKey + '.',
      });
      continue;
    }

    target.settings[P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE.selectedIconSettingKey] = {
      value: resolution.selectedIcon.value,
      library: resolution.selectedIcon.library,
    };

    if (resolution.iconAlign !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE.iconAlignSettingKey] =
        resolution.iconAlign;
    }

    if (resolution.iconIndentPx !== undefined) {
      target.settings[P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE.iconIndentSettingKey] = {
        unit: 'px',
        size: resolution.iconIndentPx,
        sizes: [],
      };
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
        code: 'P15_BUTTON_ICON_BASICS_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Button icon output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null, null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedIcons = [...resolutions.values()]
    .map(cloneEntry)
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'BUTTON_ICON_BASICS_RESOLVED',
    sourceIrFingerprint, baseIdentity.digest, resolvedIdentity.digest, sourceButtons.size,
    resolvedIcons, [], template, candidate,
  );
}

function validIssue(issue: P15ElementorButtonIconBasicsIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorButtonIconBasicsIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorButtonIconBasicsEntryV1): boolean {
  return isRecord(entry)
    && onlyAllowedKeys(entry, ENTRY_KEYS)
    && validSourceNodeId(entry.sourceNodeId)
    && validSelectedIcon(entry.selectedIcon)
    && (entry.iconAlign === undefined || validIconAlignment(entry.iconAlign))
    && (entry.iconIndentPx === undefined || validIconIndent(entry.iconIndentPx));
}

export function serializeP15ElementorButtonIconBasicsSummary(
  result: P15ElementorButtonIconBasicsResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_BUTTON_ICON_OVERRIDES'
    || result.status === 'BUTTON_ICON_BASICS_RESOLVED';

  const validCounts = Number.isSafeInteger(result.sourceButtonCount)
    && result.sourceButtonCount >= 0
    && Number.isSafeInteger(result.resolvedButtonCount)
    && result.resolvedButtonCount >= 0
    && result.resolvedButtonCount <= result.sourceButtonCount
    && result.resolvedButtonCount === result.resolvedIcons.length;

  const uniqueIds = new Set(result.resolvedIcons.map((entry) => entry.sourceNodeId)).size
    === result.resolvedIcons.length;

  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_BUTTON_ICON_OVERRIDES'
    || result.status === 'BUTTON_ICON_BASICS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'BUTTON_ICON_BASICS_RESOLVED'
    ? result.resolvedButtonCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_BUTTON_ICON_OVERRIDES'
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
    || !result.resolvedIcons.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.styleInferencePerformed !== false
    || result.responsiveInferencePerformed !== false
    || result.iconInferencePerformed !== false
    || result.svgImportPerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 button-icon-basics result.');
  }

  return JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_BUTTON_ICON_BASICS_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceButtonCount: result.sourceButtonCount,
    resolvedButtonCount: result.resolvedButtonCount,
    resolvedIcons: result.resolvedIcons.map(cloneEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_BUTTON_ICON_BASICS_EVIDENCE,
    styleInferencePerformed: false,
    responsiveInferencePerformed: false,
    iconInferencePerformed: false,
    svgImportPerformed: false,
    figmaMutation: false,
    networkAccess: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2) + '\n';
}
