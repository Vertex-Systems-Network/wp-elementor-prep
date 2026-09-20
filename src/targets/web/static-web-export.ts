import { sha256Hex } from '../../core/sha256';

export const P17_STATIC_WEB_CONTRACT_VERSION = 'p17-static-web-export-v1' as const;
export const P17_STATIC_WEB_MAX_NODES = 10_000;
export const P17_STATIC_WEB_MAX_DEPTH = 64;
export const P17_STATIC_WEB_MAX_TEXT_LENGTH = 20_000;
export const P17_STATIC_WEB_MAX_TEXT_BYTES = 1_048_576;
export const P17_STATIC_WEB_MAX_PATH_LENGTH = 512;
export const P17_STATIC_WEB_MAX_URL_LENGTH = 4_096;
export const P17_STATIC_WEB_MAX_OUTPUT_BYTES = 4_194_304;
export const P17_STATIC_WEB_MAX_SPACING_PX = 4_096;
export const P17_STATIC_WEB_MAX_RADIUS_PX = 4_096;

export type P17StaticWebContainerTag =
  | 'div'
  | 'section'
  | 'main'
  | 'header'
  | 'footer'
  | 'nav'
  | 'article'
  | 'aside';

export type P17StaticWebDirection = 'row' | 'column';
export type P17StaticWebAlignment = 'start' | 'center' | 'end';
export type P17StaticWebCrossAlignment = P17StaticWebAlignment | 'stretch';
export type P17StaticWebJustification =
  | P17StaticWebAlignment
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type P17StaticWebTextAlignment = P17StaticWebAlignment | 'justify';

