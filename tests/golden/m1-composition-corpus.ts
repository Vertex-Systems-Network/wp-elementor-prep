import { P15_NEUTRAL_EXPORT_IR_VERSION, type P15NeutralExportDocumentV1 } from '../../src/targets/elementor/neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from '../../src/targets/elementor/neutral-export-ir-identity';
import { generateElementorV3TemplateCandidate } from '../../src/targets/elementor/v3-template-generator';
import { buildElementorTemplateCandidateIdentity } from '../../src/targets/elementor/import-validation-contract';
import type { GoldenCase } from './m1-container-family-corpus';

/**
 * Deterministic case corpus for golden equivalence of the family compositions (recovery M1.5).
 * Golden outputs were recorded from the original hand-written compositions before they were
 * re-expressed on the shared ordered composer; the composer must reproduce them exactly.
 */
export interface CompositionCorpusSpec {
  compositionVersion: string;
  source: () => P15NeutralExportDocumentV1;
  /** One valid nested manifest per family, built from the shared top-level identity fields. */
  families: (common: Record<string, unknown>) => Record<string, Record<string, unknown>>;
  /** Field overrides that make one nested family manifest invalid, per family. */
  invalidNested: Record<string, Record<string, unknown>>;
  /** Two families whose valid manifests target the same node, for ordering and coexistence. */
  orderingPairs?: Array<[string, string]>;
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

function common(source: P15NeutralExportDocumentV1): Record<string, unknown> {
  const generation = generateElementorV3TemplateCandidate(source);
  if (!generation.candidate) throw new Error('golden source must generate');
  return {
    schemaVersion: 1,
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest,
    ...FLAGS,
  };
}

function reviewSource(makeSource: () => P15NeutralExportDocumentV1): P15NeutralExportDocumentV1 {
  const source = makeSource();
  const root = source.nodes[0];
  if (root?.kind === 'container') root.children.push({ kind: 'review', sourceNodeId: 'needs-review', reasonCode: 'MANUAL_LAYOUT_REQUIRES_REVIEW', detail: 'Golden review node.' });
  return source;
}

export function buildCompositionCorpus(spec: CompositionCorpusSpec): GoldenCase[] {
  const source = spec.source();
  const shared = common(source);
  const families = spec.families(shared);
  const ids = Object.keys(families);
  const manifest = (selected: Record<string, unknown>, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    ...shared,
    compositionVersion: spec.compositionVersion,
    families: selected,
    ...overrides,
  });
  const reversed = Object.fromEntries([...ids].reverse().map((id) => [id, families[id]]));
  const cases: GoldenCase[] = [
    { name: 'all-families', source, manifest: manifest(families) },
    { name: 'all-families-reversed-keys', source, manifest: manifest(reversed) },
    ...ids.map((id) => ({ name: `only-${id}`, source, manifest: manifest({ [id]: families[id] }) })),
    ...(spec.orderingPairs ?? []).map(([a, b]) => ({ name: `pair-${a}-${b}`, source, manifest: manifest({ [b]: families[b], [a]: families[a] }) })),
    { name: 'families-empty', source, manifest: manifest({}) },
    { name: 'families-array', source, manifest: manifest([] as never) },
    { name: 'families-unknown', source, manifest: manifest({ ...families, unknown: {} }) },
    { name: 'manifest-null', source, manifest: null },
    { name: 'manifest-array', source, manifest: [] },
    { name: 'manifest-extra-key', source, manifest: { ...manifest(families), extra: 'PRIVATE' } },
    { name: 'manifest-missing-key', source, manifest: (() => { const value = manifest(families); delete value.downloadEnabled; return value; })() },
    { name: 'manifest-wrong-version', source, manifest: manifest(families, { compositionVersion: 'other-v1' }) },
    { name: 'manifest-wrong-schema', source, manifest: manifest(families, { schemaVersion: 2 }) },
    { name: 'fingerprint-mismatch', source, manifest: manifest(families, { sourceIrFingerprint: `sha256:${'0'.repeat(64)}` }) },
    { name: 'base-digest-mismatch', source, manifest: manifest(families, { baseCandidateIdentityDigest: `sha256:${'1'.repeat(64)}` }) },
    ...Object.keys(FLAGS).map((flag) => ({ name: `authority-${flag}`, source, manifest: manifest(families, { [flag]: true }) })),
    ...ids.map((id) => ({ name: `nested-stale-fingerprint-${id}`, source, manifest: manifest({ ...families, [id]: { ...families[id], sourceIrFingerprint: `sha256:${'0'.repeat(64)}` } }) })),
    ...ids.map((id) => ({ name: `nested-authority-${id}`, source, manifest: manifest({ ...families, [id]: { ...families[id], productionAcceptance: true } }) })),
    ...ids.map((id) => ({ name: `nested-null-${id}`, source, manifest: manifest({ ...families, [id]: null }) })),
    ...Object.entries(spec.invalidNested).map(([id, fields]) => ({ name: `nested-invalid-${id}`, source, manifest: manifest({ ...families, [id]: { ...families[id], ...fields } }) })),
    { name: 'source-invalid', source: { schemaVersion: 2 }, manifest: manifest(families) },
    { name: 'source-review-upstream', source: reviewSource(spec.source), manifest: manifest(families) },
  ];
  return cases;
}
