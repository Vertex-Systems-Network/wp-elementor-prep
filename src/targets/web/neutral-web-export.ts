import { sha256Hex } from '../../core/sha256';
import {
  P17_NEUTRAL_WEB_IR_VERSION,
  identifyP17NeutralWebDocument,
  serializeP17NeutralWebDocument,
  validateP17NeutralWebDocument,
  type P17NeutralWebDocumentV1,
  type P17NeutralWebLayout,
  type P17NeutralWebNode,
  type P17NeutralWebStyle,
  type P17NeutralWebValidationResult,
} from './neutral-web-ir';

export const P17_NEUTRAL_WEB_EXPORT_VERSION = 'p17-neutral-web-static-export-v1' as const;
export const P17_NEUTRAL_WEB_EXPORT_MAX_OUTPUT_BYTES = 4_194_304;

export interface P17NeutralWebExportReviewIssue {
  nodeId: string;
  reasonCode: string;
  detail: string;
}

export interface P17NeutralWebExportReceipt {
  irVersion: typeof P17_NEUTRAL_WEB_IR_VERSION;
  irSha256: string | null;
  htmlSha256: string | null;
  cssSha256: string | null;
  packageSha256: string | null;
}

export interface P17NeutralWebExportPackage {
  exportVersion: typeof P17_NEUTRAL_WEB_EXPORT_VERSION;
  status:
    | 'READY_FOR_BROWSER_VALIDATION'
    | 'REVIEW_REQUIRED'
    | 'REJECTED_INVALID_IR'
    | 'REJECTED_UNSTABLE_INPUT'
    | 'REJECTED_OUTPUT_LIMIT';
  validation: P17NeutralWebValidationResult;
  reviewIssues: P17NeutralWebExportReviewIssue[];
  html: string | null;
  css: string | null;
  javascript: null;
  javascriptExecution: false;
  networkAccessRequired: false;
  browserValidationStatus: 'NOT_RUN';
  productionAcceptance: false;
  receipt: P17NeutralWebExportReceipt;
}

