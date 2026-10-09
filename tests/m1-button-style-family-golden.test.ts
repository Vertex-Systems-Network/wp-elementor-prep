import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as borderStyle from '../src/targets/elementor/button-border-style-resolution';
import * as visualDepth from '../src/targets/elementor/button-visual-depth-radius-resolution';
import * as padding from '../src/targets/elementor/button-responsive-padding-resolution';
import * as icon from '../src/targets/elementor/button-icon-basics-resolution';
import * as hover from '../src/targets/elementor/button-hover-interaction-resolution';
import { buildCorpus, goldenRecord, widgetSourceDocument, type FamilyCorpusSpec } from './golden/m1-container-family-corpus';

type Family = { id: string; spec: FamilyCorpusSpec; resolve: (s: unknown, m: unknown) => unknown; serialize: (r: never) => string };

const buttonSpec = (manifestVersion: string, rest: Partial<FamilyCorpusSpec> & Pick<FamilyCorpusSpec, 'tabletValid' | 'mobileValid' | 'invalidValues'>): FamilyCorpusSpec => ({
  manifestVersion,
  source: widgetSourceDocument,
  entriesField: 'buttons',
  primaryId: 'cta',
  secondaryId: 'cta2',
  wrongKindId: 'title',
  extraFlags: ['styleInferencePerformed'],
  ...rest,
});

const shadow = { horizontal: -3, vertical: 4, blur: 10, spread: -2, color: '#102030', position: 'inset' };

const FAMILIES: Family[] = [
  {
    id: 'button-border-style',
    spec: buttonSpec(borderStyle.P15_ELEMENTOR_BUTTON_BORDER_STYLE_MANIFEST_VERSION, {
      entryBase: { borderType: 'dashed', widthPx: { top: 2, right: 2, bottom: 2, left: 2 }, color: '#abcdef' },
      omitBaseKeys: ['borderType', 'widthPx', 'color'],
      tabletValid: { tabletWidthPx: { top: 1, right: 0, bottom: 1, left: 0 } },
      mobileValid: { mobileWidthPx: { top: 0, right: 0, bottom: 0, left: 0 } },
      invalidValues: [{ borderType: 'none' }, { widthPx: { top: 1, right: 1, bottom: 1, left: 101 } }, { mobileWidthPx: { top: 1 } }, { tabletWidthPx: undefined }, { color: '#ABCDEF' }],
    }),
    resolve: borderStyle.resolveP15ElementorButtonBorderStyles,
    serialize: borderStyle.serializeP15ElementorButtonBorderStyleSummary as (r: never) => string,
  },
  {
    id: 'button-visual-depth-radius',
    spec: buttonSpec(visualDepth.P15_ELEMENTOR_BUTTON_VISUAL_DEPTH_RADIUS_MANIFEST_VERSION, {
      tabletValid: { textShadow: { horizontal: 1, vertical: -1, blur: 0, color: '#000000' }, boxShadow: shadow },
      mobileValid: { borderRadiusPx: { desktop: 8, tablet: 6, mobile: 4 }, boxShadow: { ...shadow, position: 'outline' } },
      invalidValues: [
        { textShadow: { horizontal: 101, vertical: 0, blur: 0, color: '#000000' } },
        { textShadow: { horizontal: 0, vertical: 0, blur: 0 } },
        { boxShadow: { ...shadow, position: 'outset' } },
        { boxShadow: { ...shadow, spread: 1.5 } },
        { borderRadiusPx: { desktop: 8, tablet: 6 } },
        { borderRadiusPx: { desktop: -1, tablet: 6, mobile: 4 } },
        { textShadow: undefined },
      ],
    }),
    resolve: visualDepth.resolveP15ElementorButtonVisualDepthRadius,
    serialize: visualDepth.serializeP15ElementorButtonVisualDepthRadiusSummary as (r: never) => string,
  },
  {
    id: 'button-responsive-padding',
    spec: buttonSpec(padding.P15_ELEMENTOR_BUTTON_RESPONSIVE_PADDING_MANIFEST_VERSION, {
      tabletValid: { desktopPaddingPx: { top: 12, right: 24, bottom: 12, left: 24 }, tabletPaddingPx: { top: 8, right: 8, bottom: 8, left: 8 } },
      mobileValid: { mobilePaddingPx: { top: 4.5, right: 0, bottom: 4.5, left: 0 } },
      invalidValues: [{ desktopPaddingPx: { top: 1, right: 1, bottom: 1 } }, { tabletPaddingPx: { top: -1, right: 0, bottom: 0, left: 0 } }, { mobilePaddingPx: { top: 4097, right: 0, bottom: 0, left: 0 } }, { mobilePaddingPx: 8 }],
    }),
    resolve: padding.resolveP15ElementorButtonResponsivePadding,
    serialize: padding.serializeP15ElementorButtonResponsivePaddingSummary as (r: never) => string,
  },
  {
    id: 'button-icon-basics',
    spec: buttonSpec(icon.P15_ELEMENTOR_BUTTON_ICON_BASICS_MANIFEST_VERSION, {
      extraFlags: ['styleInferencePerformed', 'iconInferencePerformed', 'svgImportPerformed'],
      omitFlags: ['responsiveClosureClaim'],
      entryBase: { selectedIcon: { value: 'fas fa-arrow-right', library: 'fa-solid' } },
      tabletValid: { iconAlign: 'row-reverse' },
      mobileValid: { iconIndentPx: 12.5 },
      invalidValues: [
        { selectedIcon: { value: 'far fa-arrow-right', library: 'fa-solid' } },
        { selectedIcon: { value: 'fab fa-github', library: 'fa-brands', svg: '<svg/>' } },
        { selectedIcon: { value: 'fas fa-Arrow', library: 'fa-solid' } },
        { selectedIcon: undefined },
        { iconAlign: 'column' },
        { iconIndentPx: 51 },
        { iconIndentPx: undefined, iconAlign: undefined },
      ],
    }),
    resolve: icon.resolveP15ElementorButtonIconBasics,
    serialize: icon.serializeP15ElementorButtonIconBasicsSummary as (r: never) => string,
  },
  {
    id: 'button-hover-interaction',
    spec: buttonSpec(hover.P15_ELEMENTOR_BUTTON_HOVER_INTERACTION_MANIFEST_VERSION, {
      tabletValid: { boxShadow: shadow, transitionSeconds: 0.3 },
      mobileValid: { animation: 'pulse-grow' },
      invalidValues: [{ boxShadow: { ...shadow, blur: -1 } }, { transitionSeconds: 11 }, { transitionSeconds: '0.3' }, { animation: 'spin' }, { animation: undefined }],
    }),
    resolve: hover.resolveP15ElementorButtonHoverInteractions,
    serialize: hover.serializeP15ElementorButtonHoverInteractionSummary as (r: never) => string,
  },
];

describe('recovery M1.4c — button style family golden equivalence', () => {
  for (const family of FAMILIES) {
    it(`${family.id} reproduces the recorded original-resolver outputs exactly`, () => {
      const path = `tests/golden/m1-${family.id}.golden.json`;
      const records = buildCorpus(family.spec).map((testCase) => goldenRecord(family.resolve, family.serialize, testCase));
      if (process.env.GOLDEN_WRITE === '1') writeFileSync(path, `${JSON.stringify(records, null, 1)}\n`);
      expect(existsSync(path)).toBe(true);
      const golden = JSON.parse(readFileSync(path, 'utf8')) as unknown[];
      expect(records.length).toBe(golden.length);
      records.forEach((record, index) => expect(record).toEqual(golden[index]));
    });
  }
});
