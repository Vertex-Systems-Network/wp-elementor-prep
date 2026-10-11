import { buttonSizingSettings, containerSizingSettings, widgetSizingSettings } from './container-sizing';
import { absolutePositionSettings, zIndexSettings } from './absolute-position';
import { wrapSettings } from './container-wrap';
import { gridSettings } from './container-grid';
import { containerMarginSettings } from './container-spacing';
import { buildP15FontManifest } from './font-manifest';
import {
  P15_BLOCKING_REVIEW_CODES,
  P15_REVIEW_ARTIFACT_VERSION,
  reviewPlaceholderSettings,
  type P15ElementorReviewArtifactV1,
} from './review-artifact';
import { gradientSettings } from './container-gradient';
import { boxShadowSettings } from './container-shadow';
import { containerVisualStyleSettings } from './container-visual-style';
import { textEditorHtml, textEditorTypographySettings, typographyGroupSettings } from './typography';
import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  validateP15NeutralExportDocument,
  type P15NeutralAlignment,
  type P15NeutralButtonNode,
  type P15NeutralContainerNode,
  type P15NeutralDividerNode,
  type P15NeutralSpacerNode,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
  type P15NeutralExportValidationResult,
  type P15NeutralHeadingNode,
  type P15NeutralImageNode,
  type P15NeutralStyleReview,
  type P15NeutralTextAlignment,
  type P15NeutralTextNode,
} from './neutral-export-ir';
import {
  ELEMENTOR_TEMPLATE_DATA_VERSION,
  type ElementorContainerV04,
  type ElementorElementV04,
  type ElementorSettingsV04,
  type ElementorTemplateV04,
  type ElementorWidgetV04,
} from './template-v04';

export const P15_ELEMENTOR_V3_GENERATOR_VERSION = 'p15-elementor-v3-template-generator-v3' as const;

export const P15_ELEMENTOR_BUTTON_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  sourcePath: 'includes/widgets/traits/button-trait.php',
  sourceBlobSha: '31192aaee6851c445f79d1998499f6ce73ba7da5',
  controlName: 'align',
  targetValues: ['left', 'center', 'right', 'justify'] as const,
});

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
  /** D-049 partial export: only with status REVIEW_REQUIRED and no blocking review; never a ready artifact. */
  reviewArtifact: P15ElementorReviewArtifactV1 | null;
}

