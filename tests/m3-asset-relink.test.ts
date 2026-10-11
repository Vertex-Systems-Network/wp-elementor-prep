import { describe, expect, it } from 'vitest';
import { relinkP15PackAssets } from '../src/targets/elementor/asset-relink';

const template = JSON.stringify({ content: [{ elType: 'container', settings: { background_image: { url: 'assets/original-h.jpg', id: 0 } }, elements: [
  { elType: 'widget', widgetType: 'image', settings: { image: { url: 'assets/render-1-1@2x.png', id: 0 }, image_size: 'full' }, elements: [] },
  { elType: 'widget', widgetType: 'image', settings: { image: { url: 'https://cdn.example.com/kept.png', id: 9 } }, elements: [] },
  { elType: 'widget', widgetType: 'text-editor', settings: { editor: '<p>assets/render-1-1@2x.png is text, not media</p>' }, elements: [] },
] }] });

describe('recovery M3.6a — relink pack assets to uploaded attachments', () => {
  it('rewrites every pack media reference to its attachment id and URL, leaving everything else untouched', () => {
    const result = relinkP15PackAssets(template, new Map([
      ['assets/original-h.jpg', { id: 11, url: 'https://site.test/wp-content/uploads/original-h.jpg' }],
      ['assets/render-1-1@2x.png', { id: 12, url: 'https://site.test/wp-content/uploads/render-1-1@2x.png' }],
    ]));
    expect(result.status).toBe('RELINKED');
    expect(result.relinked).toEqual(['assets/original-h.jpg', 'assets/render-1-1@2x.png']);
    const parsed = JSON.parse(result.templateJson);
    expect(parsed.content[0].settings.background_image).toEqual({ url: 'https://site.test/wp-content/uploads/original-h.jpg', id: 11 });
    expect(parsed.content[0].elements[0].settings).toEqual({ image: { url: 'https://site.test/wp-content/uploads/render-1-1@2x.png', id: 12 }, image_size: 'full' });
    expect(parsed.content[0].elements[1].settings.image).toEqual({ url: 'https://cdn.example.com/kept.png', id: 9 });
    expect(parsed.content[0].elements[2].settings.editor).toContain('assets/render-1-1@2x.png is text');
  });

  it('a missing or invalid upload leaves the reference and reports it', () => {
    const result = relinkP15PackAssets(template, new Map([['assets/original-h.jpg', { id: 0, url: 'https://site.test/a.jpg' }],
      ['assets/render-1-1@2x.png', { id: 5, url: 'javascript:alert(1)' }]]));
    expect(result).toMatchObject({ status: 'INCOMPLETE', relinked: [], unresolved: ['assets/original-h.jpg', 'assets/render-1-1@2x.png'] });
    expect(JSON.parse(result.templateJson).content[0].settings.background_image).toEqual({ url: 'assets/original-h.jpg', id: 0 });
  });
});
