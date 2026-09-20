import { sha256Hex } from '../../core/sha256';

export const P17_STATIC_IMPORT_POLICY_VERSION = 'p17-static-import-safety-v1' as const;
export const P17_STATIC_IMPORT_MAX_HTML_BYTES = 1_048_576;
export const P17_STATIC_IMPORT_MAX_CSS_FILE_BYTES = 524_288;
export const P17_STATIC_IMPORT_MAX_CSS_TOTAL_BYTES = 2_097_152;
export const P17_STATIC_IMPORT_MAX_STYLE_FILES = 64;
export const P17_STATIC_IMPORT_MAX_PATH_LENGTH = 256;
export const P17_STATIC_IMPORT_MAX_DIAGNOSTICS = 256;

export interface P17StaticImportTextFile {
  path: string;
  content: string;
}

export interface P17StaticImportSourceV1 {
  schemaVersion: 1;
  policyVersion: typeof P17_STATIC_IMPORT_POLICY_VERSION;
  html: P17StaticImportTextFile;
  styles: P17StaticImportTextFile[];
}

export type P17StaticImportValidationCode =
  | 'P17_IMPORT_SOURCE_NOT_OBJECT'
  | 'P17_IMPORT_SOURCE_KEYS_UNSUPPORTED'
  | 'P17_IMPORT_SCHEMA_UNSUPPORTED'
  | 'P17_IMPORT_POLICY_UNSUPPORTED'
  | 'P17_IMPORT_HTML_INVALID'
  | 'P17_IMPORT_STYLES_INVALID'
  | 'P17_IMPORT_FILE_NOT_OBJECT'
  | 'P17_IMPORT_FILE_KEYS_UNSUPPORTED'
  | 'P17_IMPORT_PATH_INVALID'
  | 'P17_IMPORT_HTML_EXTENSION_INVALID'
  | 'P17_IMPORT_CSS_EXTENSION_INVALID'
  | 'P17_IMPORT_DUPLICATE_PATH'
  | 'P17_IMPORT_STYLE_FILE_LIMIT_EXCEEDED'
  | 'P17_IMPORT_HTML_BYTE_LIMIT_EXCEEDED'
  | 'P17_IMPORT_CSS_FILE_BYTE_LIMIT_EXCEEDED'
  | 'P17_IMPORT_CSS_TOTAL_BYTE_LIMIT_EXCEEDED';

export interface P17StaticImportValidationIssue {
  code: P17StaticImportValidationCode;
  path: string;
  message: string;
}

export type P17StaticImportDiagnosticSeverity = 'BLOCK' | 'REVIEW';

export type P17StaticImportDiagnosticCode =
  | 'P17_IMPORT_SCRIPT_ELEMENT_BLOCKED'
  | 'P17_IMPORT_INLINE_EVENT_HANDLER_BLOCKED'
  | 'P17_IMPORT_EMBEDDED_DOCUMENT_BLOCKED'
  | 'P17_IMPORT_FORM_SURFACE_BLOCKED'
  | 'P17_IMPORT_META_REFRESH_BLOCKED'
  | 'P17_IMPORT_BASE_ELEMENT_BLOCKED'
  | 'P17_IMPORT_MALFORMED_HTML_BLOCKED'
  | 'P17_IMPORT_EXECUTABLE_URL_BLOCKED'
  | 'P17_IMPORT_REMOTE_RESOURCE_BLOCKED'
  | 'P17_IMPORT_CSS_IMPORT_BLOCKED'
  | 'P17_IMPORT_CSS_EXECUTABLE_SURFACE_BLOCKED'
  | 'P17_IMPORT_RESOURCE_TRAVERSAL_BLOCKED'
  | 'P17_IMPORT_DATA_RESOURCE_REVIEW'
  | 'P17_IMPORT_ROOT_RESOURCE_REVIEW'
  | 'P17_IMPORT_LOCAL_RESOURCE_REVIEW'
  | 'P17_IMPORT_DIAGNOSTIC_LIMIT_EXCEEDED';

