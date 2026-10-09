import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../../src/targets/elementor/neutral-export-ir-identity';
import { generateElementorV3TemplateCandidate } from '../../src/targets/elementor/v3-template-generator';
import { buildElementorTemplateCandidateIdentity } from '../../src/targets/elementor/import-validation-contract';

/**
 * Deterministic case corpus for golden equivalence of container property families (recovery M1.3).
 * Golden outputs were recorded from the original hand-written resolvers before they were
 * re-expressed as mapping-engine families; the engine must reproduce them exactly.
 */
export interface GoldenCase {
  name: string;
  source: unknown;
  manifest: unknown;
}

export interface FamilyCorpusSpec {
  manifestVersion: string;
  /** Valid tablet/mobile entry field sets for one container. */
  tabletValid: Record<string, unknown>;
  mobileValid: Record<string, unknown>;
  /** Field sets whose values are invalid for the family. */
  invalidValues: Array<Record<string, unknown>>;
  /** Extra family-specific malformed field sets (e.g. gap linked+split). */
  extraInvalid?: Array<Record<string, unknown>>;
  /** Fields every entry must carry (e.g. full width's contentWidthMode). */
  entryBase?: Record<string, unknown>;
  /** Cases dropping each listed base key entirely (required-key envelopes, e.g. border style). */
  omitBaseKeys?: string[];
  /** Family-specific authority flags the manifest must carry as false (e.g. styleInferencePerformed). */
  extraFlags?: string[];
}

export function sourceDocument(): P15NeutralExportDocumentV1 {
  return {
    schemaVersion: 1,
    irVersion: P15_NEUTRAL_EXPORT_IR_VERSION,
    title: 'Golden container family source',
    documentType: 'section',
    nodes: [{
      kind: 'container',
      sourceNodeId: 'root',
      direction: 'row',
      gapPx: 24,
      paddingPx: { top: 10, right: 20, bottom: 10, left: 20 },
      children: [{
        kind: 'container',
        sourceNodeId: 'nested',
        direction: 'column',
        gapPx: 8,
        children: [{ kind: 'text', sourceNodeId: 'copy', text: 'GOLDEN COPY', align: 'start' }],
      }],
    }],
  };
}