interface RenderState {
  nodeIndex: number;
  cssRules: string[];
  reviewIssues: P17NeutralWebExportReviewIssue[];
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function emptyReceipt(): P17NeutralWebExportReceipt {
  return {
    irVersion: P17_NEUTRAL_WEB_IR_VERSION,
    irSha256: null,
    htmlSha256: null,
    cssSha256: null,
    packageSha256: null,
  };
}

function rejected(
  status: 'REJECTED_INVALID_IR' | 'REJECTED_UNSTABLE_INPUT',
  validation: P17NeutralWebValidationResult,
): P17NeutralWebExportPackage {
  return {
    exportVersion: P17_NEUTRAL_WEB_EXPORT_VERSION,
    status,
    validation,
    reviewIssues: [],
    html: null,
    css: null,
    javascript: null,
    javascriptExecution: false,
    networkAccessRequired: false,
    browserValidationStatus: 'NOT_RUN',
    productionAcceptance: false,
    receipt: emptyReceipt(),
  };
}

function className(state: RenderState): string {
  state.nodeIndex += 1;
  return `wpb-ir-node-${state.nodeIndex}`;
}

function addRule(state: RenderState, classToken: string, declarations: string[]): void {
  if (declarations.length === 0) return;
  state.cssRules.push(`.${classToken}{${declarations.join('')}}`);
}

function flexAlignment(value: string): string {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

function styleDeclarations(style: P17NeutralWebStyle | undefined): string[] {
  if (!style) return [];
  const declarations: string[] = [];
  if (style.paddingPx !== undefined) {
    declarations.push(
      `padding:${style.paddingPx.top}px ${style.paddingPx.right}px ${style.paddingPx.bottom}px ${style.paddingPx.left}px;`,
    );
  }
  if (style.backgroundColorHex !== undefined) {
    declarations.push(`background-color:${style.backgroundColorHex};`);
  }
  if (style.colorHex !== undefined) {
    declarations.push(`color:${style.colorHex};`);
  }
  if (style.cornerRadiusPx !== undefined) {
    declarations.push(`border-radius:${style.cornerRadiusPx}px;`);
  }
  if (style.textAlign !== undefined) {
    declarations.push(`text-align:${style.textAlign};`);
  }
  return declarations;
}

function layoutDeclarations(layout: P17NeutralWebLayout): string[] {
  if (layout.mode === 'flow') {
    return ['display:block;'];
  }

  if (layout.mode === 'flex') {
    const declarations = [
      'display:flex;',
      `flex-direction:${layout.direction};`,
    ];
    if (layout.gapPx !== undefined) declarations.push(`gap:${layout.gapPx}px;`);
    if (layout.alignItems !== undefined) declarations.push(`align-items:${flexAlignment(layout.alignItems)};`);
    if (layout.justifyContent !== undefined) {
      declarations.push(`justify-content:${flexAlignment(layout.justifyContent)};`);
    }
    if (layout.wrap !== undefined) declarations.push(`flex-wrap:${layout.wrap ? 'wrap' : 'nowrap'};`);
    return declarations;
  }

  const declarations = [
    'display:grid;',
    `grid-template-columns:repeat(${layout.columns},minmax(0,1fr));`,
  ];
  if (layout.gapPx !== undefined) declarations.push(`gap:${layout.gapPx}px;`);
  return declarations;
}

function renderNode(node: P17NeutralWebNode, state: RenderState): string {
  const classToken = className(state);

  if (node.kind === 'container') {
    addRule(state, classToken, [
      ...layoutDeclarations(node.layout),
      ...styleDeclarations(node.style),
    ]);
    const children = node.children.map((child) => renderNode(child, state)).join('');
    return `<${node.semanticTag} class="${classToken}">${children}</${node.semanticTag}>`;
  }

  if (node.kind === 'text') {
    addRule(state, classToken, styleDeclarations(node.style));
    const tag = node.semantic === 'heading'
      ? `h${node.headingLevel}`
      : node.semantic === 'paragraph'
        ? 'p'
        : 'span';
    return `<${tag} class="${classToken}">${escapeHtml(node.text)}</${tag}>`;
  }

  if (node.kind === 'link') {
    const declarations = styleDeclarations(node.style);
    if (node.role === 'button') {
      declarations.push('display:inline-flex;', 'align-items:center;', 'justify-content:center;');
    }
    addRule(state, classToken, declarations);

    const attributes = [
      `class="${classToken}${node.role === 'button' ? ' wpb-ir-button' : ''}"`,
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
    addRule(state, classToken, styleDeclarations(node.style));
    const attributes = [
      `class="${classToken}"`,
      `src="./${escapeHtml(node.assetPath)}"`,
      `alt="${escapeHtml(node.alt)}"`,
    ];
    if (node.widthPx !== undefined) attributes.push(`width="${node.widthPx}"`);
    if (node.heightPx !== undefined) attributes.push(`height="${node.heightPx}"`);
    return `<img ${attributes.join(' ')}>`;
  }

  state.reviewIssues.push({
    nodeId: node.nodeId,
    reasonCode: node.reasonCode,
    detail: node.detail,
  });
  addRule(state, classToken, ['padding:12px;', 'border:1px dashed currentColor;']);
  return `<div class="${classToken} wpb-ir-review" data-wpb-review="${escapeHtml(node.reasonCode)}">Review required: ${escapeHtml(node.detail)}</div>`;
}

export function buildP17NeutralWebExportPackage(value: unknown): P17NeutralWebExportPackage {
  const initialValidation = validateP17NeutralWebDocument(value);
  if (!initialValidation.valid) {
    return rejected('REJECTED_INVALID_IR', initialValidation);
  }

  let document: P17NeutralWebDocumentV1;
  let validation: P17NeutralWebValidationResult;
  try {
    const canonical = serializeP17NeutralWebDocument(value as P17NeutralWebDocumentV1);
    const snapshot = JSON.parse(canonical) as unknown;
    validation = validateP17NeutralWebDocument(snapshot);
    if (!validation.valid) return rejected('REJECTED_UNSTABLE_INPUT', validation);
    document = snapshot as P17NeutralWebDocumentV1;
  } catch {
    return rejected('REJECTED_UNSTABLE_INPUT', initialValidation);
  }

  const identity = identifyP17NeutralWebDocument(document);
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
    '.wpb-ir-button{text-decoration:none;}',
    '.wpb-ir-review{font:inherit;}',
    ...renderState.cssRules,
    '',
  ].join('\n');

  if (utf8ByteLength(html) > P17_NEUTRAL_WEB_EXPORT_MAX_OUTPUT_BYTES
    || utf8ByteLength(css) > P17_NEUTRAL_WEB_EXPORT_MAX_OUTPUT_BYTES) {
    return {
      exportVersion: P17_NEUTRAL_WEB_EXPORT_VERSION,
      status: 'REJECTED_OUTPUT_LIMIT',
      validation,
      reviewIssues: renderState.reviewIssues,
      html: null,
      css: null,
      javascript: null,
      javascriptExecution: false,
      networkAccessRequired: false,
      browserValidationStatus: 'NOT_RUN',
      productionAcceptance: false,
      receipt: {
        ...emptyReceipt(),
        irSha256: identity.sha256,
      },
    };
  }

  const htmlSha256 = sha256Hex(html);
  const cssSha256 = sha256Hex(css);
  const packageSha256 = sha256Hex([
    P17_NEUTRAL_WEB_EXPORT_VERSION,
    identity.irVersion,
    identity.sha256,
    htmlSha256,
    cssSha256,
  ].join('\n'));

  return {
    exportVersion: P17_NEUTRAL_WEB_EXPORT_VERSION,
    status: renderState.reviewIssues.length > 0 ? 'REVIEW_REQUIRED' : 'READY_FOR_BROWSER_VALIDATION',
    validation,
    reviewIssues: renderState.reviewIssues,
    html,
    css,
    javascript: null,
    javascriptExecution: false,
    networkAccessRequired: false,
    browserValidationStatus: 'NOT_RUN',
    productionAcceptance: false,
    receipt: {
      irVersion: identity.irVersion,
      irSha256: identity.sha256,
      htmlSha256,
      cssSha256,
      packageSha256,
    },
  };
}