export interface P17StaticImportDiagnostic {
  code: P17StaticImportDiagnosticCode;
  severity: P17StaticImportDiagnosticSeverity;
  sourcePath: string;
  count: number;
}

export interface P17StaticImportValidationResult {
  valid: boolean;
  htmlBytes: number;
  cssBytes: number;
  styleFileCount: number;
  issues: P17StaticImportValidationIssue[];
}

export interface P17StaticImportReceipt {
  htmlSha256: string | null;
  styleFiles: Array<{
    path: string;
    sha256: string;
  }>;
  sourceSha256: string | null;
}

export interface P17StaticImportSafetyReport {
  policyVersion: typeof P17_STATIC_IMPORT_POLICY_VERSION;
  status: 'CLEAR_FOR_STATIC_PARSER' | 'REVIEW_REQUIRED' | 'BLOCKED' | 'REJECTED_INVALID_INPUT';
  validation: P17StaticImportValidationResult;
  diagnostics: P17StaticImportDiagnostic[];
  parserAcceptance: false;
  sanitizedHtml: null;
  sanitizedCss: null;
  activeRenderAllowed: false;
  javascriptExecutionAllowed: false;
  networkAccessAllowed: false;
  reconstructionAllowed: false;
  productionAcceptance: false;
  receipt: P17StaticImportReceipt;
}

interface ValidationState {
  issues: P17StaticImportValidationIssue[];
  htmlBytes: number;
  cssBytes: number;
  styleFileCount: number;
  paths: Set<string>;
}

interface DiagnosticState {
  counts: Map<string, P17StaticImportDiagnostic>;
  overflow: boolean;
}

interface ResourceAttribute {
  tag: string;
  attribute: string;
  value: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pushValidationIssue(
  state: ValidationState,
  code: P17StaticImportValidationCode,
  path: string,
  message: string,
): void {
  state.issues.push({ code, path, message });
}

function validateExactKeys(
  record: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  state: ValidationState,
  code: 'P17_IMPORT_SOURCE_KEYS_UNSUPPORTED' | 'P17_IMPORT_FILE_KEYS_UNSUPPORTED',
): void {
  const allowedSet = new Set(allowed);
  const unsupported = Object.keys(record).filter((key) => !allowedSet.has(key)).sort();
  if (unsupported.length > 0) {
    pushValidationIssue(state, code, path, `Unsupported keys: ${unsupported.join(', ')}.`);
  }
}

function safeLocalPath(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > P17_STATIC_IMPORT_MAX_PATH_LENGTH) return false;
  if (value.startsWith('/') || value.includes('\\') || value.includes('%') || value.includes('?') || value.includes('#') || value.includes(':')) return false;
  if (!/^[A-Za-z0-9._/-]+$/.test(value)) return false;
  const segments = value.split('/');
  return segments.every((segment) => segment.length > 0 && segment !== '.' && segment !== '..');
}

