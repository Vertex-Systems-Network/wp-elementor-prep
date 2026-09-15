import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildP15ElementorV1PreviewFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import {
  P15_PLUGIN_PREVIEW_REPORT_VERSION,
  buildP15PluginPreviewReport,
} from '../src/plugin/p15-plugin-preview-report';

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

describe('P15 normal-plugin preview report', () => {
  it('keeps generated local candidates inspection-only with every authority gate false', () => {
    const frame = autoFrame('page', [textNode('copy', 'Private preview text')]);
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame));
    const report = buildP15PluginPreviewReport({ id: frame.id, name: frame.name }, extraction);

    expect(report.reportVersion).toBe(P15_PLUGIN_PREVIEW_REPORT_VERSION);
    expect(report.readOnly).toBe(true);
    expect(report.extraction).toEqual(expect.objectContaining({
      valid: true,
      nodeCount: 2,
      reviewNodeCount: 0,
    }));
    expect(report.generation).toEqual(expect.objectContaining({
      status: 'GENERATED_LOCAL_CANDIDATE',
      candidateStatus: 'READY_FOR_TARGET_IMPORT_VALIDATION',
      targetCompatibilityClaim: false,
      productionAcceptance: false,
      downloadEnabled: false,
      importValidationStatus: 'NOT_RUN',
    }));
    expect(report.generation.widgetTypes).toEqual(['text-editor']);
    expect(report.authority).toEqual({
      figmaMutation: false,
      networkAccess: false,
      wordpressConnection: false,
      targetImport: false,
      fileDownload: false,
      sectionTransfer: false,
    });

    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain('Private preview text');
    expect(serialized).not.toContain('templateJson');
    expect(serialized).not.toContain('settings');
  });

  it('preserves review reason codes and exposes no partial candidate data', () => {
    const frame = autoFrame('manual', [textNode('copy', 'Text')], { layoutMode: 'NONE' });
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame));
    const report = buildP15PluginPreviewReport({ id: frame.id, name: frame.name }, extraction);

    expect(report.generation.status).toBe('REVIEW_REQUIRED');
    expect(report.generation.candidateStatus).toBeNull();
    expect(report.generation.widgetTypes).toEqual([]);
    expect(report.generation.reviewEntries).toEqual([
      { sourceNodeId: 'manual', reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW' },
    ]);
    expect(JSON.stringify(report)).not.toContain('templateJson');
  });

  it('keeps the UI request/result surface explicit and does not add a P15 download action', () => {
    const html = readFileSync('src/ui/ui.html', 'utf8');
    const main = readFileSync('src/plugin/main.ts', 'utf8');

    expect(html).toContain("post('p15-elementor-preview-request')");
    expect(html).toContain("message.type === 'p15-elementor-preview-result'");
    expect(html).toContain("message.type === 'p15-elementor-preview-unavailable'");
    expect(main).toContain("type === 'p15-elementor-preview-request'");
    expect(main).toContain("type: 'p15-elementor-preview-result'");
    expect(main).toContain("type: 'p15-elementor-preview-unavailable'");
    expect(html).not.toContain('export-p15');
    expect(html).not.toContain("downloadText('elementor");
  });
});
