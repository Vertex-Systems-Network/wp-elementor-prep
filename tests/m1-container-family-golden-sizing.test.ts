import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as alignSelf from '../src/targets/elementor/responsive-flex-item-align-self-resolution';
import * as basis from '../src/targets/elementor/responsive-flex-item-basis-resolution';
import * as factors from '../src/targets/elementor/responsive-flex-item-factors-resolution';
import * as orderPreset from '../src/targets/elementor/responsive-flex-item-order-preset-resolution';
import * as customOrder from '../src/targets/elementor/responsive-flex-item-custom-order-resolution';
import * as minHeight from '../src/targets/elementor/responsive-min-height-resolution';
import * as boxedWidth from '../src/targets/elementor/responsive-boxed-width-resolution';
import * as fullWidth from '../src/targets/elementor/responsive-full-width-resolution';
import * as zIndex from '../src/targets/elementor/responsive-z-index-resolution';
import { buildCorpus, goldenRecord, type FamilyCorpusSpec } from './golden/m1-container-family-corpus';

type Family = { id: string; spec: FamilyCorpusSpec; resolve: (s: unknown, m: unknown) => unknown; serialize: (r: never) => string };

const FAMILIES: Family[] = [
  {
    id: 'responsive-flex-item-align-self',
    spec: {
      manifestVersion: alignSelf.P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION,
      tabletValid: { tabletAlignSelf: 'end' },
      mobileValid: { mobileAlignSelf: 'stretch' },
      invalidValues: [{ tabletAlignSelf: 'flex-end' }, { mobileAlignSelf: 'baseline' }, { tabletAlignSelf: 2 }],
    },
    resolve: alignSelf.resolveP15ElementorResponsiveContainerAlignSelf,
    serialize: alignSelf.serializeP15ElementorResponsiveFlexItemAlignSelfSummary as (r: never) => string,
  },
  {
    id: 'responsive-flex-item-basis',
    spec: {
      manifestVersion: basis.P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION,
      tabletValid: { tabletBasisCustom: true, tabletBasisPx: 240 },
      mobileValid: { mobileBasisCustom: true, mobileBasisPx: 0 },
      invalidValues: [{ tabletBasisCustom: true, tabletBasisPx: 1001 }, { tabletBasisCustom: false, tabletBasisPx: 10 }, { mobileBasisCustom: true, mobileBasisPx: 1.5 }, { tabletBasisPx: 10 }, { mobileBasisCustom: true }],
    },
    resolve: basis.resolveP15ElementorResponsiveContainerFlexItemBasis,
    serialize: basis.serializeP15ElementorResponsiveFlexItemBasisSummary as (r: never) => string,
  },
  {
    id: 'responsive-flex-item-order-preset',
    spec: {
      manifestVersion: orderPreset.P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION,
      tabletValid: { tabletOrderPreset: 'start' },
      mobileValid: { mobileOrderPreset: 'end' },
      invalidValues: [{ tabletOrderPreset: 'custom' }, { mobileOrderPreset: -99999 }, { tabletOrderPreset: 'START' }],
    },
    resolve: orderPreset.resolveP15ElementorResponsiveContainerOrderPreset,
    serialize: orderPreset.serializeP15ElementorResponsiveFlexItemOrderPresetSummary as (r: never) => string,
  },
  {
    id: 'responsive-flex-item-custom-order',
    spec: {
      manifestVersion: customOrder.P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION,
      tabletValid: { tabletOrderCustom: true, tabletOrderValue: -5 },
      mobileValid: { mobileOrderCustom: true, mobileOrderValue: 1000 },
      invalidValues: [{ tabletOrderCustom: true, tabletOrderValue: 1001 }, { tabletOrderCustom: 'custom', tabletOrderValue: 1 }, { mobileOrderValue: 3 }, { mobileOrderCustom: true }, { tabletOrderCustom: true, tabletOrderValue: 2.5 }],
    },
    resolve: customOrder.resolveP15ElementorResponsiveContainerFlexItemCustomOrder,
    serialize: customOrder.serializeP15ElementorResponsiveFlexItemCustomOrderSummary as (r: never) => string,
  },
  {
    id: 'responsive-min-height',
    spec: {
      manifestVersion: minHeight.P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION,
      tabletValid: { tabletMinHeightPx: 480 },
      mobileValid: { mobileMinHeightPx: 0 },
      invalidValues: [{ tabletMinHeightPx: 1441 }, { mobileMinHeightPx: -1 }, { tabletMinHeightPx: 10.5 }, { mobileMinHeightPx: '400' }],
    },
    resolve: minHeight.resolveP15ElementorResponsiveContainerMinHeight,
    serialize: minHeight.serializeP15ElementorResponsiveMinHeightSummary as (r: never) => string,
  },
  {
    id: 'responsive-boxed-width',
    spec: {
      manifestVersion: boxedWidth.P15_ELEMENTOR_RESPONSIVE_BOXED_WIDTH_MANIFEST_VERSION,
      tabletValid: { tabletBoxedWidthPx: 960 },
      mobileValid: { mobileBoxedWidthPx: 500 },
      invalidValues: [{ tabletBoxedWidthPx: 499 }, { mobileBoxedWidthPx: 1601 }, { tabletBoxedWidthPx: 960.5 }],
    },
    resolve: boxedWidth.resolveP15ElementorResponsiveContainerBoxedWidth,
    serialize: boxedWidth.serializeP15ElementorResponsiveBoxedWidthSummary as (r: never) => string,
  },
  {
    id: 'responsive-full-width',
    spec: {
      manifestVersion: fullWidth.P15_ELEMENTOR_RESPONSIVE_FULL_WIDTH_MANIFEST_VERSION,
      entryBase: { contentWidthMode: 'full' },
      tabletValid: { tabletWidthPx: 1200 },
      mobileValid: { mobileWidthPx: 600 },
      invalidValues: [{ tabletWidthPx: 499 }, { mobileWidthPx: 1601 }, { tabletWidthPx: 700.25 }],
      extraInvalid: [{ contentWidthMode: 'boxed', tabletWidthPx: 800 }, { contentWidthMode: undefined, mobileWidthPx: 800 }],
    },
    resolve: fullWidth.resolveP15ElementorResponsiveContainerFullWidth,
    serialize: fullWidth.serializeP15ElementorResponsiveFullWidthSummary as (r: never) => string,
  },
  {
    id: 'responsive-z-index',
    spec: {
      manifestVersion: zIndex.P15_ELEMENTOR_RESPONSIVE_Z_INDEX_MANIFEST_VERSION,
      tabletValid: { tabletZIndex: 10 },
      mobileValid: { mobileZIndex: 0 },
      invalidValues: [{ tabletZIndex: 10000 }, { mobileZIndex: -1 }, { tabletZIndex: 1.5 }],
    },
    resolve: zIndex.resolveP15ElementorResponsiveContainerZIndex,
    serialize: zIndex.serializeP15ElementorResponsiveZIndexSummary as (r: never) => string,
  },
];

