import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ELEMENTOR_4_2_4_EARLY_ACCESS_FONTS,
  ELEMENTOR_4_2_4_FONT_REGISTRY_DIGEST,
  ELEMENTOR_4_2_4_GOOGLE_FONTS,
  ELEMENTOR_4_2_4_SYSTEM_FONTS,
} from '../src/targets/elementor/elementor-font-registry';
import { buildP15ElementorExport } from '../src/targets/elementor/export-pipeline';
import { buildP15FontManifest, classifyP15FontFamily } from '../src/targets/elementor/font-manifest';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1, type P15NeutralExportNode } from '../src/targets/elementor/neutral-export-ir';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

describe('recovery M2.8 — Elementor 4.2.4 font registry', () => {
  it('matches the pinned fonts.php counts and digest', () => {
    expect(ELEMENTOR_4_2_4_SYSTEM_FONTS).toEqual(['Arial', 'Tahoma', 'Verdana', 'Helvetica', 'Times New Roman', 'Trebuchet MS', 'Georgia']);
    expect(ELEMENTOR_4_2_4_GOOGLE_FONTS.length).toBe(1652);
    expect(ELEMENTOR_4_2_4_EARLY_ACCESS_FONTS.length).toBe(8);
    const groups = { EARLYACCESS: ELEMENTOR_4_2_4_EARLY_ACCESS_FONTS, GOOGLE: ELEMENTOR_4_2_4_GOOGLE_FONTS, SYSTEM: ELEMENTOR_4_2_4_SYSTEM_FONTS };
    expect(`sha256:${createHash('sha256').update(JSON.stringify(groups)).digest('hex')}`).toBe(ELEMENTOR_4_2_4_FONT_REGISTRY_DIGEST);
    expect(new Set(ELEMENTOR_4_2_4_GOOGLE_FONTS).size).toBe(1652);
  });

  it('classifies families exactly (case-sensitive, as Elementor keys them)', () => {
    expect(classifyP15FontFamily('Arial')).toBe('system');
    expect(classifyP15FontFamily('Inter')).toBe('google');
    expect(classifyP15FontFamily('Open Sans Hebrew')).toBe('google-early-access');
    expect(classifyP15FontFamily('inter')).toBe('upload-required');
    expect(classifyP15FontFamily('SF Pro Display')).toBe('upload-required');
  });
});

const text = (id: string, extra: Record<string, unknown> = {}) => ({ kind: 'text', sourceNodeId: id, text: 'Hello world', ...extra });
const doc = (...children: Record<string, unknown>[]): P15NeutralExportDocumentV1 => ({ schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Fonts',
  documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children } as unknown as P15NeutralExportNode] });

describe('recovery M2.8 — manifest and reviews', () => {
  it('lists families with their weights, sources and usage, sorted', () => {
    const { manifest, reviews } = buildP15FontManifest(doc(
      text('a', { typography: { fontFamily: 'Inter', fontWeight: '700' } }),
      { kind: 'heading', sourceNodeId: 'h', text: 'Title', level: 'h1', typography: { fontFamily: 'Inter', fontStyle: 'italic' } },
      { kind: 'button', sourceNodeId: 'b', text: 'Go', typography: { fontFamily: 'Arial' } },
      text('c', { typography: { fontFamily: 'Inter' }, paragraphs: [{ spans: [{ text: 'Hello ' }, { text: 'world', style: { fontWeight: '600' } }] }] }),
    ));
    expect(reviews).toEqual([]);
    expect(manifest).toMatchObject({ schemaVersion: 1, manifestVersion: 'p15-font-manifest-v1', registryDigest: ELEMENTOR_4_2_4_FONT_REGISTRY_DIGEST, requiresGoogleFontsOption: true });
    expect(manifest.families).toEqual([
      { family: 'Arial', source: 'system', weights: ['400'], usage: 'control', firstSourceNodeId: 'b' },
      { family: 'Inter', source: 'google', weights: ['400', '400italic', '600', '700'], usage: 'control', firstSourceNodeId: 'a' },
    ]);
    expect(buildP15FontManifest(doc(text('x'))).manifest).toMatchObject({ families: [], requiresGoogleFontsOption: false });
  });

  it('an unknown family needs an upload; a Google family used only in spans is not loaded', () => {
    const { manifest, reviews } = buildP15FontManifest(doc(
      text('brand', { typography: { fontFamily: 'Brand Sans', fontWeight: '700' } }),
      text('mixed', { typography: { fontFamily: 'Inter' }, paragraphs: [{ spans: [{ text: 'Hello ' }, { text: 'world', style: { fontFamily: 'Lora', fontStyle: 'italic' } }] }] }),
      text('sys', { typography: { fontFamily: 'Inter' }, paragraphs: [{ spans: [{ text: 'Hello ' }, { text: 'world', style: { fontFamily: 'Georgia' } }] }] }),
    ));
    expect(manifest.families.find((entry) => entry.family === 'Lora')).toMatchObject({ source: 'google', usage: 'span-only', weights: ['400italic'] });
    expect(reviews).toEqual([
      expect.objectContaining({ sourceNodeId: 'brand', reasonCode: 'FONT_UPLOAD_REQUIRED', detail: expect.stringContaining('"Brand Sans" (700)') }),
      expect.objectContaining({ sourceNodeId: 'mixed', reasonCode: 'FONT_NOT_LOADED_FOR_SPAN' }),
    ]);
  });

  it('the generator refuses a candidate with an unloadable font and the pipeline carries the manifest', () => {
    const blocked = generateElementorV3TemplateCandidate(doc(text('brand', { typography: { fontFamily: 'Brand Sans' } })));
    expect(blocked.status).toBe('REVIEW_REQUIRED');
    expect(blocked.reviewEntries.map((entry) => entry.reasonCode)).toEqual(['FONT_UPLOAD_REQUIRED']);
    const exported = buildP15ElementorExport(doc(text('a', { typography: { fontFamily: 'Inter' } })));
    expect(exported.status).toBe('BASE_CANDIDATE');
    expect(exported.fontManifest?.families.map((entry) => entry.family)).toEqual(['Inter']);
    expect(buildP15ElementorExport({ nonsense: true }).fontManifest).toBeNull();
  });
});
