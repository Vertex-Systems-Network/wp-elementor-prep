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
  P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256,
  P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
  buildP15ElementorAssetProofVector,
} from '../src/targets/elementor/asset-proof-vector';
import {
  ELEMENTOR_TARGET_MANAGED_MEDIA_INTEGRITY_EVIDENCE_VERSION,
  type ElementorTargetManagedMediaIntegrityEvidenceV1,
} from '../src/targets/elementor/target-managed-media-integrity-evidence';
import {
  buildElementorTargetManagedMediaReviewPrerequisite,
  serializeElementorTargetManagedMediaReviewPrerequisite,
} from '../src/targets/elementor/target-managed-media-review-prerequisite';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

const tempDirs: string[] = [];
const EVIDENCE_REFERENCE = 'retained-evidence://p15/media-review-prerequisite-private';
const TARGET_MEDIA_FINGERPRINT = 'sha256:' + 'a'.repeat(64);

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function fullPassSteps(sourceFingerprint: string): ElementorAssetTargetProofStepsV1 {
  return {
    importResult: 'PASS',
    targetManagedMediaResult: 'PASS',
    sourceProvenanceResult: 'PASS',
    sourceAssetUrlFingerprint: sourceFingerprint,
    targetManagedMediaUrlFingerprint: TARGET_MEDIA_FINGERPRINT,
    renderResult: 'PASS',
    renderedImageReferenceResult: 'PASS',
    browserImageLoadResult: 'PASS',
    renderedImageUrlFingerprint: TARGET_MEDIA_FINGERPRINT,
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
    observedAt: '2026-09-20T10:00:00.000Z',
    evidenceReference: EVIDENCE_REFERENCE,
    steps: fullPassSteps(vector.assetUrlFingerprint),
  });
  const integrity: ElementorTargetManagedMediaIntegrityEvidenceV1 = {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_TARGET_MANAGED_MEDIA_INTEGRITY_EVIDENCE_VERSION,
    candidateIdentity: proof.candidateIdentity,
    targetProfileIdentity: proof.targetProfileIdentity,
    referenceReviewIdentity: proof.referenceReviewIdentity,
    observedTarget: proof.observedTarget,
    observedAt: '2026-09-20T10:00:01.000Z',
    evidenceReference: EVIDENCE_REFERENCE,
    attachment: {
      postType: 'attachment',
      sourceFixtureSha256: P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256,
      targetFileSha256: P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256,
      mimeType: 'image/png',
      width: 2,
      height: 2,
    },
    referenceClosureClaim: false,
    assetReferenceClosureClaim: false,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
  return { vector, candidate, proof, integrity };
}

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-media-review-prerequisite-'));
  tempDirs.push(dir);
  return dir;
}

