import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extendP15LocalTemplateDownloadUi } from '../scripts/p15-local-template-download-ui.mjs';

const ui = extendP15LocalTemplateDownloadUi(readFileSync('src/ui/ui.html', 'utf8'));

function extractTargetResultBankId() {
  const match = ui.match(/function targetResultBankId\(message\) \{[\s\S]*?\n    \}/);
  expect(match).not.toBeNull();
  return new Function(`${match[0]}; return targetResultBankId;`)();
}

describe('recovery M6.2 — changing the target clears stale results', () => {
  it('clears the preview/validation view when the Elementor target changes', () => {
    expect(ui).toContain("clearStaleTargetResults(); post('option-bank-selection', { optionBankId: selectedOptionBankId })");
    expect(ui).toContain('Target changed. The previous Elementor preview and validation results were cleared');
  });

  it('drops late preview/download results built for a different target before any renderer runs', () => {
    const guard = "if (resultBankId !== undefined && resultBankId !== selectedOptionBankId) return;";
    expect(ui).toContain(guard);
    expect(ui.indexOf(guard)).toBeLessThan(ui.indexOf("message.type === 'p15-elementor-preview-result') {\n        exportPanel"));
    expect(ui.indexOf(guard)).toBeLessThan(ui.indexOf("message.type === 'p15-elementor-local-template-download-result') {"));
    const bankOf = extractTargetResultBankId();
    expect(bankOf({ type: 'p15-elementor-preview-result', optionBank: { id: 'a' } })).toBe('a');
    expect(bankOf({ type: 'p15-elementor-local-template-download-result', result: { source: { optionBankId: 'b' } } })).toBe('b');
    expect(bankOf({ type: 'p15-elementor-local-template-download-result', result: { source: { optionBankId: null } } })).toBeNull();
    expect(bankOf({ type: 'audit-result' })).toBeUndefined();
  });

  it('the download receipt carries the profile id and adapter version', () => {
    const source = readFileSync('src/plugin/p15-local-template-download.ts', 'utf8');
    expect(source).toContain('profileId: profile?.profileId ?? null');
    expect(source).toContain('adapterVersion: profile?.adapterVersion ?? null');
  });
});
