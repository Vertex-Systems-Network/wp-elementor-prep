export const ELEMENTOR_TARGET_ENVIRONMENT_EVIDENCE_VERSION = 'elementor-target-environment-evidence-v1' as const;
export const ELEMENTOR_TARGET_ENVIRONMENT_POLICY_VERSION = 'elementor-target-environment-policy-2026-09-16-v1' as const;

export type ElementorTargetEnvironmentDatabaseEngine = 'MYSQL' | 'MARIADB' | 'SQLITE' | 'OTHER';
export type ElementorTargetEnvironmentBrowserFamily = 'CHROME' | 'EDGE' | 'BRAVE' | 'FIREFOX' | 'SAFARI' | 'OTHER';
export type ElementorTargetEnvironmentClassification =
  | 'QUALIFIED_FOR_BOUND_TARGET_PROOF'
  | 'REVIEW_REQUIRED'
  | 'NOT_QUALIFIED'
  | 'REJECTED';

export interface ElementorTargetEnvironmentEvidenceV1 {
  schemaVersion: 1;
  evidenceVersion: typeof ELEMENTOR_TARGET_ENVIRONMENT_EVIDENCE_VERSION;
  source: 'OBSERVED';
  wordpressVersion: string;
  elementorVersion: string;
  phpVersion: string;
  database: {
    engine: ElementorTargetEnvironmentDatabaseEngine;
    version: string;
  };
  wordpressMemoryLimitMb: number;
  browser: {
    family: ElementorTargetEnvironmentBrowserFamily;
    version: string;
  };
  elementorProActive: boolean;
  thirdPartyElementorAddonsActive: boolean;
  observedAt: string;
  evidenceReference: string;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

export type ElementorTargetEnvironmentIssueCode =
  | 'P15_TARGET_ENVIRONMENT_NOT_OBJECT'
  | 'P15_TARGET_ENVIRONMENT_FIELDS_INVALID'
  | 'P15_TARGET_ENVIRONMENT_VERSION_INVALID'
  | 'P15_TARGET_ENVIRONMENT_DATABASE_INVALID'
  | 'P15_TARGET_ENVIRONMENT_MEMORY_INVALID'
  | 'P15_TARGET_ENVIRONMENT_BROWSER_INVALID'
  | 'P15_TARGET_ENVIRONMENT_OBSERVED_AT_INVALID'
  | 'P15_TARGET_ENVIRONMENT_EVIDENCE_REFERENCE_INVALID'
  | 'P15_TARGET_ENVIRONMENT_AUTHORITY_FLAGS_INVALID';

export type ElementorTargetEnvironmentFailureCode =
  | 'P15_TARGET_ENVIRONMENT_WORDPRESS_BELOW_MINIMUM'
  | 'P15_TARGET_ENVIRONMENT_PHP_BELOW_MINIMUM'
  | 'P15_TARGET_ENVIRONMENT_DATABASE_ENGINE_UNSUPPORTED'
  | 'P15_TARGET_ENVIRONMENT_DATABASE_BELOW_MINIMUM'
  | 'P15_TARGET_ENVIRONMENT_MEMORY_BELOW_MINIMUM'
  | 'P15_TARGET_ENVIRONMENT_BROWSER_UNSUPPORTED'
  | 'P15_TARGET_ENVIRONMENT_BROWSER_BELOW_MINIMUM';

export type ElementorTargetEnvironmentReviewCode =
  | 'P15_TARGET_ENVIRONMENT_ELEMENTOR_PRO_ACTIVE'
  | 'P15_TARGET_ENVIRONMENT_THIRD_PARTY_ADDONS_ACTIVE';

export interface ElementorTargetEnvironmentIssue {
  code: ElementorTargetEnvironmentIssueCode;
  path: string;
  message: string;
}

export interface ElementorTargetEnvironmentRequirementChecks {
  wordpressMinimum: boolean;
  phpMinimum: boolean;
  databaseSupported: boolean;
  databaseMinimum: boolean;
  memoryMinimum: boolean;
  browserSupported: boolean;
  browserMinimum: boolean;
}

export interface ElementorTargetEnvironmentValidationResult {
  valid: boolean;
  classification: ElementorTargetEnvironmentClassification;
  policyVersion: typeof ELEMENTOR_TARGET_ENVIRONMENT_POLICY_VERSION;
  environment: ElementorTargetEnvironmentEvidenceV1 | null;
  requirementChecks: ElementorTargetEnvironmentRequirementChecks;
  failures: ElementorTargetEnvironmentFailureCode[];
  reviewCodes: ElementorTargetEnvironmentReviewCode[];
  issues: ElementorTargetEnvironmentIssue[];
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  internalReviewRequired: true;
}

const EVIDENCE_KEYS = [
  'acceptanceAuthority',
  'browser',
  'database',
  'elementorProActive',
  'elementorVersion',
  'evidenceReference',
  'evidenceVersion',
  'internalReviewRequired',
  'observedAt',
  'phpVersion',
  'productionAcceptance',
  'schemaVersion',
  'source',
  'targetCompatibilityClaim',
  'thirdPartyElementorAddonsActive',
  'wordpressMemoryLimitMb',
  'wordpressVersion',
] as const;
const DATABASE_KEYS = ['engine', 'version'] as const;
const BROWSER_KEYS = ['family', 'version'] as const;

const MIN_WORDPRESS = [6, 8, 0] as const;
const MIN_PHP = [7, 4, 0] as const;
const MIN_MYSQL = [5, 6, 0] as const;
const MIN_MARIADB = [10, 5, 0] as const;
const MIN_MEMORY_MB = 256;
const BROWSER_MINIMUMS: Readonly<Record<Exclude<ElementorTargetEnvironmentBrowserFamily, 'OTHER'>, readonly number[]>> = Object.freeze({
  CHROME: [148, 0, 0],
  EDGE: [148, 0, 0],
  BRAVE: [148, 0, 0],
  FIREFOX: [150, 0, 0],
  SAFARI: [26, 2, 0],
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonicalExpected = [...expected].sort();
  return actual.length === canonicalExpected.length
    && actual.every((key, index) => key === canonicalExpected[index]);
}

function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function parseNumericVersion(value: unknown): number[] | null {
  if (typeof value !== 'string' || value.length > 64 || !/^\d+(?:\.\d+){1,3}$/.test(value)) return null;
  const parts = value.split('.').map((part) => Number(part));
  if (parts.some((part) => !Number.isSafeInteger(part) || part < 0 || part > 1_000_000)) return null;
  return parts;
}

function versionAtLeast(actual: readonly number[], minimum: readonly number[]): boolean {
  const length = Math.max(actual.length, minimum.length);
  for (let index = 0; index < length; index += 1) {
    const left = actual[index] ?? 0;
    const right = minimum[index] ?? 0;
    if (left > right) return true;
    if (left < right) return false;
  }
  return true;
}

function isDatabaseEngine(value: unknown): value is ElementorTargetEnvironmentDatabaseEngine {
  return value === 'MYSQL' || value === 'MARIADB' || value === 'SQLITE' || value === 'OTHER';
}

function isBrowserFamily(value: unknown): value is ElementorTargetEnvironmentBrowserFamily {
  return value === 'CHROME'
    || value === 'EDGE'
    || value === 'BRAVE'
    || value === 'FIREFOX'
    || value === 'SAFARI'
    || value === 'OTHER';
}

function emptyChecks(): ElementorTargetEnvironmentRequirementChecks {
  return {
    wordpressMinimum: false,
    phpMinimum: false,
    databaseSupported: false,
    databaseMinimum: false,
    memoryMinimum: false,
    browserSupported: false,
    browserMinimum: false,
  };
}

function snapshotEvidence(value: Record<string, unknown>): ElementorTargetEnvironmentEvidenceV1 | null {
  const database = value.database;
  const browser = value.browser;
  if (!isRecord(database)
    || !exactKeys(database, DATABASE_KEYS)
    || !isDatabaseEngine(database.engine)
    || !isBoundedString(database.version, 64)
    || !isRecord(browser)
    || !exactKeys(browser, BROWSER_KEYS)
    || !isBrowserFamily(browser.family)
    || !isBoundedString(browser.version, 64)) {
    return null;
  }

  if (value.schemaVersion !== 1
    || value.evidenceVersion !== ELEMENTOR_TARGET_ENVIRONMENT_EVIDENCE_VERSION
    || value.source !== 'OBSERVED'
    || !isBoundedString(value.wordpressVersion, 64)
    || !isBoundedString(value.elementorVersion, 64)
    || !isBoundedString(value.phpVersion, 64)
    || typeof value.wordpressMemoryLimitMb !== 'number'
    || !Number.isSafeInteger(value.wordpressMemoryLimitMb)
    || value.wordpressMemoryLimitMb <= 0
    || value.wordpressMemoryLimitMb > 1_048_576
    || typeof value.elementorProActive !== 'boolean'
    || typeof value.thirdPartyElementorAddonsActive !== 'boolean'
    || !isCanonicalIsoTimestamp(value.observedAt)
    || !isBoundedString(value.evidenceReference, 1024)) {
    return null;
  }

  return {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_TARGET_ENVIRONMENT_EVIDENCE_VERSION,
    source: 'OBSERVED',
    wordpressVersion: value.wordpressVersion,
    elementorVersion: value.elementorVersion,
    phpVersion: value.phpVersion,
    database: {
      engine: database.engine,
      version: database.version,
    },
    wordpressMemoryLimitMb: value.wordpressMemoryLimitMb,
    browser: {
      family: browser.family,
      version: browser.version,
    },
    elementorProActive: value.elementorProActive,
    thirdPartyElementorAddonsActive: value.thirdPartyElementorAddonsActive,
    observedAt: value.observedAt,
    evidenceReference: value.evidenceReference,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
}

export function validateElementorTargetEnvironmentEvidence(value: unknown): ElementorTargetEnvironmentValidationResult {
  const issues: ElementorTargetEnvironmentIssue[] = [];
  const failures: ElementorTargetEnvironmentFailureCode[] = [];
  const reviewCodes: ElementorTargetEnvironmentReviewCode[] = [];
  const requirementChecks = emptyChecks();

  if (!isRecord(value)) {
    issues.push({
      code: 'P15_TARGET_ENVIRONMENT_NOT_OBJECT',
      path: '$',
      message: 'Target environment evidence must be an object.',
    });
  } else {
    if (!exactKeys(value, EVIDENCE_KEYS)
      || value.schemaVersion !== 1
      || value.evidenceVersion !== ELEMENTOR_TARGET_ENVIRONMENT_EVIDENCE_VERSION
      || value.source !== 'OBSERVED') {
      issues.push({
        code: 'P15_TARGET_ENVIRONMENT_FIELDS_INVALID',
        path: '$',
        message: 'Target environment evidence contains unknown, missing or unsupported fields/version.',
      });
    }

    const wordpress = parseNumericVersion(value.wordpressVersion);
    const elementor = parseNumericVersion(value.elementorVersion);
    const php = parseNumericVersion(value.phpVersion);
    if (!wordpress || !elementor || !php) {
      issues.push({
        code: 'P15_TARGET_ENVIRONMENT_VERSION_INVALID',
        path: '$',
        message: 'WordPress, Elementor and PHP versions must use bounded numeric dotted versions.',
      });
    }

    if (!isRecord(value.database)
      || !exactKeys(value.database, DATABASE_KEYS)
      || !isDatabaseEngine(value.database.engine)
      || !parseNumericVersion(value.database.version)) {
      issues.push({
        code: 'P15_TARGET_ENVIRONMENT_DATABASE_INVALID',
        path: '$.database',
        message: 'Database evidence must use an exact supported engine enum and bounded numeric dotted version.',
      });
    }

    if (typeof value.wordpressMemoryLimitMb !== 'number'
      || !Number.isSafeInteger(value.wordpressMemoryLimitMb)
      || value.wordpressMemoryLimitMb <= 0
      || value.wordpressMemoryLimitMb > 1_048_576) {
      issues.push({
        code: 'P15_TARGET_ENVIRONMENT_MEMORY_INVALID',
        path: '$.wordpressMemoryLimitMb',
        message: 'WordPress memory limit must be a bounded positive integer in MB.',
      });
    }

    if (!isRecord(value.browser)
      || !exactKeys(value.browser, BROWSER_KEYS)
      || !isBrowserFamily(value.browser.family)
      || !parseNumericVersion(value.browser.version)) {
      issues.push({
        code: 'P15_TARGET_ENVIRONMENT_BROWSER_INVALID',
        path: '$.browser',
        message: 'Browser evidence must use an exact supported family enum and bounded numeric dotted version.',
      });
    }

    if (!isCanonicalIsoTimestamp(value.observedAt)) {
      issues.push({
        code: 'P15_TARGET_ENVIRONMENT_OBSERVED_AT_INVALID',
        path: '$.observedAt',
        message: 'observedAt must be a canonical ISO-8601 UTC timestamp.',
      });
    }

    if (!isBoundedString(value.evidenceReference, 1024)) {
      issues.push({
        code: 'P15_TARGET_ENVIRONMENT_EVIDENCE_REFERENCE_INVALID',
        path: '$.evidenceReference',
        message: 'A bounded non-empty retained evidence reference is required.',
      });
    }

    if (value.acceptanceAuthority !== false
      || value.targetCompatibilityClaim !== false
      || value.productionAcceptance !== false
      || value.internalReviewRequired !== true) {
      issues.push({
        code: 'P15_TARGET_ENVIRONMENT_AUTHORITY_FLAGS_INVALID',
        path: '$',
        message: 'Environment evidence cannot claim target compatibility, production acceptance or acceptance authority.',
      });
    }
  }

  const environment = isRecord(value) ? snapshotEvidence(value) : null;
  if (issues.length === 0 && environment) {
    const wordpress = parseNumericVersion(environment.wordpressVersion)!;
    const php = parseNumericVersion(environment.phpVersion)!;
    const databaseVersion = parseNumericVersion(environment.database.version)!;
    const browserVersion = parseNumericVersion(environment.browser.version)!;

    requirementChecks.wordpressMinimum = versionAtLeast(wordpress, MIN_WORDPRESS);
    if (!requirementChecks.wordpressMinimum) failures.push('P15_TARGET_ENVIRONMENT_WORDPRESS_BELOW_MINIMUM');

    requirementChecks.phpMinimum = versionAtLeast(php, MIN_PHP);
    if (!requirementChecks.phpMinimum) failures.push('P15_TARGET_ENVIRONMENT_PHP_BELOW_MINIMUM');

    requirementChecks.databaseSupported = environment.database.engine === 'MYSQL' || environment.database.engine === 'MARIADB';
    if (!requirementChecks.databaseSupported) {
      failures.push('P15_TARGET_ENVIRONMENT_DATABASE_ENGINE_UNSUPPORTED');
    } else {
      const minimum = environment.database.engine === 'MYSQL' ? MIN_MYSQL : MIN_MARIADB;
      requirementChecks.databaseMinimum = versionAtLeast(databaseVersion, minimum);
      if (!requirementChecks.databaseMinimum) failures.push('P15_TARGET_ENVIRONMENT_DATABASE_BELOW_MINIMUM');
    }

    requirementChecks.memoryMinimum = environment.wordpressMemoryLimitMb >= MIN_MEMORY_MB;
    if (!requirementChecks.memoryMinimum) failures.push('P15_TARGET_ENVIRONMENT_MEMORY_BELOW_MINIMUM');

    requirementChecks.browserSupported = environment.browser.family !== 'OTHER';
    if (!requirementChecks.browserSupported) {
      failures.push('P15_TARGET_ENVIRONMENT_BROWSER_UNSUPPORTED');
    } else {
      const minimum = BROWSER_MINIMUMS[environment.browser.family];
      requirementChecks.browserMinimum = versionAtLeast(browserVersion, minimum);
      if (!requirementChecks.browserMinimum) failures.push('P15_TARGET_ENVIRONMENT_BROWSER_BELOW_MINIMUM');
    }

    if (environment.elementorProActive) reviewCodes.push('P15_TARGET_ENVIRONMENT_ELEMENTOR_PRO_ACTIVE');
    if (environment.thirdPartyElementorAddonsActive) {
      reviewCodes.push('P15_TARGET_ENVIRONMENT_THIRD_PARTY_ADDONS_ACTIVE');
    }
  }

  const valid = issues.length === 0 && environment !== null;
  let classification: ElementorTargetEnvironmentClassification = 'REJECTED';
  if (valid) {
    if (failures.length > 0) classification = 'NOT_QUALIFIED';
    else if (reviewCodes.length > 0) classification = 'REVIEW_REQUIRED';
    else classification = 'QUALIFIED_FOR_BOUND_TARGET_PROOF';
  }

  return {
    valid,
    classification,
    policyVersion: ELEMENTOR_TARGET_ENVIRONMENT_POLICY_VERSION,
    environment: valid ? environment : null,
    requirementChecks,
    failures,
    reviewCodes,
    issues,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
}

export function buildElementorTargetEnvironmentEvidence(input: Omit<ElementorTargetEnvironmentEvidenceV1,
  'schemaVersion' | 'evidenceVersion' | 'source' | 'acceptanceAuthority' | 'targetCompatibilityClaim' | 'productionAcceptance' | 'internalReviewRequired'>): ElementorTargetEnvironmentEvidenceV1 {
  const evidence: ElementorTargetEnvironmentEvidenceV1 = {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_TARGET_ENVIRONMENT_EVIDENCE_VERSION,
    source: 'OBSERVED',
    ...input,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    internalReviewRequired: true,
  };
  const validation = validateElementorTargetEnvironmentEvidence(evidence);
  if (!validation.valid || !validation.environment) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor target environment evidence: ${first.code} at ${first.path}`
      : 'Invalid Elementor target environment evidence.');
  }
  return validation.environment;
}

export function serializeElementorTargetEnvironmentEvidence(evidence: ElementorTargetEnvironmentEvidenceV1): string {
  const validation = validateElementorTargetEnvironmentEvidence(evidence);
  if (!validation.valid || !validation.environment) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor target environment evidence: ${first.code} at ${first.path}`
      : 'Invalid Elementor target environment evidence.');
  }
  return `${JSON.stringify(validation.environment, null, 2)}\n`;
}
