import { describe, expect, it } from 'vitest';
import { P15_CONTAINER_BOX_SHADOW_EVIDENCE, P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION,
  resolveP15ContainerBoxShadows, serializeP15ContainerBoxShadowSummary,
  type P15ContainerBoxShadowManifestV1, type P15ContainerBoxShadowValueV1 } from '../src/targets/elementor/container-box-shadow-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function source(): P15NeutralExportDocumentV1 {
  return { schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'PRIVATE SOURCE', documentType: 'section',
    nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [
      { kind: 'heading', sourceNodeId: 'heading', text: 'PRIVATE HEADING', level: 'h2' },
      { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [] },
    ] }],
  };
}
function manifest(document: P15NeutralExportDocumentV1, containers: P15ContainerBoxShadowManifestV1['containers']): P15ContainerBoxShadowManifestV1 {
  const generated = generateElementorV3TemplateCandidate(document);
  if (!generated.candidate) throw new Error('fixture must generate');
  return { schemaVersion: 1, manifestVersion: P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(document),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generated.candidate).digest,
    containers, styleInferencePerformed: false, responsiveInferencePerformed: false,
    figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
    targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false };
}
const normal: P15ContainerBoxShadowValueV1 = { horizontal: -10, vertical: 10, blur: 20, spread: -5, color: '#123456', position: 'outline' };
const hover: P15ContainerBoxShadowValueV1 = { horizontal: 0, vertical: -8, blur: 0, spread: 100, color: '#abcdef', position: 'inset' };
function settings(result: ReturnType<typeof resolveP15ContainerBoxShadows>, nested = false): Record<string, unknown> {
  const target = nested ? result.template?.content[0]?.elements[1] : result.template?.content[0];
  if (!target || Array.isArray(target.settings)) throw new Error('expected Container settings');
  return target.settings;
}

describe('P15 exact Container normal and hover box shadow groups', () => {
  it('writes atomic normal and hover values using exact 4.2.4 keys', () => {
    const document = source();
    const result = resolveP15ContainerBoxShadows(document, manifest(document, [{ sourceNodeId: 'root', normal, hover }]));
    expect(P15_CONTAINER_BOX_SHADOW_EVIDENCE).toMatchObject({
      containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
      groupSourceBlobSha: '1c068c900db0ff2593089028d67fb6d897dbaa33',
      controlSourceBlobSha: 'e55cf9af34db5cc3e73dc295cd9f35b437da6fa7',
      normalGroup: 'box_shadow', hoverGroup: 'box_shadow_hover',
    });
    expect(result.status).toBe('CONTAINER_BOX_SHADOWS_RESOLVED');
    expect(settings(result)).toMatchObject({
      box_shadow_box_shadow_type: 'yes',
      box_shadow_box_shadow: { horizontal: -10, vertical: 10, blur: 20, spread: -5, color: '#123456' },
      box_shadow_box_shadow_position: ' ',
      box_shadow_hover_box_shadow_type: 'yes',
      box_shadow_hover_box_shadow: { horizontal: 0, vertical: -8, blur: 0, spread: 100, color: '#abcdef' },
      box_shadow_hover_box_shadow_position: 'inset',
    });
    expect(settings(result)).not.toHaveProperty('box_shadow_box_shadow_tablet');
    expect(settings(result, true)).not.toHaveProperty('box_shadow_hover_box_shadow');
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
  });

  it('keeps normal/hover isolated and binds nested Container', () => {
    const document = source();
    const result = resolveP15ContainerBoxShadows(document, manifest(document, [{ sourceNodeId: 'nested', hover }]));
    expect(result.status).toBe('CONTAINER_BOX_SHADOWS_RESOLVED');
    expect(settings(result)).not.toHaveProperty('box_shadow_hover_box_shadow');
    expect(settings(result, true).box_shadow_hover_box_shadow_position).toBe('inset');
    expect(settings(result, true)).not.toHaveProperty('box_shadow_box_shadow');
    const noOp = resolveP15ContainerBoxShadows(document, manifest(document, []));
    expect(noOp.status).toBe('NO_CONTAINER_BOX_SHADOW_OVERRIDES');
    expect(noOp.baseCandidateIdentityDigest).toBe(noOp.resolvedCandidateIdentityDigest);
  });

  it('rejects malformed, extra, fractional and out-of-range shadow objects', () => {
    const document = source();
    for (const bad of [
      { ...normal, horizontal: -101 }, { ...normal, vertical: 101 }, { ...normal, blur: -1 },
      { ...normal, spread: 101 }, { ...normal, blur: 1.5 }, { ...normal, blur: Number.NaN },
      { ...normal, color: '#ABCDEF' }, { ...normal, position: 'outside' },
      { ...normal, css: 'PRIVATE' }, { horizontal: 0 },
    ]) {
      const result = resolveP15ContainerBoxShadows(document, manifest(document, [{ sourceNodeId: 'root', normal: bad }] as never));
      expect(result.issues.map(x => x.code)).toContain('P15_CONTAINER_SHADOW_VALUE_INVALID');
      expect(result.template).toBeNull();
    }
    expect(resolveP15ContainerBoxShadows(document, manifest(document, [{ sourceNodeId: 'root', normal: undefined }] as never)).status)
      .toBe('REJECTED_INVALID_MANIFEST');
  });

  it('rejects stale identities, duplicate IDs, wrong types, unknown fields and authority inflation', () => {
    const document = source(); const valid = manifest(document, [{ sourceNodeId: 'root', normal }]);
    for (const bad of [
      { ...valid, sourceIrFingerprint: 'sha256:' + '0'.repeat(64) },
      { ...valid, baseCandidateIdentityDigest: 'sha256:' + '1'.repeat(64) },
      { ...valid, productionAcceptance: true }, { ...valid, extra: 'PRIVATE' },
      { ...valid, containers: [{ sourceNodeId: 'root', normal }, { sourceNodeId: 'root', hover }] },
      { ...valid, containers: [{ sourceNodeId: 'heading', normal }] },
      { ...valid, containers: [{ sourceNodeId: 'root', normal, unknown: 'PRIVATE' }] },
    ]) {
      expect(resolveP15ContainerBoxShadows(document, bad).status).toBe('REJECTED_INVALID_MANIFEST');
    }
  });

  it('is deterministic and refuses private or inflated summary fields', () => {
    const document = source(); const valid = manifest(document, [{ sourceNodeId: 'root', normal }]);
    const first = resolveP15ContainerBoxShadows(document, valid);
    expect(first).toEqual(resolveP15ContainerBoxShadows(document, valid));
    const summary = serializeP15ContainerBoxShadowSummary(first);
    expect(summary).not.toContain('PRIVATE');
    expect(summary).not.toContain('templateJson');
    expect(() => serializeP15ContainerBoxShadowSummary({ ...first, productionAcceptance: true } as never)).toThrow();
    expect(() => serializeP15ContainerBoxShadowSummary({ ...first,
      issues: [{ code: 'P15_CONTAINER_SHADOW_ENTRY_INVALID', path: '$manifest', message: 'x', privateText: 'PRIVATE' }],
    } as never)).toThrow();
  });
});
