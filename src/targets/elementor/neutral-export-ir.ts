import { P15_NEUTRAL_EXPORT_MAX_URL_LENGTH, validP15AbsoluteUrl, validP15LinkUrl } from './link-url';
import {
  borderProblems,
  cornerRadiiProblems,
  type P15NeutralBorder,
  type P15NeutralCornerRadii,
} from './container-visual-style';
import {
  buttonSizingProblems,
  containerSizingProblems,
  widgetSizingProblems,
  type P15NeutralButtonSizing,
  type P15NeutralContainerSizing,
  type P15NeutralWidgetSizing,
} from './container-sizing';
import {
  paragraphProblems,
  paragraphSpacingValid,
  typographyProblems,
  type P15NeutralParagraph,
  type P15NeutralTypography,
} from './typography';

export type { P15NeutralParagraph, P15NeutralTextSpan, P15NeutralTypography } from './typography';
export type { P15NeutralBorder, P15NeutralBoxPx, P15NeutralCornerRadii } from './container-visual-style';
export type { P15NeutralButtonSizing, P15NeutralContainerSizing, P15NeutralWidgetSizing } from './container-sizing';
export { P15_NEUTRAL_EXPORT_MAX_URL_LENGTH } from './link-url';
export const P15_NEUTRAL_EXPORT_IR_VERSION = 'p15-neutral-export-ir-v2' as const;
export const P15_NEUTRAL_EXPORT_MAX_NODES = 10_000;
export const P15_NEUTRAL_EXPORT_MAX_DEPTH = 64;
export const P15_NEUTRAL_EXPORT_MAX_TEXT_LENGTH = 20_000;
export const P15_NEUTRAL_EXPORT_MAX_SPACING_PX = 4_096;
export const P15_NEUTRAL_EXPORT_MAX_RADIUS_PX = 4_096;
export const P15_NEUTRAL_EXPORT_MAX_STYLE_REVIEWS = 16;

export type P15NeutralDocumentType = 'page' | 'section';
export type P15NeutralDirection = 'row' | 'column';
export type P15NeutralAlignment = 'start' | 'center' | 'end';
export type P15NeutralTextAlignment = P15NeutralAlignment | 'justify';
export type P15NeutralCrossAlignment = P15NeutralAlignment | 'stretch';
export type P15NeutralJustification = P15NeutralAlignment | 'space-between' | 'space-around' | 'space-evenly';
export type P15NeutralHeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';

