import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_EVIDENCE,
  P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_MANIFEST_VERSION,
  resolveP15ElementorContainerHoverBorderStyles,
  serializeP15ElementorContainerHoverBorderStyleSummary,
  type P15ElementorContainerHoverBorderStyleEntryV1,
  type P15ElementorContainerHoverBorderStyleManifestV1,
} from '../src/targets/elementor/container-hover-border-style-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function source(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'PRIVATE CONTAINER TITLE', documentType: 'section',
    nodes: [{
      kind: 'container', sourceNodeId: 'root', direction: 'column', children: [
        { kind: 'heading', sourceNodeId: 'heading', text: 'PRIVATE HEADING', level: 'h2' },
        { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [] },
      ],
    }],
  };
}
function manifest(document: P15NeutralExportDocumentV1, containers: P15ElementorContainerHoverBorderStyleEntryV1[]): P15ElementorContainerHoverBorderStyleManifestV1 {
  const generation = generateElementorV3TemplateCandidate(document);
  if (!generation.candidate) throw new Error('fixture must generate');
  return {
    schemaVersion: 1, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(document),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest,
    containers,
    styleInferencePerformed: false, responsiveInferencePerformed: false, figmaMutation: false,
    networkAccess: false, responsiveClosureClaim: false, targetCompatibilityClaim: false,
    productionAcceptance: false, downloadEnabled: false,
  };
}
const widthPx = { top: 1, right: 2, bottom: 3, left: 4 };
const entry: P15ElementorContainerHoverBorderStyleEntryV1 = {
  sourceNodeId: 'root', borderType: 'solid', widthPx, color: '#123456',
};

function settings(result: ReturnType<typeof resolveP15ElementorContainerHoverBorderStyles>, nested = false): Record<string, unknown> {
  const target = nested ? result.template?.content[0]?.elements[1] : result.template?.content[0];
  if (!target || Array.isArray(target.settings)) throw new Error('expected container settings');
  return target.settings;
}

describe('P15 Container hover border and responsive widths', () => {
  it('writes exact normal and explicit tablet/mobile keys for the bound Container', () => {
    const document = source();
    const result = resolveP15ElementorContainerHoverBorderStyles(document, manifest(document, [{
      ...entry, tabletWidthPx: { top: 2, right: 2, bottom: 2, left: 2 },
      mobileWidthPx: { top: 0, right: 1, bottom: 0, left: 1 },
    }]));
    expect(P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_EVIDENCE.containerSourceBlobSha).toBe('3486766b9565af99536ae205ed1936bb155daed0');
    expect(P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_EVIDENCE.borderGroupSourceBlobSha).toBe('eac53e6b1014a985d1d17f90a4044cfb0c6c33c5');
    expect(result.status).toBe('CONTAINER_HOVER_BORDER_STYLES_RESOLVED');
    expect(settings(result)).toMatchObject({
      flex_direction: 'column', border_hover_border: 'solid', border_hover_color: '#123456',
      border_hover_width: { unit: 'px', top: '1', right: '2', bottom: '3', left: '4', isLinked: false },
      border_hover_width_tablet: { unit: 'px', top: '2', right: '2', bottom: '2', left: '2', isLinked: true },
      border_hover_width_mobile: { unit: 'px', top: '0', right: '1', bottom: '0', left: '1', isLinked: false },
    });
    expect(settings(result)).not.toHaveProperty('border_border');
    expect(settings(result)).not.toHaveProperty('border_color');
    expect(settings(result)).not.toHaveProperty('border_width');
    expect(settings(result, true)).not.toHaveProperty('border_hover_border');
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
  });

  it('leaves omitted responsive keys absent and binds nested Containers', () => {
    const document = source();
    const result = resolveP15ElementorContainerHoverBorderStyles(document, manifest(document, [{ ...entry, sourceNodeId: 'nested', borderType: 'dashed' }]));
    expect(result.status).toBe('CONTAINER_HOVER_BORDER_STYLES_RESOLVED');
    expect(settings(result)).not.toHaveProperty('border_hover_border');
    expect(settings(result, true).border_hover_border).toBe('dashed');
    expect(settings(result, true)).not.toHaveProperty('border_hover_width_tablet');
    expect(settings(result, true)).not.toHaveProperty('border_hover_width_mobile');
    expect(settings(result, true)).not.toHaveProperty('border_border');
  });

  it('rejects partial, extra, out-of-range and fractional width objects', () => {
    const document = source();
    for (const bad of [
      { top: 1, right: 1, bottom: 1 },
      { top: 1, right: 1, bottom: 1, left: 1, unit: 'px' },
      { top: -1, right: 1, bottom: 1, left: 1 },
      { top: 101, right: 1, bottom: 1, left: 1 },
      { top: 1.5, right: 1, bottom: 1, left: 1 },
    ]) {
      const result = resolveP15ElementorContainerHoverBorderStyles(document, manifest(document, [{ ...entry, tabletWidthPx: bad }] as never));
      expect(result.issues.map((issue) => issue.code)).toContain('P15_CONTAINER_HOVER_BORDER_STYLE_WIDTH_INVALID');
      expect(result.template).toBeNull();
    }
  });

  it('rejects stale source/candidate, duplicate IDs, wrong types and authority inflation', () => {
    const document = source(); const valid = manifest(document, [entry]);
    expect(resolveP15ElementorContainerHoverBorderStyles(document, { ...valid, sourceIrFingerprint: 'sha256:' + '0'.repeat(64) }).issues.map(x => x.code))
      .toContain('P15_CONTAINER_HOVER_BORDER_STYLE_SOURCE_FINGERPRINT_MISMATCH');
    expect(resolveP15ElementorContainerHoverBorderStyles(document, { ...valid, baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64) }).issues.map(x => x.code))
      .toContain('P15_CONTAINER_HOVER_BORDER_STYLE_BASE_CANDIDATE_IDENTITY_MISMATCH');
    expect(resolveP15ElementorContainerHoverBorderStyles(document, { ...valid, containers: [entry, entry] }).issues.map(x => x.code))
      .toContain('P15_CONTAINER_HOVER_BORDER_STYLE_DUPLICATE_SOURCE_ID');
    expect(resolveP15ElementorContainerHoverBorderStyles(document, { ...valid, containers: [{ ...entry, sourceNodeId: 'heading' }] }).issues.map(x => x.code))
      .toContain('P15_CONTAINER_HOVER_BORDER_STYLE_SOURCE_NOT_CONTAINER');
    expect(resolveP15ElementorContainerHoverBorderStyles(document, { ...valid, productionAcceptance: true }).issues.map(x => x.code))
      .toContain('P15_CONTAINER_HOVER_BORDER_STYLE_AUTHORITY_FLAGS_INVALID');
  });

  it('rejects unknown fields, invalid enum/color and serializes deterministically without private text', () => {
    const document = source(); const valid = manifest(document, [entry]);
    for (const changed of [
      { ...entry, borderType: 'ridge' },
      { ...entry, color: '#ABCDEF' },
      { ...entry, css: 'border: 1px solid red' },
    ]) {
      const result = resolveP15ElementorContainerHoverBorderStyles(document, { ...valid, containers: [changed] });
      expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
    }
    const first = resolveP15ElementorContainerHoverBorderStyles(document, valid);
    const second = resolveP15ElementorContainerHoverBorderStyles(document, valid);
    expect(first).toEqual(second);
    const summary = serializeP15ElementorContainerHoverBorderStyleSummary(first);
    expect(summary).not.toContain('PRIVATE');
    expect(summary).not.toContain('templateJson');
  });
});
