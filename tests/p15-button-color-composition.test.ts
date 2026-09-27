import { describe, expect, it } from 'vitest';
import {
  composeP15ButtonColors, P15_BUTTON_COLOR_COMPOSITION_VERSION,
  serializeP15ButtonColorCompositionSummary,
} from '../src/targets/elementor/button-color-composition';
import { P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-text-color-resolution';
import { P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-background-color-resolution';
import { P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-hover-text-color-resolution';
import { P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-hover-background-color-resolution';
import { P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-hover-border-color-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function source(): P15NeutralExportDocumentV1 {
  return { schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'PRIVATE TITLE', documentType: 'section', nodes: [{ kind: 'container', sourceNodeId: 'root',
      direction: 'column', children: [
        { kind: 'button', sourceNodeId: 'button', text: 'PRIVATE BUTTON', align: 'start' },
        { kind: 'heading', sourceNodeId: 'heading', text: 'PRIVATE HEADING', level: 'h2' },
        { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [
          { kind: 'button', sourceNodeId: 'nested-button', text: 'PRIVATE NESTED', align: 'end' },
        ] },
      ] }],
  };
}

function manifest(document: P15NeutralExportDocumentV1) {
  const generated = generateElementorV3TemplateCandidate(document);
  if (!generated.candidate) throw new Error('fixture must generate');
  const common = { schemaVersion: 1, sourceIrFingerprint: fingerprintP15NeutralExportDocument(document),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generated.candidate).digest,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false, productionAcceptance: false,
    downloadEnabled: false } as const;
  const family = (manifestVersion: string, sourceNodeId: string, color: string) => ({ ...common, manifestVersion,
    colorInferencePerformed: false, buttons: [{ sourceNodeId, color }] });
  return { ...common, compositionVersion: P15_BUTTON_COLOR_COMPOSITION_VERSION,
    families: {
      normalText: family(P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION, 'button', '#112233'),
      normalBackground: family(P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION, 'button', '#223344'),
      hoverText: family(P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION, 'button', '#334455'),
      hoverBackground: family(P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION, 'nested-button', '#445566'),
      hoverBorder: family(P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MANIFEST_VERSION, 'button', '#556677'),
    } };
}

describe('P15 Button color composition', () => {
  it('combines five exact color families on nested Buttons without normal/hover leakage', () => {
    const document = source();
    const result = composeP15ButtonColors(document, manifest(document));
    expect(result.status).toBe('RESOLVED');
    expect(result.appliedFamilies).toEqual(['normalText', 'normalBackground', 'hoverText', 'hoverBackground', 'hoverBorder']);
    expect(result.candidate?.status).toBe('READY_FOR_TARGET_IMPORT_VALIDATION');
    const root = result.template?.content[0];
    const button = root?.elements[0];
    const nested = root?.elements[2]?.elements[0];
    if (!button || !nested || Array.isArray(button.settings) || Array.isArray(nested.settings)) throw new Error('fixture missing Buttons');
    expect(button.settings).toMatchObject({ button_text_color: '#112233', background_background: 'classic',
      background_color: '#223344', hover_color: '#334455', button_hover_border_color: '#556677' });
    expect(button.settings).not.toHaveProperty('button_background_hover_color');
    expect(nested.settings).toMatchObject({ button_background_hover_background: 'classic',
      button_background_hover_color: '#445566' });
    expect(nested.settings).not.toHaveProperty('button_text_color');
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('rejects stale top-level and nested identities, unknown family and authority inflation', () => {
    const document = source(); const valid = manifest(document);
    const stale = 'sha256:' + '0'.repeat(64);
    for (const bad of [
      { ...valid, sourceIrFingerprint: stale },
      { ...valid, baseCandidateIdentityDigest: stale },
      { ...valid, productionAcceptance: true },
      { ...valid, extra: 'PRIVATE' },
      { ...valid, families: { ...valid.families, unknown: {} } },
      { ...valid, families: { ...valid.families, normalText: { ...valid.families.normalText, baseCandidateIdentityDigest: stale } } },
    ]) {
      const result = composeP15ButtonColors(document, bad);
      expect(result.status).toBe('REJECTED');
      expect(result.template).toBeNull();
    }
  });

  it('rejects malformed and duplicate Button requests and wrong widget type', () => {
    const document = source(); const valid = manifest(document);
    const entry = { sourceNodeId: 'button', color: '#112233' };
    for (const buttons of [
      [entry, entry], [{ ...entry, sourceNodeId: 'heading' }], [{ ...entry, color: 'red' }],
      [{ ...entry, color: '#ABCDEF' }], [{ ...entry, privateCss: 'PRIVATE' }],
    ]) {
      const changed = { ...valid, families: { ...valid.families, normalText: { ...valid.families.normalText, buttons } } };
      expect(composeP15ButtonColors(document, changed).status).toBe('REJECTED');
    }
  });

  it('serializes deterministic sanitized metadata and rejects inflated result shapes', () => {
    const document = source(); const valid = manifest(document);
    const first = composeP15ButtonColors(document, valid);
    expect(first).toEqual(composeP15ButtonColors(document, valid));
    const summary = serializeP15ButtonColorCompositionSummary(first);
    expect(summary).not.toContain('PRIVATE');
    expect(summary).not.toContain('templateJson');
    expect(() => serializeP15ButtonColorCompositionSummary({ ...first, productionAcceptance: true } as never)).toThrow();
    expect(() => serializeP15ButtonColorCompositionSummary({ ...first, sourceIrFingerprint: 'PRIVATE' })).toThrow();
  });
});
