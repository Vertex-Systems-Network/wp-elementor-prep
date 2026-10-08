import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { injectOptionBankRegistry, OPTION_BANK_UI_PLACEHOLDER, serializeOptionBankRegistry } from '../scripts/option-bank-ui.mjs';
import { assertNoUnresolvedBuildPlaceholders, assertReleaseUiCapabilities, buildReleaseUi } from '../scripts/release-ui-contract.mjs';

const developmentUi = await readFile('src/ui/ui.html', 'utf8');
const registry = JSON.parse(await readFile('docs/option-bank/registry.json', 'utf8'));

describe('recovery M0.1 — release UI build placeholders', () => {
  it('substitutes the option-bank registry into the publishable UI', () => {
    const releaseUi = buildReleaseUi(developmentUi);
    expect(releaseUi).not.toContain(OPTION_BANK_UI_PLACEHOLDER);
    expect(releaseUi).not.toMatch(/__[A-Z][A-Z0-9_]*__/);
    for (const entry of [...registry.elementor, ...registry.gutenberg]) {
      expect(releaseUi).toContain(JSON.stringify(entry.id));
    }
  });

  it('rejects a publishable UI that still contains a build placeholder', () => {
    expect(() => assertNoUnresolvedBuildPlaceholders('const x = __SOME_TOKEN__;')).toThrow(/__SOME_TOKEN__/);
    const releaseUi = buildReleaseUi(developmentUi);
    expect(() => assertReleaseUiCapabilities(`${releaseUi}\n<!-- ${OPTION_BANK_UI_PLACEHOLDER} -->`)).toThrow(/unresolved build placeholder/);
  });

  it('fails closed when the UI placeholder or registry shape is missing', () => {
    expect(() => injectOptionBankRegistry('<script>const a = 1;</script>', '{"elementor":[],"gutenberg":[]}')).toThrow(/missing __OPTION_BANK_REGISTRY__/);
    expect(() => serializeOptionBankRegistry('{"elementor":[]}')).toThrow(/elementor and gutenberg arrays/);
    expect(() => serializeOptionBankRegistry('not json')).toThrow();
  });

  it('escapes markup so registry content cannot close the inline script', () => {
    const injected = injectOptionBankRegistry(`const r = ${OPTION_BANK_UI_PLACEHOLDER};`, JSON.stringify({ elementor: [{ id: '</script><b>' }], gutenberg: [] }));
    expect(injected).not.toContain('</script>');
    expect(injected).toContain('\\u003c/script>');
  });
});
