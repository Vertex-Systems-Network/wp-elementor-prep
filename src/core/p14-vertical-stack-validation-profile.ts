import { validateP14ValidationEvidence } from './p14-validation-evidence';

export const P14_VERTICAL_STACK_VALIDATION_PROFILE_SCHEMA_VERSION = 1 as const;
export const P14_VERTICAL_STACK_VALIDATION_PROFILE_VERSION = 1 as const;
export const P14_VERTICAL_STACK_VALIDATION_PROFILE_ID =
  'P14_VALIDATE_VERTICAL_STACK_V1' as const;

export const P14_VERTICAL_STACK_REQUIRED_VALIDATION_CHECK_IDS = Object.freeze([
  'vertical-stack-layout-mode',
  'vertical-stack-primary-axis-sizing',
  'vertical-stack-counter-axis-sizing',
  'vertical-stack-primary-axis-alignment',
  'vertical-stack-counter-axis-alignment',
  'vertical-stack-item-spacing',
  'vertical-stack-padding',
  'vertical-stack-child-structure-preserved',
  'vertical-stack-content-preserved',
  'vertical-stack-visibility-preserved',
  'vertical-stack-geometry-preserved',
] as const);

export type P14VerticalStackValidationCheckId =
  typeof P14_VERTICAL_STACK_REQUIRED_VALIDATION_CHECK_IDS[number];

export interface P14VerticalStackValidationProfileV1 {
  schemaVersion: typeof P14_VERTICAL_STACK_VALIDATION_PROFILE_SCHEMA_VERSION;
  profileVersion: typeof P14_VERTICAL_STACK_VALIDATION_PROFILE_VERSION;
  profileId: typeof P14_VERTICAL_STACK_VALIDATION_PROFILE_ID;
  requiredCheckIds: readonly P14VerticalStackValidationCheckId[];
  candidateOnly: true;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
}

export interface P14VerticalStackValidationProfileAssessment {
  valid: boolean;
  failures: string[];
  observedProfileIds: string[];
  observedCheckIds: string[];
}

export const P14_VERTICAL_STACK_VALIDATION_PROFILE: P14VerticalStackValidationProfileV1 =
  Object.freeze({
    schemaVersion: P14_VERTICAL_STACK_VALIDATION_PROFILE_SCHEMA_VERSION,
    profileVersion: P14_VERTICAL_STACK_VALIDATION_PROFILE_VERSION,
    profileId: P14_VERTICAL_STACK_VALIDATION_PROFILE_ID,
    requiredCheckIds: P14_VERTICAL_STACK_REQUIRED_VALIDATION_CHECK_IDS,
    candidateOnly: true,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
  });

function stableUnique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/**
 * Applies the accepted target-neutral vertical-stack validation policy to already-bounded adapter
 * validation evidence. This is evidence validation only: it grants no runtime mutation,
 * confirmation, target compatibility or production acceptance authority.
 */
export function assessP14VerticalStackValidationProfileEvidence(
  value: unknown,
): P14VerticalStackValidationProfileAssessment {
  const bounded = validateP14ValidationEvidence(value);
  if (!bounded.valid || !bounded.value) {
    return {
      valid: false,
      failures: bounded.failures,
      observedProfileIds: [],
      observedCheckIds: [],
    };
  }

  const failures: string[] = [];
  const profileIds: string[] = [];
  for (const profileId of bounded.value.profileIdsRun) {
    if (typeof profileId !== 'string' || profileId.length === 0) {
      failures.push('Vertical-stack validation profile evidence contains an invalid profile ID.');
      continue;
    }
    profileIds.push(profileId);
  }

  if (new Set(profileIds).size !== profileIds.length) {
    failures.push('Vertical-stack validation profile evidence contains duplicate profile IDs.');
  }
  const observedProfileIds = stableUnique(profileIds);
  if (!observedProfileIds.includes(P14_VERTICAL_STACK_VALIDATION_PROFILE_ID)) {
    failures.push(
      `Required validation profile ${P14_VERTICAL_STACK_VALIDATION_PROFILE_ID} did not run.`,
    );
  }
  const unknownProfileIds = observedProfileIds.filter(
    (profileId) => profileId !== P14_VERTICAL_STACK_VALIDATION_PROFILE_ID,
  );
  if (unknownProfileIds.length > 0) {
    failures.push(
      `Vertical-stack validation evidence contains unknown profile IDs: ${unknownProfileIds.join(', ')}.`,
    );
  }

  const checkIds = bounded.value.checks.map((check) => check.id);
  if (new Set(checkIds).size !== checkIds.length) {
    failures.push('Vertical-stack validation evidence contains duplicate check IDs.');
  }
  const observedCheckIds = stableUnique(checkIds);
  const requiredCheckIds = [...P14_VERTICAL_STACK_REQUIRED_VALIDATION_CHECK_IDS];

  for (const requiredCheckId of requiredCheckIds) {
    const matching = bounded.value.checks.find((check) => check.id === requiredCheckId);
    if (!matching) {
      failures.push(`Required vertical-stack validation check ${requiredCheckId} did not run.`);
      continue;
    }
    if (!matching.required) {
      failures.push(`Required vertical-stack validation check ${requiredCheckId} was not marked required.`);
    }
    if (!matching.passed) {
      failures.push(`Required vertical-stack validation check ${requiredCheckId} did not pass.`);
    }
  }

  const unknownCheckIds = observedCheckIds.filter(
    (checkId) => !requiredCheckIds.includes(checkId as P14VerticalStackValidationCheckId),
  );
  if (unknownCheckIds.length > 0) {
    failures.push(
      `Vertical-stack validation evidence contains unknown check IDs: ${unknownCheckIds.join(', ')}.`,
    );
  }

  if (!bounded.value.passed) {
    failures.push('Vertical-stack validation evidence did not report an overall pass.');
  }

  return {
    valid: failures.length === 0,
    failures,
    observedProfileIds,
    observedCheckIds,
  };
}

export function serializeP14VerticalStackValidationProfile(): string {
  return `${JSON.stringify(P14_VERTICAL_STACK_VALIDATION_PROFILE, null, 2)}\n`;
}
