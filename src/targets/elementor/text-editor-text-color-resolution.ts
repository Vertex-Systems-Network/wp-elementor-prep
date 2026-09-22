import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralTextNode,
} from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import { cloneP15ReadyElementorTemplate } from './responsive-container-binding';
import type {
  ElementorElementV04,
  ElementorTemplateV04,
  ElementorWidgetV04,
} from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION =
  'p15-elementor-text-editor-text-color-manifest-v1' as const;
export const P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_RESULT_VERSION =
  'p15-elementor-text-editor-text-color-result-v1' as const;
export const P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  textEditorSourcePath: 'includes/widgets/text-editor.php',
  textEditorSourceBlobSha: '72ff868493a3c0f27c6305794ffcff9cf217c9ea',
  controlName: 'text_color',
  settingKey: 'text_color',
  linkControlName: 'link_color',
  selector: '{{WRAPPER}}',
  acceptedColorPattern: '^#[0-9a-f]{6}$',
});

export type P15ElementorTextEditorTextColorValue = string;

export interface P15ElementorTextEditorTextColorEntryV1 {
  sourceNodeId: string;
  color: P15ElementorTextEditorTextColorValue;
}

export interface P15ElementorTextEditorTextColorManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  texts: P15ElementorTextEditorTextColorEntryV1[];
  colorInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorTextEditorTextColorIssueCode =
  | 'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_IR_INVALID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_MANIFEST_NOT_OBJECT'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_MANIFEST_FIELDS_INVALID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION_INVALID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_FINGERPRINT_INVALID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_ENTRIES_INVALID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_ENTRY_INVALID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_DUPLICATE_SOURCE_ID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_NOT_TEXT'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_VALUE_INVALID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_AUTHORITY_FLAGS_INVALID'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_GENERATOR_BINDING_MISMATCH'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_TEXT_EDITOR_TEXT_COLOR_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorTextEditorTextColorIssueV1 {
  code: P15ElementorTextEditorTextColorIssueCode;
  path: string;
  message: string;
}

export type P15ElementorTextEditorTextColorStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_TEXT_EDITOR_TEXT_COLOR_OVERRIDES'
  | 'TEXT_EDITOR_TEXT_COLORS_RESOLVED';

export interface P15ElementorTextEditorTextColorSummaryEntryV1 {
  sourceNodeId: string;
  color: P15ElementorTextEditorTextColorValue;
}

export interface P15ElementorTextEditorTextColorResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_RESULT_VERSION;
  status: P15ElementorTextEditorTextColorStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceTextCount: number;
  resolvedTextCount: number;
  resolvedColors: P15ElementorTextEditorTextColorSummaryEntryV1[];
  issues: P15ElementorTextEditorTextColorIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  colorInferencePerformed: false;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

type TextBinding = {
  source: P15NeutralTextNode;
  target: ElementorWidgetV04;
};

type TextBindingIssue = {
  path: string;
  message: string;
};

