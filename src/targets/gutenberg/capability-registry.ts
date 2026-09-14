import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  validateGutenbergNormalizedParsedBlockDocument,
  type GutenbergNormalizedParsedBlockDocumentV1,
  type GutenbergNormalizedParsedBlockV1,
  type GutenbergParsedBlockValidationIssue,
} from './parsed-block';

export const GUTENBERG_CAPABILITY_REGISTRY_VERSION = 'gutenberg-documented-core-block-capabilities-v1' as const;
export const GUTENBERG_DOCUMENTED_CORE_API_VERSION = 3 as const;

export type GutenbergDocumentedCoreBlockV1 =
  | 'core/group'
  | 'core/heading'
  | 'core/image'
  | 'core/paragraph';

export type GutenbergBlockCapabilityClass = 'DOCUMENTED_CORE' | 'REVIEW_REQUIRED';
export type GutenbergBlockEvidenceClass = 'DOCUMENTED_CORE_API_V3' | 'UNREGISTERED_OR_CUSTOM' | 'FREEFORM';

export interface GutenbergCoreBlockCapabilityV1 {
  blockName: GutenbergDocumentedCoreBlockV1;
  classification: 'DOCUMENTED_CORE';
  documentedApiVersion: typeof GUTENBERG_DOCUMENTED_CORE_API_VERSION;
  generationEnabled: false;
  availabilityClaim: false;
  evidenceUrl: string;
}

export const GUTENBERG_CORE_BLOCK_CAPABILITIES_V1: readonly GutenbergCoreBlockCapabilityV1[] = Object.freeze([
  Object.freeze({
    blockName: 'core/group',
    classification: 'DOCUMENTED_CORE',
    documentedApiVersion: GUTENBERG_DOCUMENTED_CORE_API_VERSION,
    generationEnabled: false,
    availabilityClaim: false,
    evidenceUrl: 'https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-design/core-block-group/',
  }),
  Object.freeze({
    blockName: 'core/heading',
    classification: 'DOCUMENTED_CORE',
    documentedApiVersion: GUTENBERG_DOCUMENTED_CORE_API_VERSION,
    generationEnabled: false,
    availabilityClaim: false,
    evidenceUrl: 'https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-text/core-block-heading/',
  }),
  Object.freeze({
    blockName: 'core/image',
    classification: 'DOCUMENTED_CORE',
    documentedApiVersion: GUTENBERG_DOCUMENTED_CORE_API_VERSION,
    generationEnabled: false,
    availabilityClaim: false,
    evidenceUrl: 'https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-media/core-block-image/',
  }),
  Object.freeze({
    blockName: 'core/paragraph',
    classification: 'DOCUMENTED_CORE',
    documentedApiVersion: GUTENBERG_DOCUMENTED_CORE_API_VERSION,
    generationEnabled: false,
    availabilityClaim: false,
    evidenceUrl: 'https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-text/core-block-paragraph/',
  }),
]);

export interface GutenbergBlockCapabilityEntry {
  path: string;
  blockName: string | null;
  classification: GutenbergBlockCapabilityClass;
  evidenceClass: GutenbergBlockEvidenceClass;
  documentedApiVersion: typeof GUTENBERG_DOCUMENTED_CORE_API_VERSION | null;
  generationEnabled: false;
  availabilityClaim: false;
}

export interface GutenbergBlockInventoryEntry {
  blockName: string | null;
  classification: GutenbergBlockCapabilityClass;
  documentedApiVersion: typeof GUTENBERG_DOCUMENTED_CORE_API_VERSION | null;
  count: number;
}

export interface GutenbergCapabilityReport {
  schemaVersion: 1;
  registryVersion: typeof GUTENBERG_CAPABILITY_REGISTRY_VERSION;
  targetContractVersion: typeof GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  generationEnabled: false;
  downloadEnabled: false;
  status: 'ASSESSED' | 'INVALID_DOCUMENT';
  documentValid: boolean;
  validationIssues: GutenbergParsedBlockValidationIssue[];
  summary: {
    totalBlocks: number;
    namedBlocks: number;
    freeformBlocks: number;
    documentedCoreBlocks: number;
    reviewRequiredBlocks: number;
  };
  blockInventory: GutenbergBlockInventoryEntry[];
  entries: GutenbergBlockCapabilityEntry[];
}

const capabilityByBlockName = new Map<string, GutenbergCoreBlockCapabilityV1>(
  GUTENBERG_CORE_BLOCK_CAPABILITIES_V1.map((entry) => [entry.blockName, entry]),
);

