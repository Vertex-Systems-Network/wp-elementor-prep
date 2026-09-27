import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE,
  P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerFlexItemCustomOrder,
  serializeP15ElementorResponsiveFlexItemCustomOrderSummary,
  type P15ElementorResponsiveFlexItemCustomOrderManifestV1,
} from '../src/targets/elementor/responsive-flex-item-custom-order-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';

function sourceDocument(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Responsive custom order private source', documentType: 'section',
    nodes: [{
      kind: 'container', sourceNodeId: 'root', direction: 'row', alignItems: 'start',
      children: [{
        kind: 'container', sourceNodeId: 'nested', direction: 'column', alignItems: 'stretch',
        children: [{ kind: 'text', sourceNodeId: 'copy', text: 'PRIVATE ORDER COPY', align: 'start' }],
      }],
    }],
  };
}

function baseDigest(source: P15NeutralExportDocumentV1): string {
  const generated = generateElementorV3TemplateCandidate(source);
  if (generated.status !== 'GENERATED_LOCAL_CANDIDATE' || !generated.candidate) throw new Error('expected base candidate');
  return buildElementorTemplateCandidateIdentity(generated.candidate).digest;
}

function manifest(source: P15NeutralExportDocumentV1, containers: P15ElementorResponsiveFlexItemCustomOrderManifestV1['containers']): P15ElementorResponsiveFlexItemCustomOrderManifestV1 {
  return {
    schemaVersion: 1, manifestVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source), baseCandidateIdentityDigest: baseDigest(source), containers,
    responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false,
    responsiveClosureClaim: false, targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false,
  };
}

function settingsOf(element: unknown): Record<string, unknown> {
  if (typeof element !== 'object' || element === null || Array.isArray(element)) throw new Error('expected element');
  const settings = (element as Record<string, unknown>).settings;
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) throw new Error('expected settings');
  return settings as Record<string, unknown>;
}

describe('P15 source-bound responsive Flex Item custom order', () => {
  it('writes complete exact tablet/mobile custom integer pairs and preserves desktop settings', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerFlexItemCustomOrder(source, manifest(source, [{
      sourceNodeId: 'root', tabletOrderCustom: true, tabletOrderValue: 240, mobileOrderCustom: true, mobileOrderValue: -2,
    }]));
    expect(P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.tabletCustomOrderSettingKey).toBe('_flex_order_custom_tablet');
    expect(P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.mobileCustomOrderSettingKey).toBe('_flex_order_custom_mobile');
    expect(result.status).toBe('RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED');
    expect(result.issues).toEqual([]);
    const settings = settingsOf(result.template?.content[0]);
    expect(settings._flex_order_tablet).toBe('custom');
    expect(settings._flex_order_mobile).toBe('custom');
    expect(settings._flex_order_custom_tablet).toBe(240);
    expect(settings._flex_order_custom_mobile).toBe(-2);
    expect(settings).not.toHaveProperty('_flex_order');
    expect(result.resolvedOrder).toEqual([{ sourceNodeId: 'root', tabletOrderCustom: true, mobileOrderCustom: true, tabletOrderValue: 240, mobileOrderValue: -2 }]);
    expect(result.responsiveInferencePerformed).toBe(false);
    expect(result.responsiveClosureClaim).toBe(false);
    expect(result.targetCompatibilityClaim).toBe(false);
    expect(result.productionAcceptance).toBe(false);
    expect(result.downloadEnabled).toBe(false);
  });

  it('binds nested source IDs and leaves unselected breakpoints absent', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerFlexItemCustomOrder(source, manifest(source, [{ sourceNodeId: 'nested', mobileOrderCustom: true, mobileOrderValue: -1000 }]));
    expect(result.status).toBe('RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED');
    const rootElement = result.template?.content[0];
    if (!rootElement) throw new Error('expected generated root');
    const root = settingsOf(rootElement);
    const nested = settingsOf(rootElement.elements[0]);
    expect(root).not.toHaveProperty('_flex_order_custom_mobile');
    expect(nested._flex_order_mobile).toBe('custom');
    expect(nested._flex_order_custom_mobile).toBe(-1000);
    expect(nested).not.toHaveProperty('_flex_order_tablet');
  });

  it('accepts explicit zero without inferring a second breakpoint', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerFlexItemCustomOrder(source, manifest(source, [{ sourceNodeId: 'root', mobileOrderCustom: true, mobileOrderValue: 0 }]));
    expect(result.status).toBe('RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED');
    const settings = settingsOf(result.template?.content[0]);
    expect(settings._flex_order_mobile).toBe('custom');
    expect(settings._flex_order_custom_mobile).toBe(0);
    expect(settings).not.toHaveProperty('_flex_order_tablet');
  });

  it('rejects partial pairs, unsupported ranges, non-integers and authority inflation', () => {
    const source = sourceDocument();
    const invalid: unknown[] = [
      { sourceNodeId: 'root', tabletOrderCustom: true },
      { sourceNodeId: 'root', tabletOrderValue: 32 },
      { sourceNodeId: 'root', mobileOrderCustom: false, mobileOrderValue: 10 },
      { sourceNodeId: 'root', mobileOrderCustom: true, mobileOrderValue: -1001 },
      { sourceNodeId: 'root', mobileOrderCustom: true, mobileOrderValue: 1001 },
      { sourceNodeId: 'root', mobileOrderCustom: true, mobileOrderValue: 10.5 },
      { sourceNodeId: 'root', mobileOrderCustom: true, mobileOrderValue: 10, unknown: true },
    ];
    for (const entry of invalid) {
      const result = resolveP15ElementorResponsiveContainerFlexItemCustomOrder(source, manifest(source, [entry as never]));
      expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
      expect(result.template).toBeNull();
    }
    const inflated = manifest(source, [{ sourceNodeId: 'root', mobileOrderCustom: true, mobileOrderValue: 10 }]);
    const result = resolveP15ElementorResponsiveContainerFlexItemCustomOrder(source, { ...inflated, targetCompatibilityClaim: true });
    expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
  });

  it('rejects stale source bindings and serializes sanitized metadata only', () => {
    const source = sourceDocument();
    const input = manifest(source, [{ sourceNodeId: 'root', mobileOrderCustom: true, mobileOrderValue: 20 }]);
    const stale = resolveP15ElementorResponsiveContainerFlexItemCustomOrder(source, { ...input, sourceIrFingerprint: 'sha256:' + '0'.repeat(64) });
    expect(stale.status).toBe('REJECTED_INVALID_MANIFEST');
    const valid = resolveP15ElementorResponsiveContainerFlexItemCustomOrder(source, input);
    const summary = serializeP15ElementorResponsiveFlexItemCustomOrderSummary(valid);
    expect(summary).toContain('"_flex_order_custom_mobile"');
    expect(summary).not.toContain('PRIVATE ORDER COPY');
    expect(summary).not.toContain('templateJson');
  });

  it('returns a deterministic no-op when no overrides are supplied', () => {
    const source = sourceDocument();
    const result = resolveP15ElementorResponsiveContainerFlexItemCustomOrder(source, manifest(source, []));
    expect(result.status).toBe('NO_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDES');
    expect(result.baseCandidateIdentityDigest).toBe(result.resolvedCandidateIdentityDigest);
  });
});
