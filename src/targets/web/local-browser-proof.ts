import {
  P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION,
  type P17NeutralWebPackageValidationReceipt,
} from './neutral-web-package-validation';

export const P17_LOCAL_BROWSER_PROOF_VERSION = 'p17-local-browser-proof-v1' as const;

export const P17_LOCAL_BROWSER_ALLOWED_REQUESTS = [
  'GET /index.html',
  'GET /styles.css',
] as const;

export interface P17LocalBrowserProofIssue {
  code:
    | 'P17_BROWSER_PACKAGE_GATE_NOT_PASS'
    | 'P17_BROWSER_RUNTIME_FAILURE'
    | 'P17_BROWSER_IDENTITY_INVALID'
    | 'P17_BROWSER_VIEWPORT_INVALID'
    | 'P17_BROWSER_REQUEST_POLICY_INVALID'
    | 'P17_BROWSER_EXTERNAL_REQUEST_BLOCKED'
    | 'P17_BROWSER_CONSOLE_ERROR'
    | 'P17_BROWSER_PAGE_ERROR'
    | 'P17_BROWSER_ACTIVE_SURFACE'
    | 'P17_BROWSER_STYLESHEET_MISSING'
    | 'P17_BROWSER_STRUCTURE_MISMATCH'
    | 'P17_BROWSER_COMPUTED_STYLE_MISMATCH'
    | 'P17_BROWSER_SCREENSHOT_HASH_INVALID'
    | 'P17_BROWSER_EVIDENCE_REFERENCE_INVALID';
  message: string;
}

export interface P17LocalBrowserObservation {
  runtimeFailureCode: string | null;
  evidence: {
    commitSha: string | null;
    runId: string | null;
    runAttempt: string | null;
  };
  browser: {
    family: string | null;
    version: string | null;
  };
  viewport: {
    width: number | null;
    height: number | null;
  };
  requestPolicy: {
    mode: string | null;
    allowedRequests: string[];
    observedRequests: string[];
    blockedRequestCount: number;
  };
  dom: {
    bodyChildCount: number | null;
    mainCount: number | null;
    headingCount: number | null;
    paragraphCount: number | null;
    stylesheetCount: number | null;
    activeSurfaceCount: number | null;
    inlineEventHandlerCount: number | null;
  };
  computedStyle: {
    rootDisplay: string | null;
    rootFlexDirection: string | null;
    rootGap: string | null;
    rootPaddingTop: string | null;
    rootPaddingRight: string | null;
    rootPaddingBottom: string | null;
    rootPaddingLeft: string | null;
    rootBackgroundColor: string | null;
  };
  consoleErrorCount: number;
  pageErrorCount: number;
  screenshotSha256: string | null;
}

export interface P17LocalBrowserProofReceipt {
  schemaVersion: 1;
  proofVersion: typeof P17_LOCAL_BROWSER_PROOF_VERSION;
  packageValidationVersion: typeof P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION;
  status: 'BROWSER_RENDER_OBSERVED' | 'REJECTED';
  valid: boolean;
  acceptanceAuthority: false;
  javascriptExecution: false;
  networkAccessRequired: false;
  browserValidationStatus: 'OBSERVED_PASS' | 'OBSERVED_FAIL';
  visualFidelityStatus: 'NOT_RUN';
  reconstructionStatus: 'NOT_RUN';
  productionAcceptance: false;
  sourceIrSha256: string | null;
  packageSha256: string | null;
  browser: P17LocalBrowserObservation['browser'];
  viewport: P17LocalBrowserObservation['viewport'];
  requestPolicy: P17LocalBrowserObservation['requestPolicy'];
  dom: P17LocalBrowserObservation['dom'];
  computedStyle: P17LocalBrowserObservation['computedStyle'];
  consoleErrorCount: number;
  pageErrorCount: number;
  screenshotSha256: string | null;
  evidence: P17LocalBrowserObservation['evidence'];
  issues: P17LocalBrowserProofIssue[];
}

function sameStringSet(actual: readonly string[], expected: readonly string[]): boolean {
  if (actual.length !== expected.length) return false;
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  return actualSorted.every((value, index) => value === expectedSorted[index]);
}

function push(
  issues: P17LocalBrowserProofIssue[],
  code: P17LocalBrowserProofIssue['code'],
  message: string,
): void {
  issues.push({ code, message });
}