describe('recovery M1.3c — flex item and sizing family golden equivalence', () => {
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

/**
 * Flex-item factors target repair (recovery M2.3c): `flex-item.php` conditions `grow`/`shrink` on
 * `size === 'custom'` and `controls-stack.php` reads the same-device `size` first, so the v1 writes were
 * ignored by Elementor. The v1 golden stays as the "before" record (never re-recorded); the v2 output
 * must be exactly the v1 output plus `_flex_size_<device>: 'custom'` for every device that sets a factor,
 * under the v2 manifest/result versions and the extended evidence, with only the resolved candidate digest changing.
 */
const FACTORS: Family = {
    id: 'responsive-flex-item-factors',
    spec: {
      manifestVersion: factors.P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION,
      tabletValid: { tabletGrow: 1, tabletShrink: 0 },
      mobileValid: { mobileGrow: 0, mobileShrink: 1 },
      invalidValues: [{ tabletGrow: 2 }, { mobileShrink: -1 }, { tabletGrow: '1' }, { mobileGrow: 0.5 }],
      extraInvalid: [{ mobileShrink: 0 }],
    },
    resolve: factors.resolveP15ElementorResponsiveContainerFlexItemFactors,
    serialize: factors.serializeP15ElementorResponsiveFlexItemFactorsSummary as (r: never) => string,
};

function normalized(value: unknown, repairWrites: boolean): unknown {
  if (Array.isArray(value)) return value.map((entry) => normalized(entry, repairWrites));
  if (value === null || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'resolvedCandidateIdentityDigest') out[key] = typeof entry === 'string' ? 'DIGEST' : entry;
    else if (key === 'templateJson' && typeof entry === 'string') out[key] = normalized(JSON.parse(entry), repairWrites);
    else out[key] = normalized(entry, repairWrites);
  }
  // The repaired evidence adds the size-condition fields; every original evidence field is unchanged.
  if (repairWrites && 'growControlName' in out) {
    const evidence = factors.P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE;
    for (const key of ['sizeControlName', 'sizeRequiredValue', 'tabletSizeSettingKey', 'mobileSizeSettingKey', 'controlsStackSourcePath', 'controlsStackSourceBlobSha'] as const) {
      out[key] = evidence[key];
    }
  }
  const settings = out.settings;
  if (repairWrites && settings && typeof settings === 'object' && !Array.isArray(settings)) {
    const record = settings as Record<string, unknown>;
    for (const device of ['tablet', 'mobile']) {
      if (`_flex_grow_${device}` in record || `_flex_shrink_${device}` in record) record[`_flex_size_${device}`] = 'custom';
    }
  }
  return out;
}

const parsedSerialized = (text: unknown, repairWrites: boolean) =>
  typeof text === 'string' && !text.startsWith('THROWS') ? normalized(JSON.parse(text), repairWrites) : text;

describe('recovery M2.3c — flex-item factors target repair against the v1 baseline', () => {
  it('v2 output is exactly the v1 output plus the per-device custom size', () => {
    const golden = JSON.parse(readFileSync('tests/golden/m1-responsive-flex-item-factors.golden.json', 'utf8')
      .replaceAll('flex-item-factors-manifest-v1', 'flex-item-factors-manifest-v2')
      .replaceAll('flex-item-factors-result-v1', 'flex-item-factors-result-v2')) as Array<Record<string, unknown>>;
    const records = buildCorpus(FACTORS.spec).map((testCase) => goldenRecord(FACTORS.resolve, FACTORS.serialize, testCase) as Record<string, unknown>);
    expect(records.map((record) => record.name)).toEqual(golden.map((record) => record.name));
    let repaired = 0;
    records.forEach((record, index) => {
      const original = golden[index]!;
      const name = String(record.name);
      expect(normalized(record.result, false), name).toEqual(normalized(original.result, true));
      expect(parsedSerialized(record.serialized, false), name).toEqual(parsedSerialized(original.serialized, true));
      expect(record.inflatedSerialized, name).toEqual(original.inflatedSerialized);
      if (JSON.stringify(record.result).includes('_flex_size_')) repaired += 1;
    });
    expect(repaired).toBeGreaterThan(0);
  });
});
