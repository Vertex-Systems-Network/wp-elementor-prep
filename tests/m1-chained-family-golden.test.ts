import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as alignContent from '../src/targets/elementor/responsive-align-content-resolution';
import { P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION, resolveP15ElementorResponsiveContainerWraps } from '../src/targets/elementor/responsive-wrap-resolution';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { buildCorpus, goldenRecord, sourceDocument, type GoldenCase } from './golden/m1-container-family-corpus';

/**
 * Golden equivalence for chained families (recovery M1.5b): align-content binds to the exact
 * responsive-wrap result instead of the generated base, so every case runs against several wrap
 * prerequisites. Recorded from the original resolver before it moved onto the engine.
 */
const FLAGS = { responsiveInferencePerformed: false, figmaMutation: false, networkAccess: false, responsiveClosureClaim: false,
  targetCompatibilityClaim: false, productionAcceptance: false, downloadEnabled: false };

function wrapManifest(containers: unknown): Record<string, unknown> {
  const source = sourceDocument();
  const generation = generateElementorV3TemplateCandidate(source);
  if (!generation.candidate) throw new Error('golden source must generate');
  return { schemaVersion: 1, manifestVersion: P15_ELEMENTOR_RESPONSIVE_WRAP_MANIFEST_VERSION,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest,
    containers, ...FLAGS };
}

const PREREQUISITES: Record<string, unknown> = {
  'wrap-both': wrapManifest([{ sourceNodeId: 'root', tabletWrap: 'wrap', mobileWrap: 'wrap' }, { sourceNodeId: 'nested', tabletWrap: 'wrap', mobileWrap: 'wrap' }]),
  'wrap-tablet-only': wrapManifest([{ sourceNodeId: 'root', tabletWrap: 'wrap' }, { sourceNodeId: 'nested', tabletWrap: 'wrap', mobileWrap: 'nowrap' }]),
  'wrap-none': wrapManifest([]),
  'wrap-invalid': wrapManifest([{ sourceNodeId: 'root', tabletWrap: 'reverse' }]),
};

function alignCases(wrapped: unknown): GoldenCase[] {
  const source = sourceDocument();
  const generation = generateElementorV3TemplateCandidate(source);
  if (!generation.candidate) throw new Error('golden source must generate');
  const baseDigest = buildElementorTemplateCandidateIdentity(generation.candidate).digest;
  const wrappedDigest = resolveP15ElementorResponsiveContainerWraps(source, wrapped).resolvedCandidateIdentityDigest;
  const cases = buildCorpus({
    manifestVersion: alignContent.P15_ELEMENTOR_RESPONSIVE_ALIGN_CONTENT_MANIFEST_VERSION,
    tabletValid: { tabletAlignContent: 'space-between' },
    mobileValid: { mobileAlignContent: 'center' },
    invalidValues: [{ tabletAlignContent: 'start' }, { mobileAlignContent: 'stretch' }, { tabletAlignContent: 1 }, { tabletAlignContent: null }],
  });
  return cases.map((testCase) => {
    if (testCase.manifest === null || typeof testCase.manifest !== 'object' || Array.isArray(testCase.manifest)) return testCase;
    const { baseCandidateIdentityDigest, ...rest } = testCase.manifest as Record<string, unknown>;
    const manifest = { ...rest, wrappedCandidateIdentityDigest: baseCandidateIdentityDigest === baseDigest ? wrappedDigest : baseCandidateIdentityDigest };
    return { ...testCase, manifest };
  });
}

describe('recovery M1.5b — chained family golden equivalence', () => {
  it('responsive-align-content reproduces the recorded original-resolver outputs on every wrap prerequisite', () => {
    const path = 'tests/golden/m1-responsive-align-content.golden.json';
    const records = Object.entries(PREREQUISITES).flatMap(([name, wrapped]) => alignCases(wrapped).map((testCase) => goldenRecord(
      (s, m) => alignContent.resolveP15ElementorResponsiveContainerAlignContent(s, wrapped, m),
      alignContent.serializeP15ElementorResponsiveAlignContentSummary as (r: never) => string,
      { ...testCase, name: `${name}/${testCase.name}` },
    )));
    if (process.env.GOLDEN_WRITE === '1') writeFileSync(path, `${JSON.stringify(records, null, 1)}\n`);
    expect(existsSync(path)).toBe(true);
    const golden = JSON.parse(readFileSync(path, 'utf8')) as unknown[];
    expect(records.length).toBe(golden.length);
    records.forEach((record, index) => expect(record).toEqual(golden[index]));
  });
});
