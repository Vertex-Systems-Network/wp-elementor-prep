import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralHeadingNode,
  type P15NeutralTextAlignment,
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

export const P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-responsive-text-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-responsive-text-alignment-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  headingSourcePath: 'includes/widgets/heading.php',
  headingSourceBlobSha: '5b193f958ba34d8d4a24d165a9114f9bc3ef2561',
  textEditorSourcePath: 'includes/widgets/text-editor.php',
  textEditorSourceBlobSha: '72ff868493a3c0f27c6305794ffcff9cf217c9ea',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  controlName: 'align',
  desktopSettingKey: 'align',
  tabletSettingKey: 'align_tablet',
  mobileSettingKey: 'align_mobile',
  headingValues: ['start', 'center', 'end'] as const,
  textValues: ['start', 'center', 'end', 'justify'] as const,
});

type P15ResponsiveTextNode = P15NeutralHeadingNode | P15NeutralTextNode;
export type P15ElementorResponsiveTextNodeKind = P15ResponsiveTextNode['kind'];

export interface P15ElementorResponsiveTextAlignmentEntryV1 {
  sourceNodeId: string;
  tabletAlign?: P15NeutralTextAlignment;
  mobileAlign?: P15NeutralTextAlignment;
}

export interface P15ElementorResponsiveTextAlignmentManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  widgets: P15ElementorResponsiveTextAlignmentEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveTextAlignmentIssueCode =
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_ENTRY_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_NOT_TEXT_WIDGET'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_VALUE_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_TEXT_ALIGNMENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveTextAlignmentIssueV1 {
  code: P15ElementorResponsiveTextAlignmentIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveTextAlignmentStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDES'
  | 'RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED';

export interface P15ElementorResponsiveTextAlignmentSummaryEntryV1 {
  sourceNodeId: string;
  nodeKind: P15ElementorResponsiveTextNodeKind;
  tabletAlign: P15NeutralTextAlignment | null;
  mobileAlign: P15NeutralTextAlignment | null;
}

export interface P15ElementorResponsiveTextAlignmentResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorResponsiveTextAlignmentStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceTextWidgetCount: number;
  resolvedWidgetCount: number;
  resolvedAlignments: P15ElementorResponsiveTextAlignmentSummaryEntryV1[];
  issues: P15ElementorResponsiveTextAlignmentIssueV1[];
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

type TextWidgetBinding = {
  source: P15ResponsiveTextNode;
  target: ElementorWidgetV04;
};