export interface P17StaticWebPaddingPx {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface P17StaticWebNodeBase {
  sourceNodeId: string;
}

export interface P17StaticWebContainerNode extends P17StaticWebNodeBase {
  kind: 'container';
  tag: P17StaticWebContainerTag;
  direction: P17StaticWebDirection;
  gapPx?: number;
  paddingPx?: P17StaticWebPaddingPx;
  alignItems?: P17StaticWebCrossAlignment;
  justifyContent?: P17StaticWebJustification;
  backgroundColorHex?: string;
  cornerRadiusPx?: number;
  children: P17StaticWebNode[];
}

export interface P17StaticWebHeadingNode extends P17StaticWebNodeBase {
  kind: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  align?: P17StaticWebTextAlignment;
}

export interface P17StaticWebTextNode extends P17StaticWebNodeBase {
  kind: 'text';
  tag: 'p' | 'span';
  text: string;
  align?: P17StaticWebTextAlignment;
}

export interface P17StaticWebLinkNode extends P17StaticWebNodeBase {
  kind: 'link';
  role: 'link' | 'button';
  text: string;
  href: string;
  openInNewTab?: boolean;
  nofollow?: boolean;
  align?: P17StaticWebAlignment;
}

export interface P17StaticWebImageNode extends P17StaticWebNodeBase {
  kind: 'image';
  assetPath: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface P17StaticWebReviewNode extends P17StaticWebNodeBase {
  kind: 'review';
  reasonCode: string;
  detail: string;
}

export type P17StaticWebNode =
  | P17StaticWebContainerNode
  | P17StaticWebHeadingNode
  | P17StaticWebTextNode
  | P17StaticWebLinkNode
  | P17StaticWebImageNode
  | P17StaticWebReviewNode;

export interface P17StaticWebDocumentV1 {
  schemaVersion: 1;
  contractVersion: typeof P17_STATIC_WEB_CONTRACT_VERSION;
  title: string;
  language: string;
  nodes: P17StaticWebNode[];
}

export type P17StaticWebValidationCode =
  | 'P17_DOCUMENT_NOT_OBJECT'
  | 'P17_DOCUMENT_KEYS_UNSUPPORTED'
  | 'P17_SCHEMA_UNSUPPORTED'
  | 'P17_CONTRACT_UNSUPPORTED'
  | 'P17_TITLE_INVALID'
  | 'P17_LANGUAGE_INVALID'
  | 'P17_NODES_INVALID'
  | 'P17_NODE_NOT_OBJECT'
  | 'P17_NODE_KEYS_UNSUPPORTED'
  | 'P17_NODE_KIND_UNSUPPORTED'
  | 'P17_SOURCE_ID_INVALID'
  | 'P17_DUPLICATE_SOURCE_ID'
  | 'P17_CONTAINER_TAG_INVALID'
  | 'P17_DIRECTION_INVALID'
  | 'P17_CHILDREN_INVALID'
  | 'P17_SPACING_INVALID'
  | 'P17_ALIGNMENT_INVALID'
  | 'P17_COLOR_INVALID'
  | 'P17_RADIUS_INVALID'
  | 'P17_TEXT_INVALID'
  | 'P17_HEADING_LEVEL_INVALID'
  | 'P17_TEXT_TAG_INVALID'
  | 'P17_LINK_ROLE_INVALID'
  | 'P17_URL_INVALID'
  | 'P17_BOOLEAN_INVALID'
  | 'P17_ASSET_PATH_INVALID'
  | 'P17_DIMENSION_INVALID'
  | 'P17_REVIEW_REASON_INVALID'
  | 'P17_NODE_LIMIT_EXCEEDED'
  | 'P17_DEPTH_LIMIT_EXCEEDED'
  | 'P17_TEXT_BUDGET_EXCEEDED';

export interface P17StaticWebValidationIssue {
  code: P17StaticWebValidationCode;
  path: string;
  message: string;
}

export interface P17StaticWebValidationResult {
  valid: boolean;
  nodeCount: number;
  reviewNodeCount: number;
  textBytes: number;
  issues: P17StaticWebValidationIssue[];
}

export interface P17StaticWebReviewIssue {
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
}

export interface P17StaticWebPackageReceipt {
  sourceSha256: string | null;
  htmlSha256: string | null;
  cssSha256: string | null;
  packageSha256: string | null;
}

export interface P17StaticWebPackage {
  contractVersion: typeof P17_STATIC_WEB_CONTRACT_VERSION;
  status: 'READY_FOR_BROWSER_VALIDATION' | 'REVIEW_REQUIRED' | 'REJECTED_INVALID_INPUT';
  validation: P17StaticWebValidationResult;
  reviewIssues: P17StaticWebReviewIssue[];
  html: string | null;
  css: string | null;
  javascript: null;
  javascriptExecution: false;
  networkAccessRequired: false;
  browserValidationStatus: 'NOT_RUN';
  reconstructionStatus: 'NOT_RUN';
  productionAcceptance: false;
  receipt: P17StaticWebPackageReceipt;
}

interface ValidationState {
  issues: P17StaticWebValidationIssue[];
  sourceIds: Set<string>;
  nodeCount: number;
  reviewNodeCount: number;
  textBytes: number;
  nodeLimitReported: boolean;
  textBudgetReported: boolean;
}

interface RenderState {
  nodeIndex: number;
  cssRules: string[];
  reviewIssues: P17StaticWebReviewIssue[];
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

function pushIssue(
  state: ValidationState,
  code: P17StaticWebValidationCode,
  path: string,
  message: string,
): void {
  state.issues.push({ code, path, message });
}

function boundedString(value: unknown, maxLength: number, allowEmpty = false): value is string {
  return typeof value === 'string'
    && value.length <= maxLength
    && (allowEmpty || value.trim().length > 0);
}

function chargeText(
  value: unknown,
  path: string,
  state: ValidationState,
  maxLength = P17_STATIC_WEB_MAX_TEXT_LENGTH,
  allowEmpty = false,
): value is string {
  if (!boundedString(value, maxLength, allowEmpty)) {
    pushIssue(state, 'P17_TEXT_INVALID', path, `Text must be ${allowEmpty ? '' : 'non-empty and '}no longer than ${maxLength} characters.`);
    return false;
  }

  if (state.textBudgetReported) return true;

  state.textBytes += utf8ByteLength(value);
  if (state.textBytes > P17_STATIC_WEB_MAX_TEXT_BYTES) {
    state.textBudgetReported = true;
    pushIssue(
      state,
      'P17_TEXT_BUDGET_EXCEEDED',
      path,
      `Aggregate text exceeds ${P17_STATIC_WEB_MAX_TEXT_BYTES} UTF-8 bytes.`,
    );
  }
  return true;
}

function validateExactKeys(
  record: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  state: ValidationState,
  code: 'P17_DOCUMENT_KEYS_UNSUPPORTED' | 'P17_NODE_KEYS_UNSUPPORTED',
): void {
  const allowedSet = new Set(allowed);
  const unsupported = Object.keys(record).filter((key) => !allowedSet.has(key)).sort();
  if (unsupported.length > 0) {
    pushIssue(state, code, path, `Unsupported keys: ${unsupported.join(', ')}.`);
  }
}

function validateSourceId(record: Record<string, unknown>, path: string, state: ValidationState): void {
  const value = record.sourceNodeId;
  if (!boundedString(value, 256)) {
    pushIssue(state, 'P17_SOURCE_ID_INVALID', `${path}.sourceNodeId`, 'sourceNodeId must be a non-empty string up to 256 characters.');
    return;
  }
  if (state.sourceIds.has(value)) {
    pushIssue(state, 'P17_DUPLICATE_SOURCE_ID', `${path}.sourceNodeId`, `Duplicate sourceNodeId: ${value}.`);
    return;
  }
  state.sourceIds.add(value);
}

function validSpacing(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= P17_STATIC_WEB_MAX_SPACING_PX;
}

function validRadius(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= P17_STATIC_WEB_MAX_RADIUS_PX;
}

function validDimension(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value > 0
    && value <= 100_000;
}

function validatePadding(value: unknown, path: string, state: ValidationState): void {
  if (!isRecord(value)) {
    pushIssue(state, 'P17_SPACING_INVALID', path, 'paddingPx must be an object with top/right/bottom/left values.');
    return;
  }
  validateExactKeys(value, ['top', 'right', 'bottom', 'left'], path, state, 'P17_NODE_KEYS_UNSUPPORTED');
  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    if (!validSpacing(value[side])) {
      pushIssue(state, 'P17_SPACING_INVALID', `${path}.${side}`, `Padding must be between 0 and ${P17_STATIC_WEB_MAX_SPACING_PX}px.`);
    }
  }
}

function validLanguage(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 35
    && /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value);
}

function validLinkHref(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > P17_STATIC_WEB_MAX_URL_LENGTH) return false;
  if (/[ -]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  if (value.startsWith('#')) return true;
  try {
    const parsed = new URL(value);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function validLocalAssetPath(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > P17_STATIC_WEB_MAX_PATH_LENGTH) return false;
  if (!value.startsWith('assets/')) return false;
  if (value.includes('\\') || value.includes('%') || value.includes('?') || value.includes('#') || value.includes(':')) return false;
  if (!/^assets\/[A-Za-z0-9._/-]+$/.test(value)) return false;
  const segments = value.split('/');
  return segments.length >= 2
    && segments.every((segment) => segment.length > 0 && segment !== '.' && segment !== '..');
}

function validateOptionalBoolean(
  record: Record<string, unknown>,
  key: string,
  path: string,
  state: ValidationState,
): void {
  if (record[key] !== undefined && typeof record[key] !== 'boolean') {
    pushIssue(state, 'P17_BOOLEAN_INVALID', `${path}.${key}`, `${key} must be boolean when provided.`);
  }
}

function validateNode(value: unknown, path: string, depth: number, state: ValidationState): void {
  if (depth > P17_STATIC_WEB_MAX_DEPTH) {
    pushIssue(state, 'P17_DEPTH_LIMIT_EXCEEDED', path, `Web export nesting exceeds ${P17_STATIC_WEB_MAX_DEPTH} levels.`);
    return;
  }

  if (state.nodeCount >= P17_STATIC_WEB_MAX_NODES) {
    if (!state.nodeLimitReported) {
      state.nodeLimitReported = true;
      pushIssue(state, 'P17_NODE_LIMIT_EXCEEDED', path, `Web export exceeds ${P17_STATIC_WEB_MAX_NODES} nodes.`);
    }
    return;
  }

  state.nodeCount += 1;

  if (!isRecord(value)) {
    pushIssue(state, 'P17_NODE_NOT_OBJECT', path, 'Web export nodes must be objects.');
    return;
  }

  validateSourceId(value, path, state);
  const kind = value.kind;

  if (kind === 'container') {
    validateExactKeys(
      value,
      ['kind', 'sourceNodeId', 'tag', 'direction', 'gapPx', 'paddingPx', 'alignItems', 'justifyContent', 'backgroundColorHex', 'cornerRadiusPx', 'children'],
      path,
      state,
      'P17_NODE_KEYS_UNSUPPORTED',
    );
    if (!['div', 'section', 'main', 'header', 'footer', 'nav', 'article', 'aside'].includes(String(value.tag))) {
      pushIssue(state, 'P17_CONTAINER_TAG_INVALID', `${path}.tag`, 'Container tag is outside the bounded semantic tag vocabulary.');
    }
    if (value.direction !== 'row' && value.direction !== 'column') {
      pushIssue(state, 'P17_DIRECTION_INVALID', `${path}.direction`, 'Container direction must be row or column.');
    }
    if (value.gapPx !== undefined && !validSpacing(value.gapPx)) {
      pushIssue(state, 'P17_SPACING_INVALID', `${path}.gapPx`, `gapPx must be between 0 and ${P17_STATIC_WEB_MAX_SPACING_PX}.`);
    }
    if (value.paddingPx !== undefined) validatePadding(value.paddingPx, `${path}.paddingPx`, state);
    if (value.alignItems !== undefined && !['start', 'center', 'end', 'stretch'].includes(String(value.alignItems))) {
      pushIssue(state, 'P17_ALIGNMENT_INVALID', `${path}.alignItems`, 'alignItems is outside the bounded alignment vocabulary.');
    }
    if (value.justifyContent !== undefined && !['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'].includes(String(value.justifyContent))) {
      pushIssue(state, 'P17_ALIGNMENT_INVALID', `${path}.justifyContent`, 'justifyContent is outside the bounded justification vocabulary.');
    }
    if (value.backgroundColorHex !== undefined
      && (typeof value.backgroundColorHex !== 'string' || !/^#[0-9A-F]{6}$/.test(value.backgroundColorHex))) {
      pushIssue(state, 'P17_COLOR_INVALID', `${path}.backgroundColorHex`, 'backgroundColorHex must be canonical uppercase #RRGGBB.');
    }
    if (value.cornerRadiusPx !== undefined && !validRadius(value.cornerRadiusPx)) {
      pushIssue(state, 'P17_RADIUS_INVALID', `${path}.cornerRadiusPx`, `cornerRadiusPx must be between 0 and ${P17_STATIC_WEB_MAX_RADIUS_PX}px.`);
    }
    if (!Array.isArray(value.children)) {
      pushIssue(state, 'P17_CHILDREN_INVALID', `${path}.children`, 'Container children must be an array.');
      return;
    }
    for (let index = 0; index < value.children.length; index += 1) {
      validateNode(value.children[index], `${path}.children[${index}]`, depth + 1, state);
      if (state.nodeLimitReported || state.textBudgetReported) break;
    }
    return;
  }

  if (kind === 'heading') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'level', 'text', 'align'], path, state, 'P17_NODE_KEYS_UNSUPPORTED');
    if (![1, 2, 3, 4, 5, 6].includes(Number(value.level))) {
      pushIssue(state, 'P17_HEADING_LEVEL_INVALID', `${path}.level`, 'Heading level must be an integer from 1 through 6.');
    }
    chargeText(value.text, `${path}.text`, state);
    if (value.align !== undefined && !['start', 'center', 'end', 'justify'].includes(String(value.align))) {
      pushIssue(state, 'P17_ALIGNMENT_INVALID', `${path}.align`, 'Heading alignment is unsupported.');
    }
    return;
  }