function validateFile(
  value: unknown,
  path: string,
  expected: 'html' | 'css',
  state: ValidationState,
): P17StaticImportTextFile | null {
  if (!isRecord(value)) {
    pushValidationIssue(state, 'P17_IMPORT_FILE_NOT_OBJECT', path, 'Import source files must be objects.');
    return null;
  }

  validateExactKeys(value, ['path', 'content'], path, state, 'P17_IMPORT_FILE_KEYS_UNSUPPORTED');

  if (!safeLocalPath(value.path)) {
    pushValidationIssue(
      state,
      'P17_IMPORT_PATH_INVALID',
      `${path}.path`,
      'Source path must be a bounded local relative path without traversal, URL syntax or percent encoding.',
    );
  } else {
    const lower = value.path.toLowerCase();
    const validExtension = expected === 'html'
      ? (lower.endsWith('.html') || lower.endsWith('.htm'))
      : lower.endsWith('.css');
    if (!validExtension) {
      pushValidationIssue(
        state,
        expected === 'html' ? 'P17_IMPORT_HTML_EXTENSION_INVALID' : 'P17_IMPORT_CSS_EXTENSION_INVALID',
        `${path}.path`,
        expected === 'html' ? 'HTML entrypoint must end in .html or .htm.' : 'Style source must end in .css.',
      );
    }

    const canonical = value.path.toLowerCase();
    if (state.paths.has(canonical)) {
      pushValidationIssue(
        state,
        'P17_IMPORT_DUPLICATE_PATH',
        `${path}.path`,
        'Source paths must be unique under case-insensitive comparison.',
      );
    } else {
      state.paths.add(canonical);
    }
  }

  if (typeof value.content !== 'string') {
    pushValidationIssue(
      state,
      expected === 'html' ? 'P17_IMPORT_HTML_INVALID' : 'P17_IMPORT_STYLES_INVALID',
      `${path}.content`,
      'Source content must be text.',
    );
    return null;
  }

  const bytes = utf8ByteLength(value.content);
  if (expected === 'html') {
    state.htmlBytes = bytes;
    if (bytes > P17_STATIC_IMPORT_MAX_HTML_BYTES) {
      pushValidationIssue(
        state,
        'P17_IMPORT_HTML_BYTE_LIMIT_EXCEEDED',
        `${path}.content`,
        `HTML input exceeds ${P17_STATIC_IMPORT_MAX_HTML_BYTES} UTF-8 bytes.`,
      );
    }
  } else {
    state.cssBytes += bytes;
    if (bytes > P17_STATIC_IMPORT_MAX_CSS_FILE_BYTES) {
      pushValidationIssue(
        state,
        'P17_IMPORT_CSS_FILE_BYTE_LIMIT_EXCEEDED',
        `${path}.content`,
        `CSS file exceeds ${P17_STATIC_IMPORT_MAX_CSS_FILE_BYTES} UTF-8 bytes.`,
      );
    }
  }

  if (typeof value.path !== 'string') return null;
  return {
    path: value.path,
    content: value.content,
  };
}

export function validateP17StaticImportSource(value: unknown): P17StaticImportValidationResult {
  const state: ValidationState = {
    issues: [],
    htmlBytes: 0,
    cssBytes: 0,
    styleFileCount: 0,
    paths: new Set<string>(),
  };

  if (!isRecord(value)) {
    pushValidationIssue(state, 'P17_IMPORT_SOURCE_NOT_OBJECT', '$', 'Static import source must be an object.');
  } else {
    validateExactKeys(
      value,
      ['schemaVersion', 'policyVersion', 'html', 'styles'],
      '$',
      state,
      'P17_IMPORT_SOURCE_KEYS_UNSUPPORTED',
    );

    if (value.schemaVersion !== 1) {
      pushValidationIssue(state, 'P17_IMPORT_SCHEMA_UNSUPPORTED', '$.schemaVersion', 'schemaVersion must be 1.');
    }
    if (value.policyVersion !== P17_STATIC_IMPORT_POLICY_VERSION) {
      pushValidationIssue(
        state,
        'P17_IMPORT_POLICY_UNSUPPORTED',
        '$.policyVersion',
        `policyVersion must be ${P17_STATIC_IMPORT_POLICY_VERSION}.`,
      );
    }

    validateFile(value.html, '$.html', 'html', state);

    if (!Array.isArray(value.styles)) {
      pushValidationIssue(state, 'P17_IMPORT_STYLES_INVALID', '$.styles', 'styles must be an array.');
    } else {
      state.styleFileCount = value.styles.length;
      if (value.styles.length > P17_STATIC_IMPORT_MAX_STYLE_FILES) {
        pushValidationIssue(
          state,
          'P17_IMPORT_STYLE_FILE_LIMIT_EXCEEDED',
          '$.styles',
          `Style file count exceeds ${P17_STATIC_IMPORT_MAX_STYLE_FILES}.`,
        );
      }
      const count = Math.min(value.styles.length, P17_STATIC_IMPORT_MAX_STYLE_FILES + 1);
      for (let index = 0; index < count; index += 1) {
        validateFile(value.styles[index], `$.styles[${index}]`, 'css', state);
      }
      if (state.cssBytes > P17_STATIC_IMPORT_MAX_CSS_TOTAL_BYTES) {
        pushValidationIssue(
          state,
          'P17_IMPORT_CSS_TOTAL_BYTE_LIMIT_EXCEEDED',
          '$.styles',
          `Aggregate CSS input exceeds ${P17_STATIC_IMPORT_MAX_CSS_TOTAL_BYTES} UTF-8 bytes.`,
        );
      }
    }
  }

  return {
    valid: state.issues.length === 0,
    htmlBytes: state.htmlBytes,
    cssBytes: state.cssBytes,
    styleFileCount: state.styleFileCount,
    issues: state.issues,
  };
}

