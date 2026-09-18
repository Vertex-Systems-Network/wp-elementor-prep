import { describe, expect, it } from 'vitest';
import { buildP15ElementorV1PreviewFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import {
  P15_DECLARED_VERSION_MAX_LENGTH,
  P15_TARGET_PROFILE_PREVIEW_REPORT_VERSION,
  buildP15TargetProfilePreviewReport,
} from '../src/plugin/p15-target-profile-preview-report';

type MockNode = Record<string, unknown> & {
  id: string;
  name: string;
  type: string;
  visible: boolean;
};

function textNode(id: string, characters: string): MockNode {
  return {
    id,
    name: id,
    type: 'TEXT',
    visible: true,
    characters,
    textAlignHorizontal: 'LEFT',
    fills: [],
  };
}

function autoFrame(id: string, children: MockNode[], extra: Record<string, unknown> = {}): MockNode {
  return {
    id,
    name: id,
    type: 'FRAME',
    visible: true,
    layoutMode: 'VERTICAL',
    layoutWrap: 'NO_WRAP',
    layoutPositioning: 'AUTO',
    itemSpacing: 16,
    paddingTop: 24,
    paddingRight: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN',
    fills: [],
    children,
    ...extra,
  };
}

function asFrame(node: MockNode): FrameNode {
  return node as unknown as FrameNode;
}

function generatedExtraction(secretText = 'Do not expose me') {
  return buildP15ElementorV1PreviewFromFigmaFrame(asFrame(autoFrame('page', [textNode('copy', secretText)])));
}

describe('P15 declared TargetProfile plugin preview report', () => {
  it('assesses one generated candidate against declared versions while keeping all authority false', () => {
    const report = buildP15TargetProfilePreviewReport(
      { id: 'page', name: 'Page' },
      generatedExtraction(),
      { wordpressVersion: '6.8.2', elementorVersion: '3.31.2' },
    );

    expect(report.reportVersion).toBe(P15_TARGET_PROFILE_PREVIEW_REPORT_VERSION);
    expect(report.status).toBe('ASSESSMENT_READY');
    expect(report.declaredTarget).toEqual({
      source: 'DECLARED',
      wordpressVersion: '6.8.2',
      elementorVersion: '3.31.2',
      inputIssueCodes: [],
    });
    expect(report.assessment?.status).toBe('PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING');
    expect(report.assessment?.profileFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(report.assessment?.candidateFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(report.assessment?.referenceProof.status).toBe('NO_EXACT_REFERENCE_PROFILE');
    expect(report.assessment?.referenceProof.referenceProof).toBeNull();
    expect(report.assessment?.referenceProof.candidateBinding).toBe('NOT_ASSESSED');
    expect(report.assessment?.referenceProof.currentCandidateIdentityDigest).toBeNull();
    expect(report.assessment?.referenceProof.environmentObserved).toBe(false);
    expect(report.assessment?.referenceClosureStatus).toBe('NOT_RUN');
    expect(report.assessment?.targetEnvironmentValidationStatus).toBe('NOT_RUN');
    expect(report.assessment?.targetCompatibilityClaim).toBe(false);
    expect(report.assessment?.productionAcceptance).toBe(false);
    expect(report.assessment?.generationEnabled).toBe(false);
    expect(report.assessment?.downloadEnabled).toBe(false);
    expect(report.authority).toEqual({
      environmentObserved: false,
      figmaMutation: false,
      networkAccess: false,
      wordpressConnection: false,
      targetImport: false,
      fileDownload: false,
      sectionTransfer: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
    });
  });

  it('surfaces the exact retained WordPress 6.8 + Elementor 4.2.4 reference without promoting declared input to observed target evidence', () => {
    const report = buildP15TargetProfilePreviewReport(
      { id: 'page', name: 'Page' },
      generatedExtraction('Stable exact-proof candidate'),
      { wordpressVersion: '6.8', elementorVersion: '4.2.4' },
    );

    expect(report.assessment?.referenceProof.status).toBe('EXACT_REFERENCE_PROFILE_MATCH');
    expect(report.assessment?.referenceProof.exactVersionMatch).toBe(true);
    expect(report.assessment?.referenceProof.referenceProof).toEqual(expect.objectContaining({
      proofId: 'p15-wp6.8-elementor4.2.4-container-proof-v1',
      workflowRunId: 35403469986,
      artifactId: 10570709987,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
    }));
    expect(report.assessment?.referenceProof.candidateBinding).toBe('REFERENCE_CANDIDATE_MISMATCH');
    expect(report.assessment?.referenceProof.currentCandidateIdentityDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(report.assessment?.referenceProof.currentCandidateIdentityDigest)
      .not.toBe(report.assessment?.referenceProof.referenceProof?.retainedCandidateIdentityDigest);
    expect(report.assessment?.referenceProof.environmentObserved).toBe(false);
    expect(report.assessment?.targetEnvironmentValidationStatus).toBe('NOT_RUN');
    expect(report.authority.environmentObserved).toBe(false);
    expect(report.authority.targetCompatibilityClaim).toBe(false);
    expect(report.authority.productionAcceptance).toBe(false);
  });

  it('changes only profile fingerprint when declared target versions change for the same candidate', () => {
    const extraction = generatedExtraction('Stable candidate');
    const first = buildP15TargetProfilePreviewReport(
      { id: 'page', name: 'Page' },
      extraction,
      { wordpressVersion: '6.8.1', elementorVersion: '3.31.2' },
    );
    const second = buildP15TargetProfilePreviewReport(
      { id: 'page', name: 'Page' },
      extraction,
      { wordpressVersion: '6.8.2', elementorVersion: '3.31.2' },
    );

    expect(first.assessment?.candidateFingerprint).toBe(second.assessment?.candidateFingerprint);
    expect(first.assessment?.profileFingerprint).not.toBe(second.assessment?.profileFingerprint);
  });

  it('fails closed before target-profile assessment when Figma extraction requires review', () => {
    const frame = autoFrame('manual', [textNode('copy', 'Text')], { layoutMode: 'NONE' });
    const report = buildP15TargetProfilePreviewReport(
      { id: frame.id, name: frame.name },
      buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame)),
      { wordpressVersion: '6.8.2', elementorVersion: '3.31.2' },
    );

    expect(report.status).toBe('EXTRACTION_REVIEW_REQUIRED');
    expect(report.assessment).toBeNull();
    expect(report.extractionReviewEntries).toEqual([
      { sourceNodeId: 'manual', reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW' },
    ]);
  });

  it('rejects blank, whitespace-padded and oversized declared version inputs without trimming or inference', () => {
    const extraction = generatedExtraction();
    const blank = buildP15TargetProfilePreviewReport(
      { id: 'page', name: 'Page' },
      extraction,
      { wordpressVersion: '', elementorVersion: '3.31.2' },
    );
    const padded = buildP15TargetProfilePreviewReport(
      { id: 'page', name: 'Page' },
      extraction,
      { wordpressVersion: ' 6.8.2 ', elementorVersion: '3.31.2' },
    );
    const oversized = buildP15TargetProfilePreviewReport(
      { id: 'page', name: 'Page' },
      extraction,
      { wordpressVersion: '6.8.2', elementorVersion: 'x'.repeat(P15_DECLARED_VERSION_MAX_LENGTH + 1) },
    );

    expect(blank.status).toBe('INVALID_DECLARED_PROFILE');
    expect(blank.declaredTarget.inputIssueCodes).toContain('P15_DECLARED_WORDPRESS_VERSION_INVALID');
    expect(padded.status).toBe('INVALID_DECLARED_PROFILE');
    expect(padded.declaredTarget.wordpressVersion).toBeNull();
    expect(oversized.status).toBe('INVALID_DECLARED_PROFILE');
    expect(oversized.declaredTarget.inputIssueCodes).toContain('P15_DECLARED_ELEMENTOR_VERSION_INVALID');
    expect(blank.assessment).toBeNull();
    expect(padded.assessment).toBeNull();
    expect(oversized.assessment).toBeNull();
  });

  it('sanitizes candidate/template content out of the UI-facing compatibility payload', () => {
    const report = buildP15TargetProfilePreviewReport(
      { id: 'page', name: 'Page' },
      generatedExtraction('PRIVATE TEXT CONTENT'),
      { wordpressVersion: '6.8.2', elementorVersion: '3.31.2' },
    );
    const serialized = JSON.stringify(report);

    expect(serialized).not.toContain('PRIVATE TEXT CONTENT');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('settings');
    expect(serialized).not.toContain('editor');
    expect(serialized).not.toContain('review detail');
  });
});
