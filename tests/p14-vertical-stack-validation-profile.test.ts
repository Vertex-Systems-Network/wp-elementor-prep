import { describe, expect, it } from 'vitest';
import {
  P14_VERTICAL_STACK_REQUIRED_VALIDATION_CHECK_IDS,
  P14_VERTICAL_STACK_VALIDATION_PROFILE,
  P14_VERTICAL_STACK_VALIDATION_PROFILE_ID,
  assessP14VerticalStackValidationProfileEvidence,
  serializeP14VerticalStackValidationProfile,
} from '../src/core/p14-vertical-stack-validation-profile';

function validEvidence(): {
  passed: boolean;
  profileIdsRun: string[];
  checks: Array<{ id: string; passed: boolean; required: boolean }>;
} {
  return {
    passed: true,
    profileIdsRun: [P14_VERTICAL_STACK_VALIDATION_PROFILE_ID],
    checks: P14_VERTICAL_STACK_REQUIRED_VALIDATION_CHECK_IDS.map((id) => ({
      id,
      passed: true,
      required: true,
    })),
  };
}

describe('P14 vertical-stack validation profile', () => {
  it('freezes one versioned target-neutral validation profile and exact required checks', () => {
    expect(P14_VERTICAL_STACK_VALIDATION_PROFILE).toEqual({
      schemaVersion: 1,
      profileVersion: 1,
      profileId: 'P14_VALIDATE_VERTICAL_STACK_V1',
      requiredCheckIds: [
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
      ],
      candidateOnly: true,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
    });
    expect(Object.isFrozen(P14_VERTICAL_STACK_VALIDATION_PROFILE)).toBe(true);
    expect(Object.isFrozen(P14_VERTICAL_STACK_REQUIRED_VALIDATION_CHECK_IDS)).toBe(true);
  });

  it('accepts only the exact profile with every required check passing', () => {
    const assessment = assessP14VerticalStackValidationProfileEvidence(validEvidence());
    expect(assessment).toEqual({
      valid: true,
      failures: [],
      observedProfileIds: ['P14_VALIDATE_VERTICAL_STACK_V1'],
      observedCheckIds: [...P14_VERTICAL_STACK_REQUIRED_VALIDATION_CHECK_IDS].sort(),
    });
  });

  it('fails closed for missing, duplicate or unknown profile evidence', () => {
    const missing = validEvidence();
    missing.profileIdsRun = [];
    expect(assessP14VerticalStackValidationProfileEvidence(missing).valid).toBe(false);

    const duplicate = validEvidence();
    duplicate.profileIdsRun = [
      P14_VERTICAL_STACK_VALIDATION_PROFILE_ID,
      P14_VERTICAL_STACK_VALIDATION_PROFILE_ID,
    ];
    expect(
      assessP14VerticalStackValidationProfileEvidence(duplicate).failures,
    ).toContain('Vertical-stack validation profile evidence contains duplicate profile IDs.');

    const unknown = validEvidence();
    unknown.profileIdsRun = [P14_VERTICAL_STACK_VALIDATION_PROFILE_ID, 'UNKNOWN_PROFILE'];
    expect(
      assessP14VerticalStackValidationProfileEvidence(unknown).failures.some(
        (failure) => failure.includes('unknown profile IDs'),
      ),
    ).toBe(true);
  });

  it('fails closed for missing, duplicate, unknown, optional or failed required checks', () => {
    const missing = validEvidence();
    missing.checks = missing.checks.slice(1);
    expect(
      assessP14VerticalStackValidationProfileEvidence(missing).failures.some(
        (failure) => failure.includes('did not run'),
      ),
    ).toBe(true);

    const duplicate = validEvidence();
    duplicate.checks.push({ ...duplicate.checks[0] });
    expect(
      assessP14VerticalStackValidationProfileEvidence(duplicate).failures,
    ).toContain('Vertical-stack validation evidence contains duplicate check IDs.');

    const unknown = validEvidence();
    unknown.checks.push({ id: 'unknown-check', passed: true, required: true });
    expect(
      assessP14VerticalStackValidationProfileEvidence(unknown).failures.some(
        (failure) => failure.includes('unknown check IDs'),
      ),
    ).toBe(true);

    const optional = validEvidence();
    optional.checks[0] = { ...optional.checks[0], required: false };
    expect(
      assessP14VerticalStackValidationProfileEvidence(optional).failures.some(
        (failure) => failure.includes('was not marked required'),
      ),
    ).toBe(true);

    const failed = validEvidence();
    failed.checks[0] = { ...failed.checks[0], passed: false };
    expect(
      assessP14VerticalStackValidationProfileEvidence(failed).failures.some(
        (failure) => failure.includes('did not pass'),
      ),
    ).toBe(true);
  });

  it('requires the bounded evidence overall pass and serializes deterministically', () => {
    const failed = validEvidence();
    failed.passed = false;
    expect(
      assessP14VerticalStackValidationProfileEvidence(failed).failures,
    ).toContain('Vertical-stack validation evidence did not report an overall pass.');

    expect(serializeP14VerticalStackValidationProfile()).toBe(
      serializeP14VerticalStackValidationProfile(),
    );
    expect(serializeP14VerticalStackValidationProfile()).toContain(
      '"acceptanceAuthority": false',
    );
  });
});
