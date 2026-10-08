import { describe, expect, it } from 'vitest';
import { assessP15ElementorCompatibilityReadiness } from '../src/targets/elementor/compatibility-readiness';
import {
  P15_NEUTRAL_EXPORT_IR_VERSION,
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
} from '../src/targets/elementor/neutral-export-ir';

function documentWith(styleReviews: unknown): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Style reviews',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'hero',
      direction: 'column',
      styleReviews,
      children: [{ kind: 'text', sourceNodeId: 'hero-title', text: 'Welcome' }],
    } as P15NeutralExportDocumentV1['nodes'][number]],
  };
}

describe('recovery M0.3 — neutral container style reviews', () => {
  it('accepts bounded style reviews and classifies a background image as native-with-review', () => {
    const document = documentWith([{ reasonCode: 'CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW', detail: 'Needs asset export.' }]);
    expect(validateP15NeutralExportDocument(document).valid).toBe(true);
    const readiness = assessP15ElementorCompatibilityReadiness(document);
    expect(readiness.findings).toEqual([
      { sourceNodeId: 'hero', category: 'NATIVE_WITH_REVIEW', reasonCode: 'CONTAINER_BACKGROUND_IMAGE_REQUIRES_REVIEW' },
      { sourceNodeId: 'hero-title', category: 'NATIVE', reasonCode: 'P15_NATIVE_TEXT_EDITOR' },
    ]);
    expect(readiness.status).toBe('READY_WITH_REVIEW');
  });

  it('rejects empty, malformed or target-leaking style reviews', () => {
    for (const bad of [[], 'x', [{ reasonCode: 'lower', detail: 'd' }], [{ reasonCode: 'OK', detail: '' }], [{ reasonCode: 'OK', detail: 'd', background_image: 'x' }]]) {
      const codes = validateP15NeutralExportDocument(documentWith(bad)).issues.map((issue) => issue.code);
      expect(codes.length).toBeGreaterThan(0);
    }
  });
});
