import { describe, expect, it } from 'vitest';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  P15_NEUTRAL_EXPORT_MAX_RADIUS_PX,
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';
import {
  buildP15ElementorV1PreviewFromFigmaFrame,
  extractP15NeutralExportDocumentFromFigmaFrame,
} from '../src/plugin/p15-neutral-export-extractor';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

type MockFrame = Record<string, unknown> & {
  id: string;
  name: string;
  type: 'FRAME';
  visible: boolean;
};

function autoFrame(extra: Record<string, unknown> = {}): MockFrame {
  return {
    id: 'frame',
    name: 'Frame',
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
    children: [],
    ...extra,
  };
}

function asFrame(frame: MockFrame): FrameNode {
  return frame as unknown as FrameNode;
}

function neutralContainer(extra: Record<string, unknown> = {}): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Container fidelity',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'container',
      direction: 'column',
      children: [],
      ...extra,
    } as P15NeutralExportDocumentV1['nodes'][number]],
  };
}

function firstReason(extra: Record<string, unknown>): string | undefined {
  const result = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(autoFrame(extra)));
  expect(result.validation.valid).toBe(true);
  expect(result.generation.status).toBe('REVIEW_REQUIRED');
  expect(result.generation.template).toBeNull();
  expect(result.generation.candidate).toBeNull();
  return result.generation.reviewEntries[0]?.reasonCode;
}

