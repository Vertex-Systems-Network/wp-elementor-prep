import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extendP15LocalTemplateDownloadUi } from '../scripts/p15-local-template-download-ui.mjs';

describe('recovery M4.1 — breakpoint set confirmation', () => {
  it('the controller confirms only the exact set shown, re-read from the current selection', () => {
    const controller = readFileSync('src/plugin/p15-breakpoint-set-controller.ts', 'utf8');
    expect(controller).toContain("type === 'p15-breakpoint-set-request'");
    expect(controller).toContain("type === 'p15-breakpoint-set-confirm'");
    expect(controller).toContain("set.status !== 'BREAKPOINT_SET'");
    expect(controller).toContain('set.fingerprint !== fingerprint');
    expect(controller).toContain("figma.on('selectionchange'");
    expect(controller).not.toContain('clientStorage');
  });

  it('the UI shows the classified frames and offers confirmation only for a clean set', () => {
    const ui = extendP15LocalTemplateDownloadUi(readFileSync('src/ui/ui.html', 'utf8'));
    expect(ui).toContain('<button id="p15-breakpoints">Detect breakpoints</button>');
    expect(ui).toContain("post('p15-breakpoint-set-request')");
    expect(ui).toContain("post('p15-breakpoint-set-confirm', { fingerprint })");
    expect(ui).toContain("set.status === 'BREAKPOINT_SET' && typeof set.fingerprint === 'string' && issues.length === 0");
    expect(ui).toContain('BREAKPOINT SET CONFIRMED');
    expect(ui).toContain('BREAKPOINT SET NEEDS REVIEW');
  });
});
