import { sha256Hex } from '../../core/sha256';
import {
  buildGutenbergNativeSerializationEvidenceRetentionRequirements,
  type GutenbergNativeSerializationEvidenceRetentionRequirementsStatus,
} from './native-serialization-evidence-retention-requirements';

export const GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_REQUIREMENTS_VALIDATION_VERSION =
  'gutenberg-native-serialization-evidence-retention-requirements-validation-v1' as const;
export const GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_DEPTH = 64;
export const GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_VALUES = 50_000;
export const GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_TEXT_BYTES = 1024 * 1024;

export type GutenbergNativeSerializationEvidenceRetentionRequirementsValidationStatus =
  | 'REJECTED_CURRENT_CHAIN_NOT_READY'
  | 'REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE'
  | 'CURRENT_REQUIREMENTS_MANIFEST_VALID';

export type GutenbergNativeSerializationEvidenceRetentionRequirementsValidationNextAction =
  | 'FIX_CURRENT_PREREQUISITE_CHAIN'
  | 'REEXPORT_CURRENT_RETENTION_REQUIREMENTS_MANIFEST'
  | 'RETAIN_VALIDATED_MANIFEST_AS_NON_AUTHORIZING_METADATA';

export type GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssueCode =
  | 'P16_RETENTION_MANIFEST_CURRENT_CHAIN_NOT_READY'
  | 'P16_RETENTION_MANIFEST_NOT_OBJECT'
  | 'P16_RETENTION_MANIFEST_INVALID_OR_STALE';

export interface GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssue {
  code: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssueCode;
  message: string;
}

export interface GutenbergNativeSerializationEvidenceRetentionRequirementsValidationV1 {
  schemaVersion: 1;
  validationVersion: typeof GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_REQUIREMENTS_VALIDATION_VERSION;
  status: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationStatus;
  currentRequirementsStatus: GutenbergNativeSerializationEvidenceRetentionRequirementsStatus;
  providedManifestObject: boolean;
  exactSemanticMatch: boolean;
  canonicalExpectedManifestSha256: string;
  canonicalProvidedManifestSha256: string | null;
  nextAction: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationNextAction;
  issues: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssue[];
  evidenceAuthenticationStatus: 'NOT_RUN';
  authenticationAuthority: false;
  nativeSerializationAuthority: false;
  targetEnvironmentValidated: false;
  editorImportValidated: false;
  renderValidated: false;
  decisionAuthority: false;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  internalDecisionStatus: 'NOT_RUN';
  internalDecisionEligible: false;
  internalReviewRequired: true;
}

type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue };

type CanonicalizationBudget = {
  visitedValues: number;
  textBytes: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function utf8ByteLengthWithinLimit(value: string, limit: number): number | null {
  let bytes = 0;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        index += 1;
      } else {
        bytes += 3;
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      bytes += 3;
    } else {
      bytes += 3;
    }

    if (bytes > limit) return null;
  }

  return bytes;
}

function consumeCanonicalTextBudget(value: string, budget: CanonicalizationBudget): void {
  const remaining = GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_TEXT_BYTES - budget.textBytes;
  const bytes = utf8ByteLengthWithinLimit(value, remaining);
  if (bytes === null) {
    throw new Error('Manifest value exceeds canonical JSON text byte limit.');
  }
  budget.textBytes += bytes;
}

function readOwnDataProperty(value: object, key: PropertyKey): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor) {
    throw new Error('Manifest value is missing an expected own property.');
  }
  if (!('value' in descriptor)) {
    throw new Error('Manifest value contains an accessor property.');
  }
  return descriptor.value;
}

function isCanonicalArrayIndexKey(key: string, length: number): boolean {
  if (key.length === 0) return false;
  const index = Number(key);
  return Number.isInteger(index)
    && index >= 0
    && index < length
    && String(index) === key;
}

