import { describe, expect, it } from 'vitest';
import {
  ELEMENTOR_CAPABILITY_REGISTRY_VERSION,
  ELEMENTOR_CORE_WIDGET_CAPABILITIES_V1,
  assessElementorTemplateCapabilities,
  serializeElementorTemplateCapabilityReport,
} from '../src/targets/elementor/capability-registry';
import type { ElementorTemplateV04 } from '../src/targets/elementor/template-v04';

function template(): ElementorTemplateV04 {
  return {
    title: 'Capability Fixture',
    type: 'page',
    version: '0.4',
    page_settings: [],
    content: [
      {
        id: 'container1',
        elType: 'container',
        isInner: false,
        settings: [],
        elements: [
          {
            id: 'heading1',
            elType: 'widget',
            widgetType: 'heading',
            isInner: false,
            settings: {
              title: 'Hello',
              align_mobile: 'center',
              __globals__: {
                title_color: 'globals/colors?id=primary',
              },
            },
            elements: [],
          },
          {
            id: 'image1',
            elType: 'widget',
            widgetType: 'image',
            isInner: false,
            settings: {
              space_between_tablet: { unit: 'px', size: 20, sizes: [] },
            },
            elements: [],
          },
          {
            id: 'button1',
            elType: 'widget',
            widgetType: 'button',
            isInner: false,
            settings: {
              text: 'Click Me',
              __globals__: {
                button_text_color: 'globals/colors?id=accent',
              },
            },
            elements: [],
          },
          {
            id: 'addon1',
            elType: 'widget',
            widgetType: 'custom-addon-widget',
            isInner: false,
            settings: [],
            elements: [],
          },
        ],
      },
    ],
  };
}

describe('P15 Elementor capability registry and report', () => {
  it('registers only directly evidenced classic core widget identifiers and keeps generation disabled', () => {
    expect(ELEMENTOR_CAPABILITY_REGISTRY_VERSION).toBe('elementor-core-widget-capabilities-v1');
    expect(ELEMENTOR_CORE_WIDGET_CAPABILITIES_V1.map((entry) => entry.widgetType)).toEqual([
      'button',
      'heading',
      'image',
    ]);
    for (const entry of ELEMENTOR_CORE_WIDGET_CAPABILITIES_V1) {
      expect(entry.classification).toBe('DOCUMENTED_CORE');
      expect(entry.generationEnabled).toBe(false);
      expect(entry.availabilityClaim).toBe(false);
    }
  });

  it('assesses known widgets as documented core and unknown widgets as review required', () => {
    const report = assessElementorTemplateCapabilities(template());

    expect(report.status).toBe('ASSESSED');
    expect(report.templateValid).toBe(true);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.generationEnabled).toBe(false);
    expect(report.summary).toEqual({
      totalWidgets: 4,
      documentedCoreWidgets: 3,
      reviewRequiredWidgets: 1,
      widgetsWithResponsiveSettings: 2,
      widgetsWithGlobalReferences: 2,
    });
    expect(report.widgetInventory).toEqual([
      { widgetType: 'button', classification: 'DOCUMENTED_CORE', count: 1 },
      { widgetType: 'custom-addon-widget', classification: 'REVIEW_REQUIRED', count: 1 },
      { widgetType: 'heading', classification: 'DOCUMENTED_CORE', count: 1 },
      { widgetType: 'image', classification: 'DOCUMENTED_CORE', count: 1 },
    ]);
  });

  it('reports responsive/global evidence without interpreting or rewriting values', () => {
    const report = assessElementorTemplateCapabilities(template());
    const heading = report.entries.find((entry) => entry.id === 'heading1');
    const image = report.entries.find((entry) => entry.id === 'image1');
    const button = report.entries.find((entry) => entry.id === 'button1');

    expect(heading?.responsiveSettingKeys).toEqual(['align_mobile']);
    expect(heading?.globalReferenceKeys).toEqual(['title_color']);
    expect(image?.responsiveSettingKeys).toEqual(['space_between_tablet']);
    expect(image?.globalReferenceKeys).toEqual([]);
    expect(button?.responsiveSettingKeys).toEqual([]);
    expect(button?.globalReferenceKeys).toEqual(['button_text_color']);
  });

  it('includes nested widgets with stable evidence paths', () => {
    const document = template();
    document.content[0]!.elements[0]!.elements.push({
      id: 'nested-button',
      elType: 'widget',
      widgetType: 'button',
      isInner: true,
      settings: [],
      elements: [],
    });

    const report = assessElementorTemplateCapabilities(document);
    const nested = report.entries.find((entry) => entry.id === 'nested-button');
    expect(nested).toEqual(expect.objectContaining({
      path: '$.content[0].elements[0].elements[0]',
      widgetType: 'button',
      classification: 'DOCUMENTED_CORE',
      generationEnabled: false,
      availabilityClaim: false,
    }));
  });

  it('fails closed before assessment when the template contract is invalid', () => {
    const document = { ...template(), version: '0.5' };
    const report = assessElementorTemplateCapabilities(document);

    expect(report.status).toBe('INVALID_TEMPLATE');
    expect(report.templateValid).toBe(false);
    expect(report.entries).toEqual([]);
    expect(report.widgetInventory).toEqual([]);
    expect(report.summary.totalWidgets).toBe(0);
    expect(report.validationIssues.map((issue) => issue.code)).toContain('P15_UNSUPPORTED_DOCUMENT_VERSION');
  });

  it('serializes reports deterministically', () => {
    const report = assessElementorTemplateCapabilities(template());
    const first = serializeElementorTemplateCapabilityReport(report);
    const second = serializeElementorTemplateCapabilityReport(report);

    expect(first).toBe(second);
    expect(first.endsWith('\n')).toBe(true);
  });
});
