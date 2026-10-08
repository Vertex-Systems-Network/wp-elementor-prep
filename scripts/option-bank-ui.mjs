import { readFileSync } from 'node:fs';

export const OPTION_BANK_UI_PLACEHOLDER = '__OPTION_BANK_REGISTRY__';
const OPTION_BANK_REGISTRY_PATH = 'docs/option-bank/registry.json';

/**
 * Serialises the repository option-bank registry for inline `<script>` use. The registry is
 * re-encoded from parsed JSON and `<` is escaped so registry content can never close the script.
 */
export function serializeOptionBankRegistry(rawRegistry) {
  const registry = JSON.parse(rawRegistry);
  if (!registry || !Array.isArray(registry.elementor) || !Array.isArray(registry.gutenberg)) {
    throw new Error('Option-bank registry must contain elementor and gutenberg arrays.');
  }
  return JSON.stringify(registry).replace(/</g, '\\u003c');
}

export function readOptionBankRegistry() {
  return readFileSync(OPTION_BANK_REGISTRY_PATH, 'utf8');
}

/** Substitutes the option-bank placeholder in the plugin UI; shared by development and release builds. */
export function injectOptionBankRegistry(ui, rawRegistry = readOptionBankRegistry()) {
  if (!ui.includes(OPTION_BANK_UI_PLACEHOLDER)) {
    throw new Error(`Plugin UI contract drifted: missing ${OPTION_BANK_UI_PLACEHOLDER} placeholder.`);
  }
  return ui.split(OPTION_BANK_UI_PLACEHOLDER).join(serializeOptionBankRegistry(rawRegistry));
}