function addDiagnostic(
  state: DiagnosticState,
  code: P17StaticImportDiagnosticCode,
  severity: P17StaticImportDiagnosticSeverity,
  sourcePath: string,
  count = 1,
): void {
  if (count <= 0 || state.overflow) return;
  const key = `${sourcePath}\n${severity}\n${code}`;
  const existing = state.counts.get(key);
  if (existing) {
    existing.count += count;
    return;
  }
  if (state.counts.size >= P17_STATIC_IMPORT_MAX_DIAGNOSTICS) {
    state.overflow = true;
    state.counts.clear();
    state.counts.set('overflow', {
      code: 'P17_IMPORT_DIAGNOSTIC_LIMIT_EXCEEDED',
      severity: 'BLOCK',
      sourcePath: '<aggregate>',
      count: 1,
    });
    return;
  }
  state.counts.set(key, { code, severity, sourcePath, count });
}

function matchCount(value: string, pattern: RegExp): number {
  let count = 0;
  pattern.lastIndex = 0;
  while (pattern.exec(value) !== null) {
    count += 1;
    if (count > P17_STATIC_IMPORT_MAX_DIAGNOSTICS) break;
  }
  pattern.lastIndex = 0;
  return count;
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1).trim();
    }
  }
  return trimmed;
}

function hasUnsafeAsciiControl(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

function hasCharacterReferenceInPrefix(value: string): boolean {
  const boundaries = [value.indexOf('/'), value.indexOf('?'), value.indexOf('#')]
    .filter((index) => index >= 0);
  const limit = boundaries.length > 0 ? Math.min(...boundaries) : value.length;

  for (let index = 0; index < limit; index += 1) {
    if (value[index] !== '&') continue;
    const semicolon = value.indexOf(';', index + 1);
    if (semicolon < 0 || semicolon >= limit || semicolon - index > 40) continue;
    const body = value.slice(index + 1, semicolon);
    if (/^(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]+)$/i.test(body)) return true;
  }
  return false;
}

function explicitScheme(value: string): string | null | 'INVALID' {
  const colon = value.indexOf(':');
  if (colon < 0) return null;

  const slash = value.indexOf('/');
  const query = value.indexOf('?');
  const fragment = value.indexOf('#');
  const earlierBoundary = [slash, query, fragment]
    .filter((index) => index >= 0)
    .some((index) => index < colon);
  if (earlierBoundary) return null;

  const candidate = value.slice(0, colon);
  if (!/^[A-Za-z][A-Za-z0-9+.-]*$/.test(candidate)) return 'INVALID';
  return candidate.toLowerCase();
}

