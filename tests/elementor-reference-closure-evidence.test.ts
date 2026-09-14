import { describe, expect, it } from 'vitest';
import {
  serializeElementorReferenceClosureEvidenceReceipt,
  validateElementorReferenceClosureEvidenceReceipt,
  type ElementorReferenceClosureEvidenceReceiptV1,
} from '../src/targets/elementor/reference-closure-evidence';
import { buildElementorReferenceReviewIdentity } from '../src/targets/elementor/reference-review-identity';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

function profile() {
  return buildElementorTargetProfile({
    wordpressVersion: 'wp-declared',
    elementorVersion: 'elementor-declared',
  });
}

function template(widgetType = 'heading', settings: Record<string, unknown> = { title: 'Fixture' }) {
  return {
    title: 'Reference Closure Evidence',
    type: 'page',
    version: '0.4',
    page_settings: [],
    content: [
      {
        id: 'container-1',
        elType: 'container',
        isInner: false,
        settings: {},
        elements: [
          {
            id: 'widget-1',
            elType: 'widget',
            widgetType,
            isInner: false,
            settings,
            elements: [],
          },
        ],
      },
    ],
  };
}

function receipt(
  value: unknown,
  targetProfile: unknown,
  globalClosureEvidence: ElementorReferenceClosureEvidenceReceiptV1['globalClosureEvidence'],
  assetClosureEvidence: ElementorReferenceClosureEvidenceReceiptV1['assetClosureEvidence'],
): ElementorReferenceClosureEvidenceReceiptV1 {
  return {
    schemaVersion: 1,
    receiptVersion: 'elementor-reference-closure-evidence-receipt-v1',
    referenceReviewIdentity: buildElementorReferenceReviewIdentity(value, targetProfile),
    observedAt: '2026-09-14T12:00:00.000Z',
    globalClosureEvidence,
    assetClosureEvidence,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

describe('P15 R1 exact-bound external reference-closure evidence receipt', () => {
  it('accepts exact-bound global-only reported PASS without granting closure authority', () => {
    const value = template('heading', {
      title: 'Fixture',
      __globals__: { title_color: 'globals/colors?id=private-global' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, {
      result: 'PASS',
      evidenceReference: 'external-review/global-closure/123',
    }, null);
    const result = validateElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);

    expect(result.valid).toBe(true);
    expect(result.bindingMatches).toBe(true);
    expect(result.currentIdentity.disposition).toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(result.globalReportedResult).toBe('PASS');
    expect(result.assetReportedResult).toBeNull();
    expect(result.allRequiredEvidenceReportsPass).toBe(true);
    expect(result.acceptanceAuthority).toBe(false);
    expect(result.referenceClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalReviewRequired).toBe(true);

    const serialized = serializeElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);
    expect(serialized).not.toContain('private-global');
    expect(serialized).toContain('external-review/global-closure/123');
  });

  it('accepts exact-bound asset-only reported FAIL as valid evidence while all-pass stays false', () => {
    const value = template('image', {
      image: { id: 55, url: 'https://source.example.test/private-image.jpg' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, null, {
      result: 'FAIL',
      evidenceReference: 'external-review/asset-closure/fail-55',
    });
    const result = validateElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);

    expect(result.valid).toBe(true);
    expect(result.globalReportedResult).toBeNull();
    expect(result.assetReportedResult).toBe('FAIL');
    expect(result.allRequiredEvidenceReportsPass).toBe(false);
    expect(serializeElementorReferenceClosureEvidenceReceipt(input, value, targetProfile))
      .not.toContain('https://source.example.test/private-image.jpg');
  });

  it('requires PASS evidence for both classes before computed all-required-pass becomes true', () => {
    const value = template('image', {
      image: { id: 77, url: 'https://source.example.test/combined.jpg' },
      __globals__: { border_color: 'globals/colors?id=combined-private' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, {
      result: 'PASS',
      evidenceReference: 'external-review/global/combined',
    }, {
      result: 'PASS',
      evidenceReference: 'external-review/asset/combined',
    });
    const result = validateElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);

    expect(result.valid).toBe(true);
    expect(result.globalReportedResult).toBe('PASS');
    expect(result.assetReportedResult).toBe('PASS');
    expect(result.allRequiredEvidenceReportsPass).toBe(true);
    expect(result.referenceClosureClaim).toBe(false);
  });

  it('rejects missing required class evidence and unexpected evidence for a NOT_REQUIRED class', () => {
    const globalOnly = template('heading', {
      __globals__: { title_color: 'globals/colors?id=global-only' },
    });
    const targetProfile = profile();

    const missingGlobal = receipt(globalOnly, targetProfile, null, null);
    const missingResult = validateElementorReferenceClosureEvidenceReceipt(missingGlobal, globalOnly, targetProfile);
    expect(missingResult.valid).toBe(false);
    expect(missingResult.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_GLOBAL_EVIDENCE_REQUIRED')).toBe(true);

    const unexpectedAsset = receipt(globalOnly, targetProfile, {
      result: 'PASS',
      evidenceReference: 'external-review/global/ok',
    }, {
      result: 'PASS',
      evidenceReference: 'external-review/asset/unexpected',
    });
    const unexpectedResult = validateElementorReferenceClosureEvidenceReceipt(unexpectedAsset, globalOnly, targetProfile);
    expect(unexpectedResult.valid).toBe(false);
    expect(unexpectedResult.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_ASSET_EVIDENCE_UNEXPECTED')).toBe(true);
  });

  it('rejects noncanonical observedAt and malformed evidence references', () => {
    const value = template('heading', {
      __globals__: { title_color: 'globals/colors?id=timestamp-test' },
    });
    const targetProfile = profile();
    const badTime = {
      ...receipt(value, targetProfile, {
        result: 'PASS',
        evidenceReference: 'external-review/global/time',
      }, null),
      observedAt: '2026-09-14 12:00:00',
    };
    const timeResult = validateElementorReferenceClosureEvidenceReceipt(badTime, value, targetProfile);
    expect(timeResult.valid).toBe(false);
    expect(timeResult.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_OBSERVED_AT_INVALID')).toBe(true);

    const blankReference = receipt(value, targetProfile, {
      result: 'PASS',
      evidenceReference: '   ',
    }, null);
    const referenceResult = validateElementorReferenceClosureEvidenceReceipt(blankReference, value, targetProfile);
    expect(referenceResult.valid).toBe(false);
    expect(referenceResult.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_GLOBAL_EVIDENCE_INVALID')).toBe(true);
  });

  it('rejects stale or tampered reference-review identity binding', () => {
    const firstTemplate = template('heading', {
      __globals__: { title_color: 'globals/colors?id=first' },
    });
    const secondTemplate = template('heading', {
      __globals__: { title_color: 'globals/colors?id=second' },
    });
    const targetProfile = profile();
    const stale = receipt(firstTemplate, targetProfile, {
      result: 'PASS',
      evidenceReference: 'external-review/global/stale',
    }, null);

    const staleResult = validateElementorReferenceClosureEvidenceReceipt(stale, secondTemplate, targetProfile);
    expect(staleResult.valid).toBe(false);
    expect(staleResult.bindingMatches).toBe(false);
    expect(staleResult.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_IDENTITY_INVALID')).toBe(true);

    const tampered = {
      ...stale,
      referenceReviewIdentity: {
        ...stale.referenceReviewIdentity,
        digest: `sha256:${'0'.repeat(64)}`,
      },
    };
    const tamperedResult = validateElementorReferenceClosureEvidenceReceipt(tampered, firstTemplate, targetProfile);
    expect(tamperedResult.valid).toBe(false);
    expect(tamperedResult.bindingMatches).toBe(false);
  });

  it('rejects receipt intake for current REVIEW_REQUIRED state even when external global closure also exists', () => {
    const value = template('third-party-widget', {
      __globals__: { custom_color: 'globals/colors?id=review-required' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, {
      result: 'PASS',
      evidenceReference: 'external-review/global/cannot-bypass-widget-review',
    }, null);
    const result = validateElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);

    expect(result.currentIdentity.disposition).toBe('REVIEW_REQUIRED');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_IDENTITY_NOT_ELIGIBLE')).toBe(true);
    expect(result.allRequiredEvidenceReportsPass).toBe(false);
  });

  it('rejects receipt intake for blocked upstream and no-reference identities', () => {
    const noReferenceTemplate = template();
    const targetProfile = profile();
    const noReferenceReceipt = receipt(noReferenceTemplate, targetProfile, null, null);
    const noReferenceResult = validateElementorReferenceClosureEvidenceReceipt(
      noReferenceReceipt,
      noReferenceTemplate,
      targetProfile,
    );
    expect(noReferenceResult.currentIdentity.disposition).toBe('NO_EXTERNAL_REFERENCE_CLOSURE_REQUIRED');
    expect(noReferenceResult.valid).toBe(false);
    expect(noReferenceResult.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_IDENTITY_NOT_ELIGIBLE')).toBe(true);

    const invalidProfile = { ...targetProfile, targetCompatibilityClaim: true };
    const blockedReceipt = receipt(noReferenceTemplate, invalidProfile, null, null);
    const blockedResult = validateElementorReferenceClosureEvidenceReceipt(
      blockedReceipt,
      noReferenceTemplate,
      invalidProfile,
    );
    expect(blockedResult.currentIdentity.disposition).toBe('BLOCKED_UPSTREAM');
    expect(blockedResult.valid).toBe(false);
    expect(blockedResult.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_IDENTITY_NOT_ELIGIBLE')).toBe(true);
  });

  it('rejects authority inflation, unknown fields and serializes valid evidence deterministically', () => {
    const value = template('image', {
      image: { id: 9, url: 'https://source.example.test/deterministic.jpg' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, null, {
      result: 'PASS',
      evidenceReference: 'external-review/asset/deterministic',
    });

    const first = serializeElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);
    const second = serializeElementorReferenceClosureEvidenceReceipt(input, value, targetProfile);
    expect(first).toBe(second);

    const inflated = {
      ...input,
      referenceClosureClaim: true,
    } as unknown as ElementorReferenceClosureEvidenceReceiptV1;
    expect(() => serializeElementorReferenceClosureEvidenceReceipt(inflated, value, targetProfile))
      .toThrow(/Invalid Elementor reference-closure evidence receipt/);

    const unknownField = {
      ...input,
      approval: 'forged',
    };
    const unknownResult = validateElementorReferenceClosureEvidenceReceipt(unknownField, value, targetProfile);
    expect(unknownResult.valid).toBe(false);
    expect(unknownResult.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_RECEIPT_SHAPE_INVALID')).toBe(true);
  });
});
