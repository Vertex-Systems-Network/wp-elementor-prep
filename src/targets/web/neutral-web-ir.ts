import { sha256Hex } from '../../core/sha256';

export const P17_NEUTRAL_WEB_IR_VERSION = 'p17-neutral-web-ir-v1' as const;
export const P17_NEUTRAL_WEB_MAX_NODES = 10_000;
export const P17_NEUTRAL_WEB_MAX_DEPTH = 64;
export const P17_NEUTRAL_WEB_MAX_TEXT_LENGTH = 20_000;
export const P17_NEUTRAL_WEB_MAX_TEXT_BYTES = 1_048_576;
export const P17_NEUTRAL_WEB_MAX_REF_LENGTH = 512;
export const P17_NEUTRAL_WEB_MAX_PATH_LENGTH = 512;
export const P17_NEUTRAL_WEB_MAX_SPACING_PX = 4_096;
export const P17_NEUTRAL_WEB_MAX_DIMENSION_PX = 100_000;

export type P17NeutralWebDirection = 'DESIGN_TO_WEB' | 'WEB_TO_DESIGN';
export type P17NeutralWebSourceKind = 'FIGMA' | 'DOM';
export type P17NeutralWebSemanticContainerTag =
  | 'div'
  | 'section'
  | 'main'
  | 'header'
  | 'footer'
  | 'nav'
  | 'article'
  | 'aside'
  | 'ul'
  | 'ol'
  | 'li';
export type P17NeutralWebAlignment = 'start' | 'center' | 'end';
export type P17NeutralWebCrossAlignment = P17NeutralWebAlignment | 'stretch';
export type P17NeutralWebJustification =
  | P17NeutralWebAlignment
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type P17NeutralWebTextAlignment = P17NeutralWebAlignment | 'justify';

export interface P17NeutralWebProvenance {
  source: P17NeutralWebSourceKind;
  sourceRef: string;
}