  if (kind === 'text') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'tag', 'text', 'align'], path, state, 'P17_NODE_KEYS_UNSUPPORTED');
    if (value.tag !== 'p' && value.tag !== 'span') {
      pushIssue(state, 'P17_TEXT_TAG_INVALID', `${path}.tag`, 'Text tag must be p or span.');
    }
    chargeText(value.text, `${path}.text`, state, P17_STATIC_WEB_MAX_TEXT_LENGTH, true);
    if (value.align !== undefined && !['start', 'center', 'end', 'justify'].includes(String(value.align))) {
      pushIssue(state, 'P17_ALIGNMENT_INVALID', `${path}.align`, 'Text alignment is unsupported.');
    }
    return;
  }

  if (kind === 'link') {
    validateExactKeys(
      value,
      ['kind', 'sourceNodeId', 'role', 'text', 'href', 'openInNewTab', 'nofollow', 'align'],
      path,
      state,
      'P17_NODE_KEYS_UNSUPPORTED',
    );
    if (value.role !== 'link' && value.role !== 'button') {
      pushIssue(state, 'P17_LINK_ROLE_INVALID', `${path}.role`, 'Link role must be link or button.');
    }
    chargeText(value.text, `${path}.text`, state, 2_000);
    if (!validLinkHref(value.href)) {
      pushIssue(state, 'P17_URL_INVALID', `${path}.href`, 'href must be bounded http(s), mailto, tel, root-relative or fragment URL.');
    }
    validateOptionalBoolean(value, 'openInNewTab', path, state);
    validateOptionalBoolean(value, 'nofollow', path, state);
    if (value.align !== undefined && !['start', 'center', 'end'].includes(String(value.align))) {
      pushIssue(state, 'P17_ALIGNMENT_INVALID', `${path}.align`, 'Link alignment must be start, center or end.');
    }
    return;
  }

  if (kind === 'image') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'assetPath', 'alt', 'width', 'height'], path, state, 'P17_NODE_KEYS_UNSUPPORTED');
    if (!validLocalAssetPath(value.assetPath)) {
      pushIssue(
        state,
        'P17_ASSET_PATH_INVALID',
        `${path}.assetPath`,
        'Image assetPath must be a bounded local assets/... path without traversal, URL syntax or percent encoding.',
      );
    }
    chargeText(value.alt, `${path}.alt`, state, 2_000, true);
    if (value.width !== undefined && !validDimension(value.width)) {
      pushIssue(state, 'P17_DIMENSION_INVALID', `${path}.width`, 'Image width must be a positive safe integer up to 100000.');
    }
    if (value.height !== undefined && !validDimension(value.height)) {
      pushIssue(state, 'P17_DIMENSION_INVALID', `${path}.height`, 'Image height must be a positive safe integer up to 100000.');
    }
    return;
  }

  if (kind === 'review') {
    state.reviewNodeCount += 1;
    validateExactKeys(value, ['kind', 'sourceNodeId', 'reasonCode', 'detail'], path, state, 'P17_NODE_KEYS_UNSUPPORTED');
    if (!boundedString(value.reasonCode, 128) || !/^[A-Z0-9_:-]+$/.test(String(value.reasonCode))) {
      pushIssue(state, 'P17_REVIEW_REASON_INVALID', `${path}.reasonCode`, 'reasonCode must be a bounded uppercase identifier.');
    }
    chargeText(value.detail, `${path}.detail`, state, 2_000);
    return;
  }

  pushIssue(state, 'P17_NODE_KIND_UNSUPPORTED', `${path}.kind`, 'Web export node kind is unsupported.');
}

