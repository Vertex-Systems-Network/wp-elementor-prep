import { sha256Hex } from '../../core/sha256';
import { ELEMENTOR_CAPABILITY_REGISTRY_VERSION } from './capability-registry';
import {
  ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
  ELEMENTOR_TEMPLATE_DATA_VERSION,
} from './template-v04';

export const ELEMENTOR_TARGET_PROFILE_VERSION = 'elementor-target-profile-v1' as const;

export interface ElementorTargetProfileV1 {
  schemaVersion: 1;
  profileVersion: typeof ELEMENTOR_TARGET_PROFILE_VERSION;
  target: 'elementor';
  adapterContractVersion: typeof ELEMENTOR_TEMPLATE_CONTRACT_VERSION;
  capabilityRegistryVersion: typeof ELEMENTOR_CAPABILITY_REGISTRY_VERSION;
  documentDataVersion: typeof ELEMENTOR_TEMPLATE_DATA_VERSION;
  architecture: 'CONTAINER';
  outputMode: 'TEMPLATE_JSON';
  responsiveMode: 'SOURCE_ONLY';
  proWidgets: 'UNSUPPORTED';
  atomicElements: 'UNSUPPORTED';
  globalReferencePolicy: 'REVIEW_REQUIRED';
  assetReferencePolicy: 'REVIEW_REQUIRED';
  environment: {
    source: 'DECLARED';
    wordpressVersion: string;
    elementorVersion: string;
  };
  targetEnvironmentValidated: false;
  targetCompatibilityClaim: false;
  generationEnabled: false;
  downloadEnabled: false;
}

export type ElementorTargetProfileIssueCode =
  | 'P15_PROFILE_NOT_OBJECT'
  | 'P15_PROFILE_FIELDS_INVALID'
  | 'P15_PROFILE_ENVIRONMENT_INVALID'
  | 'P15_PROFILE_AUTHORITY_FLAGS_INVALID';

export interface ElementorTargetProfileIssue {
  code: ElementorTargetProfileIssueCode;
  path: string;
  message: string;
}

export interface ElementorTargetProfileValidationResult {
  valid: boolean;
  profile: ElementorTargetProfileV1 | null;
  issues: ElementorTargetProfileIssue[];
}

const PROFILE_KEYS = [
  'adapterContractVersion',
  'architecture',
  'assetReferencePolicy',
  'atomicElements',
  'capabilityRegistryVersion',
  'documentDataVersion',
  'downloadEnabled',
  'environment',
  'generationEnabled',
  'globalReferencePolicy',
  'outputMode',
  'profileVersion',
  'proWidgets',
  'responsiveMode',
  'schemaVersion',
  'target',
  'targetCompatibilityClaim',
  'targetEnvironmentValidated',
] as const;

