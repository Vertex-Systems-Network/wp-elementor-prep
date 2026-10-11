import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildReleaseUi } from '../scripts/release-ui-contract.mjs';
import { buildSecureUi } from '../scripts/ui-security-contract.mjs';

const developmentUi = readFileSync('src/ui/ui.html', 'utf8');

function assertPixelBrokerGuards(ui) {
  expect(ui).toContain('const MAX_PIXEL_PNG_BYTES = 32 * 1024 * 1024;');
  expect(ui).toContain('const MAX_PIXEL_DIMENSION = 2048;');
  expect(ui).toContain('function boundedPngBytes(value, maxBytes = MAX_PIXEL_PNG_BYTES)');
  // Recovery M5.4: full-resolution limits apply only to validated tiled requests.
  expect(ui).toContain('const MAX_FULL_RES_DIMENSION = 16384;');
  expect(ui).toContain('const MAX_FULL_RES_PIXELS = 64 * 1024 * 1024;');
  expect(ui).toContain('function isSafeTiledRequest(value)');
  expect(ui).toContain("throw new Error('Pixel broker tiled request is invalid.');");
  expect(ui).toContain('decodePng(message.beforePng, tiled !== null)');
  expect(ui).toContain('function isSafeValidationId(value)');
  expect(ui).toContain('function isSafeChannelTolerance(value)');
  expect(ui).toContain("const eventData = event && isRecord(event.data) ? event.data : null;");
  expect(ui).toContain("if (!message || typeof message.type !== 'string') return;");
  expect(ui).toContain('if (validationId === null) throw new Error');
  expect(ui).toContain('const maxDimension = fullResolution ? MAX_FULL_RES_DIMENSION : MAX_PIXEL_DIMENSION;');
  expect(ui).toContain('bitmap.width > maxDimension');
  expect(ui).not.toContain('const message = event.data.pluginMessage;');
  expect(ui).not.toContain("const blob = new Blob([bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)]");
}

describe('UI security contract', () => {
  it('hardens the development UI message and PNG broker boundaries', () => {
    const secured = buildSecureUi(developmentUi);
    assertPixelBrokerGuards(secured);
  });

  it('retains the same security guards in the publishable release UI', () => {
    const release = buildReleaseUi(developmentUi);
    assertPixelBrokerGuards(release);
  });

  it('fails closed if the raw UI contract drifts before hardening', () => {
    const drifted = developmentUi.replace('async function decodePng(bytes)', 'async function decodePngDrifted(bytes)');
    expect(() => buildSecureUi(drifted)).toThrow(/UI security contract drifted/);
  });

  it('requires normal development builds to pass through the security transform', () => {
    const buildScript = readFileSync('scripts/build.mjs', 'utf8');
    expect(buildScript).toContain("import { buildSecureUi } from './ui-security-contract.mjs';");
    expect(buildScript).toContain("await writeFile('dist/ui.html', buildSecureUi(developmentUi), 'utf8');");
    expect(buildScript).not.toContain("await cp('src/ui/ui.html', 'dist/ui.html')");
  });
});
