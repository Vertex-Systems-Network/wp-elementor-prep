import { sha256Hex } from '../../core/sha256';
import {
  GUTENBERG_CAPABILITY_REGISTRY_VERSION,
  GUTENBERG_DOCUMENTED_CORE_API_VERSION,
} from './capability-registry';
import { GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION } from './parsed-block';

export const GUTENBERG_TARGET_PROFILE_VERSION = 'gutenberg-target-profile-v1' as const;

export interface GutenbergTargetProfileV1 {
  schemaVersion: 1;
  profileVersion: typeof GUTENBERG_TARGET_PROFILE_VERSION;
  target: 'gutenberg';
  adapterContractVersion: typeof GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION;
  capabilityRegistryVersion: typeof GUTENBERG_CAPABILITY_REGISTRY_VERSION;
  documentedCoreApiVersion: typeof GUTENBERG_DOCUMENTED_CORE_API_VERSION;
  outputMode: 'NORMALIZED_REVIEW_ONLY';
  serializationMode: 'UNWIRED';
  responsiveMode: 'SOURCE_ONLY';
  customBlockPolicy: 'REVIEW_REQUIRED';
  freeformContentPolicy: 'REVIEW_REQUIRED';
  dynamicBlockPolicy: 'REVIEW_REQUIRED';
  patternPackagePolicy: 'UNWIRED';
  environment: {
    source: 'DECLARED';
    wordpressVersion: string;
  };
  targetEnvironmentValidated: false;
  nativeSerializationValidated: false;
  editorImportValidated: false;
  renderValidated: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
}

export type GutenbergTargetProfileIssueCode =
  | 'P16_PROFILE_NOT_OBJECT'
  | 'P16_PROFILE_FIELDS_INVALID'
  | 'P16_PROFILE_ENVIRONMENT_INVALID'
  | 'P16_PROFILE_VALIDATION_FLAGS_INVALID'
  | 'P16_PROFILE_AUTHORITY_FLAGS_INVALID';

export interface GutenbergTargetProfileIssue {
  code: GutenbergTargetProfileIssueCode;
  path: string;
  message: string;
}

export interface GutenbergTargetProfileValidationResult {
  valid: boolean;
  profile: GutenbergTargetProfileV1 | null;
  issues: GutenbergTargetProfileIssue[];
}

const PROFILE_KEYS = [
  'adapterContractVersion',
  'capabilityRegistryVersion',
  'customBlockPolicy',
  'documentedCoreApiVersion',
  'downloadEnabled',
  'dynamicBlockPolicy',
  'editorImportValidated',
  'environment',
  'freeformContentPolicy',
  'generationEnabled',
  'nativeSerializationValidated',
  'outputMode',
  'patternPackagePolicy',
  'productionAcceptance',
  'profileVersion',
  'renderValidated',
  'responsiveMode',
  'schemaVersion',
  'serializationMode',
  'target',
  'targetCompatibilityClaim',
  'targetEnvironmentValidated',
] as const;

const ENVIRONMENT_KEYS = ['source', 'wordpressVersion'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonicalExpected = [...expected].sort();
  return actual.length === canonicalExpected.length
    && actual.every((key, index) => key === canonicalExpected[index]);
}

function boundedVersion(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 64;
}

function snapshotProfile(value: Record<string, unknown>): GutenbergTargetProfileV1 | null {
  const environment = value.environment;
  if (!isRecord(environment)
    || !exactKeys(environment, ENVIRONMENT_KEYS)
    || environment.source !== 'DECLARED'
    || !boundedVersion(environment.wordpressVersion)) {
    return null;
  }

  return {
    schemaVersion: 1,
    profileVersion: GUTENBERG_TARGET_PROFILE_VERSION,
    target: 'gutenberg',
    adapterContractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    capabilityRegistryVersion: GUTENBERG_CAPABILITY_REGISTRY_VERSION,
    documentedCoreApiVersion: GUTENBERG_DOCUMENTED_CORE_API_VERSION,
    outputMode: 'NORMALIZED_REVIEW_ONLY',
    serializationMode: 'UNWIRED',
    responsiveMode: 'SOURCE_ONLY',
    customBlockPolicy: 'REVIEW_REQUIRED',
    freeformContentPolicy: 'REVIEW_REQUIRED',
    dynamicBlockPolicy: 'REVIEW_REQUIRED',
    patternPackagePolicy: 'UNWIRED',
    environment: {
      source: 'DECLARED',
      wordpressVersion: environment.wordpressVersion,
    },
    targetEnvironmentValidated: false,
    nativeSerializationValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
  };
}

/**
 * Validate one immutable declared Gutenberg target profile.
 *
 * The profile records intended target/options only. It is not observed WordPress evidence and cannot establish
 * native serialization support, editor/import/render validity, target compatibility, production acceptance,
 * generation authority, or download authority.
 */
