import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from '../src/targets/elementor/candidate-artifact';
import {
  buildElementorAssetTargetProofEvidence,
  type ElementorAssetTargetProofEvidenceV1,
  type ElementorAssetTargetProofStepsV1,
} from '../src/targets/elementor/asset-target-proof-evidence';
import {
  P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL,
  buildP15ElementorAssetProofVector,
} from '../src/targets/elementor/asset-proof-vector';
import {
  assessElementorObservedAssetReferenceEvidence,
  serializeElementorObservedAssetReferenceEvidence,
} from '../src/targets/elementor/observed-asset-reference-evidence';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

const tempDirs: string[] = [];
const EVIDENCE_REFERENCE = 'retained-evidence://p15/observed-asset-reference-private';
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

function vectorFixture() {
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
    observedAt: '2026-09-19T10:23:45.000Z',
    evidenceReference: EVIDENCE_REFERENCE,
    steps: fullPassSteps(vector.assetUrlFingerprint),
  });
  return { vector, candidate, proof };
}

function fixtureDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-observed-asset-reference-'));
  tempDirs.push(dir);
  return dir;
}

describe('P15 observed asset reference evidence bridge', () => {
  it('binds exact ASSET_BOUND_FULL_PASS into sanitized observed evidence without granting closure authority', () => {
    const { vector, candidate, proof } = vectorFixture();
    const assessment = assessElementorObservedAssetReferenceEvidence(
      proof,
      candidate,
      vector.profile,
    );

    expect(assessment.status).toBe('OBSERVED_ASSET_EVIDENCE_BOUND');
    expect(assessment.proofValid).toBe(true);
    expect(assessment.proofClassification).toBe('ASSET_BOUND_FULL_PASS');
    expect(assessment.referenceScopeEligible).toBe(true);
    expect(assessment.referenceBindingMatches).toBe(true);
    expect(assessment.issues).toEqual([]);
    expect(assessment.evidence?.referenceReviewIdentityDigest)
      .toBe(vector.referenceReviewIdentity.digest);
    expect(assessment.evidence?.candidateIdentityDigest)
      .toBe(vector.candidateIdentity.digest);
    expect(assessment.evidence?.targetProfileFingerprint)
      .toBe(vector.targetProfileFingerprint);
    expect(assessment.evidence?.sourceAssetUrlFingerprint)
      .toBe(vector.assetUrlFingerprint);
    expect(assessment.evidence?.targetManagedMediaUrlFingerprint)
      .toBe(TARGET_MEDIA_FINGERPRINT);
    expect(assessment.evidence?.renderedImageUrlFingerprint)
      .toBe(TARGET_MEDIA_FINGERPRINT);
    expect(assessment.evidence?.evidenceAuthenticationStatus)
      .toBe('OBSERVED_PROOF_VALIDATED');
    expect(assessment.evidence?.internalDecisionStatus).toBe('NOT_RUN');
    expect(assessment.referenceClosureClaim).toBe(false);
    expect(assessment.authenticationAuthority).toBe(false);
    expect(assessment.targetCompatibilityClaim).toBe(false);
    expect(assessment.productionAcceptance).toBe(false);
  });

  it('serializes deterministically while omitting raw source URL and raw evidence reference', () => {
    const { vector, candidate, proof } = vectorFixture();
    const first = serializeElementorObservedAssetReferenceEvidence(proof, candidate, vector.profile);
    const second = serializeElementorObservedAssetReferenceEvidence(
      structuredClone(proof),
      structuredClone(candidate),
      structuredClone(vector.profile),
    );

    expect(second).toBe(first);
    expect(first).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(first).not.toContain(EVIDENCE_REFERENCE);
    expect(first).toContain(vector.assetUrlFingerprint);
    expect(first).toContain(TARGET_MEDIA_FINGERPRINT);
    expect(first).toMatch(/"sourceEvidenceReferenceSha256": "sha256:[0-9a-f]{64}"/);
    expect(first).toMatch(/"sourceProofSha256": "sha256:[0-9a-f]{64}"/);
  });

  it('rejects a genuine bounded FAIL proof instead of treating observed failure as closure evidence', () => {
    const { vector, candidate } = vectorFixture();
    const failed = buildElementorAssetTargetProofEvidence({
      candidate,
      profile: vector.profile,
      observedTarget: {
        source: 'OBSERVED',
        wordpressVersion: '6.8',
        elementorVersion: '4.2.4',
        importSurface: 'TEMPLATE_LIBRARY_JSON',
      },
      observedAt: '2026-09-19T10:24:00.000Z',
      evidenceReference: 'retained-evidence://p15/asset-failure',
      steps: {
        ...fullPassSteps(vector.assetUrlFingerprint),
        browserImageLoadResult: 'FAIL',
      },
    });

    const assessment = assessElementorObservedAssetReferenceEvidence(
      failed,
      candidate,
      vector.profile,
    );
    expect(assessment.status).toBe('REJECTED_PROOF');
    expect(assessment.proofValid).toBe(true);
    expect(assessment.proofClassification).toBe('ASSET_BOUND_FAIL');
    expect(assessment.evidence).toBeNull();
    expect(assessment.issues.map((issue) => issue.code))
      .toContain('P15_OBSERVED_ASSET_PROOF_NOT_FULL_PASS');
  });

  it('rejects stale profile replay even when the supplied proof was full-pass for the original profile', () => {
    const { candidate, proof } = vectorFixture();
    const changedProfile = buildElementorTargetProfile({
      wordpressVersion: '6.8',
      elementorVersion: '4.2.5',
    });

    const assessment = assessElementorObservedAssetReferenceEvidence(
      proof,
      candidate,
      changedProfile,
    );
    expect(assessment.status).toBe('REJECTED_PROOF');
    expect(assessment.proofValid).toBe(false);
    expect(assessment.evidence).toBeNull();
    expect(assessment.issues.map((issue) => issue.code))
      .toContain('P15_OBSERVED_ASSET_PROOF_INVALID');
  });

  it('rejects mixed global+asset current reference scope even when the exact asset proof itself is full-pass', () => {
    const vector = buildP15ElementorAssetProofVector();
    const template = JSON.parse(vector.files['template.json']) as {
      content: Array<{
        elements: Array<{
          widgetType?: string;
          settings: Record<string, unknown>;
        }>;
      }>;
    };
    const heading = template.content[0]?.elements.find((element) => element.widgetType === 'heading');
    if (!heading) throw new Error('fixture heading missing');
    heading.settings.__globals__ = {
      title_color: 'globals/colors?id=observed-asset-mixed-global',
    };

    const candidate = buildElementorTemplateCandidateArtifact(template);
    expect(candidate.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    const proof = buildElementorAssetTargetProofEvidence({
      candidate,
      profile: vector.profile,
      observedTarget: {
        source: 'OBSERVED',
        wordpressVersion: '6.8',
        elementorVersion: '4.2.4',
        importSurface: 'TEMPLATE_LIBRARY_JSON',
      },
      observedAt: '2026-09-19T10:25:00.000Z',
      evidenceReference: 'retained-evidence://p15/mixed-scope',
      steps: fullPassSteps(vector.assetUrlFingerprint),
    });

    const assessment = assessElementorObservedAssetReferenceEvidence(
      proof,
      candidate,
      vector.profile,
    );
    expect(assessment.proofValid).toBe(true);
    expect(assessment.proofClassification).toBe('ASSET_BOUND_FULL_PASS');
    expect(assessment.status).toBe('REJECTED_REFERENCE_SCOPE');
    expect(assessment.referenceScopeEligible).toBe(false);
    expect(assessment.evidence).toBeNull();
    expect(assessment.issues.map((issue) => issue.code))
      .toContain('P15_OBSERVED_ASSET_REFERENCE_SCOPE_INVALID');
  });

  it('CLI emits only sanitized bound evidence and exits nonzero for authority-inflated proof', () => {
    const { vector, candidate, proof } = vectorFixture();
    const dir = fixtureDir();
    const candidatePath = join(dir, 'candidate.json');
    const profilePath = join(dir, 'profile.json');
    const proofPath = join(dir, 'proof.json');
    const outPath = join(dir, 'report.json');

    writeFileSync(candidatePath, JSON.stringify(candidate, null, 2) + '\n');
    writeFileSync(profilePath, JSON.stringify(vector.profile, null, 2) + '\n');
    writeFileSync(proofPath, JSON.stringify(proof, null, 2) + '\n');

    const run = spawnSync(process.execPath, [
      'scripts/p15-observed-asset-reference-evidence.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--proof', proofPath,
      '--out', outPath,
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(run.status).toBe(0);
    expect(run.stdout).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(run.stdout).not.toContain(EVIDENCE_REFERENCE);
    const reportText = readFileSync(outPath, 'utf8');
    const report = JSON.parse(reportText);
    expect(report.status).toBe('OBSERVED_ASSET_EVIDENCE_BOUND');
    expect(report.evidence.evidenceAuthenticationStatus).toBe('OBSERVED_PROOF_VALIDATED');
    expect(report.referenceClosureClaim).toBe(false);
    expect(report.authenticationAuthority).toBe(false);
    expect(reportText).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(reportText).not.toContain(EVIDENCE_REFERENCE);

    const inflated = structuredClone(proof) as ElementorAssetTargetProofEvidenceV1;
    (inflated as unknown as { assetReferenceClosureClaim: boolean }).assetReferenceClosureClaim = true;
    writeFileSync(proofPath, JSON.stringify(inflated, null, 2) + '\n');
    const rejected = spawnSync(process.execPath, [
      'scripts/p15-observed-asset-reference-evidence.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--proof', proofPath,
      '--out', join(dir, 'rejected.json'),
    ], { cwd: process.cwd(), encoding: 'utf8' });
    expect(rejected.status).toBe(2);
  });
});
