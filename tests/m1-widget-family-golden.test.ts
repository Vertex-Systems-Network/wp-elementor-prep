import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as headingColor from '../src/targets/elementor/heading-text-color-resolution';
import * as textColor from '../src/targets/elementor/text-editor-text-color-resolution';
import * as textAlignment from '../src/targets/elementor/responsive-text-alignment-resolution';
import * as buttonAlignment from '../src/targets/elementor/responsive-button-alignment-resolution';
import { buildCorpus, goldenRecord, widgetSourceDocument, type FamilyCorpusSpec } from './golden/m1-container-family-corpus';

type Family = { id: string; spec: FamilyCorpusSpec; resolve: (s: unknown, m: unknown) => unknown; serialize: (r: never) => string };

const colorInvalid = [{ color: '#ABCDEF' }, { color: '#abc' }, { color: 'red' }, { color: undefined }];

const FAMILIES: Family[] = [
  {
    id: 'heading-text-color',
    spec: {
      manifestVersion: headingColor.P15_ELEMENTOR_HEADING_TEXT_COLOR_MANIFEST_VERSION,
      source: widgetSourceDocument,
      entriesField: 'headings',
      extraFlags: ['colorInferencePerformed'],
      primaryId: 'title',
      secondaryId: 'subtitle',
      wrongKindId: 'copy',
      tabletValid: { color: '#112233' },
      mobileValid: { color: '#aabbcc' },
      invalidValues: colorInvalid,
    },
    resolve: headingColor.resolveP15ElementorHeadingTextColors,
    serialize: headingColor.serializeP15ElementorHeadingTextColorSummary as (r: never) => string,
  },
  {
    id: 'text-editor-text-color',
    spec: {
      manifestVersion: textColor.P15_ELEMENTOR_TEXT_EDITOR_TEXT_COLOR_MANIFEST_VERSION,
      source: widgetSourceDocument,
      entriesField: 'texts',
      extraFlags: ['colorInferencePerformed'],
      primaryId: 'copy',
      secondaryId: 'body',
      wrongKindId: 'title',
      tabletValid: { color: '#445566' },
      mobileValid: { color: '#000000' },
      invalidValues: colorInvalid,
    },
    resolve: textColor.resolveP15ElementorTextEditorTextColors,
    serialize: textColor.serializeP15ElementorTextEditorTextColorSummary as (r: never) => string,
  },
  {
    id: 'responsive-text-alignment',
    spec: {
      manifestVersion: textAlignment.P15_ELEMENTOR_RESPONSIVE_TEXT_ALIGNMENT_MANIFEST_VERSION,
      source: widgetSourceDocument,
      entriesField: 'widgets',
      primaryId: 'title',
      secondaryId: 'body',
      wrongKindId: 'cta',
      tabletValid: { tabletAlign: 'end' },
      mobileValid: { mobileAlign: 'justify' },
      invalidValues: [{ tabletAlign: 'justify' }, { mobileAlign: 'left' }, { tabletAlign: 'center', mobileAlign: 3 }, { tabletAlign: 'START' }],
    },
    resolve: textAlignment.resolveP15ElementorResponsiveTextAlignments,
    serialize: textAlignment.serializeP15ElementorResponsiveTextAlignmentSummary as (r: never) => string,
  },
  {
    id: 'responsive-button-alignment',
    spec: {
      manifestVersion: buttonAlignment.P15_ELEMENTOR_RESPONSIVE_BUTTON_ALIGNMENT_MANIFEST_VERSION,
      source: widgetSourceDocument,
      entriesField: 'widgets',
      primaryId: 'cta',
      secondaryId: 'cta2',
      wrongKindId: 'title',
      tabletValid: { tabletAlign: 'justify' },
      mobileValid: { mobileAlign: 'left' },
      invalidValues: [{ tabletAlign: 'start' }, { mobileAlign: 'end' }, { tabletAlign: 'center', mobileAlign: null }, { tabletAlign: 'Right' }],
    },
    resolve: buttonAlignment.resolveP15ElementorResponsiveButtonAlignments,
    serialize: buttonAlignment.serializeP15ElementorResponsiveButtonAlignmentSummary as (r: never) => string,
  },
];

describe('recovery M1.4a — widget family golden equivalence', () => {
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
