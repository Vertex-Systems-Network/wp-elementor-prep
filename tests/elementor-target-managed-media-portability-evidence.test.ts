import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256';
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
  ELEMENTOR_TARGET_MANAGED_MEDIA_PORTABILITY_EVIDENCE_VERSION,
  validateElementorTargetManagedMediaPortabilityEvidence,
  type ElementorTargetManagedMediaPortabilityEvidenceV1,
} from '../src/targets/elementor/target-managed-media-portability-evidence';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

const tempDirs: string[] = [];
const EVIDENCE_REFERENCE = 'retained-evidence://p15/cross-target-portability-private';
const SOURCE_MANAGED_URL = 'http://127.0.0.1:8080/wp-content/uploads/2026/09/p15-asset-fixture.png';
const DESTINATION_MANAGED_URL = 'http://127.0.0.1:8082/wp-content/uploads/2026/09/p15-asset-fixture.png';

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function sha256(value: string): string {
  return `sha256:${sha256Hex(value)}`;
}

function fullPassSteps(sourceFingerprint: string, targetFingerprint: string): ElementorAssetTargetProofStepsV1 {
  return {
    importResult: 'PASS',
    targetManagedMediaResult: 'PASS',
    sourceProvenanceResult: 'PASS',
    sourceAssetUrlFingerprint: sourceFingerprint,
    targetManagedMediaUrlFingerprint: targetFingerprint,
    renderResult: 'PASS',
    renderedImageReferenceResult: 'PASS',
    browserImageLoadResult: 'PASS',
    renderedImageUrlFingerprint: targetFingerprint,
  };
}

function replaceImageUrl(value: unknown, nextUrl: string): boolean {
  if (!Array.isArray(value)) return false;
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const element = item as Record<string, unknown>;
    const settings = element.settings;
    if (element.widgetType === 'image'
      && settings && typeof settings === 'object' && !Array.isArray(settings)) {
      const image = (settings as Record<string, unknown>).image;
      if (image && typeof image === 'object' && !Array.isArray(image)) {
        (image as Record<string, unknown>).url = nextUrl;
        return true;
      }
    }
    if (replaceImageUrl(element.elements, nextUrl)) return true;
  }
  return false;
}

function fixture() {
  const vector = buildP15ElementorAssetProofVector();
  const candidate = JSON.parse(vector.files['candidate.json']) as ElementorTemplateCandidateArtifactV1;
  const sourceManagedFingerprint = sha256(SOURCE_MANAGED_URL);
  const destinationManagedFingerprint = sha256(DESTINATION_MANAGED_URL);
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
    steps: fullPassSteps(vector.assetUrlFingerprint, sourceManagedFingerprint),
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

  if (typeof candidate.templateJson !== 'string') {
    throw new Error('Asset proof candidate must retain template JSON.');
  }
  const exportedTemplate = JSON.parse(candidate.templateJson) as Record<string, unknown>;
  expect(replaceImageUrl(exportedTemplate.content, SOURCE_MANAGED_URL)).toBe(true);
  const exportedRaw = JSON.stringify(exportedTemplate, null, 2) + '\n';
  const exportedTemplateSha256 = sha256(exportedRaw);
  const portability: ElementorTargetManagedMediaPortabilityEvidenceV1 = {
    schemaVersion: 1,
    evidenceVersion: ELEMENTOR_TARGET_MANAGED_MEDIA_PORTABILITY_EVIDENCE_VERSION,
    exportedTemplateSha256,
    sourceTarget: {
      source: 'OBSERVED',
      wordpressVersion: '6.8',
      elementorVersion: '4.2.4',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    destinationTarget: {
      source: 'OBSERVED',
      wordpressVersion: '6.8',
      elementorVersion: '4.2.4',
      importSurface: 'TEMPLATE_LIBRARY_JSON',
    },
    observedAt: '2026-09-20T10:00:02.000Z',
    evidenceReference: EVIDENCE_REFERENCE,
    steps: {
      importResult: 'PASS',
      sourceProvenanceResult: 'PASS',
      sourceManagedMediaUrlFingerprint: sourceManagedFingerprint,
      destinationSourceUrlFingerprint: sourceManagedFingerprint,
      destinationManagedMediaUrlFingerprint: destinationManagedFingerprint,
      destinationManagedMediaTargetLocal: true,
      renderResult: 'PASS',
      renderedImageReferenceResult: 'PASS',
      browserImageLoadResult: 'PASS',
      renderedImageUrlFingerprint: destinationManagedFingerprint,
    },
    attachment: {
      sourceFixtureSha256: P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256,
      targetFileSha256: P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256,
      mimeType: 'image/png',
      width: 2,
      height: 2,
    },
    internalDecisionStatus: 'NOT_RUN',
    authenticationAuthority: false,
    acceptanceAuthority: false,
    referenceClosureClaim: false,
    assetReferenceClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };

  return {
    vector,
    candidate,
    proof,
    integrity,
    exportedTemplate,
    exportedRaw,
    exportedTemplateSha256,
    portability,
    sourceManagedFingerprint,
    destinationManagedFingerprint,
  };
}

function validate(value = fixture()) {
  return validateElementorTargetManagedMediaPortabilityEvidence(
    value.portability,
    value.candidate,
    value.vector.profile,
    value.proof,
    value.integrity,
    value.exportedTemplate,
    value.exportedTemplateSha256,
  );
}

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-media-portability-'));
  tempDirs.push(dir);
  return dir;
}

