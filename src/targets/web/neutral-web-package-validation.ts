import { sha256Hex } from '../../core/sha256';
import {
  P17_NEUTRAL_WEB_EXPORT_MAX_OUTPUT_BYTES,
  P17_NEUTRAL_WEB_EXPORT_VERSION,
  buildP17NeutralWebExportPackage,
  type P17NeutralWebExportPackage,
} from './neutral-web-export';
import {
  P17_NEUTRAL_WEB_IR_VERSION,
  identifyP17NeutralWebDocument,
  validateP17NeutralWebDocument,
  type P17NeutralWebDocumentV1,
  type P17NeutralWebNode,
} from './neutral-web-ir';

export const P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION =
  'p17-neutral-web-package-validation-v1' as const;

export type P17NeutralWebPackageValidationCode =
  | 'P17_PACKAGE_SOURCE_INVALID'
  | 'P17_PACKAGE_NOT_OBJECT'
  | 'P17_PACKAGE_EXPORT_VERSION_MISMATCH'
  | 'P17_PACKAGE_REJECTED_SOURCE'
  | 'P17_PACKAGE_AUTHORITY_INVALID'
  | 'P17_PACKAGE_HTML_MISSING'
  | 'P17_PACKAGE_CSS_MISSING'
  | 'P17_PACKAGE_OUTPUT_LIMIT_EXCEEDED'
  | 'P17_PACKAGE_IR_IDENTITY_MISMATCH'
  | 'P17_PACKAGE_HTML_HASH_MISMATCH'
  | 'P17_PACKAGE_CSS_HASH_MISMATCH'
  | 'P17_PACKAGE_HASH_MISMATCH'
  | 'P17_PACKAGE_STATUS_MISMATCH'
  | 'P17_PACKAGE_REVIEW_BINDING_MISMATCH'
  | 'P17_PACKAGE_HTML_BYTES_MISMATCH'
  | 'P17_PACKAGE_CSS_BYTES_MISMATCH'
  | 'P17_PACKAGE_ACTIVE_HTML_SURFACE'
  | 'P17_PACKAGE_INLINE_EVENT_HANDLER'
  | 'P17_PACKAGE_EXECUTABLE_URL'
  | 'P17_PACKAGE_REMOTE_RESOURCE'
  | 'P17_PACKAGE_STYLESHEET_LINK_INVALID'
  | 'P17_PACKAGE_CSS_IMPORT'
  | 'P17_PACKAGE_CSS_URL'
  | 'P17_PACKAGE_CSS_EXECUTABLE_SURFACE';

export interface P17NeutralWebPackageValidationIssue {
  code: P17NeutralWebPackageValidationCode;
  location: 'SOURCE' | 'PACKAGE' | 'HTML' | 'CSS' | 'RECEIPT';
  message: string;
}

export interface P17NeutralWebPackageValidationReceipt {
  schemaVersion: 1;
  validationVersion: typeof P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION;
  exportVersion: typeof P17_NEUTRAL_WEB_EXPORT_VERSION;
  status: 'PACKAGE_VALIDATED' | 'REVIEW_REQUIRED' | 'REJECTED';
  valid: boolean;
  acceptanceAuthority: false;
  javascriptExecution: false;
  networkAccessRequired: false;
  browserValidationStatus: 'NOT_RUN';
  reconstructionStatus: 'NOT_RUN';
  productionAcceptance: false;
  sourceIrSha256: string | null;
  htmlSha256: string | null;
  cssSha256: string | null;
  packageSha256: string | null;
  reviewIssueCount: number;
  issues: P17NeutralWebPackageValidationIssue[];
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
  issues: P17NeutralWebPackageValidationIssue[],
  code: P17NeutralWebPackageValidationCode,
  location: P17NeutralWebPackageValidationIssue['location'],
  message: string,
): void {
  issues.push({ code, location, message });
}

