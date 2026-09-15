export const P15_NEUTRAL_EXPORT_IR_VERSION = 'p15-neutral-export-ir-v1' as const;
export const P15_NEUTRAL_EXPORT_MAX_NODES = 10_000;
export const P15_NEUTRAL_EXPORT_MAX_DEPTH = 64;
export const P15_NEUTRAL_EXPORT_MAX_TEXT_LENGTH = 20_000;
export const P15_NEUTRAL_EXPORT_MAX_URL_LENGTH = 4_096;
export const P15_NEUTRAL_EXPORT_MAX_SPACING_PX = 4_096;

export type P15NeutralDocumentType = 'page' | 'section';
export type P15NeutralDirection = 'row' | 'column';
export type P15NeutralAlignment = 'start' | 'center' | 'end';
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

export interface P15NeutralContainerNode extends P15NeutralNodeBase {
  kind: 'container';
  direction: P15NeutralDirection;
  gapPx?: number;
  paddingPx?: P15NeutralPaddingPx;
  alignItems?: P15NeutralCrossAlignment;
  justifyContent?: P15NeutralJustification;
  children: P15NeutralExportNode[];
}

export interface P15NeutralHeadingNode extends P15NeutralNodeBase {
  kind: 'heading';
  text: string;
  level: P15NeutralHeadingLevel;
  align?: P15NeutralAlignment;
}

export interface P15NeutralButtonNode extends P15NeutralNodeBase {
  kind: 'button';
  text: string;
  url?: string;
  openInNewTab?: boolean;
  nofollow?: boolean;
  align?: P15NeutralAlignment;
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

export type P15NeutralExportNode =
  | P15NeutralContainerNode
  | P15NeutralHeadingNode
  | P15NeutralButtonNode
  | P15NeutralImageNode
  | P15NeutralReviewNode;

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
  | 'P15_IR_ALIGNMENT_INVALID'
  | 'P15_IR_TEXT_INVALID'
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

function validAbsoluteUrl(value: string, allowedProtocols: readonly string[]): boolean {
  if (value.length === 0 || value.length > P15_NEUTRAL_EXPORT_MAX_URL_LENGTH) return false;
  try {
    const parsed = new URL(value);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

function validButtonUrl(value: string): boolean {
  if (value.length === 0 || value.length > P15_NEUTRAL_EXPORT_MAX_URL_LENGTH) return false;
  if (value.startsWith('/') || value.startsWith('#')) return !/[\u0000-\u001f\u007f]/.test(value);
  return validAbsoluteUrl(value, ['https:', 'http:', 'mailto:', 'tel:']);
}

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
    validateExactKeys(value, ['kind', 'sourceNodeId', 'direction', 'gapPx', 'paddingPx', 'alignItems', 'justifyContent', 'children'], path, state);
    if (value.direction !== 'row' && value.direction !== 'column') {
      pushIssue(state, 'P15_IR_CONTAINER_DIRECTION_INVALID', `${path}.direction`, 'Container direction must be row or column.');
    }
    if (value.gapPx !== undefined && !validSpacing(value.gapPx)) {
      pushIssue(state, 'P15_IR_SPACING_INVALID', `${path}.gapPx`, `gapPx must be between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}.`);
    }
    if (value.paddingPx !== undefined) validatePadding(value.paddingPx, `${path}.paddingPx`, state);
    if (value.alignItems !== undefined && !['start', 'center', 'end', 'stretch'].includes(String(value.alignItems))) {
      pushIssue(state, 'P15_IR_ALIGNMENT_INVALID', `${path}.alignItems`, 'alignItems is outside the bounded neutral alignment vocabulary.');
    }
    if (value.justifyContent !== undefined && !['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'].includes(String(value.justifyContent))) {
      pushIssue(state, 'P15_IR_ALIGNMENT_INVALID', `${path}.justifyContent`, 'justifyContent is outside the bounded neutral justification vocabulary.');
    }
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
    validateExactKeys(value, ['kind', 'sourceNodeId', 'text', 'level', 'align'], path, state);
    validateText(value.text, `${path}.text`, state);
    if (!['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'].includes(String(value.level))) {
      pushIssue(state, 'P15_IR_HEADING_LEVEL_INVALID', `${path}.level`, 'Heading level is outside the bounded Elementor heading vocabulary.');
    }
    if (value.align !== undefined && !['start', 'center', 'end'].includes(String(value.align))) {
      pushIssue(state, 'P15_IR_ALIGNMENT_INVALID', `${path}.align`, 'Heading alignment must be start, center or end.');
    }
    return;
  }

  if (kind === 'button') {
    validateExactKeys(value, ['kind', 'sourceNodeId', 'text', 'url', 'openInNewTab', 'nofollow', 'align'], path, state);
    validateText(value.text, `${path}.text`, state, 2_000);
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