export function validateGutenbergTargetProfile(value: unknown): GutenbergTargetProfileValidationResult {
  const issues: GutenbergTargetProfileIssue[] = [];
  if (!isRecord(value)) {
    return {
      valid: false,
      profile: null,
      issues: [{
        code: 'P16_PROFILE_NOT_OBJECT',
        path: '$',
        message: 'Gutenberg target profile must be an object.',
      }],
    };
  }

  const fieldsValid = exactKeys(value, PROFILE_KEYS)
    && value.schemaVersion === 1
    && value.profileVersion === GUTENBERG_TARGET_PROFILE_VERSION
    && value.target === 'gutenberg'
    && value.adapterContractVersion === GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION
    && value.capabilityRegistryVersion === GUTENBERG_CAPABILITY_REGISTRY_VERSION
    && value.documentedCoreApiVersion === GUTENBERG_DOCUMENTED_CORE_API_VERSION
    && value.outputMode === 'NORMALIZED_REVIEW_ONLY'
    && value.serializationMode === 'UNWIRED'
    && value.responsiveMode === 'SOURCE_ONLY'
    && value.customBlockPolicy === 'REVIEW_REQUIRED'
    && value.freeformContentPolicy === 'REVIEW_REQUIRED'
    && value.dynamicBlockPolicy === 'REVIEW_REQUIRED'
    && value.patternPackagePolicy === 'UNWIRED';
  if (!fieldsValid) {
    issues.push({
      code: 'P16_PROFILE_FIELDS_INVALID',
      path: '$',
      message: 'Profile contains unknown, missing or unsupported Gutenberg target/options fields.',
    });
  }

  const snapshot = snapshotProfile(value);
  if (!snapshot) {
    issues.push({
      code: 'P16_PROFILE_ENVIRONMENT_INVALID',
      path: '$.environment',
      message: 'Environment must be an exact DECLARED profile with a bounded WordPress version.',
    });
  }

  if (value.targetEnvironmentValidated !== false
    || value.nativeSerializationValidated !== false
    || value.editorImportValidated !== false
    || value.renderValidated !== false) {
    issues.push({
      code: 'P16_PROFILE_VALIDATION_FLAGS_INVALID',
      path: '$',
      message: 'Declared target profile cannot claim observed environment, native serialization, editor/import, or render validation.',
    });
  }

  if (value.targetCompatibilityClaim !== false
    || value.productionAcceptance !== false
    || value.generationEnabled !== false
    || value.downloadEnabled !== false) {
    issues.push({
      code: 'P16_PROFILE_AUTHORITY_FLAGS_INVALID',
      path: '$',
      message: 'Declared target profile cannot claim compatibility, production acceptance, generation, or download authority.',
    });
  }

  return {
    valid: issues.length === 0,
    profile: issues.length === 0 ? snapshot : null,
    issues,
  };
}

export function buildGutenbergTargetProfile(input: {
  wordpressVersion: string;
}): GutenbergTargetProfileV1 {
  const profile: GutenbergTargetProfileV1 = {
    schemaVersion: 1,
    profileVersion: GUTENBERG_TARGET_PROFILE_VERSION,
    target: 'gutenberg',
    adapterContractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    capabilityRegistryVersion: GUTENBERG_CAPABILITY_REGISTRY_VERSION,
    documentedCoreApiVersion: GUTENBERG_DOCUMENTED_CORE_API_VERSION,
    outputMode: 'NORMALIZED_REVIEW_ONLY',
    serializationMode: 'UNWIRED',
    responsiveMode: 'SOURCE_ONLY',
    customBlockPolicy: 'REVIEW_REQUIRED',
    freeformContentPolicy: 'REVIEW_REQUIRED',
    dynamicBlockPolicy: 'REVIEW_REQUIRED',
    patternPackagePolicy: 'UNWIRED',
    environment: {
      source: 'DECLARED',
      wordpressVersion: input.wordpressVersion,
    },
    targetEnvironmentValidated: false,
    nativeSerializationValidated: false,
    editorImportValidated: false,
    renderValidated: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
  };

  const validation = validateGutenbergTargetProfile(profile);
  if (!validation.valid || validation.profile === null) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Gutenberg target profile: ${first.code} at ${first.path}`
      : 'Invalid Gutenberg target profile.');
  }
  return validation.profile;
}

export function serializeGutenbergTargetProfile(profile: GutenbergTargetProfileV1): string {
  const validation = validateGutenbergTargetProfile(profile);
  if (!validation.valid || validation.profile === null) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Gutenberg target profile: ${first.code} at ${first.path}`
      : 'Invalid Gutenberg target profile.');
  }
  return `${JSON.stringify(validation.profile, null, 2)}\n`;
}

export function fingerprintGutenbergTargetProfile(profile: GutenbergTargetProfileV1): string {
  return `sha256:${sha256Hex(serializeGutenbergTargetProfile(profile))}`;
}
