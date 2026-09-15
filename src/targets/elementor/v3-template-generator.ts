import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  validateP15NeutralExportDocument,
  type P15NeutralAlignment,
  type P15NeutralContainerNode,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralHeadingNode,
  type P15NeutralImageNode,
  type P15NeutralButtonNode,
  type P15NeutralExportValidationResult,
} from './neutral-export-ir';
import {
  ELEMENTOR_TEMPLATE_DATA_VERSION,
  type ElementorContainerV04,
  type ElementorElementV04,
  type ElementorSettingsV04,
  type ElementorTemplateV04,
  type ElementorWidgetV04,
} from './template-v04';

export const P15_ELEMENTOR_V3_GENERATOR_VERSION = 'p15-elementor-v3-template-generator-v1' as const;

export type P15ElementorV3GenerationStatus =
  | 'REJECTED_INVALID_IR'
  | 'REVIEW_REQUIRED'
  | 'GENERATED_LOCAL_CANDIDATE';

export interface P15ElementorV3ReviewEntry {
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
}

export interface P15ElementorV3GenerationResult {
  schemaVersion: 1;
  generatorVersion: typeof P15_ELEMENTOR_V3_GENERATOR_VERSION;
  inputIrVersion: typeof P15_NEUTRAL_EXPORT_IR_VERSION;
  status: P15ElementorV3GenerationStatus;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  importValidationStatus: 'NOT_RUN';
  validation: P15NeutralExportValidationResult;
  reviewEntries: P15ElementorV3ReviewEntry[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
}

interface GenerationState {
  usedElementIds: Set<string>;
  reviewEntries: P15ElementorV3ReviewEntry[];
}

function fnv1a32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function stableElementorId(kind: string, sourceNodeId: string, state: GenerationState): string {
  for (let attempt = 0; attempt < 1_024; attempt += 1) {
    const seed = attempt === 0 ? `${kind}\u0000${sourceNodeId}` : `${kind}\u0000${sourceNodeId}\u0000${attempt}`;
    const id = fnv1a32(seed).toString(16).padStart(8, '0');
    if (!state.usedElementIds.has(id)) {
      state.usedElementIds.add(id);
      return id;
    }
  }
  throw new Error('Unable to derive a unique bounded Elementor element id.');
}

function pxDimensions(value: { top: number; right: number; bottom: number; left: number }): Record<string, unknown> {
  return {
    unit: 'px',
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.top === value.right && value.right === value.bottom && value.bottom === value.left,
  };
}

function mapCrossAlignment(value: P15NeutralContainerNode['alignItems']): string | undefined {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

function mapJustification(value: P15NeutralContainerNode['justifyContent']): string | undefined {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

function mapTextAlignment(value: P15NeutralAlignment | undefined): string | undefined {
  return value;
}

function containerSettings(node: P15NeutralContainerNode): ElementorSettingsV04 {
  const settings: Record<string, unknown> = {
    flex_direction: node.direction,
  };
  if (node.gapPx !== undefined) {
    settings.flex_gap = {
      column: String(node.gapPx),
      row: String(node.gapPx),
      isLinked: true,
      unit: 'px',
    };
  }
  if (node.paddingPx !== undefined) settings.padding = pxDimensions(node.paddingPx);
  const alignItems = mapCrossAlignment(node.alignItems);
  if (alignItems !== undefined) settings.flex_align_items = alignItems;
  const justifyContent = mapJustification(node.justifyContent);
  if (justifyContent !== undefined) settings.flex_justify_content = justifyContent;
  return settings;
}

function headingWidget(node: P15NeutralHeadingNode, state: GenerationState): ElementorWidgetV04 {
  const settings: Record<string, unknown> = {
    title: node.text,
    header_size: node.level,
  };
  const align = mapTextAlignment(node.align);
  if (align !== undefined) settings.align = align;
  return {
    id: stableElementorId(node.kind, node.sourceNodeId, state),
    elType: 'widget',
    widgetType: 'heading',
    isInner: false,
    settings,
    elements: [],
  };
}

function buttonWidget(node: P15NeutralButtonNode, state: GenerationState): ElementorWidgetV04 {
  const settings: Record<string, unknown> = { text: node.text };
  const align = mapTextAlignment(node.align);
  if (align !== undefined) settings.align = align;
  if (node.url !== undefined) {
    settings.link = {
      url: node.url,
      is_external: node.openInNewTab ? 'on' : '',
      nofollow: node.nofollow ? 'on' : '',
      custom_attributes: '',
    };
  }
  return {
    id: stableElementorId(node.kind, node.sourceNodeId, state),
    elType: 'widget',
    widgetType: 'button',
    isInner: false,
    settings,
    elements: [],
  };
}

function imageWidget(node: P15NeutralImageNode, state: GenerationState): ElementorWidgetV04 {
  return {
    id: stableElementorId(node.kind, node.sourceNodeId, state),
    elType: 'widget',
    widgetType: 'image',
    isInner: false,
    settings: {
      image: {
        id: node.attachmentId ?? 0,
        url: node.url,
      },
    },
    elements: [],
  };
}

function mapNode(
  node: P15NeutralExportNode,
  depth: number,
  state: GenerationState,
): ElementorElementV04 | null {
  if (node.kind === 'review') {
    state.reviewEntries.push({
      sourceNodeId: node.sourceNodeId,
      reasonCode: node.reasonCode,
      detail: node.detail,
    });
    return null;
  }
  if (node.kind === 'heading') return headingWidget(node, state);
  if (node.kind === 'button') return buttonWidget(node, state);
  if (node.kind === 'image') return imageWidget(node, state);

  const container: ElementorContainerV04 = {
    id: stableElementorId(node.kind, node.sourceNodeId, state),
    elType: 'container',
    isInner: depth > 1,
    settings: containerSettings(node),
    elements: [],
  };
  for (const child of node.children) {
    const mapped = mapNode(child, depth + 1, state);
    if (mapped) container.elements.push(mapped);
  }
  return container;
}

function cloneValidation(validation: P15NeutralExportValidationResult): P15NeutralExportValidationResult {
  return {
    valid: validation.valid,
    nodeCount: validation.nodeCount,
    reviewNodeCount: validation.reviewNodeCount,
    issues: validation.issues.map((issue) => ({ ...issue })),
  };
}

function baseResult(
  status: P15ElementorV3GenerationStatus,
  validation: P15NeutralExportValidationResult,
  reviewEntries: P15ElementorV3ReviewEntry[],
): Omit<P15ElementorV3GenerationResult, 'template' | 'candidate'> {
  return {
    schemaVersion: 1,
    generatorVersion: P15_ELEMENTOR_V3_GENERATOR_VERSION,
    inputIrVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    status,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    importValidationStatus: 'NOT_RUN',
    validation: cloneValidation(validation),
    reviewEntries: reviewEntries.map((entry) => ({ ...entry })),
  };
}

/**
 * Maps bounded target-neutral export facts into a local Elementor v0.4 candidate.
 *
 * This is deterministic candidate generation only. It does not connect to WordPress/Elementor,
 * does not prove target availability/import/render fidelity, and never enables download authority.
 */
export function generateElementorV3TemplateCandidate(value: unknown): P15ElementorV3GenerationResult {
  const validation = validateP15NeutralExportDocument(value);
  if (!validation.valid) {
    return {
      ...baseResult('REJECTED_INVALID_IR', validation, []),
      template: null,
      candidate: null,
    };
  }

  const document = value as P15NeutralExportDocumentV1;
  const state: GenerationState = { usedElementIds: new Set<string>(), reviewEntries: [] };
  const content: ElementorElementV04[] = [];
  for (const node of document.nodes) {
    const mapped = mapNode(node, 1, state);
    if (mapped) content.push(mapped);
  }

  if (state.reviewEntries.length > 0) {
    return {
      ...baseResult('REVIEW_REQUIRED', validation, state.reviewEntries),
      template: null,
      candidate: null,
    };
  }

  const template: ElementorTemplateV04 = {
    title: document.title,
    type: document.documentType,
    version: ELEMENTOR_TEMPLATE_DATA_VERSION,
    page_settings: [],
    content,
  };
  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || !candidate.validation.valid || candidate.templateJson === null) {
    throw new Error('Generated Elementor v3 candidate contradicted the bounded local generation contract.');
  }

  return {
    ...baseResult('GENERATED_LOCAL_CANDIDATE', validation, []),
    template,
    candidate,
  };
}

export function serializeP15ElementorV3GenerationResult(result: P15ElementorV3GenerationResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}
