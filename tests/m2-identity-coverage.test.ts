import { describe, expect, it } from 'vitest';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

/**
 * Identity coverage (found during recovery M2.2c): every optional fact that changes generation must
 * change the source fingerprint, or a manifest bound to one document would also bind to another.
 */
const doc = (child: P15NeutralExportNode, root: Record<string, unknown> = {}): P15NeutralExportDocumentV1 => ({
  schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Identity', documentType: 'section',
  nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [child], ...root } as P15NeutralExportNode],
});
const text = (extra: Record<string, unknown> = {}) => ({ kind: 'text', sourceNodeId: 't', text: 'a\nb', ...extra }) as P15NeutralExportNode;

describe('neutral IR identity covers every generation-affecting optional fact', () => {
  const base = doc(text());
  const variants: Array<[string, P15NeutralExportDocumentV1]> = [
    ['text typography', doc(text({ typography: { fontSizePx: 18 } }))],
    ['text colour', doc(text({ typography: { colorHex: '#000000' } }))],
    ['paragraphs', doc(text({ paragraphs: [{ spans: [{ text: 'a' }] }, { spans: [{ text: 'b' }] }] }))],
    ['span style', doc(text({ paragraphs: [{ spans: [{ text: 'a', style: { fontWeight: '700' } }] }, { spans: [{ text: 'b' }] }] }))],
    ['paragraph spacing', doc(text({ paragraphSpacingPx: 4 }))],
    ['text style review', doc(text({ styleReviews: [{ reasonCode: 'STROKE_REQUIRES_REVIEW', detail: 'x' }] }))],
    ['container style review', doc(text(), { styleReviews: [{ reasonCode: 'EFFECT_REQUIRES_REVIEW', detail: 'x' }] })],
  ];
  it.each(variants)('%s changes the fingerprint', (_name, variant) => {
    expect(fingerprintP15NeutralExportDocument(variant)).not.toBe(fingerprintP15NeutralExportDocument(base));
  });

  it('heading typography and button style change the fingerprint', () => {
    const heading = (extra: Record<string, unknown> = {}) => doc({ kind: 'heading', sourceNodeId: 'h', text: 'H', level: 'h2', ...extra } as P15NeutralExportNode);
    expect(fingerprintP15NeutralExportDocument(heading({ typography: { fontSizePx: 30 } }))).not.toBe(fingerprintP15NeutralExportDocument(heading()));
    const button = (extra: Record<string, unknown> = {}) => doc({ kind: 'button', sourceNodeId: 'b', text: 'Go', ...extra } as P15NeutralExportNode);
    for (const extra of [{ typography: { colorHex: '#ffffff' } }, { backgroundColorHex: '#000000' }, { paddingPx: { top: 1, right: 1, bottom: 1, left: 1 } }, { cornerRadiusPx: 4 }]) {
      expect(fingerprintP15NeutralExportDocument(button(extra)), JSON.stringify(extra)).not.toBe(fingerprintP15NeutralExportDocument(button()));
    }
  });

  it('every pair of documents that generate differently also fingerprint differently', () => {
    const all = [base, ...variants.map(([, variant]) => variant)];
    for (let i = 0; i < all.length; i += 1) {
      for (let j = i + 1; j < all.length; j += 1) {
        const a = generateElementorV3TemplateCandidate(all[i]!);
        const b = generateElementorV3TemplateCandidate(all[j]!);
        if (JSON.stringify(a.template) !== JSON.stringify(b.template) || a.status !== b.status) {
          expect(fingerprintP15NeutralExportDocument(all[i]!)).not.toBe(fingerprintP15NeutralExportDocument(all[j]!));
        }
      }
    }
  });
});