describe('P15 bounded container visual fidelity', () => {
  it('extracts one opaque SOLID fill and uniform radius into canonical neutral facts and evidenced Elementor settings', () => {
    const frame = autoFrame({
      fills: [{
        type: 'SOLID',
        visible: true,
        color: { r: 1, g: 0.5, b: 0 },
      }],
      cornerRadius: 12,
    });

    const document = extractP15NeutralExportDocumentFromFigmaFrame(asFrame(frame));
    expect(document.irVersion).toBe(P15_NEUTRAL_EXPORT_IR_VERSION);
    expect(document.nodes[0]).toEqual(expect.objectContaining({
      kind: 'container',
      sourceNodeId: 'frame',
      backgroundColorHex: '#FF8000',
      cornerRadiusPx: 12,
    }));

    const first = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame));
    const second = buildP15ElementorV1PreviewFromFigmaFrame(asFrame(frame));
    expect(first.generation.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(first.generation.targetCompatibilityClaim).toBe(false);
    expect(first.generation.productionAcceptance).toBe(false);
    expect(first.generation.downloadEnabled).toBe(false);
    expect(first.generation.importValidationStatus).toBe('NOT_RUN');
    expect(first.generation.candidate?.templateJson).toBe(second.generation.candidate?.templateJson);

    const root = first.generation.template?.content[0];
    expect(root?.elType).toBe('container');
    if (root?.elType !== 'container') throw new Error('fixture invariant');
    expect(root.settings).toEqual(expect.objectContaining({
      background_background: 'classic',
      background_color: '#FF8000',
      border_radius: {
        unit: 'px',
        top: '12',
        right: '12',
        bottom: '12',
        left: '12',
        isLinked: true,
      },
    }));
  });

  it('accepts uniform individual corner radii and omits absent/zero style facts', () => {
    const uniform = extractP15NeutralExportDocumentFromFigmaFrame(asFrame(autoFrame({
      topLeftRadius: 8,
      topRightRadius: 8,
      bottomRightRadius: 8,
      bottomLeftRadius: 8,
    })));
    expect(uniform.nodes[0]).toEqual(expect.objectContaining({ cornerRadiusPx: 8 }));

    const plain = extractP15NeutralExportDocumentFromFigmaFrame(asFrame(autoFrame({ cornerRadius: 0 })));
    const node = plain.nodes[0];
    expect(node?.kind).toBe('container');
    if (node?.kind !== 'container') throw new Error('fixture invariant');
    expect(node).not.toHaveProperty('backgroundColorHex');
    expect(node).not.toHaveProperty('cornerRadiusPx');

    const generated = generateElementorV3TemplateCandidate(plain);
    const root = generated.template?.content[0];
    expect(root?.elType).toBe('container');
    if (root?.elType !== 'container') throw new Error('fixture invariant');
    expect(root.settings).not.toHaveProperty('background_background');
    expect(root.settings).not.toHaveProperty('background_color');
    expect(root.settings).not.toHaveProperty('border_radius');
  });

  it('fails closed on ambiguous or unsupported container fills instead of silently dropping them', () => {
    expect(firstReason({
      fills: [
        { type: 'SOLID', visible: true, color: { r: 1, g: 0, b: 0 } },
        { type: 'SOLID', visible: true, color: { r: 0, g: 1, b: 0 } },
      ],
    })).toBe('MULTIPLE_VISIBLE_FILLS_REQUIRES_REVIEW');

    expect(firstReason({
      fills: [{ type: 'GRADIENT_LINEAR', visible: true }],
    })).toBe('UNSUPPORTED_CONTAINER_FILL_REQUIRES_REVIEW');

    expect(firstReason({
      fills: [{ type: 'SOLID', visible: true, opacity: 0.5, color: { r: 1, g: 0, b: 0 } }],
    })).toBe('TRANSLUCENT_SOLID_FILL_REQUIRES_REVIEW');

    expect(firstReason({
      fills: [{ type: 'SOLID', visible: true, color: { r: 2, g: 0, b: 0 } }],
    })).toBe('UNSUPPORTED_CONTAINER_FILL_STATE');
  });

  it('fails closed on partial, nonuniform and out-of-range corner radii', () => {
    expect(firstReason({ topLeftRadius: 8 })).toBe('UNSUPPORTED_CORNER_RADIUS_STATE');
    expect(firstReason({
      topLeftRadius: 8,
      topRightRadius: 8,
      bottomRightRadius: 4,
      bottomLeftRadius: 8,
    })).toBe('NONUNIFORM_CORNER_RADIUS_REQUIRES_REVIEW');
    expect(firstReason({ cornerRadius: P15_NEUTRAL_EXPORT_MAX_RADIUS_PX + 1 }))
      .toBe('CORNER_RADIUS_OUT_OF_RANGE');
  });

  it('preserves the existing asset-closure review boundary for image fills', () => {
    expect(firstReason({
      fills: [{ type: 'IMAGE', visible: true, imageHash: 'fake-hash', scaleMode: 'FILL' }],
    })).toBe('IMAGE_ASSET_EXPORT_REQUIRED');
  });

  it('validates canonical color/radius facts and rejects malformed or target-specific style leakage', () => {
    const accepted = neutralContainer({ backgroundColorHex: '#336699', cornerRadiusPx: 20 });
    expect(validateP15NeutralExportDocument(accepted)).toEqual(expect.objectContaining({ valid: true }));

    const malformedColor = neutralContainer({ backgroundColorHex: '#3366aa' });
    expect(validateP15NeutralExportDocument(malformedColor).issues.map((issue) => issue.code))
      .toContain('P15_IR_COLOR_INVALID');

    const badRadius = neutralContainer({ cornerRadiusPx: -1 });
    expect(validateP15NeutralExportDocument(badRadius).issues.map((issue) => issue.code))
      .toContain('P15_IR_RADIUS_INVALID');

    const leaked = neutralContainer({ background_background: 'classic' });
    expect(validateP15NeutralExportDocument(leaked).issues.map((issue) => issue.code))
      .toContain('P15_IR_NODE_KEYS_UNSUPPORTED');
  });

  it('serializes explicit neutral style facts deterministically without promoting target authority', () => {
    const input = neutralContainer({ backgroundColorHex: '#101010', cornerRadiusPx: 24 });
    const first = generateElementorV3TemplateCandidate(input);
    const second = generateElementorV3TemplateCandidate(input);

    expect(first.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(first.template).toEqual(second.template);
    expect(first.candidate?.templateJson).toBe(second.candidate?.templateJson);
    expect(first.targetCompatibilityClaim).toBe(false);
    expect(first.productionAcceptance).toBe(false);
    expect(first.importValidationStatus).toBe('NOT_RUN');
  });
});