export interface P17NeutralWebEdgesPx {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface P17NeutralWebStyle {
  paddingPx?: P17NeutralWebEdgesPx;
  backgroundColorHex?: string;
  colorHex?: string;
  cornerRadiusPx?: number;
  textAlign?: P17NeutralWebTextAlignment;
}

export interface P17NeutralWebFlowLayout {
  mode: 'flow';
}

export interface P17NeutralWebFlexLayout {
  mode: 'flex';
  direction: 'row' | 'column';
  gapPx?: number;
  alignItems?: P17NeutralWebCrossAlignment;
  justifyContent?: P17NeutralWebJustification;
  wrap?: boolean;
}

export interface P17NeutralWebGridLayout {
  mode: 'grid';
  columns: number;
  gapPx?: number;
}

export type P17NeutralWebLayout =
  | P17NeutralWebFlowLayout
  | P17NeutralWebFlexLayout
  | P17NeutralWebGridLayout;

interface P17NeutralWebNodeBase {
  nodeId: string;
  provenance: P17NeutralWebProvenance;
}

export interface P17NeutralWebContainerNode extends P17NeutralWebNodeBase {
  kind: 'container';
  semanticTag: P17NeutralWebSemanticContainerTag;
  layout: P17NeutralWebLayout;
  style?: P17NeutralWebStyle;
  children: P17NeutralWebNode[];
}

export interface P17NeutralWebTextNode extends P17NeutralWebNodeBase {
  kind: 'text';
  semantic: 'heading' | 'paragraph' | 'span';
  text: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: P17NeutralWebStyle;
}

export interface P17NeutralWebLinkNode extends P17NeutralWebNodeBase {
  kind: 'link';
  role: 'link' | 'button';
  text: string;
  href: string;
  openInNewTab?: boolean;
  nofollow?: boolean;
  style?: P17NeutralWebStyle;
}

export interface P17NeutralWebImageNode extends P17NeutralWebNodeBase {
  kind: 'image';
  assetPath: string;
  alt: string;
  widthPx?: number;
  heightPx?: number;
  style?: P17NeutralWebStyle;
}

export interface P17NeutralWebReviewNode extends P17NeutralWebNodeBase {
  kind: 'review';
  reasonCode: string;
  detail: string;
}

export type P17NeutralWebNode =
  | P17NeutralWebContainerNode
  | P17NeutralWebTextNode
  | P17NeutralWebLinkNode
  | P17NeutralWebImageNode
  | P17NeutralWebReviewNode;

export interface P17NeutralWebDocumentV1 {
  schemaVersion: 1;
  irVersion: typeof P17_NEUTRAL_WEB_IR_VERSION;
  title: string;
  language: string;
  direction: P17NeutralWebDirection;
  nodes: P17NeutralWebNode[];
}

export type P17NeutralWebValidationCode =
  | 'P17_WEB_IR_DOCUMENT_NOT_OBJECT'
  | 'P17_WEB_IR_DOCUMENT_KEYS_UNSUPPORTED'
  | 'P17_WEB_IR_SCHEMA_UNSUPPORTED'
  | 'P17_WEB_IR_VERSION_UNSUPPORTED'
  | 'P17_WEB_IR_TITLE_INVALID'
  | 'P17_WEB_IR_LANGUAGE_INVALID'
  | 'P17_WEB_IR_DIRECTION_INVALID'
  | 'P17_WEB_IR_NODES_INVALID'
  | 'P17_WEB_IR_NODE_NOT_OBJECT'
  | 'P17_WEB_IR_NODE_KEYS_UNSUPPORTED'
  | 'P17_WEB_IR_NODE_KIND_UNSUPPORTED'
  | 'P17_WEB_IR_NODE_ID_INVALID'
  | 'P17_WEB_IR_DUPLICATE_NODE_ID'
  | 'P17_WEB_IR_PROVENANCE_INVALID'
  | 'P17_WEB_IR_SEMANTIC_TAG_INVALID'
  | 'P17_WEB_IR_LAYOUT_INVALID'
  | 'P17_WEB_IR_STYLE_INVALID'
  | 'P17_WEB_IR_SPACING_INVALID'
  | 'P17_WEB_IR_COLOR_INVALID'
  | 'P17_WEB_IR_RADIUS_INVALID'
  | 'P17_WEB_IR_ALIGNMENT_INVALID'
  | 'P17_WEB_IR_TEXT_INVALID'
  | 'P17_WEB_IR_TEXT_SEMANTIC_INVALID'
  | 'P17_WEB_IR_HEADING_LEVEL_INVALID'
  | 'P17_WEB_IR_LINK_ROLE_INVALID'
  | 'P17_WEB_IR_URL_INVALID'
  | 'P17_WEB_IR_BOOLEAN_INVALID'
  | 'P17_WEB_IR_ASSET_PATH_INVALID'
  | 'P17_WEB_IR_DIMENSION_INVALID'
  | 'P17_WEB_IR_REVIEW_REASON_INVALID'
  | 'P17_WEB_IR_NODE_LIMIT_EXCEEDED'
  | 'P17_WEB_IR_DEPTH_LIMIT_EXCEEDED'
  | 'P17_WEB_IR_TEXT_BUDGET_EXCEEDED';

export interface P17NeutralWebValidationIssue {
  code: P17NeutralWebValidationCode;
  path: string;
  message: string;
}

export interface P17NeutralWebValidationResult {
  valid: boolean;
  nodeCount: number;
  reviewNodeCount: number;
  textBytes: number;
  issues: P17NeutralWebValidationIssue[];
}

export interface P17NeutralWebIdentity {
  irVersion: typeof P17_NEUTRAL_WEB_IR_VERSION;
  sha256: string;
  nodeCount: number;
  reviewNodeCount: number;
}

interface ValidationState {
  issues: P17NeutralWebValidationIssue[];
  ids: Set<string>;
  nodeCount: number;
  reviewNodeCount: number;
  textBytes: number;
  nodeLimitReported: boolean;
  textBudgetReported: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (const symbol of value) {
    const codePoint = symbol.codePointAt(0);
    if (codePoint === undefined) continue;
    if (codePoint <= 0x7f) bytes += 1;
    else if (codePoint <= 0x7ff) bytes += 2;
    else if (codePoint <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

function boundedString(value: unknown, maxLength: number, allowEmpty = false): value is string {
  return typeof value === 'string'
    && value.length <= maxLength
    && (allowEmpty || value.trim().length > 0);
}

function pushIssue(
  state: ValidationState,
  code: P17NeutralWebValidationCode,
  path: string,
  message: string,
): void {
  state.issues.push({ code, path, message });
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  state: ValidationState,
  code: 'P17_WEB_IR_DOCUMENT_KEYS_UNSUPPORTED' | 'P17_WEB_IR_NODE_KEYS_UNSUPPORTED',
): void {
  const allowedSet = new Set(allowed);
  const unsupported = Object.keys(value).filter((key) => !allowedSet.has(key)).sort();
  if (unsupported.length > 0) {
    pushIssue(state, code, path, `Unsupported keys: ${unsupported.join(', ')}.`);
  }
}

function chargeText(
  value: unknown,
  path: string,
  state: ValidationState,
  maxLength = P17_NEUTRAL_WEB_MAX_TEXT_LENGTH,
  allowEmpty = false,
): value is string {
  if (!boundedString(value, maxLength, allowEmpty)) {
    pushIssue(
      state,
      'P17_WEB_IR_TEXT_INVALID',
      path,
      `Text must be ${allowEmpty ? '' : 'non-empty and '}no longer than ${maxLength} characters.`,
    );
    return false;
  }
  if (state.textBudgetReported) return true;

  state.textBytes += utf8ByteLength(value);
  if (state.textBytes > P17_NEUTRAL_WEB_MAX_TEXT_BYTES) {
    state.textBudgetReported = true;
    pushIssue(
      state,
      'P17_WEB_IR_TEXT_BUDGET_EXCEEDED',
      path,
      `Aggregate text exceeds ${P17_NEUTRAL_WEB_MAX_TEXT_BYTES} UTF-8 bytes.`,
    );
  }
  return true;
}

function validLanguage(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 35
    && /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value);
}

function validSpacing(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= P17_NEUTRAL_WEB_MAX_SPACING_PX;
}

function validDimension(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value > 0
    && value <= P17_NEUTRAL_WEB_MAX_DIMENSION_PX;
}

function validLinkHref(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 4_096) return false;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return false;
  }
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  if (value.startsWith('#')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:'
      || parsed.protocol === 'http:'
      || parsed.protocol === 'mailto:'
      || parsed.protocol === 'tel:';
  } catch {
    return false;
  }
}

function validLocalAssetPath(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > P17_NEUTRAL_WEB_MAX_PATH_LENGTH) return false;
  if (!value.startsWith('assets/')) return false;
  if (value.includes('\\') || value.includes('%') || value.includes('?') || value.includes('#') || value.includes(':')) return false;
  if (!/^assets\/[A-Za-z0-9._/-]+$/.test(value)) return false;
  const segments = value.split('/');
  return segments.length >= 2
    && segments.every((segment) => segment.length > 0 && segment !== '.' && segment !== '..');
}