const ENVIRONMENT_KEYS = ['elementorVersion', 'source', 'wordpressVersion'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function boundedVersion(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 64;
}

function snapshotProfile(value: Record<string, unknown>): ElementorTargetProfileV1 | null {
  const environment = value.environment;
  if (!isRecord(environment)
    || !exactKeys(environment, ENVIRONMENT_KEYS)
    || environment.source !== 'DECLARED'
    || !boundedVersion(environment.wordpressVersion)
    || !boundedVersion(environment.elementorVersion)) {
    return null;
  }

  return {
    schemaVersion: 1,
    profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
    target: 'elementor',
    adapterContractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
    capabilityRegistryVersion: ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
    documentDataVersion: ELEMENTOR_TEMPLATE_DATA_VERSION,
    architecture: 'CONTAINER',
    outputMode: 'TEMPLATE_JSON',
    responsiveMode: 'SOURCE_ONLY',
    proWidgets: 'UNSUPPORTED',
    atomicElements: 'UNSUPPORTED',
    globalReferencePolicy: 'REVIEW_REQUIRED',
    assetReferencePolicy: 'REVIEW_REQUIRED',
    environment: {
      source: 'DECLARED',
      wordpressVersion: environment.wordpressVersion,
      elementorVersion: environment.elementorVersion,
    },
    targetEnvironmentValidated: false,
    targetCompatibilityClaim: false,
    generationEnabled: false,
    downloadEnabled: false,
  };
}

/**
 * Validate one immutable declared Elementor target profile.
 *
 * This profile records intended target/options only. It is not observed environment evidence and cannot
 * establish target compatibility, artifact generation authority or download authority.
 */
export function validateElementorTargetProfile(value: unknown): ElementorTargetProfileValidationResult {
  const issues: ElementorTargetProfileIssue[] = [];
  if (!isRecord(value)) {
    return {
      valid: false,
      profile: null,
      issues: [{
        code: 'P15_PROFILE_NOT_OBJECT',
        path: '$',
        message: 'Elementor target profile must be an object.',
      }],
    };
  }

  const fieldsValid = exactKeys(value, PROFILE_KEYS)
    && value.schemaVersion === 1
    && value.profileVersion === ELEMENTOR_TARGET_PROFILE_VERSION
    && value.target === 'elementor'
    && value.adapterContractVersion === ELEMENTOR_TEMPLATE_CONTRACT_VERSION
    && value.capabilityRegistryVersion === ELEMENTOR_CAPABILITY_REGISTRY_VERSION
    && value.documentDataVersion === ELEMENTOR_TEMPLATE_DATA_VERSION
    && value.architecture === 'CONTAINER'
    && value.outputMode === 'TEMPLATE_JSON'
    && value.responsiveMode === 'SOURCE_ONLY'
    && value.proWidgets === 'UNSUPPORTED'
    && value.atomicElements === 'UNSUPPORTED'
    && value.globalReferencePolicy === 'REVIEW_REQUIRED'
    && value.assetReferencePolicy === 'REVIEW_REQUIRED';
  if (!fieldsValid) {
    issues.push({
      code: 'P15_PROFILE_FIELDS_INVALID',
      path: '$',
      message: 'Profile contains unknown, missing or unsupported target/options fields.',
    });
  }

  const snapshot = snapshotProfile(value);
  if (!snapshot) {
    issues.push({
      code: 'P15_PROFILE_ENVIRONMENT_INVALID',
      path: '$.environment',
      message: 'Environment must be an exact DECLARED profile with bounded WordPress and Elementor versions.',
    });
  }

  if (value.targetEnvironmentValidated !== false
    || value.targetCompatibilityClaim !== false
    || value.generationEnabled !== false
    || value.downloadEnabled !== false) {
    issues.push({
      code: 'P15_PROFILE_AUTHORITY_FLAGS_INVALID',
      path: '$',
      message: 'Declared target profile cannot claim observed environment, compatibility, generation or download authority.',
    });
  }

  return {
    valid: issues.length === 0,
    profile: issues.length === 0 ? snapshot : null,
    issues,
  };
}

export function buildElementorTargetProfile(input: {
  wordpressVersion: string;
  elementorVersion: string;
}): ElementorTargetProfileV1 {
  const profile: ElementorTargetProfileV1 = {
    schemaVersion: 1,
    profileVersion: ELEMENTOR_TARGET_PROFILE_VERSION,
    target: 'elementor',
    adapterContractVersion: ELEMENTOR_TEMPLATE_CONTRACT_VERSION,
    capabilityRegistryVersion: ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
    documentDataVersion: ELEMENTOR_TEMPLATE_DATA_VERSION,
    architecture: 'CONTAINER',
    outputMode: 'TEMPLATE_JSON',
    responsiveMode: 'SOURCE_ONLY',
    proWidgets: 'UNSUPPORTED',
    atomicElements: 'UNSUPPORTED',
    globalReferencePolicy: 'REVIEW_REQUIRED',
    assetReferencePolicy: 'REVIEW_REQUIRED',
    environment: {
      source: 'DECLARED',
      wordpressVersion: input.wordpressVersion,
      elementorVersion: input.elementorVersion,
    },
    targetEnvironmentValidated: false,
    targetCompatibilityClaim: false,
    generationEnabled: false,
    downloadEnabled: false,
  };

  const validation = validateElementorTargetProfile(profile);
  if (!validation.valid || validation.profile === null) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor target profile: ${first.code} at ${first.path}`
      : 'Invalid Elementor target profile.');
  }
  return validation.profile;
}

export function serializeElementorTargetProfile(profile: ElementorTargetProfileV1): string {
  const validation = validateElementorTargetProfile(profile);
  if (!validation.valid || validation.profile === null) {
    const first = validation.issues[0];
    throw new Error(first
      ? `Invalid Elementor target profile: ${first.code} at ${first.path}`
      : 'Invalid Elementor target profile.');
  }
  return `${JSON.stringify(validation.profile, null, 2)}\n`;
}

export function fingerprintElementorTargetProfile(profile: ElementorTargetProfileV1): string {
  return `sha256:${sha256Hex(serializeElementorTargetProfile(profile))}`;
}
