import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as textColor from '../src/targets/elementor/button-text-color-resolution';
import * as backgroundColor from '../src/targets/elementor/button-background-color-resolution';
import * as hoverTextColor from '../src/targets/elementor/button-hover-text-color-resolution';
import * as hoverBackgroundColor from '../src/targets/elementor/button-hover-background-color-resolution';
import * as hoverBorderColor from '../src/targets/elementor/button-hover-border-color-resolution';
import * as contentMetadata from '../src/targets/elementor/button-content-metadata-resolution';
import * as stretch from '../src/targets/elementor/button-stretch-content-alignment-resolution';
import { buildCorpus, goldenRecord, widgetSourceDocument, type FamilyCorpusSpec } from './golden/m1-container-family-corpus';

type Family = { id: string; spec: FamilyCorpusSpec; resolve: (s: unknown, m: unknown) => unknown; serialize: (r: never) => string };

const buttonSpec = (manifestVersion: string, rest: Partial<FamilyCorpusSpec> & Pick<FamilyCorpusSpec, 'tabletValid' | 'mobileValid' | 'invalidValues'>): FamilyCorpusSpec => ({
  manifestVersion,
  source: widgetSourceDocument,
  entriesField: 'buttons',
  primaryId: 'cta',
  secondaryId: 'cta2',
  wrongKindId: 'title',
  ...rest,
});

const colorSpec = (manifestVersion: string): FamilyCorpusSpec => buttonSpec(manifestVersion, {
  extraFlags: ['colorInferencePerformed'],
  tabletValid: { color: '#123abc' },
  mobileValid: { color: '#ffffff' },
  invalidValues: [{ color: '#FFFFFF' }, { color: '#fff' }, { color: 'transparent' }, { color: undefined }],
});

const FAMILIES: Family[] = [
  { id: 'button-text-color', spec: colorSpec(textColor.P15_ELEMENTOR_BUTTON_TEXT_COLOR_MANIFEST_VERSION), resolve: textColor.resolveP15ElementorButtonTextColors, serialize: textColor.serializeP15ElementorButtonTextColorSummary as (r: never) => string },
  { id: 'button-background-color', spec: colorSpec(backgroundColor.P15_ELEMENTOR_BUTTON_BACKGROUND_COLOR_MANIFEST_VERSION), resolve: backgroundColor.resolveP15ElementorButtonBackgroundColors, serialize: backgroundColor.serializeP15ElementorButtonBackgroundColorSummary as (r: never) => string },
  { id: 'button-hover-text-color', spec: colorSpec(hoverTextColor.P15_ELEMENTOR_BUTTON_HOVER_TEXT_COLOR_MANIFEST_VERSION), resolve: hoverTextColor.resolveP15ElementorButtonHoverTextColors, serialize: hoverTextColor.serializeP15ElementorButtonHoverTextColorSummary as (r: never) => string },
  { id: 'button-hover-background-color', spec: colorSpec(hoverBackgroundColor.P15_ELEMENTOR_BUTTON_HOVER_BACKGROUND_COLOR_MANIFEST_VERSION), resolve: hoverBackgroundColor.resolveP15ElementorButtonHoverBackgroundColors, serialize: hoverBackgroundColor.serializeP15ElementorButtonHoverBackgroundColorSummary as (r: never) => string },
  { id: 'button-hover-border-color', spec: colorSpec(hoverBorderColor.P15_ELEMENTOR_BUTTON_HOVER_BORDER_COLOR_MANIFEST_VERSION), resolve: hoverBorderColor.resolveP15ElementorButtonHoverBorderColors, serialize: hoverBorderColor.serializeP15ElementorButtonHoverBorderColorSummary as (r: never) => string },
  {
    id: 'button-content-metadata',
    spec: buttonSpec(contentMetadata.P15_ELEMENTOR_BUTTON_CONTENT_METADATA_MANIFEST_VERSION, {
      extraFlags: ['styleInferencePerformed'],
      omitFlags: ['responsiveClosureClaim'],
      tabletValid: { buttonType: 'success', buttonCssId: 'cta_Main_1' },
      mobileValid: { buttonSize: 'xl' },
      invalidValues: [{ buttonType: 'primary' }, { buttonSize: 'xxl' }, { buttonCssId: 'has-dash' }, { buttonCssId: '' }, { buttonCssId: 'x'.repeat(129) }, { buttonType: 'info', buttonSize: 'huge' }, { buttonType: undefined, buttonSize: undefined }],
    }),
    resolve: contentMetadata.resolveP15ElementorButtonContentMetadata,
    serialize: contentMetadata.serializeP15ElementorButtonContentMetadataSummary as (r: never) => string,
  },
  {
    id: 'button-stretch-content-alignment',
    spec: buttonSpec(stretch.P15_ELEMENTOR_BUTTON_STRETCH_CONTENT_ALIGNMENT_MANIFEST_VERSION, {
      extraFlags: ['styleInferencePerformed'],
      primaryId: 'cta2',
      secondaryId: 'cta',
      entryBase: { stretch: true },
      tabletValid: { tabletContentAlign: 'space-between', desktopContentAlign: 'center' },
      mobileValid: { mobileContentAlign: 'end' },
      invalidValues: [{ desktopContentAlign: 'left' }, { mobileContentAlign: 'justify' }, { tabletContentAlign: 7 }],
      extraInvalid: [{ stretch: false }, { stretch: 'yes', mobileContentAlign: 'end' }, { stretch: undefined }],
    }),
    resolve: stretch.resolveP15ElementorButtonStretchContentAlignments,
    serialize: stretch.serializeP15ElementorButtonStretchContentAlignmentSummary as (r: never) => string,
  },
];

describe('recovery M1.4b — button colour and content family golden equivalence', () => {
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