function validateProvenance(
  value: unknown,
  path: string,
  state: ValidationState,
): void {
  if (!isRecord(value)) {
    pushIssue(state, 'P17_WEB_IR_PROVENANCE_INVALID', path, 'provenance must be an object.');
    return;
  }
  exactKeys(value, ['source', 'sourceRef'], path, state, 'P17_WEB_IR_NODE_KEYS_UNSUPPORTED');
  if (value.source !== 'FIGMA' && value.source !== 'DOM') {
    pushIssue(state, 'P17_WEB_IR_PROVENANCE_INVALID', `${path}.source`, 'provenance.source must be FIGMA or DOM.');
  }
  if (!boundedString(value.sourceRef, P17_NEUTRAL_WEB_MAX_REF_LENGTH)) {
    pushIssue(
      state,
      'P17_WEB_IR_PROVENANCE_INVALID',
      `${path}.sourceRef`,
      `sourceRef must be a non-empty string up to ${P17_NEUTRAL_WEB_MAX_REF_LENGTH} characters.`,
    );
  }
}

function validateEdges(
  value: unknown,
  path: string,
  state: ValidationState,
): void {
  if (!isRecord(value)) {
    pushIssue(state, 'P17_WEB_IR_SPACING_INVALID', path, 'paddingPx must be an object.');
    return;
  }
  exactKeys(value, ['top', 'right', 'bottom', 'left'], path, state, 'P17_WEB_IR_NODE_KEYS_UNSUPPORTED');
  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    if (!validSpacing(value[side])) {
      pushIssue(
        state,
        'P17_WEB_IR_SPACING_INVALID',
        `${path}.${side}`,
        `Spacing must be between 0 and ${P17_NEUTRAL_WEB_MAX_SPACING_PX}px.`,
      );
    }
  }
}

