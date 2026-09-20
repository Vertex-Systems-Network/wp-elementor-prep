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
  type ElementorTargetManagedMediaPortabilityEvidenceV1,
} from '../src/targets/elementor/target-managed-media-portability-evidence';
import {
  buildElementorTargetManagedMediaReviewPrerequisite,
  serializeElementorTargetManagedMediaReviewPrerequisite,
} from '../src/targets/elementor/target-managed-media-review-prerequisite';
import {
  ELEMENTOR_TARGET_MANAGED_MEDIA_INTERNAL_DECISION_VERSION,
  validateElementorTargetManagedMediaInternalDecision,
  type ElementorTargetManagedMediaInternalDecisionOutcome,
  type ElementorTargetManagedMediaInternalDecisionRecordV1,
} from '../src/targets/elementor/target-managed-media-internal-decision';
import { buildElementorTargetProfile } from '../src/targets/elementor/target-profile';

const tempDirs: string[] = [];
const EVIDENCE_REFERENCE = 'retained-evidence://p15/decision-test-private';
const DECISION_REFERENCE = 'internal-review://p15/decision-test-private';
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
  const portabilityRaw = JSON.stringify(portability, null, 2) + '\n';
  const portabilityEvidenceSha256 = sha256(portabilityRaw);
  const prerequisite = buildElementorTargetManagedMediaReviewPrerequisite(
    candidate,
    vector.profile,
    proof,
    integrity,
  );
  expect(prerequisite.status).toBe('READY_FOR_INTERNAL_REVIEW');
  const reviewPrerequisiteSha256 = sha256(serializeElementorTargetManagedMediaReviewPrerequisite(
    candidate,
    vector.profile,
    proof,
    integrity,
  ));
  if (!prerequisite.candidateIdentityDigest
    || !prerequisite.targetProfileFingerprint
    || !prerequisite.sourceEvidenceReferenceSha256) {
    throw new Error('Review prerequisite must expose exact decision bindings.');
  }

  return {
    vector,
    candidate,
    proof,
    integrity,
    exportedTemplate,
    exportedRaw,
    exportedTemplateSha256,
    portability,
    portabilityRaw,
    portabilityEvidenceSha256,
    prerequisite,
    reviewPrerequisiteSha256,
  };
}

function decisionRecord(
  value: ReturnType<typeof fixture>,
  outcome: ElementorTargetManagedMediaInternalDecisionOutcome = 'APPROVE_BOUNDED_ASSET_REFERENCE_CLOSURE',
): ElementorTargetManagedMediaInternalDecisionRecordV1 {
  return {
    schemaVersion: 1,
    decisionVersion: ELEMENTOR_TARGET_MANAGED_MEDIA_INTERNAL_DECISION_VERSION,
    outcome,
    decidedAt: '2026-09-20T10:01:00.000Z',
    decisionReference: DECISION_REFERENCE,
    candidateIdentityDigest: value.prerequisite.candidateIdentityDigest!,
    targetProfileFingerprint: value.prerequisite.targetProfileFingerprint!,
    reviewPrerequisiteSha256: value.reviewPrerequisiteSha256,
    portabilityEvidenceSha256: value.portabilityEvidenceSha256,
    exportedTemplateSha256: value.exportedTemplateSha256,
    sourceEvidenceReferenceSha256: value.prerequisite.sourceEvidenceReferenceSha256!,
    authorityBoundary: {
      globalReferenceClosureClaim: false,
      arbitraryHostPortabilityClaim: false,
      attachmentIdPortabilityClaim: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      generationEnabled: false,
      downloadEnabled: false,
    },
  };
}

function validate(
  value = fixture(),
  decision = decisionRecord(value),
) {
  return validateElementorTargetManagedMediaInternalDecision(
    value.candidate,
    value.vector.profile,
    value.proof,
    value.integrity,
    value.exportedTemplate,
    value.exportedTemplateSha256,
    value.portability,
    value.portabilityEvidenceSha256,
    decision,
  );
}

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'p15-media-decision-'));
  tempDirs.push(dir);
  return dir;
}