function assertCanonicalArrayOwnShape(
  value: unknown[],
  budget: CanonicalizationBudget,
): void {
  if (value.length > GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_VALUES - budget.visitedValues) {
    throw new Error('Manifest value exceeds canonical JSON structural value limit.');
  }

  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new Error('Manifest array contains a symbol property.');
  }

  for (const key of Object.getOwnPropertyNames(value)) {
    if (key === 'length') continue;
    if (!isCanonicalArrayIndexKey(key, value.length)) {
      throw new Error('Manifest array contains a non-JSON own property.');
    }
  }
}

function getCanonicalObjectKeys(value: object): string[] {
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new Error('Manifest object contains a symbol property.');
  }

  const keys = Object.getOwnPropertyNames(value);
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor) {
      throw new Error('Manifest value is missing an expected own property.');
    }
    if (!descriptor.enumerable) {
      throw new Error('Manifest object contains a non-enumerable property.');
    }
    if (!('value' in descriptor)) {
      throw new Error('Manifest value contains an accessor property.');
    }
  }
  return keys;
}

function canonicalizeJson(
  value: unknown,
  seen: Set<object>,
  budget: CanonicalizationBudget,
  containerDepth: number,
): CanonicalJsonValue {
  budget.visitedValues += 1;
  if (budget.visitedValues > GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_VALUES) {
    throw new Error('Manifest value exceeds canonical JSON structural value limit.');
  }

  if (value === null) return null;
  if (typeof value === 'string') {
    consumeCanonicalTextBudget(value, budget);
    return value;
  }
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Non-finite numbers are not valid JSON values.');
    return value;
  }
  if (typeof value !== 'object') {
    throw new Error('Manifest value contains a non-JSON value.');
  }

  const nextDepth = containerDepth + 1;
  if (nextDepth > GUTENBERG_RETENTION_MANIFEST_CANONICAL_MAX_DEPTH) {
    throw new Error('Manifest value exceeds canonical JSON nesting limit.');
  }

  if (seen.has(value)) throw new Error('Manifest value contains a cycle.');
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      assertCanonicalArrayOwnShape(value, budget);
      const result: CanonicalJsonValue[] = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) {
          throw new Error('Sparse arrays are not accepted as canonical JSON.');
        }
        result.push(canonicalizeJson(
          readOwnDataProperty(value, String(index)),
          seen,
          budget,
          nextDepth,
        ));
      }
      return result;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error('Manifest object must be a plain JSON object.');
    }

    const keys = getCanonicalObjectKeys(value);
    for (const key of keys) {
      consumeCanonicalTextBudget(key, budget);
    }
    keys.sort();

    const result = Object.create(null) as { [key: string]: CanonicalJsonValue };
    for (const key of keys) {
      result[key] = canonicalizeJson(
        readOwnDataProperty(value, key),
        seen,
        budget,
        nextDepth,
      );
    }
    return result;
  } finally {
    seen.delete(value);
  }
}

function canonicalJson(value: unknown): string | null {
  try {
    return JSON.stringify(canonicalizeJson(
      value,
      new Set<object>(),
      { visitedValues: 0, textBytes: 0 },
      0,
    ));
  } catch {
    return null;
  }
}

function sha256CanonicalJson(value: unknown): string | null {
  const serialized = canonicalJson(value);
  return serialized === null ? null : `sha256:${sha256Hex(serialized)}`;
}

/**
 * Validate one previously exported retention-requirements manifest against the current exact P16 chain.
 *
 * Validation is semantic and key-order independent. A VALID result means only that the supplied sanitized
 * requirements metadata exactly matches what the repository currently rebuilds. It does not authenticate
 * evidence, validate WordPress, create an internal decision, or grant any compatibility/production authority.
 */