function validateStyle(
  value: unknown,
  path: string,
  state: ValidationState,
): void {
  if (!isRecord(value)) {
    pushIssue(state, 'P17_WEB_IR_STYLE_INVALID', path, 'style must be an object.');
    return;
  }

  exactKeys(
    value,
    ['paddingPx', 'backgroundColorHex', 'colorHex', 'cornerRadiusPx', 'textAlign'],
    path,
    state,
    'P17_WEB_IR_NODE_KEYS_UNSUPPORTED',
  );

  if (value.paddingPx !== undefined) validateEdges(value.paddingPx, `${path}.paddingPx`, state);

  for (const key of ['backgroundColorHex', 'colorHex'] as const) {
    const color = value[key];
    if (color !== undefined && (typeof color !== 'string' || !/^#[0-9A-F]{6}$/.test(color))) {
      pushIssue(state, 'P17_WEB_IR_COLOR_INVALID', `${path}.${key}`, `${key} must be canonical uppercase #RRGGBB.`);
    }
  }

  if (value.cornerRadiusPx !== undefined && !validSpacing(value.cornerRadiusPx)) {
    pushIssue(
      state,
      'P17_WEB_IR_RADIUS_INVALID',
      `${path}.cornerRadiusPx`,
      `cornerRadiusPx must be between 0 and ${P17_NEUTRAL_WEB_MAX_SPACING_PX}px.`,
    );
  }

  if (value.textAlign !== undefined && !['start', 'center', 'end', 'justify'].includes(String(value.textAlign))) {
    pushIssue(state, 'P17_WEB_IR_ALIGNMENT_INVALID', `${path}.textAlign`, 'textAlign is unsupported.');
  }
}

function validateLayout(
  value: unknown,
  path: string,
  state: ValidationState,
): void {
  if (!isRecord(value)) {
    pushIssue(state, 'P17_WEB_IR_LAYOUT_INVALID', path, 'layout must be an object.');
    return;
  }

  if (value.mode === 'flow') {
    exactKeys(value, ['mode'], path, state, 'P17_WEB_IR_NODE_KEYS_UNSUPPORTED');
    return;
  }

  if (value.mode === 'flex') {
    exactKeys(
      value,
      ['mode', 'direction', 'gapPx', 'alignItems', 'justifyContent', 'wrap'],
      path,
      state,
      'P17_WEB_IR_NODE_KEYS_UNSUPPORTED',
    );
    if (value.direction !== 'row' && value.direction !== 'column') {
      pushIssue(state, 'P17_WEB_IR_LAYOUT_INVALID', `${path}.direction`, 'Flex direction must be row or column.');
    }
    if (value.gapPx !== undefined && !validSpacing(value.gapPx)) {
      pushIssue(state, 'P17_WEB_IR_SPACING_INVALID', `${path}.gapPx`, 'Flex gap is outside the bounded spacing range.');
    }
    if (value.alignItems !== undefined && !['start', 'center', 'end', 'stretch'].includes(String(value.alignItems))) {
      pushIssue(state, 'P17_WEB_IR_ALIGNMENT_INVALID', `${path}.alignItems`, 'alignItems is unsupported.');
    }
    if (value.justifyContent !== undefined
      && !['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'].includes(String(value.justifyContent))) {
      pushIssue(state, 'P17_WEB_IR_ALIGNMENT_INVALID', `${path}.justifyContent`, 'justifyContent is unsupported.');
    }
    if (value.wrap !== undefined && typeof value.wrap !== 'boolean') {
      pushIssue(state, 'P17_WEB_IR_BOOLEAN_INVALID', `${path}.wrap`, 'wrap must be boolean when present.');
    }
    return;
  }

  if (value.mode === 'grid') {
    exactKeys(value, ['mode', 'columns', 'gapPx'], path, state, 'P17_WEB_IR_NODE_KEYS_UNSUPPORTED');
    if (!Number.isSafeInteger(value.columns) || Number(value.columns) < 1 || Number(value.columns) > 12) {
      pushIssue(state, 'P17_WEB_IR_LAYOUT_INVALID', `${path}.columns`, 'Grid columns must be a safe integer from 1 through 12.');
    }
    if (value.gapPx !== undefined && !validSpacing(value.gapPx)) {
      pushIssue(state, 'P17_WEB_IR_SPACING_INVALID', `${path}.gapPx`, 'Grid gap is outside the bounded spacing range.');
    }
    return;
  }

  pushIssue(state, 'P17_WEB_IR_LAYOUT_INVALID', `${path}.mode`, 'Layout mode must be flow, flex or grid.');
}

function validateNodeId(
  value: Record<string, unknown>,
  path: string,
  state: ValidationState,
): void {
  const nodeId = value.nodeId;
  if (!boundedString(nodeId, 256)) {
    pushIssue(state, 'P17_WEB_IR_NODE_ID_INVALID', `${path}.nodeId`, 'nodeId must be a non-empty string up to 256 characters.');
    return;
  }
  if (state.ids.has(nodeId)) {
    pushIssue(state, 'P17_WEB_IR_DUPLICATE_NODE_ID', `${path}.nodeId`, `Duplicate nodeId: ${nodeId}.`);
    return;
  }
  state.ids.add(nodeId);
}

function validateOptionalBoolean(
  value: Record<string, unknown>,
  key: string,
  path: string,
  state: ValidationState,
): void {
  if (value[key] !== undefined && typeof value[key] !== 'boolean') {
    pushIssue(state, 'P17_WEB_IR_BOOLEAN_INVALID', `${path}.${key}`, `${key} must be boolean when present.`);
  }
}

function validateNode(
  value: unknown,
  path: string,
  depth: number,
  state: ValidationState,
): void {
  if (depth > P17_NEUTRAL_WEB_MAX_DEPTH) {
    pushIssue(
      state,
      'P17_WEB_IR_DEPTH_LIMIT_EXCEEDED',
      path,
      `Neutral Web IR nesting exceeds ${P17_NEUTRAL_WEB_MAX_DEPTH} levels.`,
    );
    return;
  }
  if (state.nodeCount >= P17_NEUTRAL_WEB_MAX_NODES) {
    if (!state.nodeLimitReported) {
      state.nodeLimitReported = true;
      pushIssue(
        state,
        'P17_WEB_IR_NODE_LIMIT_EXCEEDED',
        path,
        `Neutral Web IR exceeds ${P17_NEUTRAL_WEB_MAX_NODES} nodes.`,
      );
    }
    return;
  }
  state.nodeCount += 1;

  if (!isRecord(value)) {
    pushIssue(state, 'P17_WEB_IR_NODE_NOT_OBJECT', path, 'Neutral Web IR nodes must be objects.');
    return;
  }

  validateNodeId(value, path, state);
  validateProvenance(value.provenance, `${path}.provenance`, state);

  if (value.kind === 'container') {
    exactKeys(
      value,
      ['kind', 'nodeId', 'provenance', 'semanticTag', 'layout', 'style', 'children'],
      path,
      state,
      'P17_WEB_IR_NODE_KEYS_UNSUPPORTED',
    );
    if (!['div', 'section', 'main', 'header', 'footer', 'nav', 'article', 'aside', 'ul', 'ol', 'li'].includes(String(value.semanticTag))) {
      pushIssue(state, 'P17_WEB_IR_SEMANTIC_TAG_INVALID', `${path}.semanticTag`, 'Container semanticTag is unsupported.');
    }
    validateLayout(value.layout, `${path}.layout`, state);
    if (value.style !== undefined) validateStyle(value.style, `${path}.style`, state);
    if (!Array.isArray(value.children)) {
      pushIssue(state, 'P17_WEB_IR_NODES_INVALID', `${path}.children`, 'Container children must be an array.');
      return;
    }
    for (let index = 0; index < value.children.length; index += 1) {
      validateNode(value.children[index], `${path}.children[${index}]`, depth + 1, state);
      if (state.nodeLimitReported || state.textBudgetReported) break;
    }
    return;
  }

  if (value.kind === 'text') {
    exactKeys(
      value,
      ['kind', 'nodeId', 'provenance', 'semantic', 'text', 'headingLevel', 'style'],
      path,
      state,
      'P17_WEB_IR_NODE_KEYS_UNSUPPORTED',
    );
    if (!['heading', 'paragraph', 'span'].includes(String(value.semantic))) {
      pushIssue(state, 'P17_WEB_IR_TEXT_SEMANTIC_INVALID', `${path}.semantic`, 'Text semantic must be heading, paragraph or span.');
    }
    chargeText(value.text, `${path}.text`, state, P17_NEUTRAL_WEB_MAX_TEXT_LENGTH, true);
    if (value.semantic === 'heading') {
      if (![1, 2, 3, 4, 5, 6].includes(Number(value.headingLevel))) {
        pushIssue(state, 'P17_WEB_IR_HEADING_LEVEL_INVALID', `${path}.headingLevel`, 'Heading text requires level 1 through 6.');
      }
    } else if (value.headingLevel !== undefined) {
      pushIssue(state, 'P17_WEB_IR_HEADING_LEVEL_INVALID', `${path}.headingLevel`, 'headingLevel is only valid for heading text.');
    }
    if (value.style !== undefined) validateStyle(value.style, `${path}.style`, state);
    return;
  }

  if (value.kind === 'link') {
    exactKeys(
      value,
      ['kind', 'nodeId', 'provenance', 'role', 'text', 'href', 'openInNewTab', 'nofollow', 'style'],
      path,
      state,
      'P17_WEB_IR_NODE_KEYS_UNSUPPORTED',
    );
    if (value.role !== 'link' && value.role !== 'button') {
      pushIssue(state, 'P17_WEB_IR_LINK_ROLE_INVALID', `${path}.role`, 'Link role must be link or button.');
    }
    chargeText(value.text, `${path}.text`, state, 2_000);
    if (!validLinkHref(value.href)) {
      pushIssue(state, 'P17_WEB_IR_URL_INVALID', `${path}.href`, 'href must be a safe bounded http(s), mailto, tel, root-relative or fragment URL.');
    }
    validateOptionalBoolean(value, 'openInNewTab', path, state);
    validateOptionalBoolean(value, 'nofollow', path, state);
    if (value.style !== undefined) validateStyle(value.style, `${path}.style`, state);
    return;
  }

  if (value.kind === 'image') {
    exactKeys(
      value,
      ['kind', 'nodeId', 'provenance', 'assetPath', 'alt', 'widthPx', 'heightPx', 'style'],
      path,
      state,
      'P17_WEB_IR_NODE_KEYS_UNSUPPORTED',
    );
    if (!validLocalAssetPath(value.assetPath)) {
      pushIssue(
        state,
        'P17_WEB_IR_ASSET_PATH_INVALID',
        `${path}.assetPath`,
        'assetPath must be a local assets/... path without traversal or URL syntax.',
      );
    }
    chargeText(value.alt, `${path}.alt`, state, 2_000, true);
    if (value.widthPx !== undefined && !validDimension(value.widthPx)) {
      pushIssue(state, 'P17_WEB_IR_DIMENSION_INVALID', `${path}.widthPx`, 'widthPx is outside the bounded dimension range.');
    }
    if (value.heightPx !== undefined && !validDimension(value.heightPx)) {
      pushIssue(state, 'P17_WEB_IR_DIMENSION_INVALID', `${path}.heightPx`, 'heightPx is outside the bounded dimension range.');
    }
    if (value.style !== undefined) validateStyle(value.style, `${path}.style`, state);
    return;
  }

  if (value.kind === 'review') {
    state.reviewNodeCount += 1;
    exactKeys(
      value,
      ['kind', 'nodeId', 'provenance', 'reasonCode', 'detail'],
      path,
      state,
      'P17_WEB_IR_NODE_KEYS_UNSUPPORTED',
    );
    if (!boundedString(value.reasonCode, 128) || !/^[A-Z0-9_:-]+$/.test(String(value.reasonCode))) {
      pushIssue(state, 'P17_WEB_IR_REVIEW_REASON_INVALID', `${path}.reasonCode`, 'reasonCode must be a bounded uppercase identifier.');
    }
    chargeText(value.detail, `${path}.detail`, state, 2_000);
    return;
  }

  pushIssue(state, 'P17_WEB_IR_NODE_KIND_UNSUPPORTED', `${path}.kind`, 'Neutral Web IR node kind is unsupported.');
}

export function validateP17NeutralWebDocument(value: unknown): P17NeutralWebValidationResult {
  const state: ValidationState = {
    issues: [],
    ids: new Set<string>(),
    nodeCount: 0,
    reviewNodeCount: 0,
    textBytes: 0,
    nodeLimitReported: false,
    textBudgetReported: false,
  };

  if (!isRecord(value)) {
    pushIssue(state, 'P17_WEB_IR_DOCUMENT_NOT_OBJECT', '$', 'Neutral Web IR document must be an object.');
  } else {
    exactKeys(
      value,
      ['schemaVersion', 'irVersion', 'title', 'language', 'direction', 'nodes'],
      '$',
      state,
      'P17_WEB_IR_DOCUMENT_KEYS_UNSUPPORTED',
    );
    if (value.schemaVersion !== 1) {
      pushIssue(state, 'P17_WEB_IR_SCHEMA_UNSUPPORTED', '$.schemaVersion', 'schemaVersion must be 1.');
    }
    if (value.irVersion !== P17_NEUTRAL_WEB_IR_VERSION) {
      pushIssue(
        state,
        'P17_WEB_IR_VERSION_UNSUPPORTED',
        '$.irVersion',
        `irVersion must be ${P17_NEUTRAL_WEB_IR_VERSION}.`,
      );
    }
    if (!boundedString(value.title, 512)) {
      pushIssue(state, 'P17_WEB_IR_TITLE_INVALID', '$.title', 'title must be a non-empty string up to 512 characters.');
    } else {
      chargeText(value.title, '$.title', state, 512);
    }
    if (!validLanguage(value.language)) {
      pushIssue(state, 'P17_WEB_IR_LANGUAGE_INVALID', '$.language', 'language must be a bounded BCP-47-like language tag.');
    }
    if (value.direction !== 'DESIGN_TO_WEB' && value.direction !== 'WEB_TO_DESIGN') {
      pushIssue(state, 'P17_WEB_IR_DIRECTION_INVALID', '$.direction', 'direction must be DESIGN_TO_WEB or WEB_TO_DESIGN.');
    }
    if (!Array.isArray(value.nodes)) {
      pushIssue(state, 'P17_WEB_IR_NODES_INVALID', '$.nodes', 'nodes must be an array.');
    } else {
      for (let index = 0; index < value.nodes.length; index += 1) {
        validateNode(value.nodes[index], `$.nodes[${index}]`, 1, state);
        if (state.nodeLimitReported || state.textBudgetReported) break;
      }
    }
  }

  return {
    valid: state.issues.length === 0,
    nodeCount: state.nodeCount,
    reviewNodeCount: state.reviewNodeCount,
    textBytes: state.textBytes,
    issues: state.issues,
  };
}

function canonicalEdges(value: P17NeutralWebEdgesPx): Record<string, number> {
  return {
    top: value.top,
    right: value.right,
    bottom: value.bottom,
    left: value.left,
  };
}

function canonicalStyle(value: P17NeutralWebStyle): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (value.paddingPx !== undefined) result.paddingPx = canonicalEdges(value.paddingPx);
  if (value.backgroundColorHex !== undefined) result.backgroundColorHex = value.backgroundColorHex;
  if (value.colorHex !== undefined) result.colorHex = value.colorHex;
  if (value.cornerRadiusPx !== undefined) result.cornerRadiusPx = value.cornerRadiusPx;
  if (value.textAlign !== undefined) result.textAlign = value.textAlign;
  return result;
}

