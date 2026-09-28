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
} from '../web/neutral-web-ir';

export const P18_REACT_ADAPTER_ID = 'react-web' as const;
export const P18_REACT_ADAPTER_VERSION = 1 as const;

export interface P18ReactProfile {
  language: 'typescript';
  styling: 'plain-css';
  scope: 'COMPONENT' | 'PAGE';
  componentName: string;
  availableAssetPaths: readonly string[];
}
export interface P18ReactDiagnostic {
  code: 'INVALID_IR' | 'IR_DIRECTION_UNSUPPORTED' | 'REVIEW_NODE_PRESENT' | 'ASSET_BYTES_UNVERIFIED' | 'COMPONENT_NAME_INVALID';
  nodeId?: string;
  detail: string;
  severity: 'BLOCKED' | 'REVIEW';
}
export interface P18ReactAnalysis {
  status: 'READY' | 'READY_WITH_REVIEW' | 'BLOCKED';
  irSha256: string | null;
  diagnostics: P18ReactDiagnostic[];
  nodeCount: number;
  reviewNodeCount: number;
  assetPaths: string[];
}
export interface P18ReactFile { path: string; content: string; sha256: string; }
export interface P18ReactArtifact {
  status: P18ReactAnalysis['status'];
  analysis: P18ReactAnalysis;
  files: P18ReactFile[];
  receipt: { adapterId: typeof P18_REACT_ADAPTER_ID; adapterVersion: 1; irSha256: string | null; filesSha256: string | null; buildValidation: 'NOT_RUN'; previewValidation: 'NOT_RUN'; visualComparison: 'NOT_RUN'; productionAcceptance: false };
}

export function reactWebDescriptor() {
  return {
    schemaVersion: 1,
    adapterId: P18_REACT_ADAPTER_ID,
    adapterVersion: P18_REACT_ADAPTER_VERSION,
    framework: { name: 'react', compatibility: 'declared-at-build-time' },
    runtime: { rendering: 'client-root', routing: 'NONE', interactions: 'NONE', network: false },
    languages: ['typescript'] as const,
    styling: ['plain-css'] as const,
    source: { irVersion: P17_NEUTRAL_WEB_IR_VERSION, direction: 'DESIGN_TO_WEB' as const },
  };
}

function validName(value: string): boolean { return /^[A-Z][A-Za-z0-9]{0,63}$/.test(value); }
function escapeJsx(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\\/g, '\\\\');
}
function css(style: P17NeutralWebStyle | undefined): string[] {
  if (!style) return [];
  const d: string[] = [];
  if (style.paddingPx) d.push('padding:' + style.paddingPx.top + 'px ' + style.paddingPx.right + 'px ' + style.paddingPx.bottom + 'px ' + style.paddingPx.left + 'px;');
  if (style.backgroundColorHex) d.push('background-color:' + style.backgroundColorHex + ';');
  if (style.colorHex) d.push('color:' + style.colorHex + ';');
  if (style.cornerRadiusPx !== undefined) d.push('border-radius:' + style.cornerRadiusPx + 'px;');
  if (style.textAlign) d.push('text-align:' + style.textAlign + ';');
  return d;
}
function layout(layout: P17NeutralWebLayout): string[] {
  if (layout.mode === 'flow') return ['display:block;'];
  if (layout.mode === 'flex') {
    const d = ['display:flex;', 'flex-direction:' + layout.direction + ';'];
    if (layout.gapPx !== undefined) d.push('gap:' + layout.gapPx + 'px;');
    if (layout.alignItems) d.push('align-items:' + (layout.alignItems === 'start' ? 'flex-start' : layout.alignItems === 'end' ? 'flex-end' : layout.alignItems) + ';');
    if (layout.justifyContent) d.push('justify-content:' + (layout.justifyContent === 'start' ? 'flex-start' : layout.justifyContent === 'end' ? 'flex-end' : layout.justifyContent) + ';');
    if (layout.wrap !== undefined) d.push('flex-wrap:' + (layout.wrap ? 'wrap' : 'nowrap') + ';');
    return d;
  }
  const d = ['display:grid;', 'grid-template-columns:repeat(' + layout.columns + ',minmax(0,1fr));'];
  if (layout.gapPx !== undefined) d.push('gap:' + layout.gapPx + 'px;');
  return d;
}
interface RenderState { index: number; css: string[]; }
function render(node: P17NeutralWebNode, state: RenderState): string {
  const token = 'wpb-react-node-' + state.index++;
  const source = ' data-wpb-source="' + escapeJsx(node.provenance.sourceRef) + '"';
  if (node.kind === 'container') {
    state.css.push('.' + token + '{' + layout(node.layout).concat(css(node.style)).join('') + '}');
    return '<' + node.semanticTag + ' className="' + token + '"' + source + '>' + node.children.map((child) => render(child, state)).join('') + '</' + node.semanticTag + '>';
  }
  if (node.kind === 'text') {
    state.css.push('.' + token + '{' + css(node.style).join('') + '}');
    const tag = node.semantic === 'heading' ? 'h' + node.headingLevel : node.semantic === 'paragraph' ? 'p' : 'span';
    return '<' + tag + ' className="' + token + '"' + source + '>' + escapeJsx(node.text) + '</' + tag + '>';
  }
  if (node.kind === 'link') {
    state.css.push('.' + token + '{' + css(node.style).join('') + '}');
    const rel = node.openInNewTab ? ' rel="noopener noreferrer"' : node.nofollow ? ' rel="nofollow"' : '';
    const target = node.openInNewTab ? ' target="_blank"' : '';
    return '<a className="' + token + '" href="' + escapeJsx(node.href) + '"' + target + rel + source + '>' + escapeJsx(node.text) + '</a>';
  }
  if (node.kind === 'image') {
    state.css.push('.' + token + '{' + css(node.style).join('') + '}');
    const dimensions = node.widthPx !== undefined && node.heightPx !== undefined ? ' width={' + node.widthPx + '} height={' + node.heightPx + '}' : '';
    return '<img className="' + token + '" src="./' + escapeJsx(node.assetPath) + '" alt="' + escapeJsx(node.alt) + '"' + dimensions + source + ' />';
  }
  state.css.push('.' + token + '{padding:12px;border:1px dashed currentColor;}');
  return '<div className="' + token + ' wpb-review"' + source + '>Review required: ' + escapeJsx(node.detail) + '</div>';
}