interface GenerationState {
  usedElementIds: Set<string>;
  reviewEntries: P15ElementorV3ReviewEntry[];
  /** First generated element id per source node, for the review artifact. */
  elementIds: Map<string, string>;
  placeholders: Set<string>;
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
      if (!state.elementIds.has(sourceNodeId)) state.elementIds.set(sourceNodeId, id);
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

function mapTextAlignment(value: P15NeutralAlignment | P15NeutralTextAlignment | undefined): string | undefined {
  return value;
}

function mapButtonAlignment(value: P15NeutralAlignment | undefined): 'left' | 'center' | 'right' | undefined {
  if (value === 'start') return 'left';
  if (value === 'end') return 'right';
  return value;
}



function containerSettings(node: P15NeutralContainerNode): ElementorSettingsV04 {
  // A grid (recovery M2.6b) replaces the flex group; its validated IR carries no flex gap or alignment.
  const settings: Record<string, unknown> = node.grid === undefined ? { flex_direction: node.direction } : gridSettings(node.grid);
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
  if (node.backgroundColorHex !== undefined) {
    settings.background_background = 'classic';
    settings.background_color = node.backgroundColorHex;
  }
  if (node.cornerRadiusPx !== undefined) {
    settings.border_radius = pxDimensions({
      top: node.cornerRadiusPx,
      right: node.cornerRadiusPx,
      bottom: node.cornerRadiusPx,
      left: node.cornerRadiusPx,
    });
  }
  Object.assign(settings, containerVisualStyleSettings(node));
  Object.assign(settings, boxShadowSettings(node.boxShadow));
  Object.assign(settings, gradientSettings(node.gradient));
  Object.assign(settings, containerSizingSettings(node.sizing));
  Object.assign(settings, wrapSettings(node.wrap, node.gapPx), containerMarginSettings(node.marginPx));
  Object.assign(settings, absolutePositionSettings(node.position, 'container'), zIndexSettings(node.zIndex, 'container'));
  return settings;
}

function headingWidget(node: P15NeutralHeadingNode, state: GenerationState): ElementorWidgetV04 {
  const settings: Record<string, unknown> = {
    title: node.text,
    header_size: node.level,
  };
  const align = mapTextAlignment(node.align);
  if (align !== undefined) settings.align = align;
  Object.assign(settings, typographyGroupSettings(node.typography, 'title_color'));
  // heading.php `link` URL control (recovery M2.2c); the same link shape the Button widget writes.
  if (node.href !== undefined) settings.link = { url: node.href, is_external: '', nofollow: '', custom_attributes: '' };
  Object.assign(settings, widgetSizingSettings(node.sizing));
  Object.assign(settings, absolutePositionSettings(node.position, 'widget'), zIndexSettings(node.zIndex, 'widget'));
  return {
    id: stableElementorId(node.kind, node.sourceNodeId, state),
    elType: 'widget',
    widgetType: 'heading',
    isInner: false,
    settings,
    elements: [],
  };
}

function textEditorWidget(node: P15NeutralTextNode, state: GenerationState): ElementorWidgetV04 {
  const settings: Record<string, unknown> = {
    editor: textEditorHtml(node.text, node.paragraphs, node.href),
  };
  const align = mapTextAlignment(node.align);
  if (align !== undefined) settings.align = align;
  Object.assign(settings, textEditorTypographySettings(node.typography, node.paragraphSpacingPx));
  Object.assign(settings, widgetSizingSettings(node.sizing));
  Object.assign(settings, absolutePositionSettings(node.position, 'widget'), zIndexSettings(node.zIndex, 'widget'));
  return {
    id: stableElementorId(node.kind, node.sourceNodeId, state),
    elType: 'widget',
    widgetType: 'text-editor',
    isInner: false,
    settings,
    elements: [],
  };
}

function buttonWidget(node: P15NeutralButtonNode, state: GenerationState): ElementorWidgetV04 {
  const settings: Record<string, unknown> = { text: node.text };
  const align = mapButtonAlignment(node.align);
  if (align !== undefined) settings.align = align;
  if (node.url !== undefined) {
    settings.link = {
      url: node.url,
      is_external: node.openInNewTab ? 'on' : '',
      nofollow: node.nofollow ? 'on' : '',
      custom_attributes: '',
    };
  }
  // Button style (recovery M2.2b), with the exact keys the Button families already prove.
  Object.assign(settings, typographyGroupSettings(node.typography, 'button_text_color'));
  if (node.backgroundColorHex !== undefined) {
    settings.background_background = 'classic';
    settings.background_color = node.backgroundColorHex;
  }
  if (node.paddingPx !== undefined) settings.text_padding = pxDimensions(node.paddingPx);
  if (node.cornerRadiusPx !== undefined) {
    settings.border_radius = pxDimensions({ top: node.cornerRadiusPx, right: node.cornerRadiusPx, bottom: node.cornerRadiusPx, left: node.cornerRadiusPx });
  }
  Object.assign(settings, buttonSizingSettings(node.sizing));
  Object.assign(settings, absolutePositionSettings(node.position, 'widget'), zIndexSettings(node.zIndex, 'widget'));
  return {
    id: stableElementorId(node.kind, node.sourceNodeId, state),
    elType: 'widget',
    widgetType: 'button',
    isInner: false,
    settings,
    elements: [],
  };
}

/**
 * Divider and spacer widgets (recovery M2.2c). Elementor 4.2.4 `includes/widgets/divider.php`
 * (blob 7dfbea27f5ed34d76780c3b0a520b1f7d0ac3cc1): `style` 'solid', `color`, `weight` px slider (1..10, step 0.1)
 * and `width` slider; `includes/widgets/spacer.php` (blob b1c14d71c8f5c941f9faea89eb99c0fc84ed8103): `space` px slider.
 * Recovery M2.3d repair: the divider `gap` slider defaults to 15px of padding above and below the line
 * (`{{WRAPPER}} .elementor-divider` padding-block), which the Figma line does not have, so `gap` is written as 0;
 * the `align` control (left/center/right, separator margin) positions a divider narrower than its column.
 */
function ruleWidget(node: P15NeutralDividerNode | P15NeutralSpacerNode, state: GenerationState): ElementorWidgetV04 {
  const slider = (size: number) => ({ unit: 'px', size, sizes: [] });
  const settings: Record<string, unknown> = node.kind === 'spacer'
    ? { space: slider(node.heightPx) }
    : { style: 'solid', weight: slider(node.weightPx), color: node.colorHex, ...(node.widthPx === undefined ? {} : { width: slider(node.widthPx) }),
      gap: slider(0), ...(node.align === undefined ? {} : { align: node.align === 'end' ? 'right' : 'center' }), ...zIndexSettings(node.zIndex, 'widget') };
  return {
    id: stableElementorId(node.kind, node.sourceNodeId, state),
    elType: 'widget',
    widgetType: node.kind,
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

function pushStyleReviews(
  sourceNodeId: string,
  styleReviews: readonly P15NeutralStyleReview[] | undefined,
  state: GenerationState,
): void {
  for (const styleReview of styleReviews ?? []) {
    state.reviewEntries.push({ sourceNodeId, reasonCode: styleReview.reasonCode, detail: styleReview.detail });
  }
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
    // D-049: an explicit, hidden placeholder keeps the unmapped content's place in the review artifact.
    state.placeholders.add(node.sourceNodeId);
    return {
      id: stableElementorId('review', node.sourceNodeId, state),
      elType: 'container',
      isInner: depth > 1,
      settings: reviewPlaceholderSettings(node.reasonCode),
      elements: [],
    };
  }
  if (node.kind === 'heading') return headingWidget(node, state);
  if (node.kind === 'text') {
    pushStyleReviews(node.sourceNodeId, node.styleReviews, state);
    return textEditorWidget(node, state);
  }
  if (node.kind === 'button') {
    pushStyleReviews(node.sourceNodeId, node.styleReviews, state);
    return buttonWidget(node, state);
  }
  if (node.kind === 'image') return imageWidget(node, state);
  if (node.kind === 'divider' || node.kind === 'spacer') return ruleWidget(node, state);

  pushStyleReviews(node.sourceNodeId, node.styleReviews, state);
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
): Omit<P15ElementorV3GenerationResult, 'template' | 'candidate' | 'reviewArtifact'> {
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
      reviewArtifact: null,
    };
  }

