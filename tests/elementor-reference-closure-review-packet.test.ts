import { describe, expect, it } from 'vitest';
import {
  buildElementorReferenceClosureReviewPacket,
  serializeElementorReferenceClosureReviewPacket,
} from '../src/targets/elementor/reference-closure-review-packet';
import {
  ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION,
  type ElementorReferenceClosureEvidenceReceiptV1,
} from '../src/targets/elementor/reference-closure-evidence';
import { buildElementorReferenceReviewIdentity } from '../src/targets/elementor/reference-review-identity';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

function profile() {
  return buildElementorTargetProfile({
    wordpressVersion: 'wp-review-packet',
    elementorVersion: 'elementor-review-packet',
  });
}

function template(widgetType = 'heading', settings: Record<string, unknown> = { title: 'Fixture' }) {
  return {
    title: 'Reference Closure Review Packet',
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
  globalResult: 'PASS' | 'FAIL' | null,
  assetResult: 'PASS' | 'FAIL' | null,
): ElementorReferenceClosureEvidenceReceiptV1 {
  return {
    schemaVersion: 1,
    receiptVersion: ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION,
    referenceReviewIdentity: buildElementorReferenceReviewIdentity(value, targetProfile),
    observedAt: '2026-09-14T14:45:00.000Z',
    globalClosureEvidence: globalResult
      ? { result: globalResult, evidenceReference: 'external-review/private-global-evidence' }
      : null,
    assetClosureEvidence: assetResult
      ? { result: assetResult, evidenceReference: 'external-review/private-asset-evidence' }
      : null,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

describe('P15 reference-closure pre-decision review packet', () => {
  it('turns exact-bound reported PASS into authentication-required state without granting authority', () => {
    const value = template('heading', {
      title: 'Fixture',
      __globals__: { title_color: 'globals/colors?id=private-global-value' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, 'PASS', null);

    const packet = buildElementorReferenceClosureReviewPacket(value, targetProfile, input);
    expect(packet.status).toBe('REPORTED_PASS_AUTHENTICATION_REQUIRED');
    expect(packet.receiptValid).toBe(true);
    expect(packet.bindingMatches).toBe(true);
    expect(packet.allRequiredEvidenceReportsPass).toBe(true);
    expect(packet.reportedResults).toEqual({ global: 'PASS', asset: null });
    expect(packet.canonicalReceiptSha256).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(packet.reviewNextAction).toBe('AUTHENTICATE_EVIDENCE_THEN_INTERNAL_REVIEW');
    expect(packet.evidenceAuthenticationStatus).toBe('NOT_RUN');
    expect(packet.internalDecisionStatus).toBe('NOT_RUN');
    expect(packet.acceptanceAuthority).toBe(false);
    expect(packet.referenceClosureClaim).toBe(false);
    expect(packet.targetCompatibilityClaim).toBe(false);
    expect(packet.productionAcceptance).toBe(false);
    expect(packet.generationEnabled).toBe(false);
    expect(packet.downloadEnabled).toBe(false);
    expect(packet.internalReviewRequired).toBe(true);

    const serialized = serializeElementorReferenceClosureReviewPacket(value, targetProfile, input);
    expect(serialized).not.toContain('private-global-value');
    expect(serialized).not.toContain('external-review/private-global-evidence');
  });

  it('retains exact-bound reported FAIL as review-required evidence rather than an execution failure', () => {
    const value = template('image', {
      image: { id: 55, url: 'https://source.example.test/private-review-packet.jpg' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, null, 'FAIL');

    const packet = buildElementorReferenceClosureReviewPacket(value, targetProfile, input);
    expect(packet.status).toBe('REPORTED_FAIL_REVIEW_REQUIRED');
    expect(packet.receiptValid).toBe(true);
    expect(packet.reportedResults).toEqual({ global: null, asset: 'FAIL' });
    expect(packet.allRequiredEvidenceReportsPass).toBe(false);
    expect(packet.reviewNextAction).toBe('REVIEW_REPORTED_FAILURES');
    expect(JSON.stringify(packet)).not.toContain('https://source.example.test/private-review-packet.jpg');
    expect(JSON.stringify(packet)).not.toContain('external-review/private-asset-evidence');
  });

  it('rejects a stale receipt and does not emit a canonical receipt digest', () => {
    const original = template('heading', {
      __globals__: { title_color: 'globals/colors?id=original' },
    });
    const changed = template('heading', {
      title: 'Changed',
      __globals__: { title_color: 'globals/colors?id=changed' },
    });
    const targetProfile = profile();
    const input = receipt(original, targetProfile, 'PASS', null);

    const packet = buildElementorReferenceClosureReviewPacket(changed, targetProfile, input);
    expect(packet.status).toBe('REJECTED_INVALID_RECEIPT');
    expect(packet.receiptValid).toBe(false);
    expect(packet.bindingMatches).toBe(false);
    expect(packet.canonicalReceiptSha256).toBeNull();
    expect(packet.reviewNextAction).toBe('FIX_OR_RECAPTURE_EVIDENCE');
    expect(packet.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_IDENTITY_INVALID')).toBe(true);
  });

  it('rejects a no-reference identity instead of manufacturing closure work', () => {
    const value = template('heading', { title: 'No references' });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, null, null);

    const packet = buildElementorReferenceClosureReviewPacket(value, targetProfile, input);
    expect(packet.status).toBe('REJECTED_INVALID_RECEIPT');
    expect(packet.receiptValid).toBe(false);
    expect(packet.currentReferenceReviewIdentity.disposition).not.toBe('EXTERNAL_CLOSURE_REQUIRED');
    expect(packet.issues.some((issue) => issue.code === 'P15_REFERENCE_CLOSURE_IDENTITY_NOT_ELIGIBLE')).toBe(true);
  });

  it('serializes identical semantic inputs deterministically', () => {
    const value = template('heading', {
      __globals__: { title_color: 'globals/colors?id=deterministic-private' },
    });
    const targetProfile = profile();
    const input = receipt(value, targetProfile, 'PASS', null);
    const clonedInput = JSON.parse(JSON.stringify(input)) as ElementorReferenceClosureEvidenceReceiptV1;

    const first = serializeElementorReferenceClosureReviewPacket(value, targetProfile, input);
    const second = serializeElementorReferenceClosureReviewPacket(
      JSON.parse(JSON.stringify(value)) as unknown,
      JSON.parse(JSON.stringify(targetProfile)) as unknown,
      clonedInput,
    );
    expect(second).toBe(first);
  });
});
