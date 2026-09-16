import { describe, expect, it } from 'vitest';
import { buildP15ElementorV1PreviewFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import {
  P15_LOCAL_TEMPLATE_DOWNLOAD_RECEIPT_VERSION,
  P15_LOCAL_TEMPLATE_DOWNLOAD_RESULT_VERSION,
  buildP15LocalTemplateDownloadResult,
} from '../src/plugin/p15-local-template-download';

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

function rectangleNode(id: string): MockNode {
  return {
    id,
    name: id,
    type: 'RECTANGLE',
    visible: true,
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

describe('P15 local Elementor Template JSON download contract', () => {
  it('exposes only a freshly revalidated READY local candidate for explicit download', () => {
    const frame = autoFrame('frame-ready', [textNode('copy', 'Private artifact text')]);
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame));
    const result = buildP15LocalTemplateDownloadResult({ id: frame.id }, extraction);

    expect(result.resultVersion).toBe(P15_LOCAL_TEMPLATE_DOWNLOAD_RESULT_VERSION);
    expect(result.status).toBe('LOCAL_ARTIFACT_VALIDATED');
    expect(result.compatibility.status).toBe('READY');
    expect(result.compatibility.compatibilityCoverage).toBe(100);
    expect(result.generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(result.generation.candidateStatus).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    expect(result.blockReasonCodes).toEqual([]);
    expect(result.templateJson).toContain('Private artifact text');
    expect(result.receipt).toEqual(expect.objectContaining({
      receiptVersion: P15_LOCAL_TEMPLATE_DOWNLOAD_RECEIPT_VERSION,
      sourceFrameId: 'frame-ready',
      candidateStatus: 'READY_FOR_TARGET_IMPORT_VALIDATION',
      localValidationStatus: 'PASS',
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      importValidationStatus: 'NOT_RUN',
      targetEnvironmentValidationStatus: 'NOT_RUN',
      environmentObserved: false,
    }));
    expect(result.receipt?.candidateFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.receipt?.artifactFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.receipt?.fileName).toMatch(/^wp-builders-elementor-[0-9a-f]{16}\.json$/);
    expect(result.authority).toEqual({
      fileDownload: true,
      figmaMutation: false,
      networkAccess: false,
      wordpressConnection: false,
      targetImport: false,
      sectionTransfer: false,
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      importValidationStatus: 'NOT_RUN',
      targetEnvironmentValidationStatus: 'NOT_RUN',
      environmentObserved: false,
    });

    const receiptJson = JSON.stringify(result.receipt);
    expect(receiptJson).not.toContain('Private artifact text');
    expect(receiptJson).not.toContain('settings');
  });

  it('is deterministic for identical bounded input', () => {
    const frame = autoFrame('frame-stable', [textNode('copy', 'Same input')]);
    const first = buildP15LocalTemplateDownloadResult(
      { id: frame.id },
      buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame)),
    );
    const second = buildP15LocalTemplateDownloadResult(
      { id: frame.id },
      buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame)),
    );

    expect(first).toEqual(second);
  });

  it('blocks REVIEW / UNKNOWN mapping evidence and exposes no artifact', () => {
    const frame = autoFrame('frame-manual', [textNode('copy', 'Text')], { layoutMode: 'NONE' });
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame));
    const result = buildP15LocalTemplateDownloadResult({ id: frame.id }, extraction);

    expect(result.status).toBe('DOWNLOAD_BLOCKED');
    expect(result.compatibility.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.blockReasonCodes).toContain('P15_DOWNLOAD_MAPPING_NOT_READY');
    expect(result.blockReasonCodes).toContain('P15_DOWNLOAD_MAPPING_REVIEW_PRESENT');
    expect(result.templateJson).toBeNull();
    expect(result.receipt).toBeNull();
    expect(result.authority.fileDownload).toBe(false);
  });

  it('blocks UNSUPPORTED mapping evidence and exposes no artifact', () => {
    const frame = autoFrame('frame-unsupported', [rectangleNode('shape')]);
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame));
    const result = buildP15LocalTemplateDownloadResult({ id: frame.id }, extraction);

    expect(result.status).toBe('DOWNLOAD_BLOCKED');
    expect(result.compatibility.status).toBe('NOT_READY');
    expect(result.blockReasonCodes).toContain('P15_DOWNLOAD_MAPPING_NOT_READY');
    expect(result.templateJson).toBeNull();
    expect(result.authority.fileDownload).toBe(false);
  });

  it('fails closed when the original generated candidate no longer matches the fresh local revalidation', () => {
    const frame = autoFrame('frame-mismatch', [textNode('copy', 'Candidate')]);
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame));
    if (!extraction.generation.candidate) throw new Error('Fixture did not generate a candidate.');
    extraction.generation.candidate.templateJson = `${extraction.generation.candidate.templateJson}\n `;

    const result = buildP15LocalTemplateDownloadResult({ id: frame.id }, extraction);

    expect(result.status).toBe('DOWNLOAD_BLOCKED');
    expect(result.blockReasonCodes).toContain('P15_DOWNLOAD_CANDIDATE_REVALIDATION_MISMATCH');
    expect(result.templateJson).toBeNull();
    expect(result.receipt).toBeNull();
    expect(result.authority.fileDownload).toBe(false);
  });
});