export interface P15NeutralPaddingPx {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface P15NeutralNodeBase {
  sourceNodeId: string;
}

/**
 * A node-level fidelity fact that cannot be mapped yet (for example an image background, a stroke
 * or a shadow). The node and its children are still extracted; the generator treats each entry as REVIEW.
 */
export interface P15NeutralStyleReview {
  reasonCode: string;
  detail: string;
}

export interface P15NeutralContainerNode extends P15NeutralNodeBase {
  kind: 'container';
  direction: P15NeutralDirection;
  gapPx?: number;
  paddingPx?: P15NeutralPaddingPx;
  alignItems?: P15NeutralCrossAlignment;
  justifyContent?: P15NeutralJustification;
  backgroundColorHex?: string;
  cornerRadiusPx?: number;
  /** Non-uniform corner radii (recovery M2.4a); exclusive with `cornerRadiusPx`. */
  cornerRadiiPx?: P15NeutralCornerRadii;
  /** One solid INSIDE border (recovery M2.4a); `paddingPx` is already the CSS padding inside it. */
  border?: P15NeutralBorder;
  /** The frame clips visible content (`overflow: hidden`, recovery M2.4a). */
  clipsContent?: true;
  /** Exact width, minimum height and flex-item sizing (recovery M2.3a). */
  sizing?: P15NeutralContainerSizing;
  styleReviews?: P15NeutralStyleReview[];
  children: P15NeutralExportNode[];
}

export interface P15NeutralHeadingNode extends P15NeutralNodeBase {
  kind: 'heading';
  text: string;
  level: P15NeutralHeadingLevel;
  align?: P15NeutralAlignment;
  /** Uniform heading typography (recovery M2.2a). */
  typography?: P15NeutralTypography;
  /** One link for the whole heading (recovery M2.2c). */
  href?: string;
  /** Width and flex-item sizing (recovery M2.3b). */
  sizing?: P15NeutralWidgetSizing;
}

export interface P15NeutralTextNode extends P15NeutralNodeBase {
  kind: 'text';
  text: string;
  align?: P15NeutralTextAlignment;
  /** The node's dominant typography (recovery M2.1). */
  typography?: P15NeutralTypography;
  /** Paragraphs of styled spans; when present they join to exactly `text`. */
  paragraphs?: P15NeutralParagraph[];
  /** One link for the whole text (recovery M2.2c). */
  href?: string;
  paragraphSpacingPx?: number;
  /** Width and flex-item sizing (recovery M2.3b). */
  sizing?: P15NeutralWidgetSizing;
  styleReviews?: P15NeutralStyleReview[];
}

export interface P15NeutralButtonNode extends P15NeutralNodeBase {
  kind: 'button';
  text: string;
  url?: string;
  openInNewTab?: boolean;
  nofollow?: boolean;
  align?: P15NeutralAlignment;
  /** Button style detected from its Figma frame (recovery M2.2b). */
  typography?: P15NeutralTypography;
  backgroundColorHex?: string;
  paddingPx?: P15NeutralPaddingPx;
  cornerRadiusPx?: number;
  /** Width and flex-item sizing of the Figma button frame (recovery M2.3d); exclusive with `align`. */
  sizing?: P15NeutralButtonSizing;
  styleReviews?: P15NeutralStyleReview[];
}

export interface P15NeutralImageNode extends P15NeutralNodeBase {
  kind: 'image';
  url: string;
  attachmentId?: number;
}

export interface P15NeutralReviewNode extends P15NeutralNodeBase {
  kind: 'review';
  reasonCode: string;
  detail: string;
}

/** A solid horizontal rule (recovery M2.2c), from a Figma line or thin rectangle. */
export interface P15NeutralDividerNode extends P15NeutralNodeBase {
  kind: 'divider';
  weightPx: number;
  colorHex: string;
  widthPx?: number;
  /** Horizontal position of a divider narrower than its column (recovery M2.3d); start when absent. */
  align?: 'center' | 'end';
}

/** Vertical empty space (recovery M2.2c), from an empty, unpainted Figma leaf frame or rectangle. */
export interface P15NeutralSpacerNode extends P15NeutralNodeBase {
  kind: 'spacer';
  heightPx: number;
}

export type P15NeutralExportNode =
  | P15NeutralContainerNode
  | P15NeutralHeadingNode
  | P15NeutralTextNode
  | P15NeutralButtonNode
  | P15NeutralImageNode
  | P15NeutralDividerNode
  | P15NeutralSpacerNode
  | P15NeutralReviewNode;

/** Schema version remains 1; irVersion v2 adds bounded optional container style facts. */
export interface P15NeutralExportDocumentV1 {
  schemaVersion: 1;
  irVersion: typeof P15_NEUTRAL_EXPORT_IR_VERSION;
  title: string;
  documentType: P15NeutralDocumentType;
  nodes: P15NeutralExportNode[];
}

export type P15NeutralExportValidationCode =
  | 'P15_IR_DOCUMENT_NOT_OBJECT'
  | 'P15_IR_SCHEMA_UNSUPPORTED'
  | 'P15_IR_VERSION_UNSUPPORTED'
  | 'P15_IR_TITLE_INVALID'
  | 'P15_IR_DOCUMENT_TYPE_UNSUPPORTED'
  | 'P15_IR_NODES_INVALID'
  | 'P15_IR_NODE_NOT_OBJECT'
  | 'P15_IR_NODE_KIND_UNSUPPORTED'
  | 'P15_IR_SOURCE_ID_INVALID'
  | 'P15_IR_DUPLICATE_SOURCE_ID'
  | 'P15_IR_NODE_KEYS_UNSUPPORTED'
  | 'P15_IR_CONTAINER_DIRECTION_INVALID'
  | 'P15_IR_CONTAINER_CHILDREN_INVALID'
  | 'P15_IR_SPACING_INVALID'
  | 'P15_IR_COLOR_INVALID'
  | 'P15_IR_RADIUS_INVALID'
  | 'P15_IR_ALIGNMENT_INVALID'
  | 'P15_IR_TEXT_INVALID'
  | 'P15_IR_TYPOGRAPHY_INVALID'
  | 'P15_IR_SIZING_INVALID'
  | 'P15_IR_STYLE_INVALID'
  | 'P15_IR_HEADING_LEVEL_INVALID'
  | 'P15_IR_URL_INVALID'
  | 'P15_IR_BOOLEAN_INVALID'
  | 'P15_IR_ATTACHMENT_ID_INVALID'
  | 'P15_IR_REVIEW_REASON_INVALID'
  | 'P15_IR_NODE_LIMIT_EXCEEDED'
  | 'P15_IR_DEPTH_LIMIT_EXCEEDED';

export interface P15NeutralExportValidationIssue {
  code: P15NeutralExportValidationCode;
  path: string;
  message: string;
}

export interface P15NeutralExportValidationResult {
  valid: boolean;
  nodeCount: number;
  reviewNodeCount: number;
  issues: P15NeutralExportValidationIssue[];
}

interface ValidationState {
  issues: P15NeutralExportValidationIssue[];
  sourceIds: Set<string>;
  nodeCount: number;
  reviewNodeCount: number;
  nodeLimitReported: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pushIssue(
  state: ValidationState,
  code: P15NeutralExportValidationCode,
  path: string,
  message: string,
): void {
  state.issues.push({ code, path, message });
}

function boundedString(value: unknown, maxLength: number, allowEmpty = false): value is string {
  return typeof value === 'string' && value.length <= maxLength && (allowEmpty || value.trim().length > 0);
}

function validateExactKeys(
  record: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  state: ValidationState,
): void {
  const allowedKeys = new Set(allowed);
  const unsupported = Object.keys(record).filter((key) => !allowedKeys.has(key)).sort();
  if (unsupported.length > 0) {
    pushIssue(
      state,
      'P15_IR_NODE_KEYS_UNSUPPORTED',
      path,
      `Neutral export IR contains unsupported keys: ${unsupported.join(', ')}.`,
    );
  }
}

function validateSourceId(record: Record<string, unknown>, path: string, state: ValidationState): void {
  const sourceNodeId = record.sourceNodeId;
  if (!boundedString(sourceNodeId, 256)) {
    pushIssue(state, 'P15_IR_SOURCE_ID_INVALID', `${path}.sourceNodeId`, 'sourceNodeId must be a non-empty string up to 256 characters.');
    return;
  }
  if (state.sourceIds.has(sourceNodeId)) {
    pushIssue(state, 'P15_IR_DUPLICATE_SOURCE_ID', `${path}.sourceNodeId`, `Duplicate neutral sourceNodeId: ${sourceNodeId}.`);
    return;
  }
  state.sourceIds.add(sourceNodeId);
}

function validSpacing(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= P15_NEUTRAL_EXPORT_MAX_SPACING_PX;
}

function validRadius(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= P15_NEUTRAL_EXPORT_MAX_RADIUS_PX;
}

function validatePadding(value: unknown, path: string, state: ValidationState): void {
  if (!isRecord(value)) {
    pushIssue(state, 'P15_IR_SPACING_INVALID', path, 'paddingPx must be an object with top/right/bottom/left pixel values.');
    return;
  }
  validateExactKeys(value, ['top', 'right', 'bottom', 'left'], path, state);
  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    if (!validSpacing(value[side])) {
      pushIssue(state, 'P15_IR_SPACING_INVALID', `${path}.${side}`, `Padding must be between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}px.`);
    }
  }
}

const validAbsoluteUrl = validP15AbsoluteUrl;
const validButtonUrl = validP15LinkUrl;

function validateOptionalBoolean(record: Record<string, unknown>, key: string, path: string, state: ValidationState): void {
  if (record[key] !== undefined && typeof record[key] !== 'boolean') {
    pushIssue(state, 'P15_IR_BOOLEAN_INVALID', `${path}.${key}`, `${key} must be a boolean when provided.`);
  }
}

function validateText(value: unknown, path: string, state: ValidationState, maxLength = P15_NEUTRAL_EXPORT_MAX_TEXT_LENGTH): void {
  if (!boundedString(value, maxLength)) {
    pushIssue(state, 'P15_IR_TEXT_INVALID', path, `Text must be non-empty and no longer than ${maxLength} characters.`);
  }
}

function validReviewReasonCode(value: unknown): boolean {
  return boundedString(value, 128) && /^[A-Z0-9_:-]+$/.test(String(value));
}

function validateWidgetSizing(value: unknown, path: string, state: ValidationState): void {
  if (value === undefined) return;
  for (const issue of widgetSizingProblems(value, path)) pushIssue(state, 'P15_IR_SIZING_INVALID', issue.path, issue.message);
}

function validateStyleReviews(value: unknown, path: string, state: ValidationState): void {
  if (!Array.isArray(value) || value.length === 0 || value.length > P15_NEUTRAL_EXPORT_MAX_STYLE_REVIEWS) {
    pushIssue(state, 'P15_IR_REVIEW_REASON_INVALID', path, `styleReviews must be a non-empty array of at most ${P15_NEUTRAL_EXPORT_MAX_STYLE_REVIEWS} entries when provided.`);
    return;
  }
  value.forEach((entry, index) => {
    const entryPath = `${path}[${index}]`;
    if (!isRecord(entry)) {
      pushIssue(state, 'P15_IR_REVIEW_REASON_INVALID', entryPath, 'Style review entries must be objects.');
      return;
    }
    validateExactKeys(entry, ['reasonCode', 'detail'], entryPath, state);
    if (!validReviewReasonCode(entry.reasonCode)) {
      pushIssue(state, 'P15_IR_REVIEW_REASON_INVALID', `${entryPath}.reasonCode`, 'Review reasonCode must be a bounded uppercase identifier.');
    }
    validateText(entry.detail, `${entryPath}.detail`, state, 2_000);
  });
}

function validateNode(value: unknown, path: string, depth: number, state: ValidationState): void {
  if (depth > P15_NEUTRAL_EXPORT_MAX_DEPTH) {
    pushIssue(state, 'P15_IR_DEPTH_LIMIT_EXCEEDED', path, `Neutral export nesting exceeds ${P15_NEUTRAL_EXPORT_MAX_DEPTH} levels.`);
    return;
  }
  if (state.nodeCount >= P15_NEUTRAL_EXPORT_MAX_NODES) {
    if (!state.nodeLimitReported) {
      state.nodeLimitReported = true;
      pushIssue(state, 'P15_IR_NODE_LIMIT_EXCEEDED', path, `Neutral export IR exceeds ${P15_NEUTRAL_EXPORT_MAX_NODES} nodes.`);
    }
    return;
  }
  state.nodeCount += 1;

  if (!isRecord(value)) {
    pushIssue(state, 'P15_IR_NODE_NOT_OBJECT', path, 'Neutral export nodes must be objects.');
    return;
  }

  validateSourceId(value, path, state);
  const kind = value.kind;

  if (kind === 'container') {
    validateExactKeys(
      value,
      ['kind', 'sourceNodeId', 'direction', 'gapPx', 'paddingPx', 'alignItems', 'justifyContent', 'backgroundColorHex', 'cornerRadiusPx', 'cornerRadiiPx', 'border', 'clipsContent', 'sizing', 'styleReviews', 'children'],
      path,
      state,
    );
    if (value.direction !== 'row' && value.direction !== 'column') {
      pushIssue(state, 'P15_IR_CONTAINER_DIRECTION_INVALID', `${path}.direction`, 'Container direction must be row or column.');
    }
    if (value.gapPx !== undefined && !validSpacing(value.gapPx)) {
      pushIssue(state, 'P15_IR_SPACING_INVALID', `${path}.gapPx`, `gapPx must be between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}.`);
    }
    if (value.paddingPx !== undefined) validatePadding(value.paddingPx, `${path}.paddingPx`, state);
    if (value.backgroundColorHex !== undefined
      && (typeof value.backgroundColorHex !== 'string' || !/^#[0-9A-F]{6}$/.test(value.backgroundColorHex))) {
      pushIssue(state, 'P15_IR_COLOR_INVALID', `${path}.backgroundColorHex`, 'backgroundColorHex must be canonical uppercase #RRGGBB when provided.');
    }
    if (value.cornerRadiusPx !== undefined && !validRadius(value.cornerRadiusPx)) {
      pushIssue(state, 'P15_IR_RADIUS_INVALID', `${path}.cornerRadiusPx`, `cornerRadiusPx must be between 0 and ${P15_NEUTRAL_EXPORT_MAX_RADIUS_PX}px.`);
    }
    if (value.alignItems !== undefined && !['start', 'center', 'end', 'stretch'].includes(String(value.alignItems))) {
      pushIssue(state, 'P15_IR_ALIGNMENT_INVALID', `${path}.alignItems`, 'alignItems is outside the bounded neutral alignment vocabulary.');
    }
    if (value.justifyContent !== undefined && !['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'].includes(String(value.justifyContent))) {
      pushIssue(state, 'P15_IR_ALIGNMENT_INVALID', `${path}.justifyContent`, 'justifyContent is outside the bounded neutral justification vocabulary.');
    }
    const styleIssues = [
      ...(value.border === undefined ? [] : borderProblems(value.border, `${path}.border`)),
      ...(value.cornerRadiiPx === undefined ? [] : cornerRadiiProblems(value.cornerRadiiPx, `${path}.cornerRadiiPx`, P15_NEUTRAL_EXPORT_MAX_RADIUS_PX)),
      ...(value.cornerRadiiPx !== undefined && value.cornerRadiusPx !== undefined
        ? [{ path: `${path}.cornerRadiiPx`, message: 'cornerRadiiPx and cornerRadiusPx are exclusive.' }] : []),
      ...(value.clipsContent !== undefined && value.clipsContent !== true ? [{ path: `${path}.clipsContent`, message: 'clipsContent must be true when provided.' }] : []),
    ];
    for (const issue of styleIssues) pushIssue(state, 'P15_IR_STYLE_INVALID', issue.path, issue.message);
    if (value.sizing !== undefined) {
      for (const issue of containerSizingProblems(value.sizing, `${path}.sizing`)) pushIssue(state, 'P15_IR_SIZING_INVALID', issue.path, issue.message);
    }
    if (value.styleReviews !== undefined) validateStyleReviews(value.styleReviews, `${path}.styleReviews`, state);
    if (!Array.isArray(value.children)) {
      pushIssue(state, 'P15_IR_CONTAINER_CHILDREN_INVALID', `${path}.children`, 'Container children must be an array.');
      return;
    }
    for (let index = 0; index < value.children.length; index += 1) {
      validateNode(value.children[index], `${path}.children[${index}]`, depth + 1, state);
      if (state.nodeLimitReported) break;
    }
    return;
  }

  if (kind === 'heading') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'text', 'level', 'align', 'typography', 'href', 'sizing'], path, state);
    validateWidgetSizing(value.sizing, `${path}.sizing`, state);
    if (value.href !== undefined && !validP15LinkUrl(value.href)) pushIssue(state, 'P15_IR_URL_INVALID', `${path}.href`, 'Heading link must be a bounded safe http(s), mailto, tel, root-relative or fragment URL.');
    validateText(value.text, `${path}.text`, state);
    for (const issue of value.typography === undefined ? [] : typographyProblems(value.typography, `${path}.typography`)) {
      pushIssue(state, 'P15_IR_TYPOGRAPHY_INVALID', issue.path, issue.message);
    }
    if (!['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'].includes(String(value.level))) {
      pushIssue(state, 'P15_IR_HEADING_LEVEL_INVALID', `${path}.level`, 'Heading level is outside the bounded Elementor heading vocabulary.');
    }
    if (value.align !== undefined && !['start', 'center', 'end'].includes(String(value.align))) {
      pushIssue(state, 'P15_IR_ALIGNMENT_INVALID', `${path}.align`, 'Heading alignment must be start, center or end.');
    }
    return;
  }

  if (kind === 'text') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'text', 'align', 'typography', 'paragraphs', 'paragraphSpacingPx', 'href', 'sizing', 'styleReviews'], path, state);
    validateWidgetSizing(value.sizing, `${path}.sizing`, state);
    if (value.href !== undefined && !validP15LinkUrl(value.href)) pushIssue(state, 'P15_IR_URL_INVALID', `${path}.href`, 'Text link must be a bounded safe http(s), mailto, tel, root-relative or fragment URL.');
    validateText(value.text, `${path}.text`, state);
    const typographyIssues = [
      ...(value.typography === undefined ? [] : typographyProblems(value.typography, `${path}.typography`)),
      ...(value.paragraphs === undefined ? [] : paragraphProblems(value.paragraphs, value.text, `${path}.paragraphs`)),
      ...(value.paragraphSpacingPx === undefined || paragraphSpacingValid(value.paragraphSpacingPx) ? []
        : [{ path: `${path}.paragraphSpacingPx`, message: 'Paragraph spacing must be 0..1000 px with at most two decimals.' }]),
    ];
    for (const issue of typographyIssues) pushIssue(state, 'P15_IR_TYPOGRAPHY_INVALID', issue.path, issue.message);
    if (value.styleReviews !== undefined) validateStyleReviews(value.styleReviews, `${path}.styleReviews`, state);
    if (value.align !== undefined && !['start', 'center', 'end', 'justify'].includes(String(value.align))) {
      pushIssue(state, 'P15_IR_ALIGNMENT_INVALID', `${path}.align`, 'Text alignment must be start, center, end or justify.');
    }
    return;
  }

  if (kind === 'button') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'text', 'url', 'openInNewTab', 'nofollow', 'align',
      'typography', 'backgroundColorHex', 'paddingPx', 'cornerRadiusPx', 'sizing', 'styleReviews'], path, state);
    if (value.sizing !== undefined) {
      for (const issue of buttonSizingProblems(value.sizing, `${path}.sizing`)) pushIssue(state, 'P15_IR_SIZING_INVALID', issue.path, issue.message);
      if (isRecord(value.sizing) && value.sizing.fullWidth === true && value.align !== undefined) {
        pushIssue(state, 'P15_IR_SIZING_INVALID', `${path}.align`, 'A full-width button has no separate position; align and sizing.fullWidth are exclusive.');
      }
    }
    if (value.styleReviews !== undefined) validateStyleReviews(value.styleReviews, `${path}.styleReviews`, state);
    validateText(value.text, `${path}.text`, state, 2_000);
    for (const issue of value.typography === undefined ? [] : typographyProblems(value.typography, `${path}.typography`)) {
      pushIssue(state, 'P15_IR_TYPOGRAPHY_INVALID', issue.path, issue.message);
    }
    if (value.paddingPx !== undefined) validatePadding(value.paddingPx, `${path}.paddingPx`, state);
    if (value.backgroundColorHex !== undefined
      && (typeof value.backgroundColorHex !== 'string' || !/^#[0-9A-F]{6}$/.test(value.backgroundColorHex))) {
      pushIssue(state, 'P15_IR_COLOR_INVALID', `${path}.backgroundColorHex`, 'backgroundColorHex must be canonical uppercase #RRGGBB when provided.');
    }
    if (value.cornerRadiusPx !== undefined && !validRadius(value.cornerRadiusPx)) {
      pushIssue(state, 'P15_IR_RADIUS_INVALID', `${path}.cornerRadiusPx`, `cornerRadiusPx must be between 0 and ${P15_NEUTRAL_EXPORT_MAX_RADIUS_PX}px.`);
    }
    if (value.url !== undefined && (typeof value.url !== 'string' || !validButtonUrl(value.url))) {
      pushIssue(state, 'P15_IR_URL_INVALID', `${path}.url`, 'Button URL must be a bounded safe http(s), mailto, tel, root-relative or fragment URL.');
    }
    validateOptionalBoolean(value, 'openInNewTab', path, state);
    validateOptionalBoolean(value, 'nofollow', path, state);
    if (value.align !== undefined && !['start', 'center', 'end'].includes(String(value.align))) {
      pushIssue(state, 'P15_IR_ALIGNMENT_INVALID', `${path}.align`, 'Button alignment must be start, center or end.');
    }
    return;
  }

  if (kind === 'image') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'url', 'attachmentId'], path, state);
    if (typeof value.url !== 'string' || !validAbsoluteUrl(value.url, ['https:', 'http:'])) {
      pushIssue(state, 'P15_IR_URL_INVALID', `${path}.url`, 'Image URL must be a bounded absolute http(s) URL.');
    }
    if (value.attachmentId !== undefined && (!Number.isSafeInteger(value.attachmentId) || Number(value.attachmentId) < 0)) {
      pushIssue(state, 'P15_IR_ATTACHMENT_ID_INVALID', `${path}.attachmentId`, 'attachmentId must be a safe non-negative integer when provided.');
    }
    return;
  }

  if (kind === 'divider') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'weightPx', 'colorHex', 'widthPx', 'align'], path, state);
    if (value.align !== undefined && value.align !== 'center' && value.align !== 'end') {
      pushIssue(state, 'P15_IR_ALIGNMENT_INVALID', `${path}.align`, 'Divider alignment must be center or end when provided.');
    }
    if (typeof value.weightPx !== 'number' || !Number.isFinite(value.weightPx) || value.weightPx < 0.1 || value.weightPx > 10) {
      pushIssue(state, 'P15_IR_SPACING_INVALID', `${path}.weightPx`, 'Divider weight must be 0.1..10 px (the Elementor 4.2.4 weight slider range).');
    }
    if (typeof value.colorHex !== 'string' || !/^#[0-9a-f]{6}$/.test(value.colorHex)) {
      pushIssue(state, 'P15_IR_COLOR_INVALID', `${path}.colorHex`, 'Divider colour must be lowercase #rrggbb.');
    }
    if (value.widthPx !== undefined && !(validSpacing(value.widthPx) && value.widthPx > 0)) {
      pushIssue(state, 'P15_IR_SPACING_INVALID', `${path}.widthPx`, `Divider width must be within 0-${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}px.`);
    }
    return;
  }

  if (kind === 'spacer') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'heightPx'], path, state);
    if (!validSpacing(value.heightPx) || value.heightPx === 0) {
      pushIssue(state, 'P15_IR_SPACING_INVALID', `${path}.heightPx`, `Spacer height must be within 0-${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}px and non-zero.`);
    }
    return;
  }

  if (kind === 'review') {
    state.reviewNodeCount += 1;
    validateExactKeys(value, ['kind', 'sourceNodeId', 'reasonCode', 'detail'], path, state);
    if (!boundedString(value.reasonCode, 128) || !/^[A-Z0-9_:-]+$/.test(String(value.reasonCode))) {
      pushIssue(state, 'P15_IR_REVIEW_REASON_INVALID', `${path}.reasonCode`, 'Review reasonCode must be a bounded uppercase identifier.');
    }
    validateText(value.detail, `${path}.detail`, state, 2_000);
    return;
  }

  pushIssue(state, 'P15_IR_NODE_KIND_UNSUPPORTED', `${path}.kind`, 'Neutral export node kind is unsupported.');
}