function classifyBlock(blockName: string | null): {
  classification: GutenbergBlockCapabilityClass;
  evidenceClass: GutenbergBlockEvidenceClass;
  documentedApiVersion: typeof GUTENBERG_DOCUMENTED_CORE_API_VERSION | null;
} {
  if (blockName === null) {
    return {
      classification: 'REVIEW_REQUIRED',
      evidenceClass: 'FREEFORM',
      documentedApiVersion: null,
    };
  }

  const capability = capabilityByBlockName.get(blockName);
  if (!capability) {
    return {
      classification: 'REVIEW_REQUIRED',
      evidenceClass: 'UNREGISTERED_OR_CUSTOM',
      documentedApiVersion: null,
    };
  }

  return {
    classification: 'DOCUMENTED_CORE',
    evidenceClass: 'DOCUMENTED_CORE_API_V3',
    documentedApiVersion: capability.documentedApiVersion,
  };
}

function collectBlocks(
  blocks: GutenbergNormalizedParsedBlockV1[],
  parentPath: string,
  entries: GutenbergBlockCapabilityEntry[],
): void {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (!block) continue;
    const path = `${parentPath}[${index}]`;
    const classification = classifyBlock(block.blockName);

    entries.push({
      path,
      blockName: block.blockName,
      classification: classification.classification,
      evidenceClass: classification.evidenceClass,
      documentedApiVersion: classification.documentedApiVersion,
      generationEnabled: false,
      availabilityClaim: false,
    });

    if (block.innerBlocks.length > 0) {
      collectBlocks(block.innerBlocks, `${path}.innerBlocks`, entries);
    }
  }
}

function inventorySortKey(blockName: string | null): string {
  return blockName === null ? '' : blockName;
}

function buildInventory(entries: GutenbergBlockCapabilityEntry[]): GutenbergBlockInventoryEntry[] {
  const inventory = new Map<string, GutenbergBlockInventoryEntry>();

  for (const entry of entries) {
    const key = entry.blockName === null ? '__FREEFORM__' : entry.blockName;
    const existing = inventory.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    inventory.set(key, {
      blockName: entry.blockName,
      classification: entry.classification,
      documentedApiVersion: entry.documentedApiVersion,
      count: 1,
    });
  }

  return [...inventory.values()].sort((a, b) =>
    inventorySortKey(a.blockName).localeCompare(inventorySortKey(b.blockName)),
  );
}

function invalidReport(validationIssues: GutenbergParsedBlockValidationIssue[]): GutenbergCapabilityReport {
  return {
    schemaVersion: 1,
    registryVersion: GUTENBERG_CAPABILITY_REGISTRY_VERSION,
    targetContractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    status: 'INVALID_DOCUMENT',
    documentValid: false,
    validationIssues: validationIssues.map((issue) => ({ ...issue })),
    summary: {
      totalBlocks: 0,
      namedBlocks: 0,
      freeformBlocks: 0,
      documentedCoreBlocks: 0,
      reviewRequiredBlocks: 0,
    },
    blockInventory: [],
    entries: [],
  };
}

/**
 * Assess an already-valid repository-normalized parsed-block tree against four directly documented core block IDs.
 *
 * `DOCUMENTED_CORE` means only that the exact block identifier and API version are present in current official
 * WordPress documentation. It does not prove target-site availability, editor validity, rendering parity,
 * serialization round-trip behavior, generation support, or target compatibility.
 */
export function assessGutenbergNormalizedBlockCapabilities(value: unknown): GutenbergCapabilityReport {
  const validation = validateGutenbergNormalizedParsedBlockDocument(value);
  if (!validation.valid) return invalidReport(validation.issues);

  const document = value as GutenbergNormalizedParsedBlockDocumentV1;
  const entries: GutenbergBlockCapabilityEntry[] = [];
  collectBlocks(document.blocks, '$.blocks', entries);

  return {
    schemaVersion: 1,
    registryVersion: GUTENBERG_CAPABILITY_REGISTRY_VERSION,
    targetContractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    generationEnabled: false,
    downloadEnabled: false,
    status: 'ASSESSED',
    documentValid: true,
    validationIssues: [],
    summary: {
      totalBlocks: entries.length,
      namedBlocks: entries.filter((entry) => entry.blockName !== null).length,
      freeformBlocks: entries.filter((entry) => entry.blockName === null).length,
      documentedCoreBlocks: entries.filter((entry) => entry.classification === 'DOCUMENTED_CORE').length,
      reviewRequiredBlocks: entries.filter((entry) => entry.classification === 'REVIEW_REQUIRED').length,
    },
    blockInventory: buildInventory(entries),
    entries,
  };
}

export function serializeGutenbergCapabilityReport(report: GutenbergCapabilityReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
