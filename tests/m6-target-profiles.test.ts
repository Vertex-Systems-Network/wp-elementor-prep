import { describe, expect, it } from 'vitest';
import {
  ELEMENTOR_PROPERTY_FAMILIES,
  OPTION_BANK_REGISTRY,
  classifyElementorSettingKey,
  filterElementorSettingsByFamilies,
} from '../src/core/option-bank';
import { buildP15ElementorV1PreviewFromFigmaFrame } from '../src/plugin/p15-neutral-export-extractor';
import { buildP15LocalTemplateDownloadResult } from '../src/plugin/p15-local-template-download';

function simpleFrame(): FrameNode {
  return {
    id: '1:1', name: 'Simple', type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP',
    layoutPositioning: 'AUTO', itemSpacing: 8, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
    primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', fills: [],
    children: [{ id: '1:2', name: 'Copy', type: 'TEXT', visible: true, characters: 'Hello', textAlignHorizontal: 'LEFT', fills: [] }],
  } as unknown as FrameNode;
}

describe('recovery M6.1 — version-driven Elementor target profiles', () => {
  it('every Elementor bank carries a profile; v3-Container and v4-Atomic entries exist; Gutenberg banks carry none', () => {
    for (const entry of OPTION_BANK_REGISTRY.elementor) expect(entry.profile).toBeDefined();
    const structures = OPTION_BANK_REGISTRY.elementor.map((entry) => entry.profile?.structure);
    expect(structures).toContain('V3_CONTAINER');
    expect(structures).toContain('V4_ATOMIC');
    expect(OPTION_BANK_REGISTRY.elementor.some((e) => e.profile?.elementorVersionRange === '>=3.16 <4.0')).toBe(true);
    for (const entry of OPTION_BANK_REGISTRY.gutenberg) expect(entry.profile).toBeUndefined();
    const ids = OPTION_BANK_REGISTRY.elementor.map((e) => e.profile?.profileId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('v4-Atomic has no adapter yet, so its export is declared unsupported (never silently emitted as v3)', () => {
    const atomic = OPTION_BANK_REGISTRY.elementor.find((e) => e.profile?.structure === 'V4_ATOMIC')!;
    expect(atomic.status).toBe('UNSUPPORTED');
    expect(atomic.profile).toEqual(expect.objectContaining({ adapterVersion: null, exportSupported: false, propertyFamilies: [] }));
  });

  it('classifies setting keys into families deterministically', () => {
    expect(classifyElementorSettingKey('padding_tablet')).toBe('responsive');
    expect(classifyElementorSettingKey('background_hover_color')).toBe('hover');
    expect(classifyElementorSettingKey('box_shadow_box_shadow')).toBe('shadow');
    expect(classifyElementorSettingKey('typography_font_size')).toBe('typography');
    expect(classifyElementorSettingKey('background_color')).toBe('background');
    expect(classifyElementorSettingKey('border_radius')).toBe('border');
    expect(classifyElementorSettingKey('flex_gap')).toBe('spacing');
    expect(classifyElementorSettingKey('_z_index')).toBe('position');
    expect(classifyElementorSettingKey('flex_direction')).toBe('core');
    expect(classifyElementorSettingKey('title')).toBe('core');
  });

  it('strips families the descriptor omits and keeps core settings', () => {
    const template = { page_settings: [], content: [{ settings: { title: 'x', typography_font_size: 1, padding: 2, padding_mobile: 3 }, elements: [{ settings: { border_width: 1 }, elements: [] }] }] };
    const filtered = filterElementorSettingsByFamilies(template, ['spacing']);
    expect(filtered.content[0]!.settings).toEqual({ title: 'x', padding: 2 });
    expect(filtered.content[0]!.elements[0]!.settings).toEqual([]);
    expect(template.content[0]!.settings).toHaveProperty('typography_font_size');
    expect(filterElementorSettingsByFamilies(template, ELEMENTOR_PROPERTY_FAMILIES)).toEqual(template);
  });

  it('download receipt carries profile id and adapter version; v4-Atomic download is blocked', () => {
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(simpleFrame());
    const v3 = OPTION_BANK_REGISTRY.elementor.find((e) => e.id === 'elementor:v3-container:3.16+')!;
    const ok = buildP15LocalTemplateDownloadResult({ id: '1:1' }, extraction, v3.id);
    expect(ok.status).toBe('LOCAL_ARTIFACT_VALIDATED');
    expect(ok.receipt).toEqual(expect.objectContaining({ profileId: 'elementor-v3-container@3.16', adapterVersion: v3.profile!.adapterVersion }));
    const atomic = OPTION_BANK_REGISTRY.elementor.find((e) => e.profile?.structure === 'V4_ATOMIC')!;
    const blocked = buildP15LocalTemplateDownloadResult({ id: '1:1' }, extraction, atomic.id);
    expect(blocked.status).toBe('DOWNLOAD_BLOCKED');
    expect(blocked.blockReasonCodes).toContain('P15_DOWNLOAD_PROFILE_EXPORT_UNSUPPORTED');
    expect(blocked.templateJson).toBeNull();
  });
});
