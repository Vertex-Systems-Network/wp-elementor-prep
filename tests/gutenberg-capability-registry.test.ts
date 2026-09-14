import { describe, expect, it } from 'vitest';
import {
  GUTENBERG_CAPABILITY_REGISTRY_VERSION,
  GUTENBERG_CORE_BLOCK_CAPABILITIES_V1,
  GUTENBERG_DOCUMENTED_CORE_API_VERSION,
  assessGutenbergNormalizedBlockCapabilities,
  serializeGutenbergCapabilityReport,
} from '../src/targets/gutenberg/capability-registry';
import {
  GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
  type GutenbergNormalizedParsedBlockDocumentV1,
  type GutenbergNormalizedParsedBlockV1,
} from '../src/targets/gutenberg/parsed-block';

function block(
  blockName: string | null,
  innerBlocks: GutenbergNormalizedParsedBlockV1[] = [],
): GutenbergNormalizedParsedBlockV1 {
  return {
    blockName,
    attrs: {},
    innerBlocks,
    innerHTML: '',
  };
}

function document(blocks: GutenbergNormalizedParsedBlockV1[]): GutenbergNormalizedParsedBlockDocumentV1 {
  return {
    schemaVersion: 1,
    contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
    blocks,
  };
}

describe('P16 Gutenberg documented-core capability registry', () => {
  it('contains only the four exact official core block IDs retained for the first registry', () => {
    expect(GUTENBERG_CORE_BLOCK_CAPABILITIES_V1.map((entry) => entry.blockName)).toEqual([
      'core/group',
      'core/heading',
      'core/image',
      'core/paragraph',
    ]);
    for (const entry of GUTENBERG_CORE_BLOCK_CAPABILITIES_V1) {
      expect(entry.classification).toBe('DOCUMENTED_CORE');
      expect(entry.documentedApiVersion).toBe(GUTENBERG_DOCUMENTED_CORE_API_VERSION);
      expect(entry.generationEnabled).toBe(false);
      expect(entry.availabilityClaim).toBe(false);
      expect(entry.evidenceUrl).toMatch(/^https:\/\/developer\.wordpress\.org\//);
    }
  });

  it('classifies the four documented blocks as evidence only and keeps all target authority disabled', () => {
    const value = document([
      block('core/group', [
        block('core/heading'),
        block('core/image'),
        block('core/paragraph'),
      ]),
    ]);

    const report = assessGutenbergNormalizedBlockCapabilities(value);
    expect(report.status).toBe('ASSESSED');
    expect(report.documentValid).toBe(true);
    expect(report.registryVersion).toBe(GUTENBERG_CAPABILITY_REGISTRY_VERSION);
    expect(report.summary).toEqual({
      totalBlocks: 4,
      namedBlocks: 4,
      freeformBlocks: 0,
      documentedCoreBlocks: 4,
      reviewRequiredBlocks: 0,
    });
    expect(report.entries.every((entry) => entry.classification === 'DOCUMENTED_CORE')).toBe(true);
    expect(report.entries.every((entry) => entry.documentedApiVersion === 3)).toBe(true);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.productionAcceptance).toBe(false);
    expect(report.generationEnabled).toBe(false);
    expect(report.downloadEnabled).toBe(false);
  });

  it('marks custom named blocks and top-level freeform content REVIEW_REQUIRED', () => {
    const value = document([
      block('my-plugin/card'),
      block(null),
      block('core/paragraph'),
    ]);

    const report = assessGutenbergNormalizedBlockCapabilities(value);
    expect(report.status).toBe('ASSESSED');
    expect(report.summary.reviewRequiredBlocks).toBe(2);

    const custom = report.entries.find((entry) => entry.blockName === 'my-plugin/card');
    expect(custom?.classification).toBe('REVIEW_REQUIRED');
    expect(custom?.evidenceClass).toBe('UNREGISTERED_OR_CUSTOM');
    expect(custom?.documentedApiVersion).toBeNull();

    const freeform = report.entries.find((entry) => entry.blockName === null);
    expect(freeform?.classification).toBe('REVIEW_REQUIRED');
    expect(freeform?.evidenceClass).toBe('FREEFORM');
    expect(freeform?.documentedApiVersion).toBeNull();
  });

  it('produces stable sorted inventory independent of traversal ordering', () => {
    const value = document([
      block('my-plugin/card'),
      block('core/paragraph'),
      block(null),
      block('core/group', [block('core/paragraph'), block('core/heading')]),
    ]);

    const report = assessGutenbergNormalizedBlockCapabilities(value);
    expect(report.blockInventory).toEqual([
      { blockName: null, classification: 'REVIEW_REQUIRED', documentedApiVersion: null, count: 1 },
      { blockName: 'core/group', classification: 'DOCUMENTED_CORE', documentedApiVersion: 3, count: 1 },
      { blockName: 'core/heading', classification: 'DOCUMENTED_CORE', documentedApiVersion: 3, count: 1 },
      { blockName: 'core/paragraph', classification: 'DOCUMENTED_CORE', documentedApiVersion: 3, count: 2 },
      { blockName: 'my-plugin/card', classification: 'REVIEW_REQUIRED', documentedApiVersion: null, count: 1 },
    ]);
  });

  it('fails capability assessment before entries when the normalized document is invalid', () => {
    const invalid = {
      schemaVersion: 1,
      contractVersion: GUTENBERG_PARSED_BLOCK_CONTRACT_VERSION,
      blocks: [
        {
          blockName: 'core/paragraph',
          attrs: {},
          innerBlocks: 'not-an-array',
          innerHTML: '',
        },
      ],
    };

    const report = assessGutenbergNormalizedBlockCapabilities(invalid);
    expect(report.status).toBe('INVALID_DOCUMENT');
    expect(report.documentValid).toBe(false);
    expect(report.entries).toEqual([]);
    expect(report.blockInventory).toEqual([]);
    expect(report.summary.totalBlocks).toBe(0);
    expect(report.validationIssues.some((issue) => issue.code === 'P16_INNER_BLOCKS_INVALID')).toBe(true);
    expect(report.targetCompatibilityClaim).toBe(false);
    expect(report.productionAcceptance).toBe(false);
    expect(report.generationEnabled).toBe(false);
    expect(report.downloadEnabled).toBe(false);
  });

  it('serializes a report deterministically without adding compatibility authority', () => {
    const report = assessGutenbergNormalizedBlockCapabilities(document([block('core/paragraph')]));
    const first = serializeGutenbergCapabilityReport(report);
    const second = serializeGutenbergCapabilityReport(
      assessGutenbergNormalizedBlockCapabilities(document([block('core/paragraph')])),
    );
    expect(second).toBe(first);
    expect(first).toContain('"targetCompatibilityClaim": false');
    expect(first).toContain('"generationEnabled": false');
    expect(first).toContain('"downloadEnabled": false');
  });
});
