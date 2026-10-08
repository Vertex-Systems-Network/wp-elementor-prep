import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as borderStyle from '../src/targets/elementor/container-border-style-resolution';
import * as hoverBorderStyle from '../src/targets/elementor/container-hover-border-style-resolution';
import * as hoverBackground from '../src/targets/elementor/container-hover-background-color-resolution';
import * as hoverOverlay from '../src/targets/elementor/container-hover-overlay-color-resolution';
import * as overlay from '../src/targets/elementor/container-overlay-color-resolution';
import * as overflow from '../src/targets/elementor/container-overflow-resolution';
import * as htmlTag from '../src/targets/elementor/container-semantic-html-tag-resolution';
import * as radius from '../src/targets/elementor/responsive-border-radius-resolution';
import * as hoverRadius from '../src/targets/elementor/responsive-hover-border-radius-resolution';
import { buildCorpus, goldenRecord, type FamilyCorpusSpec } from './golden/m1-container-family-corpus';

type Family = { id: string; spec: FamilyCorpusSpec; resolve: (s: unknown, m: unknown) => unknown; serialize: (r: never) => string };

const borderSpec = (manifestVersion: string): FamilyCorpusSpec => ({
  manifestVersion,
  extraFlags: ['styleInferencePerformed'],
  entryBase: { borderType: 'solid', widthPx: { top: 1, right: 2, bottom: 1, left: 2 }, color: '#1a2b3c' },
  omitBaseKeys: ['borderType', 'widthPx', 'color'],
  tabletValid: { tabletWidthPx: { top: 3, right: 3, bottom: 3, left: 3 } },
  mobileValid: { mobileWidthPx: { top: 0, right: 100, bottom: 0, left: 100 } },
  invalidValues: [
    { borderType: 'none' },
    { borderType: 'SOLID' },
    { widthPx: { top: 1, right: 1, bottom: 1 } },
    { widthPx: { top: 1, right: 1, bottom: 1, left: 101 } },
    { widthPx: { top: 1.5, right: 1, bottom: 1, left: 1 } },
    { tabletWidthPx: { top: -1, right: 1, bottom: 1, left: 1 } },
    { mobileWidthPx: 'thin' },
    { tabletWidthPx: undefined },
    { color: '#1A2B3C' },
    { color: '#abc' },
    { borderType: 'none', color: 'red' },
  ],
});

const overlaySpec = (manifestVersion: string): FamilyCorpusSpec => ({
  manifestVersion,
  entryBase: { color: '#102030' },
  tabletValid: { opacityHundredths: 50, tabletOpacityHundredths: 0 },
  mobileValid: { mobileOpacityHundredths: 100 },
  invalidValues: [
    { color: '#ABCDEF' },
    { color: undefined },
    { opacityHundredths: 101 },
    { tabletOpacityHundredths: 0.5 },
    { mobileOpacityHundredths: '50' },
    { opacityHundredths: undefined },
    { color: 'blue', opacityHundredths: -1 },
  ],
});

const radiusSpec = (manifestVersion: string): FamilyCorpusSpec => ({
  manifestVersion,
  tabletValid: { tabletCornerRadiusPx: 12 },
  mobileValid: { mobileCornerRadiusPx: 0 },
  invalidValues: [
    { tabletCornerRadiusPx: -1 },
    { mobileCornerRadiusPx: 1.5 },
    { tabletCornerRadiusPx: '4' },
    { tabletCornerRadiusPx: 100000 },
    { tabletCornerRadiusPx: undefined, mobileCornerRadiusPx: undefined },
    { tabletCornerRadiusPx: 4, mobileCornerRadiusPx: null },
  ],
});

