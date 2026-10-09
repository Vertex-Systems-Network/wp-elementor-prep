import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as basics from '../src/targets/elementor/button-typography-basics-resolution';
import * as metrics from '../src/targets/elementor/button-typography-metrics-resolution';
import * as responsiveMetrics from '../src/targets/elementor/button-responsive-typography-metrics-resolution';
import * as linear from '../src/targets/elementor/button-linear-gradient-resolution';
import * as radial from '../src/targets/elementor/button-radial-gradient-resolution';
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

const linearGradient = { colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 100, tabletStopA: 10, tabletStopB: 90, angleDeg: 45, mobileAngleDeg: 360 };
const radialGradient = { colorA: '#ff0000', colorB: '#0000ff', stopA: 20, stopB: 80, position: 'top left', mobileStopA: 0, mobileStopB: 0, tabletPosition: 'bottom right' };

const FAMILIES: Family[] = [
  {
    id: 'button-typography-basics',
    spec: buttonSpec(basics.P15_ELEMENTOR_BUTTON_TYPOGRAPHY_BASICS_MANIFEST_VERSION, {
      tabletValid: { fontWeight: '700', textTransform: 'uppercase' },
      mobileValid: { fontStyle: 'italic' },
      invalidValues: [{ fontWeight: 700 }, { fontWeight: 'heavy' }, { textTransform: 'small-caps' }, { fontStyle: 'slanted' }, { fontWeight: undefined }],
    }),
    resolve: basics.resolveP15ElementorButtonTypographyBasics,
    serialize: basics.serializeP15ElementorButtonTypographyBasicsSummary as (r: never) => string,
  },
  {
    id: 'button-typography-metrics',
    spec: buttonSpec(metrics.P15_ELEMENTOR_BUTTON_TYPOGRAPHY_METRICS_MANIFEST_VERSION, {
      tabletValid: { fontFamily: 'Open Sans', fontSizePx: 16, lineHeightPx: 24 },
      mobileValid: { letterSpacingPx: -0.3, wordSpacingPx: 50 },
      invalidValues: [{ fontFamily: 'Open Sans, Arial' }, { fontFamily: ' Roboto' }, { fontSizePx: 0 }, { fontSizePx: 16.5 }, { lineHeightPx: 401 }, { letterSpacingPx: 0.25 }, { letterSpacingPx: 11 }, { wordSpacingPx: 51 }],
    }),
    resolve: metrics.resolveP15ElementorButtonTypographyMetrics,
    serialize: metrics.serializeP15ElementorButtonTypographyMetricsSummary as (r: never) => string,
  },
  {
    id: 'button-responsive-typography-metrics',
    spec: buttonSpec(responsiveMetrics.P15_ELEMENTOR_BUTTON_RESPONSIVE_TYPOGRAPHY_METRICS_MANIFEST_VERSION, {
      tabletValid: { tabletFontSizePx: 14, tabletLineHeightPx: 20, tabletLetterSpacingPx: 0.5 },
      mobileValid: { mobileFontSizePx: 12, mobileWordSpacingPx: 2 },
      invalidValues: [{ tabletFontSizePx: 201 }, { mobileLineHeightPx: 0 }, { tabletLetterSpacingPx: -5.05 }, { mobileWordSpacingPx: -1 }, { tabletFontSizePx: 14, mobileLetterSpacingPx: 20 }],
    }),
    resolve: responsiveMetrics.resolveP15ElementorButtonResponsiveTypographyMetrics,
    serialize: responsiveMetrics.serializeP15ElementorButtonResponsiveTypographyMetricsSummary as (r: never) => string,
  },
  {
    id: 'button-linear-gradient',
    spec: buttonSpec(linear.P15_ELEMENTOR_BUTTON_LINEAR_GRADIENT_MANIFEST_VERSION, {
      extraFlags: ['gradientInferencePerformed'],
      tabletValid: { normal: linearGradient },
      mobileValid: { hover: { colorA: '#000000', colorB: '#ffffff', stopA: 50, stopB: 50, mobileStopA: 5, mobileStopB: 6, tabletAngleDeg: 0 } },
      invalidValues: [
        { normal: { ...linearGradient, stopA: 60, stopB: 40 } },
        { normal: { ...linearGradient, tabletStopB: undefined } },
        { hover: { ...linearGradient, angleDeg: 361 } },
        { hover: { ...linearGradient, colorA: '#FF0000' } },
        { normal: { colorA: '#ff0000', colorB: '#0000ff', stopA: 0 } },
        { normal: { ...linearGradient, position: 'top left' } },
        { normal: undefined },
      ],
    }),
    resolve: linear.resolveP15ElementorButtonLinearGradients,
    serialize: linear.serializeP15ElementorButtonLinearGradientSummary as (r: never) => string,
  },
  {
    id: 'button-radial-gradient',
    spec: buttonSpec(radial.P15_ELEMENTOR_BUTTON_RADIAL_GRADIENT_MANIFEST_VERSION, {
      extraFlags: ['gradientInferencePerformed'],
      tabletValid: { normal: radialGradient },
      mobileValid: { hover: { ...radialGradient, mobilePosition: 'center center', tabletPosition: undefined } },
      invalidValues: [
        { normal: { ...radialGradient, position: 'middle' } },
        { normal: { colorA: '#ff0000', colorB: '#0000ff', stopA: 0, stopB: 1 } },
        { hover: { ...radialGradient, mobileStopB: undefined } },
        { hover: { ...radialGradient, angleDeg: 10 } },
      ],
    }),
    resolve: radial.resolveP15ElementorButtonRadialGradients,
    serialize: radial.serializeP15ElementorButtonRadialGradientSummary as (r: never) => string,
  },
];

describe('recovery M1.4d — button typography and gradient family golden equivalence', () => {
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
