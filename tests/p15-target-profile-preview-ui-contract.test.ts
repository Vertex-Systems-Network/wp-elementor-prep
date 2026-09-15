import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('P15 declared TargetProfile plugin UI contract', () => {
  it('wires bounded declared version inputs to an explicit read-only request/result path', () => {
    const html = readFileSync('src/ui/ui.html', 'utf8');
    const main = readFileSync('src/plugin/main.ts', 'utf8');

    expect(html).toContain('id="p15-wp-version"');
    expect(html).toContain('id="p15-elementor-version"');
    expect(html).toContain('maxlength="64"');
    expect(html).toContain('Versions entered here are user-declared only.');
    expect(html).toContain("post('p15-elementor-target-profile-request'");
    expect(html).toContain("message.type === 'p15-elementor-target-profile-result'");
    expect(html).toContain("message.type === 'p15-elementor-target-profile-unavailable'");
    expect(html).toContain('DECLARED METADATA ALIGNMENT ONLY');

    expect(main).toContain("type === 'p15-elementor-target-profile-request'");
    expect(main).toContain("type: 'p15-elementor-target-profile-result'");
    expect(main).toContain("type: 'p15-elementor-target-profile-unavailable'");
    expect(main).toContain('buildP15ElementorV1PreviewFromFigmaFrame(frame)');
    expect(main).toContain('buildP15TargetProfilePreviewReport(');
  });

  it('does not add P15 artifact download, clipboard, import or target-site network actions', () => {
    const html = readFileSync('src/ui/ui.html', 'utf8');
    const main = readFileSync('src/plugin/main.ts', 'utf8');
    const combined = `${html}\n${main}`;

    expect(combined).not.toContain('export-p15');
    expect(combined).not.toContain("downloadText('elementor");
    expect(combined).not.toContain('p15-elementor-import-request');
    expect(combined).not.toContain('p15-elementor-copy-request');
    expect(combined).not.toContain('p15-elementor-upload-request');
    expect(combined).not.toContain('fetch(');
    expect(combined).not.toContain('XMLHttpRequest');
  });
});
