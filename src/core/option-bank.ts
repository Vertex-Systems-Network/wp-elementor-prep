export type OptionBankEntry = {
  id: string;
  label: string;
  snapshot: string;
  status: 'INVENTORIED' | 'MAPPED' | 'RUNTIME_REQUIRED' | 'UNSUPPORTED';
  generatedAt: string;
};
export const OPTION_BANK_REGISTRY: {
  schemaVersion: 1;
  elementor: OptionBankEntry[];
  gutenberg: OptionBankEntry[];
} = {
  schemaVersion: 1,
  elementor: [
    { id: 'elementor:4.3.2:4.3.0', label: 'Elementor Free 4.3.2 + Pro 4.3.0', snapshot: 'elementor-4.3.2-4.3.0.json', status: 'INVENTORIED', generatedAt: '2026-09-28' },
  ],
  gutenberg: [
    { id: 'gutenberg:wordpress-docs-current', label: 'Gutenberg / WordPress official contracts (current)', snapshot: 'gutenberg-official-contracts.json', status: 'INVENTORIED', generatedAt: '2026-09-28' },
  ],
};
export function findOptionBank(id: string | undefined): OptionBankEntry | undefined {
  return [...OPTION_BANK_REGISTRY.elementor, ...OPTION_BANK_REGISTRY.gutenberg].find((entry) => entry.id === id);
}