export function validateGutenbergNativeSerializationEvidenceRetentionRequirements(
  manifestValue: unknown,
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
  authenticationReportValue: unknown,
): GutenbergNativeSerializationEvidenceRetentionRequirementsValidationV1 {
  const expected = buildGutenbergNativeSerializationEvidenceRetentionRequirements(
    documentValue,
    profileValue,
    receiptValue,
    authenticationReportValue,
  );

  const expectedCanonical = canonicalJson(expected);
  if (expectedCanonical === null) {
    throw new Error('Repository-generated P16 retention requirements manifest is not canonically serializable.');
  }

  const expectedSha256 = `sha256:${sha256Hex(expectedCanonical)}`;
  const providedObject = isRecord(manifestValue);
  const providedCanonical = providedObject ? canonicalJson(manifestValue) : null;
  const providedSha256 = providedCanonical === null
    ? null
    : `sha256:${sha256Hex(providedCanonical)}`;
  const currentReady = expected.status === 'EVIDENCE_RETENTION_REQUIREMENTS_READY';
  const exactSemanticMatch = currentReady
    && providedCanonical !== null
    && providedCanonical === expectedCanonical;

  const issues: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationIssue[] = [];
  let status: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationStatus;
  let nextAction: GutenbergNativeSerializationEvidenceRetentionRequirementsValidationNextAction;

  if (!currentReady) {
    status = 'REJECTED_CURRENT_CHAIN_NOT_READY';
    nextAction = 'FIX_CURRENT_PREREQUISITE_CHAIN';
    issues.push({
      code: 'P16_RETENTION_MANIFEST_CURRENT_CHAIN_NOT_READY',
      message: 'Current exact P16 prerequisite chain is not ready for retention requirements validation.',
    });
  } else if (!providedObject) {
    status = 'REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE';
    nextAction = 'REEXPORT_CURRENT_RETENTION_REQUIREMENTS_MANIFEST';
    issues.push({
      code: 'P16_RETENTION_MANIFEST_NOT_OBJECT',
      message: 'Provided retention requirements manifest must be a JSON object.',
    });
  } else if (!exactSemanticMatch) {
    status = 'REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE';
    nextAction = 'REEXPORT_CURRENT_RETENTION_REQUIREMENTS_MANIFEST';
    issues.push({
      code: 'P16_RETENTION_MANIFEST_INVALID_OR_STALE',
      message: 'Provided retention requirements manifest does not exactly match the current deterministic manifest.',
    });
  } else {
    status = 'CURRENT_REQUIREMENTS_MANIFEST_VALID';
    nextAction = 'RETAIN_VALIDATED_MANIFEST_AS_NON_AUTHORIZING_METADATA';
  }

  return {
    schemaVersion: 1,
    validationVersion:
      GUTENBERG_NATIVE_SERIALIZATION_EVIDENCE_RETENTION_REQUIREMENTS_VALIDATION_VERSION,
    status,
    currentRequirementsStatus: expected.status,
    providedManifestObject: providedObject,
    exactSemanticMatch,
    canonicalExpectedManifestSha256: expectedSha256,
    canonicalProvidedManifestSha256: providedSha256,
    nextAction,
    issues,
    evidenceAuthenticationStatus: 'NOT_RUN',
    authenticationAuthority: false,
    nativeSerializationAuthority: false,
    targetEnvironmentValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    decisionAuthority: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalDecisionStatus: 'NOT_RUN',
    internalDecisionEligible: false,
    internalReviewRequired: true,
  };
}

export function serializeGutenbergNativeSerializationEvidenceRetentionRequirementsValidation(
  manifestValue: unknown,
  documentValue: unknown,
  profileValue: unknown,
  receiptValue: unknown,
  authenticationReportValue: unknown,
): string {
  return `${JSON.stringify(
    validateGutenbergNativeSerializationEvidenceRetentionRequirements(
      manifestValue,
      documentValue,
      profileValue,
      receiptValue,
      authenticationReportValue,
    ),
    null,
    2,
  )}\n`;
}

export function fingerprintGutenbergNativeSerializationEvidenceRetentionRequirementsValue(
  manifestValue: unknown,
): string | null {
  return sha256CanonicalJson(manifestValue);
}