  const document = value as P15NeutralExportDocumentV1;
  const state: GenerationState = { usedElementIds: new Set<string>(), reviewEntries: [], elementIds: new Map(), placeholders: new Set() };
  const content: ElementorElementV04[] = [];
  for (const node of document.nodes) {
    const mapped = mapNode(node, 1, state);
    if (mapped) content.push(mapped);
  }
  // Recovery M2.8: a font Elementor cannot load is REVIEW with an upload instruction, never a silent fallback.
  state.reviewEntries.push(...buildP15FontManifest(document).reviews);

  const template: ElementorTemplateV04 = {
    title: document.title,
    type: document.documentType,
    version: ELEMENTOR_TEMPLATE_DATA_VERSION,
    page_settings: [],
    content,
  };

  if (state.reviewEntries.length > 0) {
    const blocked = state.reviewEntries.some((entry) => P15_BLOCKING_REVIEW_CODES.includes(entry.reasonCode));
    return {
      ...baseResult('REVIEW_REQUIRED', validation, state.reviewEntries),
      template: null,
      candidate: null,
      reviewArtifact: blocked ? null : {
        schemaVersion: 1,
        artifactVersion: P15_REVIEW_ARTIFACT_VERSION,
        label: 'REVIEW REQUIRED',
        readiness: 'REVIEW_REQUIRED',
        targetImportReady: false,
        template,
        reviewItems: state.reviewEntries.map((entry) => ({
          ...entry,
          elementId: state.elementIds.get(entry.sourceNodeId) ?? null,
          kind: state.placeholders.has(entry.sourceNodeId) ? 'placeholder' as const : 'unmapped-property' as const,
        })),
      },
    };
  }

  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || !candidate.validation.valid || candidate.templateJson === null) {
    throw new Error('Generated Elementor v3 candidate contradicted the bounded local generation contract.');
  }

  return {
    ...baseResult('GENERATED_LOCAL_CANDIDATE', validation, []),
    template,
    candidate,
    reviewArtifact: null,
  };
}

export function serializeP15ElementorV3GenerationResult(result: P15ElementorV3GenerationResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}
