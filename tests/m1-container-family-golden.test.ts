import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerGaps,
  serializeP15ElementorResponsiveGapSummary,
} from '../src/targets/elementor/responsive-gap-resolution';
import {
  P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerPadding,
  serializeP15ElementorResponsivePaddingSummary,
} from '../src/targets/elementor/responsive-padding-resolution';
import {
  P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION,
  resolveP15ElementorResponsiveContainerMargin,
  serializeP15ElementorResponsiveMarginSummary,
} from '../src/targets/elementor/responsive-margin-resolution';
import { buildCorpus, goldenRecord, type FamilyCorpusSpec } from './golden/m1-container-family-corpus';

const box = { top: 4, right: 8, bottom: 12, left: 16 };
const linkedBox = { top: 6, right: 6, bottom: 6, left: 6 };
const boxInvalid = (field: string) => [
  { [field]: { ...box, top: -1 } },
  { [field]: { ...box, left: 4097 } },
  { [field]: { top: 1, right: 1, bottom: 1 } },
  { [field]: { ...box, unit: 'px' } },
  { [field]: '8px' },
  { [field]: { ...box, top: Number.NaN } },
];

const FAMILIES: Array<{ id: string; spec: FamilyCorpusSpec; resolve: (s: unknown, m: unknown) => unknown; serialize: (r: never) => string }> = [
  {
    id: 'responsive-gap',
    spec: {
      manifestVersion: P15_ELEMENTOR_RESPONSIVE_GAP_MANIFEST_VERSION,
      tabletValid: { tabletGapPx: 12 },
      mobileValid: { mobileRowGapPx: 4, mobileColumnGapPx: 10 },
      invalidValues: [{ tabletGapPx: -1 }, { tabletGapPx: 4097 }, { mobileGapPx: '8' }, { tabletRowGapPx: 2, tabletColumnGapPx: Number.POSITIVE_INFINITY }],
      extraInvalid: [{ tabletGapPx: 4, tabletRowGapPx: 2, tabletColumnGapPx: 2 }, { mobileRowGapPx: 2 }, { tabletColumnGapPx: 3 }],
    },
    resolve: resolveP15ElementorResponsiveContainerGaps,
    serialize: serializeP15ElementorResponsiveGapSummary as (r: never) => string,
  },
  {
    id: 'responsive-padding',
    spec: {
      manifestVersion: P15_ELEMENTOR_RESPONSIVE_PADDING_MANIFEST_VERSION,
      tabletValid: { tabletPaddingPx: box },
      mobileValid: { mobilePaddingPx: linkedBox },
      invalidValues: boxInvalid('tabletPaddingPx'),
    },
    resolve: resolveP15ElementorResponsiveContainerPadding,
    serialize: serializeP15ElementorResponsivePaddingSummary as (r: never) => string,
  },
  {
    id: 'responsive-margin',
    spec: {
      manifestVersion: P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION,
      tabletValid: { tabletMarginPx: box },
      mobileValid: { mobileMarginPx: linkedBox },
      invalidValues: boxInvalid('mobileMarginPx'),
    },
    resolve: resolveP15ElementorResponsiveContainerMargin,
    serialize: serializeP15ElementorResponsiveMarginSummary as (r: never) => string,
  },
];

describe('recovery M1.3 — container family golden equivalence', () => {
  for (const family of FAMILIES) {
    it(`${family.id} reproduces the recorded original-resolver outputs exactly`, () => {
      const path = `tests/golden/m1-${family.id}.golden.json`;
      const records = buildCorpus(family.spec).map((testCase) => goldenRecord(family.resolve, family.serialize, testCase));
      if (process.env.GOLDEN_WRITE === '1') {
        writeFileSync(path, `${JSON.stringify(records, null, 1)}\n`);
      }
      expect(existsSync(path)).toBe(true);
      const golden = JSON.parse(readFileSync(path, 'utf8')) as unknown[];
      expect(records.length).toBe(golden.length);
      records.forEach((record, index) => expect(record).toEqual(golden[index]));
    });
  }
});