const MANIFEST_KEYS = [
  'baseCandidateIdentityDigest',
  'colorInferencePerformed',
  'downloadEnabled',
  'figmaMutation',
  'texts',
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

const ISSUE_CODES: readonly P15ElementorTextEditorTextColorIssueCode[] = [
  'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_IR_INVALID',
  'P15_TEXT_EDITOR_TEXT_COLOR_UPSTREAM_GENERATION_NOT_READY',
  'P15_TEXT_EDITOR_TEXT_COLOR_MANIFEST_NOT_OBJECT',
  'P15_TEXT_EDITOR_TEXT_COLOR_MANIFEST_FIELDS_INVALID',
  'P15_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION_INVALID',
  'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_FINGERPRINT_INVALID',
  'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_FINGERPRINT_MISMATCH',
  'P15_TEXT_EDITOR_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_TEXT_EDITOR_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_TEXT_EDITOR_TEXT_COLOR_ENTRIES_INVALID',
  'P15_TEXT_EDITOR_TEXT_COLOR_ENTRY_INVALID',
  'P15_TEXT_EDITOR_TEXT_COLOR_DUPLICATE_SOURCE_ID',
  'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_NOT_TEXT',
  'P15_TEXT_EDITOR_TEXT_COLOR_VALUE_INVALID',
  'P15_TEXT_EDITOR_TEXT_COLOR_AUTHORITY_FLAGS_INVALID',
  'P15_TEXT_EDITOR_TEXT_COLOR_GENERATOR_BINDING_MISMATCH',
  'P15_TEXT_EDITOR_TEXT_COLOR_EXISTING_OVERRIDE_CONFLICT',
  'P15_TEXT_EDITOR_TEXT_COLOR_RESOLVED_CANDIDATE_INVALID',
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

function validColor(value: unknown): value is P15ElementorTextEditorTextColorValue {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/.test(value);
}

function collectTextNodes(document: P15NeutralExportDocumentV1): Map<string, P15NeutralTextNode> {
  const result = new Map<string, P15NeutralTextNode>();

  function visit(nodes: readonly P15NeutralExportNode[]): void {
    for (const node of nodes) {
      if (node.kind === 'container') {
        visit(node.children);
      } else if (node.kind === 'text') {
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

function escapeTextEditorHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function expectedTextEditorHtml(value: string): string {
  const normalized = value.replace(/\r\n?/g, '\n');
  return `<p>${escapeTextEditorHtml(normalized).replaceAll('\n', '<br>')}</p>`;
}

function textBaseSettingsMatch(
  node: P15NeutralTextNode,
  settings: Record<string, unknown>,
): boolean {
  if (settings.editor !== expectedTextEditorHtml(node.text)) return false;
  const hasAlign = Object.prototype.hasOwnProperty.call(settings, 'align');
  return node.align === undefined
    ? !hasAlign
    : hasAlign && settings.align === node.align;
}

function bindTextWidgets(
  source: P15NeutralExportDocumentV1,
  template: ElementorTemplateV04,
): { texts: Map<string, TextBinding>; issues: TextBindingIssue[] } {
  const texts = new Map<string, TextBinding>();
  const issues: TextBindingIssue[] = [];

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
        push(path, 'Review nodes cannot participate in Text Editor color binding.');
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

      if (sourceNode.kind === 'text') {
        if (!isRecord(target.settings) || !textBaseSettingsMatch(sourceNode, target.settings)) {
          push(`${path}.settings`, 'Generated Text Editor base settings drifted from the exact neutral source.');
          continue;
        }
        texts.set(sourceNode.sourceNodeId, { source: sourceNode, target });
      }
    }
  }

  visit(source.nodes, template.content, '$.content');
  return { texts, issues };
}

function baseResult(
  status: P15ElementorTextEditorTextColorStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceTextCount: number,
  resolvedColors: P15ElementorTextEditorTextColorSummaryEntryV1[],
  issues: P15ElementorTextEditorTextColorIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorTextEditorTextColorResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceTextCount,
    resolvedTextCount: resolvedColors.length,
    resolvedColors: resolvedColors.map((entry) => ({ ...entry })),
    issues: issues.map((issue) => ({ ...issue })),
    template,
    candidate,
    colorInferencePerformed: false,
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
 * Apply only explicit lowercase six-digit hex normal text colors to exact generated Text Editor bindings.
 *
 * This contract does not infer colors, parse CSS, resolve global/theme tokens, mutate hover/link color,
 * add alpha channels, change Text content/alignment, or claim compatibility/production authority.
 */
export function resolveP15ElementorTextEditorTextColors(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorTextEditorTextColorResultV1 {
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
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const sourceTexts = collectTextNodes(source);
  const baseGeneration = generateElementorV3TemplateCandidate(source);

  if (baseGeneration.status !== 'GENERATED_LOCAL_CANDIDATE'
    || baseGeneration.template === null
    || baseGeneration.candidate === null) {
    return baseResult(
      'BLOCKED_UPSTREAM_GENERATION',
      sourceIrFingerprint,
      null,
      null,
      sourceTexts.size,
      [],
      [{
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Text Editor text color resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorTextEditorTextColorIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorTextEditorTextColorEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_TEXT_EDITOR_TEXT_COLOR_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Text Editor text color manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Text Editor text color manifest contains unknown or missing fields.',
      });
    }

    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Text Editor text color manifest schema/version is unsupported.',
      });
    }

    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }

    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'Manifest is not bound to the exact current base candidate identity.',
      });
    }

    if (manifestValue.colorInferencePerformed !== false
      || manifestValue.responsiveInferencePerformed !== false
      || manifestValue.figmaMutation !== false
      || manifestValue.networkAccess !== false
      || manifestValue.responsiveClosureClaim !== false
      || manifestValue.targetCompatibilityClaim !== false
      || manifestValue.productionAcceptance !== false
      || manifestValue.downloadEnabled !== false) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Text Editor text color resolution cannot grant color/responsive inference, mutation, network, closure, compatibility, production or download authority.',
      });
    }

    if (!Array.isArray(manifestValue.texts)
      || manifestValue.texts.length > P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MAX_ENTRIES) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_ENTRIES_INVALID',
        path: '$manifest.texts',
        message: `texts must be an array of at most ${P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.texts.length; index += 1) {
        const raw = manifestValue.texts[index];
        const path = `$manifest.texts[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_TEXT_EDITOR_TEXT_COLOR_ENTRY_INVALID',
            path,
            message: 'Each Text Editor text color entry may contain only sourceNodeId and color.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_TEXT_EDITOR_TEXT_COLOR_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Text Editor text color sourceNodeId must be unique.',
          });
          continue;
        }

        if (!sourceTexts.has(sourceNodeId)) {
          issues.push({
            code: 'P15_TEXT_EDITOR_TEXT_COLOR_SOURCE_NOT_TEXT',
            path: `${path}.sourceNodeId`,
            message: 'Text Editor text color sourceNodeId must identify an existing neutral Text node.',
          });
          continue;
        }

        if (!validColor(raw.color)) {
          issues.push({
            code: 'P15_TEXT_EDITOR_TEXT_COLOR_VALUE_INVALID',
            path: `${path}.color`,
            message: 'Text Editor text color must be a lowercase six-digit hex value such as #1a2b3c.',
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
      sourceTexts.size,
      [],
      issues,
      null,
      null,
    );
  }

  if (resolutions.size === 0) {
    return baseResult(
      'NO_TEXT_EDITOR_TEXT_COLOR_OVERRIDES',
      sourceIrFingerprint,
      baseIdentity.digest,
      baseIdentity.digest,
      sourceTexts.size,
      [],
      [],
      baseGeneration.template,
      baseGeneration.candidate,
    );
  }

  const template = cloneP15ReadyElementorTemplate(baseGeneration.candidate);
  const binding = bindTextWidgets(source, template);

  if (binding.issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceTexts.size,
      [],
      binding.issues.map((issue) => ({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_GENERATOR_BINDING_MISMATCH' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  for (const [sourceNodeId, resolution] of resolutions) {
    const target = binding.texts.get(sourceNodeId)?.target;
    if (!target || !isRecord(target.settings)) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated Text Editor binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(
      target.settings,
      P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_EVIDENCE.settingKey,
    )) {
      issues.push({
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a Text Editor text_color setting.',
      });
      continue;
    }

    target.settings[P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_EVIDENCE.settingKey] = resolution.color;
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceTexts.size,
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
      sourceTexts.size,
      [],
      [{
        code: 'P15_TEXT_EDITOR_TEXT_COLOR_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Text Editor text color output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedColors = [...resolutions.values()]
    .map((entry) => ({ ...entry }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'TEXT_EDITOR_TEXT_COLORS_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceTexts.size,
    resolvedColors,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorTextEditorTextColorIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorTextEditorTextColorIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorTextEditorTextColorSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['color', 'sourceNodeId'])
    && validSourceNodeId(entry.sourceNodeId)
    && validColor(entry.color);
}

/** Serialize only sanitized color metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorTextEditorTextColorSummary(
  result: P15ElementorTextEditorTextColorResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_TEXT_EDITOR_TEXT_COLOR_OVERRIDES'
    || result.status === 'TEXT_EDITOR_TEXT_COLORS_RESOLVED';

  const validCounts = Number.isSafeInteger(result.sourceTextCount)
    && result.sourceTextCount >= 0
    && Number.isSafeInteger(result.resolvedTextCount)
    && result.resolvedTextCount >= 0
    && result.resolvedTextCount <= result.sourceTextCount
    && result.resolvedTextCount === result.resolvedColors.length;

  const uniqueIds = new Set(result.resolvedColors.map((entry) => entry.sourceNodeId)).size
    === result.resolvedColors.length;

  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);

  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';

  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;

  const resolvedDigestRequired = result.status === 'NO_TEXT_EDITOR_TEXT_COLOR_OVERRIDES'
    || result.status === 'TEXT_EDITOR_TEXT_COLORS_RESOLVED';

  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;

  const statusShapeValid = result.status === 'TEXT_EDITOR_TEXT_COLORS_RESOLVED'
    ? result.resolvedTextCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_TEXT_EDITOR_TEXT_COLOR_OVERRIDES'
      ? result.resolvedTextCount === 0
        && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedTextCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedColors.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.colorInferencePerformed !== false
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 text-editor-text-color result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceTextCount: result.sourceTextCount,
    resolvedTextCount: result.resolvedTextCount,
    resolvedColors: result.resolvedColors.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_EVIDENCE,
    colorInferencePerformed: false,
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
