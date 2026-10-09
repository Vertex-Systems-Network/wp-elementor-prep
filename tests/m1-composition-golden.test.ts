import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as containerStyle from '../src/targets/elementor/container-style-composition';
import * as buttonColor from '../src/targets/elementor/button-color-composition';
import { P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION } from '../src/targets/elementor/container-border-style-resolution';
import { P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_MANIFEST_VERSION } from '../src/targets/elementor/container-hover-border-style-resolution';
import { P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/container-overlay-color-resolution';
import { P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/container-hover-overlay-color-resolution';
import { P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION } from '../src/targets/elementor/container-box-shadow-resolution';
import { P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/container-hover-background-color-resolution';
import { P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION } from '../src/targets/elementor/responsive-border-radius-resolution';
import { P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION } from '../src/targets/elementor/responsive-hover-border-radius-resolution';
import { P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-text-color-resolution';
import { P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-background-color-resolution';
import { P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-hover-text-color-resolution';
import { P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-hover-background-color-resolution';
import { P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MANIFEST_VERSION } from '../src/targets/elementor/button-hover-border-color-resolution';
import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../src/targets/elementor/neutral-export-ir';
import { goldenRecord } from './golden/m1-container-family-corpus';
import { buildCompositionCorpus, type CompositionCorpusSpec } from './golden/m1-composition-corpus';

type Composition = { id: string; spec: CompositionCorpusSpec; compose: (s: unknown, m: unknown) => unknown; serialize: (r: never) => string };

const containerSource = (): P15NeutralExportDocumentV1 => ({
  schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Golden composition source', documentType: 'section',
  nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', cornerRadiusPx: 12, children: [
    { kind: 'heading', sourceNodeId: 'heading', level: 'h2', text: 'Golden heading' },
    { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [] },
  ] }],
});

const buttonSource = (): P15NeutralExportDocumentV1 => ({
  schemaVersion: 1, irVersion: P15_NEUTRAL_EXPORT_IR_VERSION, title: 'Golden button composition source', documentType: 'section',
  nodes: [{ kind: 'container', sourceNodeId: 'root', direction: 'column', children: [
    { kind: 'button', sourceNodeId: 'button', text: 'Go', align: 'start' },
    { kind: 'heading', sourceNodeId: 'heading', text: 'Golden heading', level: 'h2' },
    { kind: 'container', sourceNodeId: 'nested', direction: 'row', children: [
      { kind: 'button', sourceNodeId: 'nested-button', text: 'More', align: 'end' },
    ] },
  ] }],
});

const widthPx = { top: 1, right: 2, bottom: 3, left: 4 };

const COMPOSITIONS: Composition[] = [
  {
    id: 'container-style-composition',
    spec: {
      compositionVersion: containerStyle.P15_CONTAINER_STYLE_COMPOSITION_VERSION,
      source: containerSource,
      families: (common) => ({
        normalBorder: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION, styleInferencePerformed: false,
          containers: [{ sourceNodeId: 'root', borderType: 'solid', widthPx, color: '#123456', tabletWidthPx: { top: 0, right: 0, bottom: 0, left: 0 } }] },
        hoverBorder: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_MANIFEST_VERSION, styleInferencePerformed: false,
          containers: [{ sourceNodeId: 'root', borderType: 'dashed', widthPx, color: '#abcdef' }] },
        normalOverlay: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION,
          containers: [{ sourceNodeId: 'root', color: '#112233', opacityHundredths: 0, tabletOpacityHundredths: 100 }] },
        hoverOverlay: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION,
          containers: [{ sourceNodeId: 'nested', color: '#445566', mobileOpacityHundredths: 25 }] },
        boxShadows: { ...common, manifestVersion: P15_CONTAINER_BOX_SHADOW_MANIFEST_VERSION, styleInferencePerformed: false,
          containers: [{ sourceNodeId: 'root',
            normal: { horizontal: -10, vertical: 10, blur: 20, spread: -5, color: '#123456', position: 'outline' },
            hover: { horizontal: 0, vertical: 8, blur: 0, spread: 5, color: '#abcdef', position: 'inset' } }] },
        hoverBackground: { ...common, manifestVersion: P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
          containers: [{ sourceNodeId: 'nested', color: '#abcdef' }] },
        responsiveRadius: { ...common, manifestVersion: P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION,
          containers: [{ sourceNodeId: 'root', tabletCornerRadiusPx: 20 }] },
        responsiveHoverRadius: { ...common, manifestVersion: P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION,
          containers: [{ sourceNodeId: 'root', mobileCornerRadiusPx: 6 }] },
      }),
      invalidNested: {
        normalBorder: { containers: [{ sourceNodeId: 'heading', borderType: 'solid', widthPx, color: '#123456' }] },
        normalOverlay: { containers: [{ sourceNodeId: 'root', color: '#112233', opacityHundredths: 101 }] },
        boxShadows: { containers: [{ sourceNodeId: 'root', normal: { horizontal: 1 } }] },
        hoverBackground: { containers: [{ sourceNodeId: 'nested', color: '#abcdef' }, { sourceNodeId: 'nested', color: '#abcdef' }] },
        responsiveRadius: { containers: [{ sourceNodeId: 'root', tabletCornerRadiusPx: 1.5 }] },
        responsiveHoverRadius: { responsiveClosureClaim: true },
      },
      orderingPairs: [['normalBorder', 'hoverBorder'], ['normalOverlay', 'boxShadows'], ['responsiveRadius', 'responsiveHoverRadius']],
    },
    compose: containerStyle.composeP15ContainerStyles,
    serialize: containerStyle.serializeP15ContainerStyleCompositionSummary as (r: never) => string,
  },
  {
    id: 'button-color-composition',
    spec: {
      compositionVersion: buttonColor.P15_BUTTON_COLOR_COMPOSITION_VERSION,
      source: buttonSource,
      families: (common) => {
        const family = (manifestVersion: string, sourceNodeId: string, color: string) => ({ ...common, manifestVersion,
          colorInferencePerformed: false, buttons: [{ sourceNodeId, color }] });
        return {
          normalText: family(P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION, 'button', '#112233'),
          normalBackground: family(P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION, 'button', '#223344'),
          hoverText: family(P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION, 'button', '#334455'),
          hoverBackground: family(P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION, 'nested-button', '#445566'),
          hoverBorder: family(P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MANIFEST_VERSION, 'button', '#556677'),
        };
      },
      invalidNested: {
        normalText: { buttons: [{ sourceNodeId: 'heading', color: '#112233' }] },
        normalBackground: { buttons: [{ sourceNodeId: 'button', color: '#ABCDEF' }] },
        hoverText: { buttons: [{ sourceNodeId: 'button', color: '#334455' }, { sourceNodeId: 'button', color: '#334455' }] },
        hoverBorder: { buttons: [{ sourceNodeId: 'button', color: '#556677', privateCss: 'PRIVATE' }] },
      },
      orderingPairs: [['normalText', 'hoverText'], ['normalBackground', 'hoverBackground']],
    },
    compose: buttonColor.composeP15ButtonColors,
    serialize: buttonColor.serializeP15ButtonColorCompositionSummary as (r: never) => string,
  },
];

describe('recovery M1.5 — composition golden equivalence', () => {
  for (const composition of COMPOSITIONS) {
    it(`${composition.id} reproduces the recorded original-composition outputs exactly`, () => {
      const path = `tests/golden/m1-${composition.id}.golden.json`;
      const records = buildCompositionCorpus(composition.spec).map((testCase) => goldenRecord(composition.compose, composition.serialize, testCase));
      if (process.env.GOLDEN_WRITE === '1') writeFileSync(path, `${JSON.stringify(records, null, 1)}\n`);
      expect(existsSync(path)).toBe(true);
      const golden = JSON.parse(readFileSync(path, 'utf8')) as unknown[];
      expect(records.length).toBe(golden.length);
      records.forEach((record, index) => expect(record).toEqual(golden[index]));
    });
  }
});
