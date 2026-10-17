export type OptionBankEntry = {
  id: string;
  label: string;
  snapshot: string;
  status: 'INVENTORIED' | 'MAPPED' | 'RUNTIME_REQUIRED' | 'UNSUPPORTED';
  generatedAt: string;
  /** Elementor only: version-driven target profile; Gutenberg banks carry none. */
  profile?: ElementorTargetProfileDescriptor;
};

/**
 * Exportable Elementor setting families. `core` (widget content, layout direction, sizing basics) is never
 * listed: it always exports. A family missing from a profile's descriptor is stripped from the template.
 */
export const ELEMENTOR_PROPERTY_FAMILIES = [
  'spacing',
  'typography',
  'background',
  'border',
  'shadow',
  'position',
  'hover',
  'responsive',
] as const;
export type ElementorPropertyFamily = (typeof ELEMENTOR_PROPERTY_FAMILIES)[number];

export type ElementorStructure = 'V3_CONTAINER' | 'V4_ATOMIC';

export interface ElementorTargetProfileDescriptor {
  profileId: string;
  structure: ElementorStructure;
  /** Declared Elementor version range this profile targets (inventory claim, not a runtime proof). */
  elementorVersionRange: string;
  /** Adapter that emits this structure; null when no adapter exists yet (export blocked, never silently v3). */
  adapterVersion: string | null;
  exportSupported: boolean;
  propertyFamilies: readonly ElementorPropertyFamily[];
}

const V3_CONTAINER_ADAPTER_VERSION = 'elementor-template-v0.4-container-v1';
const ALL_FAMILIES: readonly ElementorPropertyFamily[] = ELEMENTOR_PROPERTY_FAMILIES;
export const OPTION_BANK_REGISTRY: {
  schemaVersion: 1;
  elementor: OptionBankEntry[];
  gutenberg: OptionBankEntry[];
} = {
  schemaVersion: 1,
  elementor: [
    {
      id: 'elementor:4.3.2:4.3.0', label: 'Elementor Free 4.3.2 + Pro 4.3.0', snapshot: 'elementor-4.3.2-4.3.0.json', status: 'INVENTORIED', generatedAt: '2026-09-28',
      profile: { profileId: 'elementor-v3-container@4.3', structure: 'V3_CONTAINER', elementorVersionRange: '>=4.0 <5.0', adapterVersion: V3_CONTAINER_ADAPTER_VERSION, exportSupported: true, propertyFamilies: ALL_FAMILIES },
    },
    {
      id: 'elementor:v3-container:3.16+', label: 'Elementor 3.16+ (Container)', snapshot: 'elementor-4.3.2-4.3.0.json', status: 'INVENTORIED', generatedAt: '2026-10-17',
      profile: { profileId: 'elementor-v3-container@3.16', structure: 'V3_CONTAINER', elementorVersionRange: '>=3.16 <4.0', adapterVersion: V3_CONTAINER_ADAPTER_VERSION, exportSupported: true, propertyFamilies: ALL_FAMILIES },
    },
    {
      id: 'elementor:v4-atomic:4.x', label: 'Elementor 4.x Atomic (v4 editor)', snapshot: 'elementor-4.3.2-4.3.0.json', status: 'UNSUPPORTED', generatedAt: '2026-10-17',
      profile: { profileId: 'elementor-v4-atomic@4', structure: 'V4_ATOMIC', elementorVersionRange: '>=4.0 <5.0', adapterVersion: null, exportSupported: false, propertyFamilies: [] },
    },
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

const RESPONSIVE_SUFFIX = /_(tablet|mobile)(_extra)?$|_(laptop|widescreen)$/;

/** Deterministic key -> family rule; anything unmatched is `core` and always exports. */
export function classifyElementorSettingKey(key: string): ElementorPropertyFamily | 'core' {
  if (RESPONSIVE_SUFFIX.test(key)) return 'responsive';
  if (/(^|_)hover(_|$)/.test(key)) return 'hover';
  if (/box_shadow/.test(key)) return 'shadow';
  if (/^typography_/.test(key)) return 'typography';
  if (/^(background|_background)(_|$)/.test(key)) return 'background';
  if (/^(border|_border)(_|$)/.test(key)) return 'border';
  if (/^(_?padding|_?margin|flex_gap|gap|grid_gaps)$/.test(key)) return 'spacing';
  if (/^(_position|_offset_|_z_index|position$|z_index$)/.test(key)) return 'position';
  return 'core';
}

/** Strip setting keys whose family the profile does not export; returns a new value, input untouched. */
export function filterElementorSettingsByFamilies<T>(value: T, families: readonly ElementorPropertyFamily[]): T {
  const allowed = new Set<string>(families);
  const visit = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(visit);
    if (typeof node !== 'object' || node === null) return node;
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(node)) {
      if (key === 'settings' || key === 'page_settings') {
        if (Array.isArray(child) || typeof child !== 'object' || child === null) { out[key] = child; continue; }
        const kept = Object.fromEntries(Object.entries(child).filter(([k]) => {
          const family = classifyElementorSettingKey(k);
          return family === 'core' || allowed.has(family);
        }));
        out[key] = Object.keys(kept).length === 0 ? [] : kept;
      } else {
        out[key] = visit(child);
      }
    }
    return out;
  };
  return visit(value) as T;
}
