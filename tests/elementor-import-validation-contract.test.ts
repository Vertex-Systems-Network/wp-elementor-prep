import { describe, expect, it } from 'vitest';
import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from '../src/targets/elementor/candidate-artifact';
import {
  ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION,
  buildElementorTemplateCandidateIdentity,
  serializeElementorImportValidationReceipt,
  validateElementorImportValidationReceipt,
  type ElementorImportValidationReceiptV1,
} from '../src/targets/elementor/import-validation-contract';

function template(widgetType = 'heading', title = 'Hello'): unknown {
  return {
    title: 'Candidate',
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
            settings: { title },
            elements: [],
          },
        ],
      },
    ],
  };
}

function readyCandidate(title = 'Hello'): ElementorTemplateCandidateArtifactV1 {
  const candidate = buildElementorTemplateCandidateArtifact(template('heading', title));
  expect(candidate.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
  return candidate;
}

function receiptFor(
  candidate: ElementorTemplateCandidateArtifactV1,
  observedResult: 'PASS' | 'FAIL' = 'PASS',
): ElementorImportValidationReceiptV1 {
  return {
    schemaVersion: 1,
    receiptVersion: ELEMENTOR_IMPORT_VALIDATION_RECEIPT_VERSION,
    candidateIdentity: buildElementorTemplateCandidateIdentity(candidate),
    target: {
      wordpressVersion: '6.x-observed',
      elementorVersion: 'observed-target-version',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-14T12:00:00.000Z',
    observedResult,
    evidenceReference: 'retained-evidence://operator-capture/example',
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

describe('P15 Elementor exact-candidate import-validation binding', () => {
  it('builds a deterministic SHA-256 identity for exact canonical candidate bytes', () => {
    const candidate = readyCandidate();
    const first = buildElementorTemplateCandidateIdentity(candidate);
    const second = buildElementorTemplateCandidateIdentity(candidate);

    expect(first).toEqual(second);
    expect(first.algorithm).toBe('SHA-256');
    expect(first.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(first.candidateVersion).toBe(candidate.candidateVersion);
    expect(first.targetContractVersion).toBe(candidate.targetContractVersion);
    expect(first.capabilityRegistryVersion).toBe(candidate.capabilityRegistryVersion);
  });

  it('changes identity when exact candidate template content changes', () => {
    const first = buildElementorTemplateCandidateIdentity(readyCandidate('Hello'));
    const second = buildElementorTemplateCandidateIdentity(readyCandidate('Hello!'));
    expect(first.digest).not.toBe(second.digest);
  });

  it('accepts a structurally valid exact-binding receipt without granting authority even for observed PASS', () => {
    const candidate = readyCandidate();
    const receipt = receiptFor(candidate, 'PASS');
    const result = validateElementorImportValidationReceipt(receipt, candidate);

    expect(result.valid).toBe(true);
    expect(result.bindingMatches).toBe(true);
    expect(result.observedResult).toBe('PASS');
    expect(result.issues).toEqual([]);
    expect(result.acceptanceAuthority).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('fails closed when a receipt is replayed against a different exact candidate', () => {
    const original = readyCandidate('Original');
    const different = readyCandidate('Different');
    const receipt = receiptFor(original);
    const result = validateElementorImportValidationReceipt(receipt, different);

    expect(result.valid).toBe(false);
    expect(result.bindingMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_IMPORT_RECEIPT_BINDING_MISMATCH');
  });

  it('refuses review-required candidates before target evidence can qualify', () => {
    const candidate = buildElementorTemplateCandidateArtifact(template('unregistered-addon-widget'));
    expect(candidate.status).toBe('REVIEW_REQUIRED');
    expect(() => buildElementorTemplateCandidateIdentity(candidate)).toThrow(/not ready/i);

    const result = validateElementorImportValidationReceipt({}, candidate);
    expect(result.valid).toBe(false);
    expect(result.candidateIdentity).toBeNull();
    expect(result.issues.map((issue) => issue.code)).toContain('P15_IMPORT_CANDIDATE_NOT_READY');
  });

  it('detects candidate-envelope tampering even when embedded template JSON remains valid', () => {
    const candidate = readyCandidate();
    const tampered = JSON.parse(JSON.stringify(candidate)) as ElementorTemplateCandidateArtifactV1;
    tampered.reviewWidgetTypes.push('forged-review-state');

    expect(() => buildElementorTemplateCandidateIdentity(tampered)).toThrow(/canonical artifact/i);
    const result = validateElementorImportValidationReceipt(receiptFor(candidate), tampered);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_IMPORT_CANDIDATE_NONCANONICAL');
  });

  it('rejects malformed target evidence, timestamps, results, evidence references and authority flags', () => {
    const candidate = readyCandidate();
    const receipt = receiptFor(candidate) as unknown as Record<string, unknown>;
    receipt.target = {
      wordpressVersion: '',
      elementorVersion: '',
      importSurface: 'UNKNOWN',
    };
    receipt.observedAt = '2026-09-14';
    receipt.observedResult = 'MAYBE';
    receipt.evidenceReference = '';
    receipt.targetCompatibilityClaim = true;

    const result = validateElementorImportValidationReceipt(receipt, candidate);
    const codes = result.issues.map((issue) => issue.code);
    expect(result.valid).toBe(false);
    expect(codes).toContain('P15_IMPORT_TARGET_INVALID');
    expect(codes).toContain('P15_IMPORT_OBSERVED_AT_INVALID');
    expect(codes).toContain('P15_IMPORT_RESULT_INVALID');
    expect(codes).toContain('P15_IMPORT_EVIDENCE_REFERENCE_INVALID');
    expect(codes).toContain('P15_IMPORT_AUTHORITY_FLAGS_INVALID');
  });

  it('serializes only validated receipts with stable known-field ordering', () => {
    const candidate = readyCandidate();
    const receipt = receiptFor(candidate, 'FAIL');
    const first = serializeElementorImportValidationReceipt(receipt, candidate);
    const second = serializeElementorImportValidationReceipt(receipt, candidate);

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
    expect(JSON.parse(first)).toEqual(receipt);

    const invalid = { ...receipt, downloadEnabled: true } as unknown as ElementorImportValidationReceiptV1;
    expect(() => serializeElementorImportValidationReceipt(invalid, candidate)).toThrow(/P15_IMPORT_AUTHORITY_FLAGS_INVALID/);
  });
});
