import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ELEMENTOR_OPTION_BANK_ID,
  OPTION_BANK_REGISTRY,
  findElementorOptionBank,
  findGutenbergOptionBank,
  resolveElementorOptionBank,
} from '../src/core/option-bank';
import { buildP15ElementorV1PreviewFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { buildP15LocalTemplateDownloadResult } from '../src/plugin/p15-local-template-download';

const ELEMENTOR_ID = OPTION_BANK_REGISTRY.elementor[0]!.id;
const GUTENBERG_ID = OPTION_BANK_REGISTRY.gutenberg[0]!.id;

function simpleFrame(): FrameNode {
  return {
    id: '1:1', name: 'Simple', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
    layoutPositioning: 'AUTO', itemSpacing: 8, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
    primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [],
    children: [{ id: '1:2', name: 'Copy', type: 'TEXT', visible: true, characters: 'Hello', textAlignHorizontal: 'LEFT', fills: [] }],
  } as unknown as FrameNode;
}

describe('recovery M0.9 — option-bank truth', () => {
  it('separates Elementor and Gutenberg banks and defaults to the first Elementor bank', () => {
    expect(DEFAULT_ELEMENTOR_OPTION_BANK_ID).toBe(ELEMENTOR_ID);
    expect(findElementorOptionBank(ELEMENTOR_ID)?.id).toBe(ELEMENTOR_ID);
    expect(findElementorOptionBank(GUTENBERG_ID)).toBeUndefined();
    expect(findGutenbergOptionBank(GUTENBERG_ID)?.id).toBe(GUTENBERG_ID);
    expect(findGutenbergOptionBank(ELEMENTOR_ID)).toBeUndefined();
  });

  it('refuses a Gutenberg bank or an unknown bank for Elementor output and falls back to the current selection', () => {
    expect(resolveElementorOptionBank(GUTENBERG_ID, ELEMENTOR_ID)).toEqual(expect.objectContaining({ ok: false, code: 'P15_OPTION_BANK_TARGET_MISMATCH' }));
    expect(resolveElementorOptionBank('elementor:9.9.9:9.9.9', ELEMENTOR_ID)).toEqual(expect.objectContaining({ ok: false, code: 'P15_OPTION_BANK_UNKNOWN' }));
    expect(resolveElementorOptionBank(42, ELEMENTOR_ID)).toEqual(expect.objectContaining({ ok: false }));
    expect(resolveElementorOptionBank(undefined, ELEMENTOR_ID)).toEqual({ ok: true, optionBank: OPTION_BANK_REGISTRY.elementor[0] });
    expect(resolveElementorOptionBank(undefined, GUTENBERG_ID)).toEqual(expect.objectContaining({ ok: false, code: 'P15_OPTION_BANK_TARGET_MISMATCH' }));
  });

  it('records the selected Elementor bank in the local download result and receipt', () => {
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(simpleFrame());
    const result = buildP15LocalTemplateDownloadResult({ id: '1:1' }, extraction, ELEMENTOR_ID);
    expect(result.status).toBe('LOCAL_ARTIFACT_VALIDATED');
    expect(result.source.optionBankId).toBe(ELEMENTOR_ID);
    expect(result.receipt?.optionBankId).toBe(ELEMENTOR_ID);
    expect(result.receipt?.targetCompatibilityClaim).toBe(false);
  });
});