/** Validate only the target-neutral export facts. No Elementor control names are accepted by this contract. */
export function validateP15NeutralExportDocument(value: unknown): P15NeutralExportValidationResult {
  const state: ValidationState = {
    issues: [],
    sourceIds: new Set<string>(),
    nodeCount: 0,
    reviewNodeCount: 0,
    nodeLimitReported: false,
  };

  if (!isRecord(value)) {
    pushIssue(state, 'P15_IR_DOCUMENT_NOT_OBJECT', '$', 'Neutral export document must be an object.');
  } else {
    const unsupportedDocumentKeys = Object.keys(value)
      .filter((key) => !['schemaVersion', 'irVersion', 'title', 'documentType', 'nodes'].includes(key))
      .sort();
    if (unsupportedDocumentKeys.length > 0) {
      pushIssue(state, 'P15_IR_NODE_KEYS_UNSUPPORTED', '$', `Neutral export document contains unsupported keys: ${unsupportedDocumentKeys.join(', ')}.`);
    }
    if (value.schemaVersion !== 1) {
      pushIssue(state, 'P15_IR_SCHEMA_UNSUPPORTED', '$.schemaVersion', 'Neutral export schemaVersion must be 1.');
    }
    if (value.irVersion !== P15_NEUTRAL_EXPORT_IR_VERSION) {
      pushIssue(state, 'P15_IR_VERSION_UNSUPPORTED', '$.irVersion', `Neutral export irVersion must be ${P15_NEUTRAL_EXPORT_IR_VERSION}.`);
    }
    if (!boundedString(value.title, 512)) {
      pushIssue(state, 'P15_IR_TITLE_INVALID', '$.title', 'Template title must be a non-empty string up to 512 characters.');
    }
    if (value.documentType !== 'page' && value.documentType !== 'section') {
      pushIssue(state, 'P15_IR_DOCUMENT_TYPE_UNSUPPORTED', '$.documentType', 'V1 neutral export supports page and section documents only.');
    }
    if (!Array.isArray(value.nodes)) {
      pushIssue(state, 'P15_IR_NODES_INVALID', '$.nodes', 'Neutral export document nodes must be an array.');
    } else {
      for (let index = 0; index < value.nodes.length; index += 1) {
        validateNode(value.nodes[index], `$.nodes[${index}]`, 1, state);
        if (state.nodeLimitReported) break;
      }
    }
  }

  return {
    valid: state.issues.length === 0,
    nodeCount: state.nodeCount,
    reviewNodeCount: state.reviewNodeCount,
    issues: state.issues,
  };
}