function collectReviewIssues(
  nodes: readonly P17NeutralWebNode[],
  output: Array<{ nodeId: string; reasonCode: string; detail: string }>,
): void {
  for (const node of nodes) {
    if (node.kind === 'review') {
      output.push({
        nodeId: node.nodeId,
        reasonCode: node.reasonCode,
        detail: node.detail,
      });
    } else if (node.kind === 'container') {
      collectReviewIssues(node.children, output);
    }
  }
}

function expectedPackageSha256(
  irSha256: string,
  htmlSha256: string,
  cssSha256: string,
): string {
  return sha256Hex([
    P17_NEUTRAL_WEB_EXPORT_VERSION,
    P17_NEUTRAL_WEB_IR_VERSION,
    irSha256,
    htmlSha256,
    cssSha256,
  ].join('\n'));
}

function scanHtml(
  html: string,
  issues: P17NeutralWebPackageValidationIssue[],
): void {
  if (/<\s*(?:script|iframe|object|embed|form)\b/i.test(html)
    || /<\s*meta\b[^>]*\bhttp-equiv\s*=\s*(?:"\s*refresh\s*"|'\s*refresh\s*'|refresh\b)/i.test(html)) {
    pushIssue(
      issues,
      'P17_PACKAGE_ACTIVE_HTML_SURFACE',
      'HTML',
      'Generated HTML contains an active surface outside the accepted static package contract.',
    );
  }

  if (/\son[a-z0-9_-]+\s*=/i.test(html)) {
    pushIssue(
      issues,
      'P17_PACKAGE_INLINE_EVENT_HANDLER',
      'HTML',
      'Generated HTML contains an inline event-handler attribute.',
    );
  }

  if (/\b(?:href|src)\s*=\s*["']\s*(?:javascript|vbscript|data):/i.test(html)) {
    pushIssue(
      issues,
      'P17_PACKAGE_EXECUTABLE_URL',
      'HTML',
      'Generated HTML contains an executable or inline-data URL scheme.',
    );
  }

  for (const match of html.matchAll(/\bsrc\s*=\s*["']([^"']*)["']/gi)) {
    const src = match[1] ?? '';
    if (!src.startsWith('./assets/')) {
      pushIssue(
        issues,
        'P17_PACKAGE_REMOTE_RESOURCE',
        'HTML',
        'Generated HTML contains a non-local resource source.',
      );
      break;
    }
  }

  const linkTags = [...html.matchAll(/<\s*link\b[^>]*>/gi)].map((match) => match[0]);
  if (linkTags.length !== 1
    || !/\brel\s*=\s*["']stylesheet["']/i.test(linkTags[0] ?? '')
    || !/\bhref\s*=\s*["']\.\/styles\.css["']/i.test(linkTags[0] ?? '')) {
    pushIssue(
      issues,
      'P17_PACKAGE_STYLESHEET_LINK_INVALID',
      'HTML',
      'Generated HTML must contain exactly one local ./styles.css stylesheet link.',
    );
  }
}

function scanCss(
  css: string,
  issues: P17NeutralWebPackageValidationIssue[],
): void {
  if (/@import\b/i.test(css)) {
    pushIssue(
      issues,
      'P17_PACKAGE_CSS_IMPORT',
      'CSS',
      'Generated CSS contains @import, which is outside the offline static package contract.',
    );
  }
  if (/\burl\s*\(/i.test(css)) {
    pushIssue(
      issues,
      'P17_PACKAGE_CSS_URL',
      'CSS',
      'Generated CSS contains url(...), which is not yet part of the accepted resource model.',
    );
  }
  if (/\b(?:expression\s*\(|behavior\s*:|-moz-binding\s*:|javascript\s*:)/i.test(css)) {
    pushIssue(
      issues,
      'P17_PACKAGE_CSS_EXECUTABLE_SURFACE',
      'CSS',
      'Generated CSS contains an executable or legacy active surface.',
    );
  }
}

function rejectedReceipt(
  issues: P17NeutralWebPackageValidationIssue[],
  reviewIssueCount = 0,
): P17NeutralWebPackageValidationReceipt {
  return {
    schemaVersion: 1,
    validationVersion: P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION,
    exportVersion: P17_NEUTRAL_WEB_EXPORT_VERSION,
    status: 'REJECTED',
    valid: false,
    acceptanceAuthority: false,
    javascriptExecution: false,
    networkAccessRequired: false,
    browserValidationStatus: 'NOT_RUN',
    reconstructionStatus: 'NOT_RUN',
    productionAcceptance: false,
    sourceIrSha256: null,
    htmlSha256: null,
    cssSha256: null,
    packageSha256: null,
    reviewIssueCount,
    issues,
  };
}

export function validateP17NeutralWebExportPackage(input: {
  source: unknown;
  package: unknown;
}): P17NeutralWebPackageValidationReceipt {
  const issues: P17NeutralWebPackageValidationIssue[] = [];
  const sourceValidation = validateP17NeutralWebDocument(input.source);
  if (!sourceValidation.valid) {
    pushIssue(
      issues,
      'P17_PACKAGE_SOURCE_INVALID',
      'SOURCE',
      'Source neutral Web IR is invalid.',
    );
    return rejectedReceipt(issues);
  }
  if (!isRecord(input.package)) {
    pushIssue(issues, 'P17_PACKAGE_NOT_OBJECT', 'PACKAGE', 'Package must be an object.');
    return rejectedReceipt(issues);
  }

  const source = input.source as P17NeutralWebDocumentV1;
  const packageValue = input.package as unknown as P17NeutralWebExportPackage;
  const expected = buildP17NeutralWebExportPackage(source);
  const sourceIdentity = identifyP17NeutralWebDocument(source);

  if (packageValue.exportVersion !== P17_NEUTRAL_WEB_EXPORT_VERSION) {
    pushIssue(
      issues,
      'P17_PACKAGE_EXPORT_VERSION_MISMATCH',
      'PACKAGE',
      'Package export version does not match the accepted static export contract.',
    );
  }

  if (expected.status === 'REJECTED_INVALID_IR'
    || expected.status === 'REJECTED_UNSTABLE_INPUT'
    || expected.status === 'REJECTED_OUTPUT_LIMIT') {
    pushIssue(
      issues,
      'P17_PACKAGE_REJECTED_SOURCE',
      'SOURCE',
      'Source cannot produce a package eligible for package validation.',
    );
    return rejectedReceipt(issues, expected.reviewIssues.length);
  }

  if (packageValue.javascript !== null
    || packageValue.javascriptExecution !== false
    || packageValue.networkAccessRequired !== false
    || packageValue.browserValidationStatus !== 'NOT_RUN'
    || packageValue.productionAcceptance !== false) {
    pushIssue(
      issues,
      'P17_PACKAGE_AUTHORITY_INVALID',
      'PACKAGE',
      'Package authority fields must remain non-executable, offline and non-authorizing.',
    );
  }

  if (typeof packageValue.html !== 'string') {
    pushIssue(issues, 'P17_PACKAGE_HTML_MISSING', 'HTML', 'Package HTML is missing.');
  }
  if (typeof packageValue.css !== 'string') {
    pushIssue(issues, 'P17_PACKAGE_CSS_MISSING', 'CSS', 'Package CSS is missing.');
  }

  if (typeof packageValue.html !== 'string' || typeof packageValue.css !== 'string') {
    return rejectedReceipt(issues, expected.reviewIssues.length);
  }

  const html = packageValue.html;
  const css = packageValue.css;
  if (utf8ByteLength(html) > P17_NEUTRAL_WEB_EXPORT_MAX_OUTPUT_BYTES
    || utf8ByteLength(css) > P17_NEUTRAL_WEB_EXPORT_MAX_OUTPUT_BYTES) {
    pushIssue(
      issues,
      'P17_PACKAGE_OUTPUT_LIMIT_EXCEEDED',
      'PACKAGE',
      'Generated package output exceeds the accepted byte ceiling.',
    );
  }

  const htmlSha256 = sha256Hex(html);
  const cssSha256 = sha256Hex(css);
  const packageSha256 = expectedPackageSha256(sourceIdentity.sha256, htmlSha256, cssSha256);

  if (packageValue.receipt?.irSha256 !== sourceIdentity.sha256
    || packageValue.receipt?.irVersion !== sourceIdentity.irVersion) {
    pushIssue(
      issues,
      'P17_PACKAGE_IR_IDENTITY_MISMATCH',
      'RECEIPT',
      'Package receipt is not bound to the exact source neutral Web IR identity.',
    );
  }
  if (packageValue.receipt?.htmlSha256 !== htmlSha256) {
    pushIssue(
      issues,
      'P17_PACKAGE_HTML_HASH_MISMATCH',
      'RECEIPT',
      'Package HTML hash does not match the supplied HTML bytes.',
    );
  }
  if (packageValue.receipt?.cssSha256 !== cssSha256) {
    pushIssue(
      issues,
      'P17_PACKAGE_CSS_HASH_MISMATCH',
      'RECEIPT',
      'Package CSS hash does not match the supplied CSS bytes.',
    );
  }
  if (packageValue.receipt?.packageSha256 !== packageSha256) {
    pushIssue(
      issues,
      'P17_PACKAGE_HASH_MISMATCH',
      'RECEIPT',
      'Package hash does not match the exact IR/HTML/CSS identity chain.',
    );
  }

  if (packageValue.status !== expected.status) {
    pushIssue(
      issues,
      'P17_PACKAGE_STATUS_MISMATCH',
      'PACKAGE',
      'Package status does not match the exact source-derived status.',
    );
  }

  const expectedReviews: Array<{ nodeId: string; reasonCode: string; detail: string }> = [];
  collectReviewIssues(source.nodes, expectedReviews);
  if (JSON.stringify(packageValue.reviewIssues) !== JSON.stringify(expectedReviews)) {
    pushIssue(
      issues,
      'P17_PACKAGE_REVIEW_BINDING_MISMATCH',
      'PACKAGE',
      'Package REVIEW evidence does not match the exact source review nodes.',
    );
  }

  if (html !== expected.html) {
    pushIssue(
      issues,
      'P17_PACKAGE_HTML_BYTES_MISMATCH',
      'HTML',
      'Package HTML is not the deterministic HTML derived from the exact source IR.',
    );
  }
  if (css !== expected.css) {
    pushIssue(
      issues,
      'P17_PACKAGE_CSS_BYTES_MISMATCH',
      'CSS',
      'Package CSS is not the deterministic CSS derived from the exact source IR.',
    );
  }

  scanHtml(html, issues);
  scanCss(css, issues);

  const valid = issues.length === 0;
  return {
    schemaVersion: 1,
    validationVersion: P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION,
    exportVersion: P17_NEUTRAL_WEB_EXPORT_VERSION,
    status: valid
      ? expectedReviews.length > 0
        ? 'REVIEW_REQUIRED'
        : 'PACKAGE_VALIDATED'
      : 'REJECTED',
    valid,
    acceptanceAuthority: false,
    javascriptExecution: false,
    networkAccessRequired: false,
    browserValidationStatus: 'NOT_RUN',
    reconstructionStatus: 'NOT_RUN',
    productionAcceptance: false,
    sourceIrSha256: sourceIdentity.sha256,
    htmlSha256,
    cssSha256,
    packageSha256,
    reviewIssueCount: expectedReviews.length,
    issues,
  };
}

export function serializeP17NeutralWebPackageValidationReceipt(
  receipt: P17NeutralWebPackageValidationReceipt,
): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}