describe('P15 controlled cross-target managed-media portability', () => {
  it('passes only the exact review-ready target-A export re-imported as target-B managed media', () => {
    const value = fixture();
    const result = validate(value);

    expect(result.valid).toBe(true);
    expect(result.classification).toBe('CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PASS');
    expect(result.reviewPrerequisiteReady).toBe(true);
    expect(result.exportBindingMatches).toBe(true);
    expect(result.sourceTargetMatches).toBe(true);
    expect(result.destinationTargetMatches).toBe(true);
    expect(result.evidenceReferenceMatches).toBe(true);
    expect(result.sourceProvenanceMatches).toBe(true);
    expect(result.destinationMediaBindingMatches).toBe(true);
    expect(result.contentIntegrityMatches).toBe(true);
    expect(result.exportedSourceMediaUrlFingerprint).toBe(value.sourceManagedFingerprint);
    expect(result.destinationManagedMediaUrlFingerprint).toBe(value.destinationManagedFingerprint);
    expect(result.destinationManagedMediaTargetLocal).toBe(true);
    expect(result.targetFileSha256).toBe(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_SHA256);
    expect(result.internalDecisionStatus).toBe('NOT_RUN');
    expect(result.referenceClosureClaim).toBe(false);
    expect(result.assetReferenceClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
  });

  it('rejects a stale or tampered exported-template hash', () => {
    const value = fixture();
    const result = validateElementorTargetManagedMediaPortabilityEvidence(
      value.portability,
      value.candidate,
      value.vector.profile,
      value.proof,
      value.integrity,
      value.exportedTemplate,
      'sha256:' + '9'.repeat(64),
    );

    expect(result.classification).toBe('REJECTED');
    expect(result.issues.map((issue) => issue.code)).toContain('P15_MEDIA_PORTABILITY_EXPORT_SHA_MISMATCH');
  });

  it('rejects TargetProfile replay before portability can pass', () => {
    const value = fixture();
    const changedProfile = buildElementorTargetProfile({
      wordpressVersion: '6.8',
      elementorVersion: '4.2.5',
    });
    const result = validateElementorTargetManagedMediaPortabilityEvidence(
      value.portability,
      value.candidate,
      changedProfile,
      value.proof,
      value.integrity,
      value.exportedTemplate,
      value.exportedTemplateSha256,
    );

    expect(result.classification).toBe('REJECTED');
    expect(result.reviewPrerequisiteReady).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_MEDIA_PORTABILITY_PREREQUISITE_NOT_READY');
  });

  it('rejects treating the target-A managed-media URL as target-B identity', () => {
    const value = fixture();
    value.portability.steps.destinationManagedMediaUrlFingerprint = value.sourceManagedFingerprint;
    value.portability.steps.renderedImageUrlFingerprint = value.sourceManagedFingerprint;
    const result = validate(value);

    expect(result.classification).toBe('REJECTED');
    expect(result.destinationMediaBindingMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_MEDIA_PORTABILITY_DESTINATION_MEDIA_INVALID');
  });

  it('fails closed when target-B bytes do not equal the canonical controlled PNG', () => {
    const value = fixture();
    value.portability.attachment.targetFileSha256 = 'sha256:' + '8'.repeat(64);
    const result = validate(value);

    expect(result.classification).toBe('CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_FAIL');
    expect(result.contentIntegrityMatches).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_MEDIA_PORTABILITY_CONTENT_INTEGRITY_INVALID');
  });

  it('rejects any attempt to inflate portability evidence into production authority', () => {
    const value = fixture();
    (value.portability as unknown as { productionAcceptance: boolean }).productionAcceptance = true;
    const result = validate(value);

    expect(result.classification).toBe('REJECTED');
    expect(result.issues.map((issue) => issue.code)).toContain('P15_MEDIA_PORTABILITY_AUTHORITY_FLAGS_INVALID');
  });

  it('CLI retains only sanitized hashes/fingerprints and rejects a mismatched export', () => {
    const value = fixture();
    const dir = tempDir();
    const candidatePath = join(dir, 'candidate.json');
    const profilePath = join(dir, 'profile.json');
    const proofPath = join(dir, 'proof.json');
    const integrityPath = join(dir, 'integrity.json');
    const exportPath = join(dir, 'target-a-export.json');
    const portabilityPath = join(dir, 'portability.json');
    const outPath = join(dir, 'report.json');

    writeFileSync(candidatePath, JSON.stringify(value.candidate, null, 2) + '\n');
    writeFileSync(profilePath, JSON.stringify(value.vector.profile, null, 2) + '\n');
    writeFileSync(proofPath, JSON.stringify(value.proof, null, 2) + '\n');
    writeFileSync(integrityPath, JSON.stringify(value.integrity, null, 2) + '\n');
    writeFileSync(exportPath, value.exportedRaw);
    writeFileSync(portabilityPath, JSON.stringify(value.portability, null, 2) + '\n');

    const run = spawnSync(process.execPath, [
      'scripts/p15-target-managed-media-portability-intake.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--asset-proof', proofPath,
      '--integrity-evidence', integrityPath,
      '--exported-template', exportPath,
      '--portability-evidence', portabilityPath,
      '--out', outPath,
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(run.status).toBe(0);
    const reportText = readFileSync(outPath, 'utf8');
    const report = JSON.parse(reportText);
    expect(report.classification).toBe('CONTROLLED_CROSS_TARGET_MEDIA_PORTABILITY_PASS');
    expect(report.exportedTemplateSha256).toBe(value.exportedTemplateSha256);
    expect(report.internalDecisionStatus).toBe('NOT_RUN');
    expect(report.referenceClosureClaim).toBe(false);
    expect(report.assetReferenceClosureClaim).toBe(false);
    expect(reportText).not.toContain(SOURCE_MANAGED_URL);
    expect(reportText).not.toContain(DESTINATION_MANAGED_URL);
    expect(reportText).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(reportText).not.toContain(EVIDENCE_REFERENCE);
    expect(reportText).not.toContain(candidatePath);
    expect(run.stdout).not.toContain(EVIDENCE_REFERENCE);

    const changed = structuredClone(value.exportedTemplate);
    (changed as Record<string, unknown>).title = 'tampered export';
    writeFileSync(exportPath, JSON.stringify(changed, null, 2) + '\n');
    const rejected = spawnSync(process.execPath, [
      'scripts/p15-target-managed-media-portability-intake.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--asset-proof', proofPath,
      '--integrity-evidence', integrityPath,
      '--exported-template', exportPath,
      '--portability-evidence', portabilityPath,
      '--out', join(dir, 'rejected.json'),
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(rejected.status).toBe(2);
  });
});