describe('P15 target-managed media internal-review prerequisite', () => {
  it('becomes ready only when exact observed asset evidence and canonical content integrity both pass', () => {
    const { vector, candidate, proof, integrity } = fixture();
    const result = buildElementorTargetManagedMediaReviewPrerequisite(
      candidate,
      vector.profile,
      proof,
      integrity,
    );

    expect(result.status).toBe('READY_FOR_INTERNAL_REVIEW');
    expect(result.observedAssetEvidenceBound).toBe(true);
    expect(result.contentIntegrityPass).toBe(true);
    expect(result.crossBindingMatches).toBe(true);
    expect(result.candidateIdentityDigest).toBe(vector.candidateIdentity.digest);
    expect(result.targetProfileFingerprint).toBe(vector.targetProfileFingerprint);
    expect(result.referenceReviewIdentityDigest).toBe(vector.referenceReviewIdentity.digest);
    expect(result.sourceFixtureSha256).toBe(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256);
    expect(result.targetFileSha256).toBe(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256);
    expect(result.mimeType).toBe('image/png');
    expect(result.width).toBe(2);
    expect(result.height).toBe(2);
    expect(result.evidenceAuthenticationStatus).toBe('OBSERVED_PROOF_VALIDATED');
    expect(result.contentIntegrityStatus).toBe('TARGET_MANAGED_CONTENT_INTEGRITY_PASS');
    expect(result.internalDecisionStatus).toBe('NOT_RUN');
    expect(result.referenceClosureClaim).toBe(false);
    expect(result.assetReferenceClosureClaim).toBe(false);
    expect(result.authenticationAuthority).toBe(false);
    expect(result.acceptanceAuthority).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('rejects a genuine canonical target-file mismatch instead of becoming review-ready', () => {
    const { vector, candidate, proof, integrity } = fixture();
    integrity.attachment.targetFileSha256 = 'sha256:' + '9'.repeat(64);
    const result = buildElementorTargetManagedMediaReviewPrerequisite(
      candidate,
      vector.profile,
      proof,
      integrity,
    );

    expect(result.status).toBe('REJECTED_CONTENT_INTEGRITY');
    expect(result.observedAssetEvidenceBound).toBe(true);
    expect(result.contentIntegrityPass).toBe(false);
    expect(result.internalDecisionStatus).toBe('NOT_RUN');
    expect(result.referenceClosureClaim).toBe(false);
  });

  it('rejects an integrity evidence-reference replay even when the observed proof remains valid', () => {
    const { vector, candidate, proof, integrity } = fixture();
    integrity.evidenceReference = 'retained-evidence://p15/different-run';
    const result = buildElementorTargetManagedMediaReviewPrerequisite(
      candidate,
      vector.profile,
      proof,
      integrity,
    );

    expect(result.status).toBe('REJECTED_CONTENT_INTEGRITY');
    expect(result.observedAssetEvidenceBound).toBe(true);
    expect(result.contentIntegrityPass).toBe(false);
  });

  it('rejects stale TargetProfile replay before any internal-review readiness', () => {
    const { candidate, proof, integrity } = fixture();
    const changedProfile = buildElementorTargetProfile({
      wordpressVersion: '6.8',
      elementorVersion: '4.2.5',
    });
    const result = buildElementorTargetManagedMediaReviewPrerequisite(
      candidate,
      changedProfile,
      proof,
      integrity,
    );

    expect(result.status).toBe('REJECTED_OBSERVED_EVIDENCE');
    expect(result.observedAssetEvidenceBound).toBe(false);
    expect(result.contentIntegrityPass).toBe(false);
    expect(result.internalDecisionStatus).toBe('NOT_RUN');
  });

  it('serializes deterministically without leaking the raw fixture URL or evidence reference', () => {
    const { vector, candidate, proof, integrity } = fixture();
    const first = serializeElementorTargetManagedMediaReviewPrerequisite(
      candidate,
      vector.profile,
      proof,
      integrity,
    );
    const second = serializeElementorTargetManagedMediaReviewPrerequisite(
      structuredClone(candidate),
      structuredClone(vector.profile),
      structuredClone(proof),
      structuredClone(integrity),
    );

    expect(second).toBe(first);
    expect(first).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(first).not.toContain(EVIDENCE_REFERENCE);
    expect(first).toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256);
    expect(first).toContain(TARGET_MEDIA_FINGERPRINT);
  });

  it('CLI writes only the sanitized ready prerequisite and exits nonzero for invalid integrity', () => {
    const { vector, candidate, proof, integrity } = fixture();
    const dir = tempDir();
    const candidatePath = join(dir, 'candidate.json');
    const profilePath = join(dir, 'profile.json');
    const proofPath = join(dir, 'proof.json');
    const integrityPath = join(dir, 'integrity.json');
    const outPath = join(dir, 'report.json');

    writeFileSync(candidatePath, JSON.stringify(candidate, null, 2) + '\n');
    writeFileSync(profilePath, JSON.stringify(vector.profile, null, 2) + '\n');
    writeFileSync(proofPath, JSON.stringify(proof, null, 2) + '\n');
    writeFileSync(integrityPath, JSON.stringify(integrity, null, 2) + '\n');

    const run = spawnSync(process.execPath, [
      'scripts/p15-target-managed-media-review-prerequisite.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--asset-proof', proofPath,
      '--integrity-evidence', integrityPath,
      '--out', outPath,
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(run.status).toBe(0);
    const reportText = readFileSync(outPath, 'utf8');
    const report = JSON.parse(reportText);
    expect(report.status).toBe('READY_FOR_INTERNAL_REVIEW');
    expect(report.crossBindingMatches).toBe(true);
    expect(report.internalDecisionStatus).toBe('NOT_RUN');
    expect(report.referenceClosureClaim).toBe(false);
    expect(reportText).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(reportText).not.toContain(EVIDENCE_REFERENCE);
    expect(reportText).not.toContain(candidatePath);
    expect(run.stdout).not.toContain(EVIDENCE_REFERENCE);

    integrity.attachment.targetFileSha256 = 'sha256:' + '0'.repeat(64);
    writeFileSync(integrityPath, JSON.stringify(integrity, null, 2) + '\n');
    const rejected = spawnSync(process.execPath, [
      'scripts/p15-target-managed-media-review-prerequisite.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--asset-proof', proofPath,
      '--integrity-evidence', integrityPath,
      '--out', join(dir, 'rejected.json'),
    ], { cwd: process.cwd(), encoding: 'utf8' });
    expect(rejected.status).toBe(2);
  });
});
