import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { ElementorTemplateCandidateArtifactV1 } from '../src/targets/elementor/candidate-artifact';
import {
  buildElementorAssetTargetProofEvidence,
  type ElementorAssetTargetProofStepsV1,
} from '../src/targets/elementor/asset-target-proof-evidence';
import {
  P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
  buildP15ElementorAssetProofVector,
} from '../src/targets/elementor/asset-proof-vector';
import {
  ELEMENTOR_TARGET_MANAGED_MEDIA_INTEGRITY_EVIDENCE_VERSION,
  serializeElementorTargetManagedMediaIntegrityEvidence,
  validateElementorTargetManagedMediaIntegrityEvidence,
  type ElementorTargetManagedMediaIntegrityEvidenceV1,
} from '../src/targets/elementor/target-managed-media-integrity-evidence';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

const tempDirs: string[] = [];
const SOURCE_SHA = 'sha256:' + '7'.repeat(64);
const TARGET_MEDIA_URL_SHA = 'sha256:' + '8'.repeat(64);
const EVIDENCE_REFERENCE = 'retained-evidence://p15/media-integrity-private';

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fullPassSteps(sourceUrlFingerprint: string): ElementorAssetTargetProofStepsV1 {
  return {
    importResult: 'PASS',
    targetManagedMediaResult: 'PASS',
    sourceProvenanceResult: 'PASS',
    sourceAssetUrlFingerprint: sourceUrlFingerprint,
    targetManagedMediaUrlFingerprint: TARGET_MEDIA_URL_SHA,
    renderResult: 'PASS',
    renderedImageReferenceResult: 'PASS',
    browserImageLoadResult: 'PASS',
    renderedImageUrlFingerprint: TARGET_MEDIA_URL_SHA,
  };
}

