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

export const DEFAULT_ELEMENTOR_OPTION_BANK_ID = OPTION_BANK_REGISTRY.elementor[0]?.id ?? '';

/** Only Elementor banks may drive an Elementor preview/download; a Gutenberg bank is never attached to one. */
export function findElementorOptionBank(id: unknown): OptionBankEntry | undefined {
  return typeof id === 'string' ? OPTION_BANK_REGISTRY.elementor.find((entry) => entry.id === id) : undefined;
}

export function findGutenbergOptionBank(id: unknown): OptionBankEntry | undefined {
  return typeof id === 'string' ? OPTION_BANK_REGISTRY.gutenberg.find((entry) => entry.id === id) : undefined;
}

export type ElementorOptionBankResolution =
  | { ok: true; optionBank: OptionBankEntry }
  | { ok: false; code: 'P15_OPTION_BANK_TARGET_MISMATCH' | 'P15_OPTION_BANK_UNKNOWN'; message: string };

/** Resolve the bank an Elementor request asks for, falling back to the current Elementor selection. */
export function resolveElementorOptionBank(requested: unknown, fallbackId: string): ElementorOptionBankResolution {
  const id = requested === undefined ? fallbackId : requested;
  const elementor = findElementorOptionBank(id);
  if (elementor) return { ok: true, optionBank: elementor };
  if (findGutenbergOptionBank(id)) {
    return {
      ok: false,
      code: 'P15_OPTION_BANK_TARGET_MISMATCH',
      message: 'A Gutenberg option bank cannot drive an Elementor preview or download. Select an Elementor version.',
    };
  }
  return { ok: false, code: 'P15_OPTION_BANK_UNKNOWN', message: 'Unknown Elementor option-bank version.' };
}