function canonicalLayout(value: P17NeutralWebLayout): Record<string, unknown> {
  if (value.mode === 'flow') return { mode: 'flow' };
  if (value.mode === 'flex') {
    const result: Record<string, unknown> = {
      mode: 'flex',
      direction: value.direction,
    };
    if (value.gapPx !== undefined) result.gapPx = value.gapPx;
    if (value.alignItems !== undefined) result.alignItems = value.alignItems;
    if (value.justifyContent !== undefined) result.justifyContent = value.justifyContent;
    if (value.wrap !== undefined) result.wrap = value.wrap;
    return result;
  }
  const result: Record<string, unknown> = {
    mode: 'grid',
    columns: value.columns,
  };
  if (value.gapPx !== undefined) result.gapPx = value.gapPx;
  return result;
}

function canonicalProvenance(value: P17NeutralWebProvenance): Record<string, string> {
  return {
    source: value.source,
    sourceRef: value.sourceRef,
  };
}

function canonicalNode(node: P17NeutralWebNode): Record<string, unknown> {
  const base: Record<string, unknown> = {
    kind: node.kind,
    nodeId: node.nodeId,
    provenance: canonicalProvenance(node.provenance),
  };

  if (node.kind === 'container') {
    base.semanticTag = node.semanticTag;
    base.layout = canonicalLayout(node.layout);
    if (node.style !== undefined) base.style = canonicalStyle(node.style);
    base.children = node.children.map(canonicalNode);
    return base;
  }

  if (node.kind === 'text') {
    base.semantic = node.semantic;
    base.text = node.text;
    if (node.headingLevel !== undefined) base.headingLevel = node.headingLevel;
    if (node.style !== undefined) base.style = canonicalStyle(node.style);
    return base;
  }

  if (node.kind === 'link') {
    base.role = node.role;
    base.text = node.text;
    base.href = node.href;
    if (node.openInNewTab !== undefined) base.openInNewTab = node.openInNewTab;
    if (node.nofollow !== undefined) base.nofollow = node.nofollow;
    if (node.style !== undefined) base.style = canonicalStyle(node.style);
    return base;
  }

  if (node.kind === 'image') {
    base.assetPath = node.assetPath;
    base.alt = node.alt;
    if (node.widthPx !== undefined) base.widthPx = node.widthPx;
    if (node.heightPx !== undefined) base.heightPx = node.heightPx;
    if (node.style !== undefined) base.style = canonicalStyle(node.style);
    return base;
  }

  base.reasonCode = node.reasonCode;
  base.detail = node.detail;
  return base;
}