function fixture() {
  const vector = buildP15ElementorAssetProofVector();
  const candidate = JSON.parse(vector.files['candidate.json']) as ElementorTemplateCandidateArtifactV1;
  const proof = buildElementorAssetTargetProofEvidence({
    candidate,
    profile: vector.profile,
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: '6.8',
      elementorVersion: '4.2.4',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-19T11:00:00.000Z',
    evidenceReference: EVIDENCE_REFERENCE,
    steps: fullPassSteps(vector.assetUrlFingerprint),
  });
  const evidence: ElementorTargetManagedMediaIntegrityEvidenceV1 = {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_TARGET_MANAGED_MEDIA_INTEGRITY_EVIDENCE_VERSION,
    candidateIdentity: vector.candidateIdentity,
    targetProfileIdentity: {
      profileVersion: vector.profile.profileVersion,
      fingerprint: vector.targetProfileFingerprint,
    },
    referenceReviewIdentity: {
      identityVersion: vector.referenceReviewIdentity.identityVersion,
      digest: vector.referenceReviewIdentity.digest,
    },
    observedTarget: {
      source: 'OBSERVED',
      wordpressVersion: '6.8',
      elementorVersion: '4.2.4',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-19T11:00:01.000Z',
    evidenceReference: EVIDENCE_REFERENCE,
    attachment: {
      postType: 'attachment',
      sourceFixtureSha256: SOURCE_SHA,
      targetFileSha256: SOURCE_SHA,
      mimeType: 'image/png',
      width: 2,
      height: 2,
    },
    assetReferenceClosureClaim: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
  return { vector, candidate, proof, evidence };
}

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-media-integrity-test-'));
  tempDirs.push(dir);
  return dir;
}

describe('P15 target-managed media content-integrity evidence', () => {
  it('passes only exact full-pass asset proof plus exact source/target file bytes', () => {
    const { vector, candidate, proof, evidence } = fixture();
    const result = validateElementorTargetManagedMediaIntegrityEvidence(
      evidence,
      candidate,
      vector.profile,
      proof,
    );

    expect(result.valid).toBe(true);
    expect(result.classification).toBe('TARGET_MANAGED_CONTENT_INTEGRITY_PASS');
    expect(result.assetProofValid).toBe(true);
    expect(result.assetProofClassification).toBe('ASSET_BOUND_FULL_PASS');
    expect(result.candidateBindingMatches).toBe(true);
    expect(result.profileBindingMatches).toBe(true);
    expect(result.referenceReviewBindingMatches).toBe(true);
    expect(result.observedTargetMatches).toBe(true);
    expect(result.evidenceReferenceMatches).toBe(true);
    expect(result.contentDigestMatches).toBe(true);
    expect(result.attachmentMetadataValid).toBe(true);
    expect(result.mimeType).toBe('image/png');
    expect(result.width).toBe(2);
    expect(result.height).toBe(2);
    expect(result.assetReferenceClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);

    const serialized = serializeElementorTargetManagedMediaIntegrityEvidence(
      evidence,
      candidate,
      vector.profile,
      proof,
    );
    expect(JSON.parse(serialized)).toEqual(evidence);
  });

  it('classifies exact-bound byte mismatch as genuine integrity FAIL', () => {
    const { vector, candidate, proof, evidence } = fixture();
    evidence.attachment.targetFileSha256 = 'sha256:' + '9'.repeat(64);

    const result = validateElementorTargetManagedMediaIntegrityEvidence(
      evidence,
      candidate,
      vector.profile,
      proof,
    );
    expect(result.valid).toBe(false);
    expect(result.classification).toBe('TARGET_MANAGED_CONTENT_INTEGRITY_FAIL');
    expect(result.contentDigestMatches).toBe(false);
    expect(result.attachmentMetadataValid).toBe(true);
    expect(result.issues.map((issue) => issue.code))
      .toContain('P15_MEDIA_INTEGRITY_CONTENT_MISMATCH');
  });

  it('rejects malformed MIME/dimensions rather than converting them into a byte mismatch', () => {
    const { vector, candidate, proof, evidence } = fixture();
    evidence.attachment.mimeType = 'image/jpeg';
    evidence.attachment.width = 0;

    const result = validateElementorTargetManagedMediaIntegrityEvidence(
      evidence,
      candidate,
      vector.profile,
      proof,
    );
    expect(result.valid).toBe(false);
    expect(result.classification).toBe('REJECTED');
    expect(result.attachmentMetadataValid).toBe(false);
    expect(result.issues.map((issue) => issue.code))
      .toContain('P15_MEDIA_INTEGRITY_ATTACHMENT_INVALID');
  });

  it('rejects replay against a changed TargetProfile and rejects a non-full-pass prerequisite proof', () => {
    const { candidate, proof, evidence } = fixture();
    const changedProfile = buildElementorTargetProfile({
      wordpressVersion: '6.8',
      elementorVersion: '4.2.5',
    });
    const stale = validateElementorTargetManagedMediaIntegrityEvidence(
      evidence,
      candidate,
      changedProfile,
      proof,
    );
    expect(stale.classification).toBe('REJECTED');
    expect(stale.assetProofValid).toBe(false);
    expect(stale.issues.map((issue) => issue.code))
      .toContain('P15_MEDIA_INTEGRITY_PROOF_INVALID');

    const { vector } = fixture();
    const failedProof = buildElementorAssetTargetProofEvidence({
      candidate,
      profile: vector.profile,
      observedTarget: {
        source: 'OBSERVED',
        wordpressVersion: '6.8',
        elementorVersion: '4.2.4',
        importSurface: 'TEMPLATE_LIBRARY_JSON',
      },
      observedAt: '2026-09-19T11:01:00.000Z',
      evidenceReference: EVIDENCE_REFERENCE,
      steps: {
        ...fullPassSteps(vector.assetUrlFingerprint),
        browserImageLoadResult: 'FAIL',
      },
    });
    const failed = validateElementorTargetManagedMediaIntegrityEvidence(
      evidence,
      candidate,
      vector.profile,
      failedProof,
    );
    expect(failed.classification).toBe('REJECTED');
    expect(failed.assetProofValid).toBe(true);
    expect(failed.assetProofClassification).toBe('ASSET_BOUND_FAIL');
    expect(failed.issues.map((issue) => issue.code))
      .toContain('P15_MEDIA_INTEGRITY_PROOF_NOT_FULL_PASS');
  });

  it('rejects evidence-reference mismatch and authority inflation', () => {
    const { vector, candidate, proof, evidence } = fixture();
    evidence.evidenceReference = 'retained-evidence://p15/other-run';
    const mismatch = validateElementorTargetManagedMediaIntegrityEvidence(
      evidence,
      candidate,
      vector.profile,
      proof,
    );
    expect(mismatch.classification).toBe('REJECTED');
    expect(mismatch.evidenceReferenceMatches).toBe(false);
    expect(mismatch.issues.map((issue) => issue.code))
      .toContain('P15_MEDIA_INTEGRITY_EVIDENCE_REFERENCE_MISMATCH');

    const inflated = {
      ...fixture().evidence,
      assetReferenceClosureClaim: true,
    };
    const inflation = validateElementorTargetManagedMediaIntegrityEvidence(
      inflated,
      candidate,
      vector.profile,
      proof,
    );
    expect(inflation.valid).toBe(false);
    expect(inflation.issues.map((issue) => issue.code))
      .toContain('P15_MEDIA_INTEGRITY_AUTHORITY_FLAGS_INVALID');
  });

  it('CLI keeps paths, raw asset URL and evidence reference out of the sanitized report', () => {
    const { vector, candidate, proof, evidence } = fixture();
    const dir = fixtureDir();
    const candidatePath = join(dir, 'candidate.json');
    const profilePath = join(dir, 'profile.json');
    const proofPath = join(dir, 'proof.json');
    const evidencePath = join(dir, 'integrity.json');
    const outPath = join(dir, 'report.json');

    writeFileSync(candidatePath, JSON.stringify(candidate, null, 2) + '\n');
    writeFileSync(profilePath, JSON.stringify(vector.profile, null, 2) + '\n');
    writeFileSync(proofPath, JSON.stringify(proof, null, 2) + '\n');
    writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n');

    const run = spawnSync(process.execPath, [
      'scripts/p15-target-managed-media-integrity-intake.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--asset-proof', proofPath,
      '--integrity-evidence', evidencePath,
      '--out', outPath,
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(run.status).toBe(0);
    const reportText = readFileSync(outPath, 'utf8');
    const report = JSON.parse(reportText);
    expect(report.classification).toBe('TARGET_MANAGED_CONTENT_INTEGRITY_PASS');
    expect(report.contentDigestMatches).toBe(true);
    expect(report.sourceFixtureSha256).toBe(SOURCE_SHA);
    expect(report.targetFileSha256).toBe(SOURCE_SHA);
    expect(reportText).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(reportText).not.toContain(EVIDENCE_REFERENCE);
    expect(reportText).not.toContain(candidatePath);
    expect(run.stdout).not.toContain(EVIDENCE_REFERENCE);
  });
});