function validSha256(value: string | null): boolean {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function validCommitSha(value: string | null): boolean {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
}

function validPositiveIntegerString(value: string | null): boolean {
  return typeof value === 'string' && /^[1-9][0-9]*$/.test(value);
}

export function buildP17LocalBrowserProofReceipt(input: {
  packageValidation: P17NeutralWebPackageValidationReceipt;
  observation: P17LocalBrowserObservation;
}): P17LocalBrowserProofReceipt {
  const { packageValidation, observation } = input;
  const issues: P17LocalBrowserProofIssue[] = [];

  if (
    packageValidation.validationVersion !== P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION
    || packageValidation.valid !== true
    || packageValidation.status !== 'PACKAGE_VALIDATED'
    || packageValidation.acceptanceAuthority !== false
    || packageValidation.javascriptExecution !== false
    || packageValidation.networkAccessRequired !== false
    || packageValidation.browserValidationStatus !== 'NOT_RUN'
    || packageValidation.productionAcceptance !== false
  ) {
    push(
      issues,
      'P17_BROWSER_PACKAGE_GATE_NOT_PASS',
      'R4 package validation must be an exact non-authorizing PACKAGE_VALIDATED result before browser proof.',
    );
  }

  if (observation.runtimeFailureCode !== null) {
    push(
      issues,
      'P17_BROWSER_RUNTIME_FAILURE',
      'Controlled browser execution did not complete successfully.',
    );
  }

  if (
    observation.browser.family !== 'CHROME'
    || typeof observation.browser.version !== 'string'
    || !/^\d+(?:\.\d+){1,3}$/.test(observation.browser.version)
  ) {
    push(
      issues,
      'P17_BROWSER_IDENTITY_INVALID',
      'Browser proof requires a sanitized Google Chrome family/version identity.',
    );
  }

  if (observation.viewport.width !== 1440 || observation.viewport.height !== 900) {
    push(
      issues,
      'P17_BROWSER_VIEWPORT_INVALID',
      'Controlled browser proof requires the exact 1440x900 viewport.',
    );
  }

  if (
    observation.requestPolicy.mode !== 'EXACT_LOOPBACK_PATH_ALLOWLIST'
    || !sameStringSet(observation.requestPolicy.allowedRequests, P17_LOCAL_BROWSER_ALLOWED_REQUESTS)
    || !sameStringSet(observation.requestPolicy.observedRequests, P17_LOCAL_BROWSER_ALLOWED_REQUESTS)
  ) {
    push(
      issues,
      'P17_BROWSER_REQUEST_POLICY_INVALID',
      'Browser requests must match only the exact controlled loopback document and stylesheet allowlist.',
    );
  }

  if (observation.requestPolicy.blockedRequestCount !== 0) {
    push(
      issues,
      'P17_BROWSER_EXTERNAL_REQUEST_BLOCKED',
      'The browser attempted one or more requests outside the exact controlled allowlist.',
    );
  }

  if (observation.consoleErrorCount !== 0) {
    push(
      issues,
      'P17_BROWSER_CONSOLE_ERROR',
      'The controlled page emitted one or more console errors.',
    );
  }

  if (observation.pageErrorCount !== 0) {
    push(
      issues,
      'P17_BROWSER_PAGE_ERROR',
      'The controlled page emitted one or more page errors.',
    );
  }

  if (
    observation.dom.activeSurfaceCount !== 0
    || observation.dom.inlineEventHandlerCount !== 0
  ) {
    push(
      issues,
      'P17_BROWSER_ACTIVE_SURFACE',
      'Rendered DOM contains an active or inline-event surface outside the static contract.',
    );
  }

  if (observation.dom.stylesheetCount !== 1) {
    push(
      issues,
      'P17_BROWSER_STYLESHEET_MISSING',
      'Rendered DOM must load exactly one local stylesheet.',
    );
  }

  if (
    observation.dom.bodyChildCount !== 1
    || observation.dom.mainCount !== 1
    || observation.dom.headingCount !== 1
    || observation.dom.paragraphCount !== 1
  ) {
    push(
      issues,
      'P17_BROWSER_STRUCTURE_MISMATCH',
      'Rendered DOM structure does not match the controlled fixture contract.',
    );
  }

  if (
    observation.computedStyle.rootDisplay !== 'flex'
    || observation.computedStyle.rootFlexDirection !== 'column'
    || observation.computedStyle.rootGap !== '16px'
    || observation.computedStyle.rootPaddingTop !== '24px'
    || observation.computedStyle.rootPaddingRight !== '24px'
    || observation.computedStyle.rootPaddingBottom !== '24px'
    || observation.computedStyle.rootPaddingLeft !== '24px'
    || observation.computedStyle.rootBackgroundColor !== 'rgb(244, 244, 244)'
  ) {
    push(
      issues,
      'P17_BROWSER_COMPUTED_STYLE_MISMATCH',
      'Rendered computed style does not match the deterministic controlled fixture contract.',
    );
  }

  if (!validSha256(observation.screenshotSha256)) {
    push(
      issues,
      'P17_BROWSER_SCREENSHOT_HASH_INVALID',
      'Browser proof must retain a SHA-256 fingerprint of the controlled screenshot bytes.',
    );
  }

  if (
    !validCommitSha(observation.evidence.commitSha)
    || !validPositiveIntegerString(observation.evidence.runId)
    || !validPositiveIntegerString(observation.evidence.runAttempt)
  ) {
    push(
      issues,
      'P17_BROWSER_EVIDENCE_REFERENCE_INVALID',
      'Browser proof must bind to an exact Git commit SHA and GitHub Actions run identity.',
    );
  }

  const valid = issues.length === 0;
  return {
    schemaVersion: 1,
    proofVersion: P17_LOCAL_BROWSER_PROOF_VERSION,
    packageValidationVersion: P17_NEUTRAL_WEB_PACKAGE_VALIDATION_VERSION,
    status: valid ? 'BROWSER_RENDER_OBSERVED' : 'REJECTED',
    valid,
    acceptanceAuthority: false,
    javascriptExecution: false,
    networkAccessRequired: false,
    browserValidationStatus: valid ? 'OBSERVED_PASS' : 'OBSERVED_FAIL',
    visualFidelityStatus: 'NOT_RUN',
    reconstructionStatus: 'NOT_RUN',
    productionAcceptance: false,
    sourceIrSha256: packageValidation.sourceIrSha256,
    packageSha256: packageValidation.packageSha256,
    browser: observation.browser,
    viewport: observation.viewport,
    requestPolicy: observation.requestPolicy,
    dom: observation.dom,
    computedStyle: observation.computedStyle,
    consoleErrorCount: observation.consoleErrorCount,
    pageErrorCount: observation.pageErrorCount,
    screenshotSha256: observation.screenshotSha256,
    evidence: observation.evidence,
    issues,
  };
}

export function serializeP17LocalBrowserProofReceipt(
  receipt: P17LocalBrowserProofReceipt,
): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}