export function serializeP17NeutralWebDocument(document: P17NeutralWebDocumentV1): string {
  const validation = validateP17NeutralWebDocument(document);
  if (!validation.valid) {
    const first = validation.issues[0];
    if (!first) throw new Error('Invalid P17 Neutral Web IR without diagnostic.');
    throw new Error(`Invalid P17 Neutral Web IR: ${first.code} at ${first.path}: ${first.message}`);
  }

  return `${JSON.stringify({
    schemaVersion: document.schemaVersion,
    irVersion: document.irVersion,
    title: document.title,
    language: document.language,
    direction: document.direction,
    nodes: document.nodes.map(canonicalNode),
  }, null, 2)}\n`;
}

export function identifyP17NeutralWebDocument(document: P17NeutralWebDocumentV1): P17NeutralWebIdentity {
  const validation = validateP17NeutralWebDocument(document);
  if (!validation.valid) {
    const first = validation.issues[0];
    if (!first) throw new Error('Invalid P17 Neutral Web IR without diagnostic.');
    throw new Error(`Invalid P17 Neutral Web IR: ${first.code} at ${first.path}: ${first.message}`);
  }

  return {
    irVersion: P17_NEUTRAL_WEB_IR_VERSION,
    sha256: sha256Hex(serializeP17NeutralWebDocument(document)),
    nodeCount: validation.nodeCount,
    reviewNodeCount: validation.reviewNodeCount,
  };
}