function classifyNavigationHref(
  rawValue: string,
  sourcePath: string,
  state: DiagnosticState,
): void {
  const value = stripQuotes(rawValue);
  if (value.length === 0) return;

  if (hasUnsafeAsciiControl(value) || hasCharacterReferenceInPrefix(value)) {
    addDiagnostic(state, 'P17_IMPORT_EXECUTABLE_URL_BLOCKED', 'BLOCK', sourcePath);
    return;
  }

  if (value.startsWith('//')) {
    addDiagnostic(state, 'P17_IMPORT_REMOTE_RESOURCE_BLOCKED', 'BLOCK', sourcePath);
    return;
  }

  const scheme = explicitScheme(value);
  if (scheme === 'INVALID') {
    addDiagnostic(state, 'P17_IMPORT_EXECUTABLE_URL_BLOCKED', 'BLOCK', sourcePath);
    return;
  }

  if (scheme !== null) {
    if (scheme === 'http' || scheme === 'https' || scheme === 'mailto' || scheme === 'tel') return;
    addDiagnostic(state, 'P17_IMPORT_EXECUTABLE_URL_BLOCKED', 'BLOCK', sourcePath);
    return;
  }

  const pathOnly = value.split(/[?#]/, 1)[0] ?? '';
  if (pathOnly.includes('\\') || pathOnly.includes('%')
    || pathOnly.split('/').some((segment) => segment === '..')) {
    addDiagnostic(state, 'P17_IMPORT_RESOURCE_TRAVERSAL_BLOCKED', 'BLOCK', sourcePath);
  }
}

function classifyResourceValue(
  rawValue: string,
  sourcePath: string,
  state: DiagnosticState,
  localResourceIsReview: boolean,
): void {
  const value = stripQuotes(rawValue);
  if (value.length === 0) return;
  if (hasUnsafeAsciiControl(value) || hasCharacterReferenceInPrefix(value)) {
    addDiagnostic(state, 'P17_IMPORT_EXECUTABLE_URL_BLOCKED', 'BLOCK', sourcePath);
    return;
  }

  if (value.startsWith('//')) {
    addDiagnostic(state, 'P17_IMPORT_REMOTE_RESOURCE_BLOCKED', 'BLOCK', sourcePath);
    return;
  }

  if (value.startsWith('/')) {
    addDiagnostic(state, 'P17_IMPORT_ROOT_RESOURCE_REVIEW', 'REVIEW', sourcePath);
    return;
  }

  const scheme = explicitScheme(value);
  if (scheme === 'INVALID') {
    addDiagnostic(state, 'P17_IMPORT_EXECUTABLE_URL_BLOCKED', 'BLOCK', sourcePath);
    return;
  }

  if (scheme !== null) {
    if (scheme === 'data') {
      const mediaType = value.slice(value.indexOf(':') + 1).split(/[;,]/, 1)[0]?.trim().toLowerCase() ?? '';
      if (mediaType === 'text/html'
        || mediaType === 'application/javascript'
        || mediaType === 'text/javascript') {
        addDiagnostic(state, 'P17_IMPORT_EXECUTABLE_URL_BLOCKED', 'BLOCK', sourcePath);
      } else {
        addDiagnostic(state, 'P17_IMPORT_DATA_RESOURCE_REVIEW', 'REVIEW', sourcePath);
      }
      return;
    }

    if (scheme === 'http' || scheme === 'https') {
      addDiagnostic(state, 'P17_IMPORT_REMOTE_RESOURCE_BLOCKED', 'BLOCK', sourcePath);
      return;
    }

    addDiagnostic(state, 'P17_IMPORT_EXECUTABLE_URL_BLOCKED', 'BLOCK', sourcePath);
    return;
  }

  const pathOnly = value.split(/[?#]/, 1)[0] ?? '';
  if (pathOnly.includes('\\') || pathOnly.includes('%')
    || pathOnly.split('/').some((segment) => segment === '..')) {
    addDiagnostic(state, 'P17_IMPORT_RESOURCE_TRAVERSAL_BLOCKED', 'BLOCK', sourcePath);
    return;
  }

  if (localResourceIsReview && pathOnly.length > 0 && !pathOnly.startsWith('#')) {
    addDiagnostic(state, 'P17_IMPORT_LOCAL_RESOURCE_REVIEW', 'REVIEW', sourcePath);
  }
}

function scanCssContent(content: string, sourcePath: string, state: DiagnosticState): void {
  const importCount = matchCount(content, /@import\b/gi);
  if (importCount > 0) {
    addDiagnostic(state, 'P17_IMPORT_CSS_IMPORT_BLOCKED', 'BLOCK', sourcePath, importCount);
  }

  const executableCssCount = matchCount(
    content,
    /(?:expression\s*\(|-moz-binding\s*:|behavior\s*:)/gi,
  );
  if (executableCssCount > 0) {
    addDiagnostic(
      state,
      'P17_IMPORT_CSS_EXECUTABLE_SURFACE_BLOCKED',
      'BLOCK',
      sourcePath,
      executableCssCount,
    );
  }

  const urlPattern = /url\s*\(\s*([^)]{1,4096})\s*\)/gi;
  let match: RegExpExecArray | null;
  while ((match = urlPattern.exec(content)) !== null) {
    const raw = match[1];
    if (raw !== undefined) classifyResourceValue(raw, sourcePath, state, true);
    if (state.overflow) break;
  }
  urlPattern.lastIndex = 0;
}

interface HtmlTagToken {
  name: string;
  closing: boolean;
  attributes: ResourceAttribute[];
  nextIndex: number;
}

function isAsciiSpace(char: string | undefined): boolean {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f';
}

function isTagNameChar(char: string | undefined): boolean {
  return char !== undefined && /[A-Za-z0-9:-]/.test(char);
}

function isAttributeNameChar(char: string | undefined): boolean {
  return char !== undefined
    && !isAsciiSpace(char)
    && char !== '='
    && char !== '>'
    && char !== '/'
    && char !== '"'
    && char !== "'"
    && char !== '<';
}

function parseHtmlTag(html: string, startIndex: number): HtmlTagToken | null | 'MALFORMED' {
  if (html[startIndex] !== '<') return null;
  let index = startIndex + 1;
  let closing = false;

  if (html[index] === '/') {
    closing = true;
    index += 1;
  }

  if (!/[A-Za-z]/.test(html[index] ?? '')) return null;

  const nameStart = index;
  while (isTagNameChar(html[index])) index += 1;
  const name = html.slice(nameStart, index).toLowerCase();

  const attributes: ResourceAttribute[] = [];
  while (index < html.length) {
    if (index - startIndex > 16_384) return 'MALFORMED';
    while (isAsciiSpace(html[index])) index += 1;

    if (html[index] === '>') {
      return { name, closing, attributes, nextIndex: index + 1 };
    }

    if (html[index] === '/' && html[index + 1] === '>') {
      return { name, closing, attributes, nextIndex: index + 2 };
    }

    if (closing) {
      if (html[index] === '>') {
        return { name, closing, attributes, nextIndex: index + 1 };
      }
      return 'MALFORMED';
    }

    const attributeStart = index;
    while (isAttributeNameChar(html[index])) index += 1;
    if (index === attributeStart) return 'MALFORMED';
    const attribute = html.slice(attributeStart, index).toLowerCase();

    while (isAsciiSpace(html[index])) index += 1;
    let value = '';
    if (html[index] === '=') {
      index += 1;
      while (isAsciiSpace(html[index])) index += 1;

      const quote = html[index];
      if (quote === '"' || quote === "'") {
        index += 1;
        const valueStart = index;
        while (index < html.length && html[index] !== quote) {
          if (index - startIndex > 16_384) return 'MALFORMED';
          index += 1;
        }
        if (index >= html.length) return 'MALFORMED';
        value = html.slice(valueStart, index);
        index += 1;
      } else {
        const valueStart = index;
        while (index < html.length
          && !isAsciiSpace(html[index])
          && html[index] !== '>'
          && !(html[index] === '/' && html[index + 1] === '>')) {
          if (html[index] === '<' || html[index] === '"' || html[index] === "'" || html[index] === '=') {
            return 'MALFORMED';
          }
          if (index - startIndex > 16_384) return 'MALFORMED';
          index += 1;
        }
        if (index === valueStart) return 'MALFORMED';
        value = html.slice(valueStart, index);
      }
    }

    attributes.push({ tag: name, attribute, value });
    if (attributes.length > 1_024) return 'MALFORMED';
  }

  return 'MALFORMED';
}

function findRawTextClose(lowerHtml: string, tagName: string, fromIndex: number): number {
  const needle = `</${tagName}`;
  let index = lowerHtml.indexOf(needle, fromIndex);
  while (index >= 0) {
    const boundary = lowerHtml[index + needle.length];
    if (boundary === '>' || boundary === '/' || isAsciiSpace(boundary)) return index;
    index = lowerHtml.indexOf(needle, index + 1);
  }
  return -1;
}

function scanHtmlAttributes(
  token: HtmlTagToken,
  sourcePath: string,
  state: DiagnosticState,
): void {
  let httpEquiv = '';

  for (const item of token.attributes) {
    if (item.attribute.startsWith('on') && item.attribute.length > 2) {
      addDiagnostic(state, 'P17_IMPORT_INLINE_EVENT_HANDLER_BLOCKED', 'BLOCK', sourcePath);
    }

    if (token.name === 'meta' && item.attribute === 'http-equiv') {
      httpEquiv = item.value.trim().toLowerCase();
    }

    if (item.attribute === 'style') {
      scanCssContent(item.value, sourcePath, state);
      continue;
    }

    if (item.attribute === 'action' || item.attribute === 'formaction') {
      classifyResourceValue(item.value, sourcePath, state, true);
      continue;
    }

    if (item.attribute === 'href' || item.attribute === 'xlink:href') {
      if (token.name === 'link' || token.name === 'base') {
        classifyResourceValue(item.value, sourcePath, state, true);
      } else {
        classifyNavigationHref(item.value, sourcePath, state);
      }
      continue;
    }

    if (item.attribute === 'srcset') {
      for (const candidate of item.value.split(',')) {
        const raw = candidate.trim().split(/\s+/, 1)[0] ?? '';
        if (raw.length > 0) classifyResourceValue(raw, sourcePath, state, true);
      }
      continue;
    }

    if (item.attribute === 'src' || item.attribute === 'poster') {
      classifyResourceValue(item.value, sourcePath, state, true);
    }
  }

  if (token.name === 'meta' && httpEquiv === 'refresh') {
    addDiagnostic(state, 'P17_IMPORT_META_REFRESH_BLOCKED', 'BLOCK', sourcePath);
  }
}

function scanHtmlContent(html: string, sourcePath: string, state: DiagnosticState): void {
  const lowerHtml = html.toLowerCase();
  let index = 0;

  while (index < html.length && !state.overflow) {
    const open = html.indexOf('<', index);
    if (open < 0) break;

    if (html.startsWith('<!--', open)) {
      const commentEnd = html.indexOf('-->', open + 4);
      if (commentEnd < 0) {
        addDiagnostic(state, 'P17_IMPORT_MALFORMED_HTML_BLOCKED', 'BLOCK', sourcePath);
        break;
      }
      index = commentEnd + 3;
      continue;
    }

    if (lowerHtml.startsWith('<!doctype', open)) {
      const declarationEnd = html.indexOf('>', open + 9);
      if (declarationEnd < 0 || declarationEnd - open > 8_192) {
        addDiagnostic(state, 'P17_IMPORT_MALFORMED_HTML_BLOCKED', 'BLOCK', sourcePath);
        break;
      }
      index = declarationEnd + 1;
      continue;
    }

    if (html[open + 1] === '!' || html[open + 1] === '?') {
      addDiagnostic(state, 'P17_IMPORT_MALFORMED_HTML_BLOCKED', 'BLOCK', sourcePath);
      index = open + 2;
      continue;
    }

    const token = parseHtmlTag(html, open);
    if (token === 'MALFORMED') {
      addDiagnostic(state, 'P17_IMPORT_MALFORMED_HTML_BLOCKED', 'BLOCK', sourcePath);
      index = open + 1;
      continue;
    }
    if (token === null) {
      index = open + 1;
      continue;
    }

    index = token.nextIndex;
    if (token.closing) continue;

    if (token.name === 'script') {
      addDiagnostic(state, 'P17_IMPORT_SCRIPT_ELEMENT_BLOCKED', 'BLOCK', sourcePath);
    } else if (token.name === 'iframe' || token.name === 'object' || token.name === 'embed') {
      addDiagnostic(state, 'P17_IMPORT_EMBEDDED_DOCUMENT_BLOCKED', 'BLOCK', sourcePath);
    } else if (token.name === 'form') {
      addDiagnostic(state, 'P17_IMPORT_FORM_SURFACE_BLOCKED', 'BLOCK', sourcePath);
    } else if (token.name === 'base') {
      addDiagnostic(state, 'P17_IMPORT_BASE_ELEMENT_BLOCKED', 'BLOCK', sourcePath);
    }

    scanHtmlAttributes(token, sourcePath, state);

    if (token.name === 'style' || token.name === 'script' || token.name === 'textarea' || token.name === 'title') {
      const closeIndex = findRawTextClose(lowerHtml, token.name, token.nextIndex);
      if (closeIndex < 0) {
        addDiagnostic(state, 'P17_IMPORT_MALFORMED_HTML_BLOCKED', 'BLOCK', sourcePath);
        break;
      }
      if (token.name === 'style') {
        scanCssContent(html.slice(token.nextIndex, closeIndex), sourcePath, state);
      }
      index = closeIndex;
    }
  }
}

function sortedDiagnostics(state: DiagnosticState): P17StaticImportDiagnostic[] {
  return [...state.counts.values()].sort((left, right) => (
    left.sourcePath.localeCompare(right.sourcePath)
    || left.severity.localeCompare(right.severity)
    || left.code.localeCompare(right.code)
  ));
}

function emptyReceipt(): P17StaticImportReceipt {
  return {
    htmlSha256: null,
    styleFiles: [],
    sourceSha256: null,
  };
}

export function scanP17StaticImportSafety(value: unknown): P17StaticImportSafetyReport {
  const validation = validateP17StaticImportSource(value);
  if (!validation.valid) {
    return {
      policyVersion: P17_STATIC_IMPORT_POLICY_VERSION,
      status: 'REJECTED_INVALID_INPUT',
      validation,
      diagnostics: [],
      parserAcceptance: false,
      sanitizedHtml: null,
      sanitizedCss: null,
      activeRenderAllowed: false,
      javascriptExecutionAllowed: false,
      networkAccessAllowed: false,
      reconstructionAllowed: false,
      productionAcceptance: false,
      receipt: emptyReceipt(),
    };
  }

  const source = value as P17StaticImportSourceV1;
  const diagnosticState: DiagnosticState = {
    counts: new Map<string, P17StaticImportDiagnostic>(),
    overflow: false,
  };

  scanHtmlContent(source.html.content, source.html.path, diagnosticState);
  for (const style of source.styles) {
    scanCssContent(style.content, style.path, diagnosticState);
    if (diagnosticState.overflow) break;
  }

  const diagnostics = sortedDiagnostics(diagnosticState);
  const hasBlock = diagnostics.some((diagnostic) => diagnostic.severity === 'BLOCK');
  const hasReview = diagnostics.some((diagnostic) => diagnostic.severity === 'REVIEW');

  const styleFiles = source.styles
    .map((style) => ({ path: style.path, sha256: sha256Hex(style.content) }))
    .sort((left, right) => left.path.localeCompare(right.path));

  const htmlSha256 = sha256Hex(source.html.content);
  const sourceSha256 = sha256Hex(JSON.stringify({
    schemaVersion: source.schemaVersion,
    policyVersion: source.policyVersion,
    html: {
      path: source.html.path,
      sha256: htmlSha256,
    },
    styles: styleFiles,
  }));

  return {
    policyVersion: P17_STATIC_IMPORT_POLICY_VERSION,
    status: hasBlock ? 'BLOCKED' : hasReview ? 'REVIEW_REQUIRED' : 'CLEAR_FOR_STATIC_PARSER',
    validation,
    diagnostics,
    parserAcceptance: false,
    sanitizedHtml: null,
    sanitizedCss: null,
    activeRenderAllowed: false,
    javascriptExecutionAllowed: false,
    networkAccessAllowed: false,
    reconstructionAllowed: false,
    productionAcceptance: false,
    receipt: {
      htmlSha256,
      styleFiles,
      sourceSha256,
    },
  };
}