const FAMILIES: Family[] = [
  {
    id: 'container-border-style',
    spec: borderSpec(borderStyle.P15_ELEMENTOR_CONTAINER_BORDER_STYLE_MANIFEST_VERSION),
    resolve: borderStyle.resolveP15ElementorContainerBorderStyles,
    serialize: borderStyle.serializeP15ElementorContainerBorderStyleSummary as (r: never) => string,
  },
  {
    id: 'container-hover-border-style',
    spec: borderSpec(hoverBorderStyle.P15_ELEMENTOR_CONTAINER_HOVER_BORDER_STYLE_MANIFEST_VERSION),
    resolve: hoverBorderStyle.resolveP15ElementorContainerHoverBorderStyles,
    serialize: hoverBorderStyle.serializeP15ElementorContainerHoverBorderStyleSummary as (r: never) => string,
  },
  {
    id: 'container-hover-background-color',
    spec: {
      manifestVersion: hoverBackground.P15_ELEMENTOR_CONTAINER_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION,
      tabletValid: { color: '#00ff00' },
      mobileValid: { color: '#0000ff' },
      invalidValues: [{ color: '#00FF00' }, { color: 'rgb(0,0,0)' }, { color: 7 }],
    },
    resolve: hoverBackground.resolveP15ElementorContainerHoverBackgroundColor,
    serialize: hoverBackground.serializeP15ElementorContainerHoverBackgroundColorSummary as (r: never) => string,
  },
  {
    id: 'container-hover-overlay-color',
    spec: overlaySpec(hoverOverlay.P15_ELEMENTOR_CONTAINER_HOVER_OVERLAY_COLOR_MANIFEST_VERSION),
    resolve: hoverOverlay.resolveP15ElementorContainerHoverOverlayColor,
    serialize: hoverOverlay.serializeP15ElementorContainerHoverOverlayColorSummary as (r: never) => string,
  },
  {
    id: 'container-overlay-color',
    spec: overlaySpec(overlay.P15_ELEMENTOR_CONTAINER_OVERLAY_COLOR_MANIFEST_VERSION),
    resolve: overlay.resolveP15ElementorContainerOverlayColor,
    serialize: overlay.serializeP15ElementorContainerOverlayColorSummary as (r: never) => string,
  },
  {
    id: 'container-overflow',
    spec: {
      manifestVersion: overflow.P15_ELEMENTOR_CONTAINER_OVERFLOW_MANIFEST_VERSION,
      tabletValid: { overflow: 'hidden' },
      mobileValid: { overflow: 'auto' },
      invalidValues: [{ overflow: 'visible' }, { overflow: 'scroll' }, { overflow: 'HIDDEN' }],
    },
    resolve: overflow.resolveP15ElementorContainerOverflow,
    serialize: overflow.serializeP15ElementorContainerOverflowSummary as (r: never) => string,
  },
  {
    id: 'container-semantic-html-tag',
    spec: {
      manifestVersion: htmlTag.P15_ELEMENTOR_CONTAINER_SEMANTIC_HTML_TAG_MANIFEST_VERSION,
      tabletValid: { htmlTag: 'header' },
      mobileValid: { htmlTag: 'nav' },
      invalidValues: [{ htmlTag: 'div' }, { htmlTag: 'a' }, { htmlTag: 'Section' }, { htmlTag: null }],
    },
    resolve: htmlTag.resolveP15ElementorContainerSemanticHtmlTag,
    serialize: htmlTag.serializeP15ElementorContainerSemanticHtmlTagSummary as (r: never) => string,
  },
  {
    id: 'responsive-border-radius',
    spec: radiusSpec(radius.P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION),
    resolve: radius.resolveP15ElementorResponsiveContainerBorderRadius,
    serialize: radius.serializeP15ElementorResponsiveBorderRadiusSummary as (r: never) => string,
  },
  {
    id: 'responsive-hover-border-radius',
    spec: radiusSpec(hoverRadius.P15_ELEMENTOR_RESPONSIVE_HOVER_BORDER_RADIUS_MANIFEST_VERSION),
    resolve: hoverRadius.resolveP15ElementorResponsiveContainerHoverBorderRadius,
    serialize: hoverRadius.serializeP15ElementorResponsiveHoverBorderRadiusSummary as (r: never) => string,
  },
];

describe('recovery M1.3d — container style family golden equivalence', () => {
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
