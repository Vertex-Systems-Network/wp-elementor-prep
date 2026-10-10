import { describe, expect, it } from 'vitest';
import { extractP15NeutralExportDocumentFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { deriveP15Gradient } from '../src/targets/elementor/container-gradient';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, validateP15NeutralExportDocument, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

const red = { r: 1, g: 0, b: 0, a: 1 };
const blue = { r: 0, g: 0, b: 1, a: 1 };
const paint = (type: string, gradientTransform: number[][], extra: Record<string, unknown> = {}) => ({ type, visible: true, gradientTransform,
  gradientStops: [{ position: 0, color: red }, { position: 1, color: blue }], ...extra });
const LEFT_TO_RIGHT = [[1, 0, 0], [0, 1, 0]];
const TOP_TO_BOTTOM = [[0, 1, 0], [-1, 0, 1]];

describe('recovery M2.4c — gradient derivation', () => {
  it('axis-aligned linear gradients map to 90/180/270/0 deg with their stops', () => {
    expect(deriveP15Gradient(paint('GRADIENT_LINEAR', LEFT_TO_RIGHT))).toEqual({ gradient: { type: 'linear', colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 100, angleDeg: 90 } });
    expect(deriveP15Gradient(paint('GRADIENT_LINEAR', TOP_TO_BOTTOM)).gradient).toMatchObject({ angleDeg: 180, stopA: 0, stopB: 100 });
    expect(deriveP15Gradient(paint('GRADIENT_LINEAR', [[-1, 0, 1], [0, 1, 0]])).gradient).toMatchObject({ angleDeg: 270, stopA: 0, stopB: 100 });
    expect(deriveP15Gradient(paint('GRADIENT_LINEAR', [[0, -1, 1], [1, 0, 0]])).gradient).toMatchObject({ angleDeg: 0, stopA: 0, stopB: 100 });
    // Handles spanning the middle half: t = 2·px - 0.5, so stops 0 and 1 sit at 25% and 75%.
    expect(deriveP15Gradient(paint('GRADIENT_LINEAR', [[2, 0, -0.5], [0, 1, 0]])).gradient).toMatchObject({ angleDeg: 90, stopA: 25, stopB: 75 });
  });

  it('the default radial gradient maps with stops scaled to the farthest-corner ellipse', () => {
    expect(deriveP15Gradient(paint('GRADIENT_RADIAL', LEFT_TO_RIGHT))).toEqual({ gradient: { type: 'radial', colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 70.71 } });
  });

  it('anything without an exact Elementor gradient is review', () => {
    for (const bad of [paint('GRADIENT_LINEAR', [[0.7, 0.7, 0], [-0.7, 0.7, 0.5]]), paint('GRADIENT_RADIAL', [[2, 0, -0.5], [0, 2, -0.5]]),
      paint('GRADIENT_LINEAR', LEFT_TO_RIGHT, { opacity: 0.5 }), paint('GRADIENT_LINEAR', LEFT_TO_RIGHT, { blendMode: 'MULTIPLY' }),
      paint('GRADIENT_LINEAR', LEFT_TO_RIGHT, { gradientStops: [{ position: 0, color: red }, { position: 0.5, color: blue }, { position: 1, color: red }] }),
      paint('GRADIENT_LINEAR', LEFT_TO_RIGHT, { gradientStops: [{ position: 0, color: { ...red, a: 0.5 } }, { position: 1, color: blue }] }),
      paint('GRADIENT_LINEAR', [[0.5, 0, 0.25], [0, 1, 0]]), paint('GRADIENT_ANGULAR', LEFT_TO_RIGHT)]) {
      expect(deriveP15Gradient(bad).review?.reasonCode, JSON.stringify(bad)).toBe('GRADIENT_REQUIRES_REVIEW');
    }
  });
});

const doc = (container: Record<string, unknown>): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Gradient',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [], ...container } as unknown as P15NeutralExportNode] });

describe('recovery M2.4c — IR and Elementor settings', () => {
  const percent = (size: number) => ({ unit: '%', size, sizes: [] });
  it('writes the background gradient group in the repaired slider encoding', () => {
    const linear = generateElementorV3TemplateCandidate(doc({ gradient: { type: 'linear', colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 100, angleDeg: 180 } }));
    expect(linear.status).toBe('GENERATED_LOCAL_CANDIDATE');
    expect(linear.template!.content[0]!.settings).toEqual({ flex_direction: 'column', background_background: 'gradient', background_color: '#ff0000',
      background_color_stop: percent(0), background_color_b: '#0000ff', background_color_b_stop: percent(100), background_gradient_type: 'linear',
      background_gradient_angle: { unit: 'deg', size: 180, sizes: [] } });
    const radial = generateElementorV3TemplateCandidate(doc({ gradient: { type: 'radial', colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 70.71 } }));
    expect(radial.template!.content[0]!.settings).toMatchObject({ background_gradient_type: 'radial', background_gradient_position: 'center center',
      background_color_b_stop: percent(70.71) });
  });

  it('validates the gradient and keeps it in the identity', () => {
    const linear = { type: 'linear', colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 100, angleDeg: 90 };
    for (const bad of [{ gradient: { ...linear, angleDeg: 45 } }, { gradient: { ...linear, stopA: 60, stopB: 40 } }, { gradient: { ...linear, colorA: '#FF0000' } },
      { gradient: { type: 'radial', colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 50, angleDeg: 90 } }, { gradient: linear, backgroundColorHex: '#FFFFFF' }]) {
      expect(validateP15NeutralExportDocument(doc(bad)).valid, JSON.stringify(bad)).toBe(false);
    }
    expect(fingerprintP15NeutralExportDocument(doc({ gradient: linear }))).not.toBe(fingerprintP15NeutralExportDocument(doc({ gradient: { ...linear, angleDeg: 270 } })));
  });

  it('extracts a Figma gradient frame end to end', () => {
    const frame = { id: 'hero', name: 'Hero', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0,
      paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', strokes: [], effects: [],
      fills: [paint('GRADIENT_LINEAR', TOP_TO_BOTTOM)],
      children: [{ id: 't', name: 't', type: 'TEXT', visible: true, characters: 'Hi', textAlignHorizontal: 'LEFT', fills: [] }] };
    const document = extractP15NeutralExportDocumentFromFigmaFrame(frame as unknown as FrameNode, 'section');
    expect(document.nodes[0]).toMatchObject({ gradient: { type: 'linear', angleDeg: 180, stopA: 0, stopB: 100 } });
    expect((document.nodes[0] as { styleReviews?: unknown }).styleReviews).toBeUndefined();
    expect(generateElementorV3TemplateCandidate(document).status).toBe('GENERATED_LOCAL_CANDIDATE');
  });
});
