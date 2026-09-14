import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
import {
  ELEMENTOR_REFERENCE_CLOSURE_AUTHENTICATION_REPORT_VERSION,
  serializeElementorReferenceClosureAuthenticationReport,
  validateElementorReferenceClosureAuthenticationReport,
  type ElementorReferenceClosureAuthenticationReportV1,
} from '../src/targets/elementor/reference-closure-authentication-report';
import {
  ELEMENTOR_REFERENCE_CLOSURE_EVIDENCE_RECEIPT_VERSION,
  type ElementorReferenceClosureEvidenceReceiptV1,
} from '../src/targets/elementor/reference-closure-evidence';
import { buildElementorReferenceClosureReviewPacket } from '../src/targets/elementor/reference-closure-review-packet';
import { buildElementorReferenceReviewIdentity } from '../src/targets/elementor/reference-review-identity';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

const GLOBAL_REFERENCE = 'external-review/private-global-evidence';
const ASSET_REFERENCE = 'external-review/private-asset-evidence';

function profile() {
  return buildElementorTargetProfile({
    wordpressVersion: 'wp-auth-report',
    elementorVersion: 'elementor-auth-report',
  });
}

function template(widgetType = 'heading', settings: Record<string, unknown> = { title: 'Fixture' }) {
  return {
    title: 'Reference Closure Authentication Report',
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
    observedAt: '2026-09-14T15:30:00.000Z',
    globalClosureEvidence: globalResult
      ? { result: globalResult, evidenceReference: GLOBAL_REFERENCE }
      : null,
    assetClosureEvidence: assetResult
      ? { result: assetResult, evidenceReference: ASSET_REFERENCE }
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

function referenceHash(value: string): string {
  return `sha256:${sha256Hex(value)}`;
}

function authenticationReport(
  value: unknown,
  targetProfile: unknown,
  closureReceipt: ElementorReferenceClosureEvidenceReceiptV1,
  globalResult: 'PASS' | 'FAIL' | null,
  assetResult: 'PASS' | 'FAIL' | null,
): ElementorReferenceClosureAuthenticationReportV1 {
  const packet = buildElementorReferenceClosureReviewPacket(value, targetProfile, closureReceipt);
  if (!packet.canonicalReceiptSha256) throw new Error('fixture requires canonical receipt hash');
  return {
    schemaVersion: 1,
    reportVersion: ELEMENTOR_REFERENCE_CLOSURE_AUTHENTICATION_REPORT_VERSION,
    referenceReviewIdentityDigest: packet.currentReferenceReviewIdentity.digest,
    canonicalReceiptSha256: packet.canonicalReceiptSha256,
    reportedAt: '2026-09-14T15:35:00.000Z',
    globalAuthentication: globalResult
      ? { result: globalResult, sourceEvidenceReferenceSha256: referenceHash(GLOBAL_REFERENCE) }
      : null,
    assetAuthentication: assetResult
      ? { result: assetResult, sourceEvidenceReferenceSha256: referenceHash(ASSET_REFERENCE) }
      : null,
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalDecisionStatus: 'NOT_RUN',
    internalReviewRequired: true,
  };
}

describe('P15 exact-bound external authentication report', () => {
  it('records exact-bound externally reported PASS without granting authentication or decision authority', () => {
    const value = template('heading', {
      title: 'Fixture',
      __globals__: { title_color: 'globals/colors?id=private-global-value' },
    });
    const targetProfile = profile();
    const closureReceipt = receipt(value, targetProfile, 'PASS', null);
    const report = authenticationReport(value, targetProfile, closureReceipt, 'PASS', null);

    const result = validateElementorReferenceClosureAuthenticationReport(
      report,
      value,
      targetProfile,
      closureReceipt,
    );

    expect(result.valid).toBe(true);
    expect(result.bindingMatches).toBe(true);
    expect(result.status).toBe('EXTERNALLY_REPORTED_PASS');
    expect(result.globalAuthenticationReportedResult).toBe('PASS');
    expect(result.assetAuthenticationReportedResult).toBeNull();
    expect(result.allRequiredAuthenticationReportsPass).toBe(true);
    expect(result.authenticationAuthority).toBe(false);
    expect(result.acceptanceAuthority).toBe(false);
    expect(result.referenceClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalDecisionStatus).toBe('NOT_RUN');
    expect(result.internalReviewRequired).toBe(true);

    const serialized = serializeElementorReferenceClosureAuthenticationReport(
      report,
      value,
      targetProfile,
      closureReceipt,
    );
    expect(serialized).toContain(referenceHash(GLOBAL_REFERENCE));
    expect(serialized).not.toContain(GLOBAL_REFERENCE);
    expect(serialized).not.toContain('private-global-value');
  });

  it('retains exact-bound externally reported FAIL as a non-authorizing internal-review input', () => {
    const value = template('image', {
      image: { id: 55, url: 'https://source.example.test/private-auth-image.jpg' },
    });
    const targetProfile = profile();
    const closureReceipt = receipt(value, targetProfile, null, 'PASS');
    const report = authenticationReport(value, targetProfile, closureReceipt, null, 'FAIL');

    const result = validateElementorReferenceClosureAuthenticationReport(
      report,
      value,
      targetProfile,
      closureReceipt,
    );
    expect(result.valid).toBe(true);
    expect(result.status).toBe('EXTERNALLY_REPORTED_FAIL');
    expect(result.assetAuthenticationReportedResult).toBe('FAIL');
    expect(result.allRequiredAuthenticationReportsPass).toBe(false);
    expect(JSON.stringify(result)).not.toContain('https://source.example.test/private-auth-image.jpg');
    expect(JSON.stringify(result)).not.toContain(ASSET_REFERENCE);
  });

  it('requires all exact-bound class reports for combined global and asset closure evidence', () => {
    const value = template('image', {
      image: { id: 77, url: 'https://source.example.test/private-combined.jpg' },
      __globals__: { border_color: 'globals/colors?id=private-combined-global' },
    });
    const targetProfile = profile();
    const closureReceipt = receipt(value, targetProfile, 'PASS', 'PASS');
    const report = authenticationReport(value, targetProfile, closureReceipt, 'PASS', 'PASS');

    const result = validateElementorReferenceClosureAuthenticationReport(
      report,
      value,
      targetProfile,
      closureReceipt,
    );
    expect(result.valid).toBe(true);
    expect(result.bindingMatches).toBe(true);
    expect(result.status).toBe('EXTERNALLY_REPORTED_PASS');
    expect(result.globalAuthenticationReportedResult).toBe('PASS');
    expect(result.assetAuthenticationReportedResult).toBe('PASS');

    const missingAsset = { ...report, assetAuthentication: null };
    const rejected = validateElementorReferenceClosureAuthenticationReport(
      missingAsset,
      value,
      targetProfile,
      closureReceipt,
    );
    expect(rejected.valid).toBe(false);
    expect(rejected.status).toBe('REJECTED');
    expect(rejected.issues.some((issue) => issue.code === 'P15_REFERENCE_AUTH_ASSET_REQUIRED')).toBe(true);
  });

  it('rejects a source evidence-reference hash mismatch instead of accepting replayed authentication', () => {
    const value = template('heading', {
      __globals__: { title_color: 'globals/colors?id=hash-mismatch' },
    });
    const targetProfile = profile();
    const closureReceipt = receipt(value, targetProfile, 'PASS', null);
    const report = authenticationReport(value, targetProfile, closureReceipt, 'PASS', null);
    const mismatched = {
      ...report,
      globalAuthentication: {
        result: 'PASS' as const,
        sourceEvidenceReferenceSha256: referenceHash('external-review/different-evidence'),
      },
    };

    const result = validateElementorReferenceClosureAuthenticationReport(
      mismatched,
      value,
      targetProfile,
      closureReceipt,
    );
    expect(result.valid).toBe(false);
    expect(result.bindingMatches).toBe(false);
    expect(result.status).toBe('REJECTED');
    expect(result.issues.some((issue) => issue.code === 'P15_REFERENCE_AUTH_GLOBAL_INVALID')).toBe(true);
  });

  it('rejects stale template/profile/receipt state and reported-FAIL closure prerequisites', () => {
    const original = template('heading', {
      __globals__: { title_color: 'globals/colors?id=original-auth' },
    });
    const changed = template('heading', {
      title: 'Changed',
      __globals__: { title_color: 'globals/colors?id=changed-auth' },
    });
    const targetProfile = profile();
    const closureReceipt = receipt(original, targetProfile, 'PASS', null);
    const report = authenticationReport(original, targetProfile, closureReceipt, 'PASS', null);

    const stale = validateElementorReferenceClosureAuthenticationReport(
      report,
      changed,
      targetProfile,
      closureReceipt,
    );
    expect(stale.valid).toBe(false);
    expect(stale.status).toBe('REJECTED');
    expect(stale.issues.some((issue) => issue.code === 'P15_REFERENCE_AUTH_PREREQUISITE_NOT_READY')).toBe(true);

    const failedClosureReceipt = receipt(original, targetProfile, 'FAIL', null);
    const failedPrerequisite = validateElementorReferenceClosureAuthenticationReport(
      report,
      original,
      targetProfile,
      failedClosureReceipt,
    );
    expect(failedPrerequisite.valid).toBe(false);
    expect(failedPrerequisite.issues.some((issue) => issue.code === 'P15_REFERENCE_AUTH_PREREQUISITE_NOT_READY')).toBe(true);
  });

  it('rejects authority inflation and keeps serialization deterministic', () => {
    const value = template('heading', {
      __globals__: { title_color: 'globals/colors?id=authority-test' },
    });
    const targetProfile = profile();
    const closureReceipt = receipt(value, targetProfile, 'PASS', null);
    const report = authenticationReport(value, targetProfile, closureReceipt, 'PASS', null);

    const forged = { ...report, referenceClosureClaim: true };
    const rejected = validateElementorReferenceClosureAuthenticationReport(
      forged,
      value,
      targetProfile,
      closureReceipt,
    );
    expect(rejected.valid).toBe(false);
    expect(rejected.issues.some((issue) => issue.code === 'P15_REFERENCE_AUTH_AUTHORITY_FLAGS_INVALID')).toBe(true);

    const first = serializeElementorReferenceClosureAuthenticationReport(
      report,
      value,
      targetProfile,
      closureReceipt,
    );
    const second = serializeElementorReferenceClosureAuthenticationReport(
      JSON.parse(JSON.stringify(report)) as ElementorReferenceClosureAuthenticationReportV1,
      JSON.parse(JSON.stringify(value)) as unknown,
      JSON.parse(JSON.stringify(targetProfile)) as unknown,
      JSON.parse(JSON.stringify(closureReceipt)) as ElementorReferenceClosureEvidenceReceiptV1,
    );
    expect(second).toBe(first);
  });
});