export function validateP17StaticWebDocument(value: unknown): P17StaticWebValidationResult {
  const state: ValidationState = {
    issues: [],
    sourceIds: new Set<string>(),
    nodeCount: 0,
    reviewNodeCount: 0,
    textBytes: 0,
    nodeLimitReported: false,
    textBudgetReported: false,
  };

  if (!isRecord(value)) {
    pushIssue(state, 'P17_DOCUMENT_NOT_OBJECT', '$', 'Static web export document must be an object.');
  } else {
    validateExactKeys(
      value,
      ['schemaVersion', 'contractVersion', 'title', 'language', 'nodes'],
      '$',
      state,
      'P17_DOCUMENT_KEYS_UNSUPPORTED',
    );
    if (value.schemaVersion !== 1) {
      pushIssue(state, 'P17_SCHEMA_UNSUPPORTED', '$.schemaVersion', 'schemaVersion must be 1.');
    }
    if (value.contractVersion !== P17_STATIC_WEB_CONTRACT_VERSION) {
      pushIssue(state, 'P17_CONTRACT_UNSUPPORTED', '$.contractVersion', `contractVersion must be ${P17_STATIC_WEB_CONTRACT_VERSION}.`);
    }
    if (!boundedString(value.title, 512)) {
      pushIssue(state, 'P17_TITLE_INVALID', '$.title', 'title must be a non-empty string up to 512 characters.');
    } else {
      chargeText(value.title, '$.title', state, 512);
    }
    if (!validLanguage(value.language)) {
      pushIssue(state, 'P17_LANGUAGE_INVALID', '$.language', 'language must be a bounded BCP-47-like language tag.');
    }
    if (!Array.isArray(value.nodes)) {
      pushIssue(state, 'P17_NODES_INVALID', '$.nodes', 'nodes must be an array.');
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cssAlign(value: P17StaticWebCrossAlignment | P17StaticWebJustification): string {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

function canonicalPadding(value: P17StaticWebPaddingPx): Record<string, unknown> {
  return {
    top: value.top,
    right: value.right,
    bottom: value.bottom,
    left: value.left,
  };
}

function canonicalNode(node: P17StaticWebNode): Record<string, unknown> {
  if (node.kind === 'container') {
    const result: Record<string, unknown> = {
      kind: node.kind,
      sourceNodeId: node.sourceNodeId,
      tag: node.tag,
      direction: node.direction,
    };
    if (node.gapPx !== undefined) result.gapPx = node.gapPx;
    if (node.paddingPx !== undefined) result.paddingPx = canonicalPadding(node.paddingPx);
    if (node.alignItems !== undefined) result.alignItems = node.alignItems;
    if (node.justifyContent !== undefined) result.justifyContent = node.justifyContent;
    if (node.backgroundColorHex !== undefined) result.backgroundColorHex = node.backgroundColorHex;
    if (node.cornerRadiusPx !== undefined) result.cornerRadiusPx = node.cornerRadiusPx;
    result.children = node.children.map(canonicalNode);
    return result;
  }

  if (node.kind === 'heading') {
    const result: Record<string, unknown> = {
      kind: node.kind,
      sourceNodeId: node.sourceNodeId,
      level: node.level,
      text: node.text,
    };
    if (node.align !== undefined) result.align = node.align;
    return result;
  }

  if (node.kind === 'text') {
    const result: Record<string, unknown> = {
      kind: node.kind,
      sourceNodeId: node.sourceNodeId,
      tag: node.tag,
      text: node.text,
    };
    if (node.align !== undefined) result.align = node.align;
    return result;
  }

  if (node.kind === 'link') {
    const result: Record<string, unknown> = {
      kind: node.kind,
      sourceNodeId: node.sourceNodeId,
      role: node.role,
      text: node.text,
      href: node.href,
    };
    if (node.openInNewTab !== undefined) result.openInNewTab = node.openInNewTab;
    if (node.nofollow !== undefined) result.nofollow = node.nofollow;
    if (node.align !== undefined) result.align = node.align;
    return result;
  }

  if (node.kind === 'image') {
    const result: Record<string, unknown> = {
      kind: node.kind,
      sourceNodeId: node.sourceNodeId,
      assetPath: node.assetPath,
      alt: node.alt,
    };
    if (node.width !== undefined) result.width = node.width;
    if (node.height !== undefined) result.height = node.height;
    return result;
  }

  return {
    kind: node.kind,
    sourceNodeId: node.sourceNodeId,
    reasonCode: node.reasonCode,
    detail: node.detail,
  };
}

function canonicalDocument(document: P17StaticWebDocumentV1): string {
  return JSON.stringify({
    schemaVersion: document.schemaVersion,
    contractVersion: document.contractVersion,
    title: document.title,
    language: document.language,
    nodes: document.nodes.map(canonicalNode),
  });
}

function className(state: RenderState): string {
  state.nodeIndex += 1;
  return `wpb-node-${state.nodeIndex}`;
}

function addRule(state: RenderState, classToken: string, declarations: string[]): void {
  if (declarations.length === 0) return;
  state.cssRules.push(`.${classToken}{${declarations.join('')}}`);
}

function renderNode(node: P17StaticWebNode, state: RenderState): string {
  const classToken = className(state);

  if (node.kind === 'container') {
    const declarations = [
      'display:flex;',
      `flex-direction:${node.direction};`,
    ];
    if (node.gapPx !== undefined) declarations.push(`gap:${node.gapPx}px;`);
    if (node.paddingPx !== undefined) {
      declarations.push(
        `padding:${node.paddingPx.top}px ${node.paddingPx.right}px ${node.paddingPx.bottom}px ${node.paddingPx.left}px;`,
      );
    }
    if (node.alignItems !== undefined) declarations.push(`align-items:${cssAlign(node.alignItems)};`);
    if (node.justifyContent !== undefined) declarations.push(`justify-content:${cssAlign(node.justifyContent)};`);
    if (node.backgroundColorHex !== undefined) declarations.push(`background-color:${node.backgroundColorHex};`);
    if (node.cornerRadiusPx !== undefined) declarations.push(`border-radius:${node.cornerRadiusPx}px;`);
    addRule(state, classToken, declarations);
    return `<${node.tag} class="${classToken}">${node.children.map((child) => renderNode(child, state)).join('')}</${node.tag}>`;
  }

  if (node.kind === 'heading') {
    const declarations: string[] = [];
    if (node.align !== undefined) declarations.push(`text-align:${node.align};`);
    addRule(state, classToken, declarations);
    return `<h${node.level} class="${classToken}">${escapeHtml(node.text)}</h${node.level}>`;
  }

  if (node.kind === 'text') {
    const declarations: string[] = [];
    if (node.align !== undefined) declarations.push(`text-align:${node.align};`);
    addRule(state, classToken, declarations);
    return `<${node.tag} class="${classToken}">${escapeHtml(node.text)}</${node.tag}>`;
  }

  if (node.kind === 'link') {
    const declarations: string[] = [];
    if (node.align !== undefined) declarations.push(`text-align:${node.align};`);
    if (node.role === 'button') {
      declarations.push('display:inline-flex;', 'align-items:center;', 'justify-content:center;');
    }
    addRule(state, classToken, declarations);

    const attributes = [
      `class="${classToken}${node.role === 'button' ? ' wpb-button' : ''}"`,
      `href="${escapeHtml(node.href)}"`,
    ];
    const rel = new Set<string>();
    if (node.openInNewTab) {
      attributes.push('target="_blank"');
      rel.add('noopener');
      rel.add('noreferrer');
    }
    if (node.nofollow) rel.add('nofollow');
    if (rel.size > 0) attributes.push(`rel="${[...rel].join(' ')}"`);

    return `<a ${attributes.join(' ')}>${escapeHtml(node.text)}</a>`;
  }

  if (node.kind === 'image') {
    addRule(state, classToken, []);
    const attributes = [
      `class="${classToken}"`,
      `src="./${escapeHtml(node.assetPath)}"`,
      `alt="${escapeHtml(node.alt)}"`,
    ];
    if (node.width !== undefined) attributes.push(`width="${node.width}"`);
    if (node.height !== undefined) attributes.push(`height="${node.height}"`);
    return `<img ${attributes.join(' ')}>`;
  }

  state.reviewIssues.push({
    sourceNodeId: node.sourceNodeId,
    reasonCode: node.reasonCode,
    detail: node.detail,
  });
  addRule(state, classToken, ['padding:12px;', 'border:1px dashed currentColor;']);
  return `<div class="${classToken} wpb-review" data-wpb-review="${escapeHtml(node.reasonCode)}">Review required: ${escapeHtml(node.detail)}</div>`;
}

function emptyReceipt(): P17StaticWebPackageReceipt {
  return {
    sourceSha256: null,
    htmlSha256: null,
    cssSha256: null,
    packageSha256: null,
  };
}

export function buildP17StaticWebPackage(value: unknown): P17StaticWebPackage {
  const validation = validateP17StaticWebDocument(value);
  if (!validation.valid) {
    return {
      contractVersion: P17_STATIC_WEB_CONTRACT_VERSION,
      status: 'REJECTED_INVALID_INPUT',
      validation,
      reviewIssues: [],
      html: null,
      css: null,
      javascript: null,
      javascriptExecution: false,
      networkAccessRequired: false,
      browserValidationStatus: 'NOT_RUN',
      reconstructionStatus: 'NOT_RUN',
      productionAcceptance: false,
      receipt: emptyReceipt(),
    };
  }

  const document = value as P17StaticWebDocumentV1;
  const renderState: RenderState = {
    nodeIndex: 0,
    cssRules: [],
    reviewIssues: [],
  };

  const body = document.nodes.map((node) => renderNode(node, renderState)).join('');
  const html = [
    '<!doctype html>',
    `<html lang="${escapeHtml(document.language)}">`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${escapeHtml(document.title)}</title>`,
    '<link rel="stylesheet" href="./styles.css">',
    '</head>',
    `<body>${body}</body>`,
    '</html>',
    '',
  ].join('\n');

  const css = [
    '*,*::before,*::after{box-sizing:border-box;}',
    'html,body{margin:0;padding:0;}',
    'img{display:block;max-width:100%;height:auto;}',
    '.wpb-button{text-decoration:none;}',
    '.wpb-review{font:inherit;}',
    ...renderState.cssRules,
    '',
  ].join('\n');

  if (utf8ByteLength(html) > P17_STATIC_WEB_MAX_OUTPUT_BYTES
    || utf8ByteLength(css) > P17_STATIC_WEB_MAX_OUTPUT_BYTES) {
    throw new Error(`P17 static web output exceeds ${P17_STATIC_WEB_MAX_OUTPUT_BYTES} UTF-8 bytes.`);
  }

  const sourceSha256 = sha256Hex(canonicalDocument(document));
  const htmlSha256 = sha256Hex(html);
  const cssSha256 = sha256Hex(css);
  const packageSha256 = sha256Hex([
    P17_STATIC_WEB_CONTRACT_VERSION,
    sourceSha256,
    htmlSha256,
    cssSha256,
    ...renderState.reviewIssues.map((issue) => `${issue.sourceNodeId}:${issue.reasonCode}`),
  ].join('\n'));

  return {
    contractVersion: P17_STATIC_WEB_CONTRACT_VERSION,
    status: renderState.reviewIssues.length > 0 ? 'REVIEW_REQUIRED' : 'READY_FOR_BROWSER_VALIDATION',
    validation,
    reviewIssues: renderState.reviewIssues,
    html,
    css,
    javascript: null,
    javascriptExecution: false,
    networkAccessRequired: false,
    browserValidationStatus: 'NOT_RUN',
    reconstructionStatus: 'NOT_RUN',
    productionAcceptance: false,
    receipt: {
      sourceSha256,
      htmlSha256,
      cssSha256,
      packageSha256,
    },
  };
}
