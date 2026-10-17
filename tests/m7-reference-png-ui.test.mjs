import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extendP15LocalTemplateDownloadUi } from '../scripts/p15-local-template-download-ui.mjs';

describe('recovery M7.1 — reference PNG export wiring', () => {
  it('the controller renders at scale 1, read-only, from the confirmed set or one selected Frame; the UI downloads only a valid bundle', () => {
    const controller = readFileSync('src/plugin/p15-reference-png-controller.ts', 'utf8');
    expect(controller).toContain("exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } })");
    expect(controller).toContain('confirmedP15BreakpointSet()');
    expect(controller).not.toMatch(/\.remove\(\)|appendChild|clientStorage|\.name = /);
    expect(readFileSync('src/plugin/entry.ts', 'utf8')).toContain("import './p15-reference-png-controller';");
    const ui = extendP15LocalTemplateDownloadUi(readFileSync('src/ui/ui.html', 'utf8'));
    expect(ui).toContain('<button id="p15-reference-pngs">Export reference PNGs</button>');
    expect(ui).toContain("post('p15-reference-png-request')");
    expect(ui).toContain("receipt.roundTripStatus === 'NOT_RUN'");
    expect(ui).toContain('/^reference-pngs-[0-9a-f]{16}\\.zip$/');
  });
});
