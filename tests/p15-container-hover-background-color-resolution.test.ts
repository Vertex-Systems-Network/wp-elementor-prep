import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_EVIDENCE,
  P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
  resolveP15ElementorContainerHoverBackgroundColor,
  serializeP15ElementorContainerHoverBackgroundColorSummary,
  type P15ElementorContainerHoverBackgroundColorManifestV1,
} from '../src/targets/elementor/container-hover-background-color-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function source(): P15NeutralExportDocumentV1 {
  return { schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'PRIVATE TITLE', documentType: 'section', nodes: [{
      kind: 'container', sourceNodeId: 'root', direction: 'column', backgroundColorHex: '#ABCDEF', children: [
        { kind: 'heading', sourceNodeId: 'heading', text: 'PRIVATE COPY', level: 'h2' },
        { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [] },
      ],
    }],
  };
}
function manifest(document: P15NeutralExportDocumentV1, containers: P15ElementorContainerHoverBackgroundColorManifestV1['containers']): P15ElementorContainerHoverBackgroundColorManifestV1 {
  const generation = generateElementorV3TemplateCandidate(document);
  if (!generation.candidate) throw new Error('fixture must generate');
  return { schemaVersion: 1, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(document),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest,
    containers, responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false,
  };
}
const entry = { sourceNodeId: 'root', color: '#123456' };

function settings(result: ReturnType<typeof resolveP15ElementorContainerHoverBackgroundColor>, nested = false): Record<string, unknown> {
  const target = nested ? result.template?.content[0]?.elements[1] : result.template?.content[0];
  if (!target || Array.isArray(target.settings)) throw new Error('expected settings');
  return target.settings;
}

describe('P15 Container classic hover background color', () => {
  it('writes only hover classic/color while retaining normal source color', () => {
    const document = source();
    const result = resolveP15ElementorContainerHoverBackgroundColor(document, manifest(document, [entry]));
    expect(P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_EVIDENCE).toMatchObject({
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      backgroundGroupSourceBlobSha: 'ac8e1a510ec663f3f428c9f564dc2c5b727435e1',
      groupName: 'background_hover', selector: '{{WRAPPER}}:hover',
      typeSettingKey: 'background_hover_background', colorSettingKey: 'background_hover_color',
    });
    expect(result.status).toBe('CONTAINER_HOVER_BACKGROUND_COLOR_RESOLVED');
    expect(settings(result)).toMatchObject({ background_background: 'classic', background_color: '#ABCDEF',
      background_hover_background: 'classic', background_hover_color: '#123456' });
    expect(settings(result)).not.toHaveProperty('background_hover_color_tablet');
    expect(settings(result)).not.toHaveProperty('background_hover_color_mobile');
    expect(settings(result, true)).not.toHaveProperty('background_hover_color');
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
  });

  it('binds nested Container and leaves omitted breakpoint/normal values alone', () => {
    const document = source();
    const result = resolveP15ElementorContainerHoverBackgroundColor(document, manifest(document, [{ sourceNodeId: 'nested', color: '#abcdef' }]));
    expect(result.status).toBe('CONTAINER_HOVER_BACKGROUND_COLOR_RESOLVED');
    expect(settings(result)).not.toHaveProperty('background_hover_color');
    expect(settings(result, true)).toMatchObject({ background_hover_background: 'classic', background_hover_color: '#abcdef' });
    expect(settings(result, true)).not.toHaveProperty('background_color');
  });

  it('rejects invalid values, missing/extra fields and wrong source type', () => {
    const document = source(); const valid = manifest(document, [entry]);
    for (const changed of [
      { ...entry, color: '#ABCDEF' }, { ...entry, color: 'red' }, { ...entry, color: '#12345g' },
      { ...entry, color: '#123456', css: 'private' }, { sourceNodeId: 'root' },
      { ...entry, sourceNodeId: 'heading' },
    ]) {
      const result = resolveP15ElementorContainerHoverBackgroundColor(document, { ...valid, containers: [changed] });
      expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
      expect(result.template).toBeNull();
    }
  });

  it('rejects replay, duplicate IDs and authority inflation', () => {
    const document = source(); const valid = manifest(document, [entry]);
    const cases = [
      [{ ...valid, sourceIrFingerprint: 'sha256:' + '0'.repeat(64) }, 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_SOURCE_FINGERPRINT_MISMATCH'],
      [{ ...valid, baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64) }, 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_BASE_CANDIDATE_IDENTITY_MISMATCH'],
      [{ ...valid, containers: [entry, entry] }, 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_DUPLICATE_SOURCE_ID'],
      [{ ...valid, productionAcceptance: true }, 'P15_CONTAINER_HOVER_BACKGROUND_COLOR_AUTHORITY_FLAGS_INVALID'],
    ] as const;
    for (const [bad, code] of cases) {
      expect(resolveP15ElementorContainerHoverBackgroundColor(document, bad).issues.map(x => x.code)).toContain(code);
    }
  });

  it('is deterministic and sanitizes serialized evidence', () => {
    const document = source(); const valid = manifest(document, [entry]);
    const first = resolveP15ElementorContainerHoverBackgroundColor(document, valid);
    expect(first).toEqual(resolveP15ElementorContainerHoverBackgroundColor(document, valid));
    const summary = serializeP15ElementorContainerHoverBackgroundColorSummary(first);
    expect(summary).not.toContain('PRIVATE');
    expect(summary).not.toContain('templateJson');
    expect(() => serializeP15ElementorContainerHoverBackgroundColorSummary({ ...first, productionAcceptance: true } as never)).toThrow();
  });
});