type TextWidgetBindingIssue = {
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
const ALIGN_VALUES: readonly P15NeutralTextAlignment[] = ['start', 'center', 'end', 'justify'];

const ISSUE_CODES: readonly P15ElementorResponsiveTextAlignmentIssueCode[] = [
  'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_ENTRIES_INVALID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_ENTRY_INVALID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_NOT_TEXT_WIDGET',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_VALUE_INVALID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_TEXT_ALIGNMENT_RESOLVED_CANDIDATE_INVALID',
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

function validAlignment(value: unknown): value is P15NeutralTextAlignment {
  return typeof value === 'string' && ALIGN_VALUES.includes(value as P15NeutralTextAlignment);
}

function alignmentAllowedForNode(
  node: P15ResponsiveTextNode,
  value: unknown,
): value is P15NeutralTextAlignment {
  if (!validAlignment(value)) return false;
  return node.kind === 'text' || value !== 'justify';
}

function collectTextWidgets(document: P15NeutralExportDocumentV1): Map<string, P15ResponsiveTextNode> {
  const result = new Map<string, P15ResponsiveTextNode>();

  function visit(nodes: readonly P15NeutralExportNode[]): void {
    for (const node of nodes) {
      if (node.kind === 'container') {
        visit(node.children);
      } else if (node.kind === 'heading' || node.kind === 'text') {
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

function desktopAlignmentMatches(
  node: P15ResponsiveTextNode,
  settings: Record<string, unknown>,
): boolean {
  const hasAlign = Object.prototype.hasOwnProperty.call(settings, 'align');
  return node.align === undefined
    ? !hasAlign
    : hasAlign && settings.align === node.align;
}

function bindTextWidgets(
  source: P15NeutralExportDocumentV1,
  template: ElementorTemplateV04,
): { widgets: Map<string, TextWidgetBinding>; issues: TextWidgetBindingIssue[] } {
  const widgets = new Map<string, TextWidgetBinding>();
  const issues: TextWidgetBindingIssue[] = [];

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
        push(path, 'Review nodes cannot participate in responsive text-widget binding.');
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

      if (sourceNode.kind === 'heading' || sourceNode.kind === 'text') {
        if (!isRecord(target.settings) || !desktopAlignmentMatches(sourceNode, target.settings)) {
          push(`${path}.settings.align`, 'Generated widget desktop alignment drifted from the neutral source.');
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
  entry: P15ElementorResponsiveTextAlignmentSummaryEntryV1,
): P15ElementorResponsiveTextAlignmentSummaryEntryV1 {
  return {
    sourceNodeId: entry.sourceNodeId,
    nodeKind: entry.nodeKind,
    tabletAlign: entry.tabletAlign,
    mobileAlign: entry.mobileAlign,
  };
}

function baseResult(
  status: P15ElementorResponsiveTextAlignmentStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceTextWidgetCount: number,
  resolvedAlignments: P15ElementorResponsiveTextAlignmentSummaryEntryV1[],
  issues: P15ElementorResponsiveTextAlignmentIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveTextAlignmentResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceTextWidgetCount,
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
 * Apply only explicit default tablet/mobile alignment overrides to exact generated Heading/Text Editor bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer semantics or responsive values,
 * alter desktop alignment, expand to Button, or claim responsive closure.
 */
export function resolveP15ElementorResponsiveTextAlignments(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveTextAlignmentResultV1 {
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
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const sourceWidgets = collectTextWidgets(source);
  const baseGeneration = generateElementorV3TemplateCandidate(source);

  if (baseGeneration.status !== 'GENERATED_LOCAL_CANDIDATE'
    || baseGeneration.template === null
    || baseGeneration.candidate === null) {
    return baseResult(
      'BLOCKED_UPSTREAM_GENERATION',
      sourceIrFingerprint,
      null,
      null,
      sourceWidgets.size,
      [],
      [{
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive text alignment requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveTextAlignmentIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveTextAlignmentEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive text alignment manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive text alignment manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive text alignment manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive text alignment cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.widgets)
      || manifestValue.widgets.length > P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_ENTRIES_INVALID',
        path: '$manifest.widgets',
        message: `widgets must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.widgets.length; index += 1) {
        const raw = manifestValue.widgets[index];
        const path = `$manifest.widgets[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_ENTRY_INVALID',
            path,
            message: 'Each responsive text alignment entry may contain only sourceNodeId plus tablet/mobile alignment values.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive text alignment sourceNodeId must be unique.',
          });
          continue;
        }
        const sourceNode = sourceWidgets.get(sourceNodeId);
        if (!sourceNode) {
          issues.push({
            code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_SOURCE_NOT_TEXT_WIDGET',
            path: `${path}.sourceNodeId`,
            message: 'Responsive text alignment sourceNodeId must identify an existing neutral Heading or Text node.',
          });
          continue;
        }

        const tabletProvided = raw.tabletAlign !== undefined;
        const mobileProvided = raw.mobileAlign !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive text alignment entry must explicitly provide tabletAlign and/or mobileAlign.',
          });
          continue;
        }

        if ((tabletProvided && !alignmentAllowedForNode(sourceNode, raw.tabletAlign))
          || (mobileProvided && !alignmentAllowedForNode(sourceNode, raw.mobileAlign))) {
          issues.push({
            code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_VALUE_INVALID',
            path,
            message: sourceNode.kind === 'heading'
              ? 'Heading responsive alignment must be start, center or end.'
              : 'Text responsive alignment must be start, center, end or justify.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletProvided ? { tabletAlign: raw.tabletAlign as P15NeutralTextAlignment } : {}),
          ...(mobileProvided ? { mobileAlign: raw.mobileAlign as P15NeutralTextAlignment } : {}),
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
      sourceWidgets.size,
      [],
      issues,
      null,
      null,
    );
  }

  if (resolutions.size === 0) {
    return baseResult(
      'NO_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDES',
      sourceIrFingerprint,
      baseIdentity.digest,
      baseIdentity.digest,
      sourceWidgets.size,
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
      sourceWidgets.size,
      [],
      binding.issues.map((issue) => ({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated text-widget binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (resolution.tabletAlign !== undefined
      && Object.prototype.hasOwnProperty.call(
        bound.target.settings,
        P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE.tabletSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a tablet alignment override.',
      });
      continue;
    }
    if (resolution.mobileAlign !== undefined
      && Object.prototype.hasOwnProperty.call(
        bound.target.settings,
        P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE.mobileSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a mobile alignment override.',
      });
      continue;
    }

    if (resolution.tabletAlign !== undefined) {
      bound.target.settings[P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE.tabletSettingKey] =
        resolution.tabletAlign;
    }
    if (resolution.mobileAlign !== undefined) {
      bound.target.settings[P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE.mobileSettingKey] =
        resolution.mobileAlign;
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceWidgets.size,
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
      sourceWidgets.size,
      [],
      [{
        code: 'P15_RESPONSIVE_TEXT_ALIGNMENT_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive text alignment output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedAlignments = [...resolutions.values()]
    .map((entry) => {
      const node = sourceWidgets.get(entry.sourceNodeId);
      if (!node) throw new Error('Responsive text alignment source binding disappeared.');
      return {
        sourceNodeId: entry.sourceNodeId,
        nodeKind: node.kind,
        tabletAlign: entry.tabletAlign ?? null,
        mobileAlign: entry.mobileAlign ?? null,
      };
    })
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceWidgets.size,
    resolvedAlignments,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveTextAlignmentIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveTextAlignmentIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveTextAlignmentSummaryEntryV1): boolean {
  const nodeKindValid = entry.nodeKind === 'heading' || entry.nodeKind === 'text';
  const tabletValid = entry.tabletAlign === null
    || (validAlignment(entry.tabletAlign) && (entry.nodeKind === 'text' || entry.tabletAlign !== 'justify'));
  const mobileValid = entry.mobileAlign === null
    || (validAlignment(entry.mobileAlign) && (entry.nodeKind === 'text' || entry.mobileAlign !== 'justify'));
  return isRecord(entry)
    && exactKeys(entry, ['mobileAlign', 'nodeKind', 'sourceNodeId', 'tabletAlign'])
    && validSourceNodeId(entry.sourceNodeId)
    && nodeKindValid
    && tabletValid
    && mobileValid
    && (entry.tabletAlign !== null || entry.mobileAlign !== null);
}

/** Serialize only sanitized alignment metadata; source copy, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveTextAlignmentSummary(
  result: P15ElementorResponsiveTextAlignmentResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDES'
    || result.status === 'RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceTextWidgetCount)
    && result.sourceTextWidgetCount >= 0
    && Number.isSafeInteger(result.resolvedWidgetCount)
    && result.resolvedWidgetCount >= 0
    && result.resolvedWidgetCount <= result.sourceTextWidgetCount
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
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDES'
    || result.status === 'RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_TEXT_ALIGNMENTS_RESOLVED'
    ? result.resolvedWidgetCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_TEXT_ALIGNMENT_OVERRIDES'
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
    throw new Error('Invalid or authority-inflated P15 responsive-text-alignment result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceTextWidgetCount: result.sourceTextWidgetCount,
    resolvedWidgetCount: result.resolvedWidgetCount,
    resolvedAlignments: result.resolvedAlignments.map(cloneSummaryEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_EVIDENCE,
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