function reviewSource(): P15NeutralExportDocumentV1 {
  const source = sourceDocument();
  const root = source.nodes[0];
  if (root?.kind === 'container') root.children.push({ kind: 'review', sourceNodeId: 'needs-review', reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW', detail: 'Golden review node.' });
  return source;
}

function baseDigest(source: P15NeutralExportDocumentV1): string {
  const generation = generateElementorV3TemplateCandidate(source);
  if (!generation.candidate) throw new Error('golden source must generate');
  return buildElementorTemplateCandidateIdentity(generation.candidate).digest;
}

const FLAGS = {
  responsiveInferencePerformed: false,
  figmaMutation: false,
  networkAccess: false,
  responsiveClosureClaim: false,
  targetCompatibilityClaim: false,
  productionAcceptance: false,
  downloadEnabled: false,
};

export function buildCorpus(spec: FamilyCorpusSpec): GoldenCase[] {
  const source = sourceDocument();
  const base = spec.entryBase ?? {};
  const flags: Record<string, boolean> = { ...Object.fromEntries((spec.extraFlags ?? []).map((flag) => [flag, false])), ...FLAGS };
  const manifest = (containers: unknown, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    schemaVersion: 1,
    manifestVersion: spec.manifestVersion,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: baseDigest(source),
    containers,
    ...flags,
    ...overrides,
  });
  const cases: GoldenCase[] = [
    { name: 'tablet-only', source, manifest: manifest([{ sourceNodeId: 'root', ...base, ...spec.tabletValid }]) },
    { name: 'mobile-only', source, manifest: manifest([{ sourceNodeId: 'nested', ...base, ...spec.mobileValid }]) },
    { name: 'both-two-containers-unsorted', source, manifest: manifest([
      { sourceNodeId: 'root', ...base, ...spec.tabletValid, ...spec.mobileValid },
      { sourceNodeId: 'nested', ...base, ...spec.mobileValid },
    ]) },
    { name: 'no-overrides', source, manifest: manifest([]) },
    { name: 'manifest-null', source, manifest: null },
    { name: 'manifest-array', source, manifest: [] },
    { name: 'manifest-extra-key', source, manifest: { ...manifest([]), extra: true } },
    { name: 'manifest-missing-key', source, manifest: (() => { const value = manifest([]); delete value.downloadEnabled; return value; })() },
    { name: 'manifest-wrong-version', source, manifest: manifest([], { manifestVersion: 'other-v1' }) },
    { name: 'manifest-wrong-schema', source, manifest: manifest([], { schemaVersion: 2 }) },
    { name: 'fingerprint-malformed', source, manifest: manifest([], { sourceIrFingerprint: 'sha256:xyz' }) },
    { name: 'fingerprint-mismatch', source, manifest: manifest([], { sourceIrFingerprint: `sha256:${'0'.repeat(64)}` }) },
    { name: 'base-digest-malformed', source, manifest: manifest([], { baseCandidateIdentityDigest: 7 }) },
    { name: 'base-digest-mismatch', source, manifest: manifest([], { baseCandidateIdentityDigest: `sha256:${'1'.repeat(64)}` }) },
    ...Object.keys(flags).map((flag) => ({ name: `authority-${flag}`, source, manifest: manifest([], { [flag]: true }) })),
    { name: 'containers-not-array', source, manifest: manifest({}) },
    { name: 'containers-too-many', source, manifest: manifest(Array.from({ length: 10_001 }, () => ({}))) },
    { name: 'entry-not-record', source, manifest: manifest(['root']) },
    { name: 'entry-unknown-key', source, manifest: manifest([{ sourceNodeId: 'root', ...base, ...spec.tabletValid, desktop: 1 }]) },
    { name: 'entry-bad-source-id', source, manifest: manifest([{ sourceNodeId: ' root', ...base, ...spec.tabletValid }]) },
    { name: 'entry-duplicate', source, manifest: manifest([{ sourceNodeId: 'root', ...base, ...spec.tabletValid }, { sourceNodeId: 'root', ...base, ...spec.mobileValid }]) },
    { name: 'entry-text-node', source, manifest: manifest([{ sourceNodeId: 'copy', ...base, ...spec.tabletValid }]) },
    { name: 'entry-missing-node', source, manifest: manifest([{ sourceNodeId: 'ghost', ...base, ...spec.tabletValid }]) },
    { name: 'entry-no-override', source, manifest: manifest([{ sourceNodeId: 'root', ...base }]) },
    ...spec.invalidValues.map((fields, index) => ({ name: `entry-invalid-value-${index}`, source, manifest: manifest([{ sourceNodeId: 'root', ...base, ...fields }]) })),
    ...(spec.extraInvalid ?? []).map((fields, index) => ({ name: `entry-extra-invalid-${index}`, source, manifest: manifest([{ sourceNodeId: 'root', ...base, ...fields }]) })),
    ...(spec.omitBaseKeys ?? []).map((key) => {
      const entry: Record<string, unknown> = { sourceNodeId: 'root', ...base, ...spec.tabletValid };
      delete entry[key];
      return { name: `entry-missing-base-${key}`, source, manifest: manifest([entry]) };
    }),
    { name: 'many-issues-accumulate', source, manifest: manifest([{ sourceNodeId: 'ghost', ...base, ...spec.tabletValid }, 'bad', { sourceNodeId: 'root', ...base }], { manifestVersion: 'x' }) },
    { name: 'source-invalid', source: { schemaVersion: 2 }, manifest: manifest([]) },
    { name: 'source-review-upstream', source: reviewSource(), manifest: manifest([]) },
  ];
  return cases;
}

/** Result plus serializer outcome, as plain JSON for golden comparison. */
export function goldenRecord(
  resolve: (source: unknown, manifest: unknown) => unknown,
  serialize: (result: never) => string,
  testCase: GoldenCase,
): unknown {
  const result = resolve(testCase.source, testCase.manifest);
  let serialized: string;
  try {
    serialized = serialize(result as never);
  } catch (error) {
    serialized = `THROWS: ${error instanceof Error ? error.message : String(error)}`;
  }
  const inflated = { ...(result as Record<string, unknown>), targetCompatibilityClaim: true };
  let inflatedSerialized: string;
  try {
    inflatedSerialized = serialize(inflated as never);
  } catch (error) {
    inflatedSerialized = `THROWS: ${error instanceof Error ? error.message : String(error)}`;
  }
  return JSON.parse(JSON.stringify({ name: testCase.name, result, serialized, inflatedSerialized }));
}