export function analyzeReactWeb(value: unknown, profile: P18ReactProfile): P18ReactAnalysis {
  const diagnostics: P18ReactDiagnostic[] = [];
  const validation = validateP17NeutralWebDocument(value);
  if (!validation.valid) diagnostics.push({ code: 'INVALID_IR', detail: validation.issues.map((issue) => issue.path + ': ' + issue.message).join(' '), severity: 'BLOCKED' });
  if (!validName(profile.componentName)) diagnostics.push({ code: 'COMPONENT_NAME_INVALID', detail: 'componentName must be a PascalCase identifier up to 64 characters.', severity: 'BLOCKED' });
  let irSha256: string | null = null;
  let reviewNodeCount = 0;
  const assetPaths = new Set<string>();
  if (validation.valid && typeof value === 'object' && value !== null) {
    const document = value as P17NeutralWebDocumentV1;
    if (document.direction !== 'DESIGN_TO_WEB') diagnostics.push({ code: 'IR_DIRECTION_UNSUPPORTED', detail: 'The React output slice accepts DESIGN_TO_WEB only.', severity: 'BLOCKED' });
    irSha256 = identifyP17NeutralWebDocument(document).sha256;
    const walk = (node: P17NeutralWebNode): void => {
      if (node.kind === 'review') {
        reviewNodeCount += 1;
        diagnostics.push({ code: 'REVIEW_NODE_PRESENT', nodeId: node.nodeId, detail: node.detail, severity: 'REVIEW' });
      }
      if (node.kind === 'image') assetPaths.add(node.assetPath);
      if (node.kind === 'container') node.children.forEach(walk);
    };
    document.nodes.forEach(walk);
    for (const path of assetPaths) if (!profile.availableAssetPaths.includes(path)) diagnostics.push({ code: 'ASSET_BYTES_UNVERIFIED', detail: 'Asset bytes are not verified for ' + path + '.', severity: 'BLOCKED' });
  }
  const blocked = diagnostics.some((item) => item.severity === 'BLOCKED');
  return { status: blocked ? 'BLOCKED' : diagnostics.some((item) => item.severity === 'REVIEW') ? 'READY_WITH_REVIEW' : 'READY', irSha256, diagnostics, nodeCount: validation.nodeCount, reviewNodeCount, assetPaths: Array.from(assetPaths).sort() };
}

export function generateReactWebArtifact(value: unknown, profile: P18ReactProfile): P18ReactArtifact {
  const analysis = analyzeReactWeb(value, profile);
  const receipt = (filesSha256: string | null) => ({ adapterId: P18_REACT_ADAPTER_ID, adapterVersion: 1 as const, irSha256: analysis.irSha256, filesSha256, buildValidation: 'NOT_RUN' as const, previewValidation: 'NOT_RUN' as const, visualComparison: 'NOT_RUN' as const, productionAcceptance: false as const });
  if (analysis.status === 'BLOCKED' || !analysis.irSha256) return { status: analysis.status, analysis, files: [], receipt: receipt(null) };
  const document = JSON.parse(serializeP17NeutralWebDocument(value as P17NeutralWebDocumentV1)) as P17NeutralWebDocumentV1;
  const state: RenderState = { index: 1, css: [] };
  const body = document.nodes.map((node) => render(node, state)).join('');
  const tsx = "import './" + profile.componentName + ".css';\n\nexport default function " + profile.componentName + "() {\n  return (\n    <>" + body + "</>\n  );\n}\n";
  const cssFile = "/* " + P18_REACT_ADAPTER_ID + "@" + P18_REACT_ADAPTER_VERSION + " — source " + analysis.irSha256 + " */\n" + state.css.join('\n') + '\n';
  const files = [{ path: profile.componentName + '.tsx', content: tsx }, { path: profile.componentName + '.css', content: cssFile }].map((file) => ({ ...file, sha256: sha256Hex(file.content) }));
  const filesSha256 = sha256Hex(files.map((file) => file.path + ':' + file.sha256).join('\n'));
  return { status: analysis.status, analysis, files, receipt: receipt(filesSha256) };
}

export function validateReactWebArtifact(artifact: P18ReactArtifact): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (artifact.status === 'BLOCKED') issues.push('Blocked artifacts cannot validate as ready.');
  if (artifact.files.length !== 2 && artifact.status !== 'BLOCKED') issues.push('Expected exactly TSX and CSS files.');
  for (const file of artifact.files) {
    if (!file.path.endsWith('.tsx') && !file.path.endsWith('.css')) issues.push('Unsupported generated file: ' + file.path);
    if (file.content.includes('<script') || file.content.includes('dangerouslySetInnerHTML') || /(?:src|href)=["'](?:https?:|\\/\\/)/.test(file.content) && /src=["'](?:https?:|\\/\\/)/.test(file.content)) issues.push('Unsafe remote resource in ' + file.path);
    if (sha256Hex(file.content) !== file.sha256) issues.push('Hash mismatch in ' + file.path);
  }
  return { valid: issues.length === 0, issues };
}