describe('P15 target-managed media internal decision', () => {
  it('approves only the exact bounded asset-reference closure scope', () => {
    const value = fixture();
    const result = validate(value);

    expect(result.valid).toBe(true);
    expect(result.classification).toBe('BOUNDED_ASSET_REFERENCE_CLOSURE_APPROVED');
    expect(result.reviewPrerequisiteReady).toBe(true);
    expect(result.portabilityPass).toBe(true);
    expect(result.decisionBindingMatches).toBe(true);
    expect(result.internalDecisionStatus).toBe('APPROVED');
    expect(result.boundedAssetReferenceClosureAuthority).toBe(true);
    expect(result.assetReferenceClosureClaim).toBe(true);
    expect(result.referenceClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.generationEnabled).toBe(false);
    expect(result.downloadEnabled).toBe(false);
    expect(result.internalReviewRequired).toBe(false);
    expect(result.decisionReferenceSha256).toBe(sha256(DECISION_REFERENCE));
  });

  it('retains explicit REJECT and DEFER as valid operator decisions without closure authority', () => {
    const rejectedValue = fixture();
    const rejected = validate(
      rejectedValue,
      decisionRecord(rejectedValue, 'REJECT_BOUNDED_ASSET_REFERENCE_CLOSURE'),
    );
    const deferredValue = fixture();
    const deferred = validate(
      deferredValue,
      decisionRecord(deferredValue, 'DEFER_BOUNDED_ASSET_REFERENCE_CLOSURE'),
    );

    expect(rejected.valid).toBe(true);
    expect(rejected.classification).toBe('BOUNDED_ASSET_REFERENCE_CLOSURE_REJECTED');
    expect(rejected.internalDecisionStatus).toBe('REJECTED');
    expect(rejected.assetReferenceClosureClaim).toBe(false);
    expect(rejected.internalReviewRequired).toBe(false);

    expect(deferred.valid).toBe(true);
    expect(deferred.classification).toBe('BOUNDED_ASSET_REFERENCE_CLOSURE_DEFERRED');
    expect(deferred.internalDecisionStatus).toBe('DEFERRED');
    expect(deferred.assetReferenceClosureClaim).toBe(false);
    expect(deferred.internalReviewRequired).toBe(true);
  });

  it('rejects decision replay after TargetProfile drift', () => {
    const value = fixture();
    const decision = decisionRecord(value);
    const result = validateElementorTargetManagedMediaInternalDecision(
      value.candidate,
      buildElementorTargetProfile({ wordpressVersion: '6.8', elementorVersion: '4.2.5' }),
      value.proof,
      value.integrity,
      value.exportedTemplate,
      value.exportedTemplateSha256,
      value.portability,
      value.portabilityEvidenceSha256,
      decision,
    );

    expect(result.valid).toBe(false);
    expect(result.classification).toBe('REJECTED');
    expect(result.internalDecisionStatus).toBe('NOT_RUN');
    expect(result.assetReferenceClosureClaim).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_MEDIA_DECISION_PREREQUISITE_NOT_READY');
  });

  it('rejects changed portability bytes even when the semantic evidence still passes', () => {
    const value = fixture();
    const decision = decisionRecord(value);
    const changedPortability = structuredClone(value.portability);
    changedPortability.observedAt = '2026-09-20T10:00:03.000Z';
    const changedSha = sha256(JSON.stringify(changedPortability, null, 2) + '\n');
    const result = validateElementorTargetManagedMediaInternalDecision(
      value.candidate,
      value.vector.profile,
      value.proof,
      value.integrity,
      value.exportedTemplate,
      value.exportedTemplateSha256,
      changedPortability,
      changedSha,
      decision,
    );

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('P15_MEDIA_DECISION_BINDING_INVALID');
  });

  it('rejects decisions that predate portability evidence or inflate authority boundaries', () => {
    const chronologyValue = fixture();
    const chronology = decisionRecord(chronologyValue);
    chronology.decidedAt = '2026-09-20T10:00:01.000Z';
    const chronologyResult = validate(chronologyValue, chronology);

    const authorityValue = fixture();
    const authority = decisionRecord(authorityValue);
    (authority.authorityBoundary as unknown as { productionAcceptance: boolean }).productionAcceptance = true;
    const authorityResult = validate(authorityValue, authority);

    expect(chronologyResult.valid).toBe(false);
    expect(chronologyResult.issues.map((issue) => issue.code)).toContain('P15_MEDIA_DECISION_CHRONOLOGY_INVALID');
    expect(authorityResult.valid).toBe(false);
    expect(authorityResult.issues.map((issue) => issue.code)).toContain('P15_MEDIA_DECISION_AUTHORITY_BOUNDARY_INVALID');
  });

  it('CLI emits only sanitized bindings and never leaks operator/evidence/media/template content', () => {
    const value = fixture();
    const decision = decisionRecord(value);
    const dir = tempDir();
    const candidatePath = join(dir, 'candidate.json');
    const profilePath = join(dir, 'profile.json');
    const proofPath = join(dir, 'proof.json');
    const integrityPath = join(dir, 'integrity.json');
    const exportPath = join(dir, 'target-a-export.json');
    const portabilityPath = join(dir, 'portability.json');
    const decisionPath = join(dir, 'decision.json');
    const outPath = join(dir, 'report.json');

    writeFileSync(candidatePath, JSON.stringify(value.candidate, null, 2) + '\n');
    writeFileSync(profilePath, JSON.stringify(value.vector.profile, null, 2) + '\n');
    writeFileSync(proofPath, JSON.stringify(value.proof, null, 2) + '\n');
    writeFileSync(integrityPath, JSON.stringify(value.integrity, null, 2) + '\n');
    writeFileSync(exportPath, value.exportedRaw);
    writeFileSync(portabilityPath, value.portabilityRaw);
    writeFileSync(decisionPath, JSON.stringify(decision, null, 2) + '\n');

    const run = spawnSync(process.execPath, [
      'scripts/p15-target-managed-media-internal-decision.mjs',
      '--candidate', candidatePath,
      '--profile', profilePath,
      '--asset-proof', proofPath,
      '--integrity-evidence', integrityPath,
      '--exported-template', exportPath,
      '--portability-evidence', portabilityPath,
      '--decision', decisionPath,
      '--out', outPath,
    ], { cwd: process.cwd(), encoding: 'utf8' });

    expect(run.status).toBe(0);
    const reportText = readFileSync(outPath, 'utf8');
    const report = JSON.parse(reportText);
    expect(report.classification).toBe('BOUNDED_ASSET_REFERENCE_CLOSURE_APPROVED');
    expect(report.internalDecisionStatus).toBe('APPROVED');
    expect(report.assetReferenceClosureClaim).toBe(true);
    expect(report.referenceClosureClaim).toBe(false);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.productionAcceptance).toBe(false);
    expect(report.decisionReferenceSha256).toBe(sha256(DECISION_REFERENCE));
    expect(reportText).not.toContain(DECISION_REFERENCE);
    expect(reportText).not.toContain(EVIDENCE_REFERENCE);
    expect(reportText).not.toContain(SOURCE_MANAGED_URL);
    expect(reportText).not.toContain(DESTINATION_MANAGED_URL);
    expect(reportText).not.toContain(P15_ELEMENTOR_ASSET_PROOF_FIXTURE_URL);
    expect(reportText).not.toContain('p15-asset-fixture.png');
    expect(reportText).not.toContain(exportPath);
    expect(run.stdout).not.toContain(DECISION_REFERENCE);
  });
});
