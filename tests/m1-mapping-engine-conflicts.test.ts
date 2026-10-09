import { describe, expect, it } from 'vitest';
import { CONTAINER_TARGET, resolveContainerPropertyFamily } from '../src/targets/elementor/mapping-engine/container-family-engine';
import type { ContainerPropertyFamily, FamilySettingWrite, FamilyTarget } from '../src/targets/elementor/mapping-engine/property-family';
import { fingerprintP15NeutralExportDocument } from '../src/targets/elementor/neutral-export-ir-identity';
import { generateElementorV3TemplateCandidate } from '../src/targets/elementor/v3-template-generator';
import { buildElementorTemplateCandidateIdentity } from '../src/targets/elementor/import-validation-contract';
import { sourceDocument } from './golden/m1-container-family-corpus';

/**
 * Engine conflict paths (recovery M1.4): the generated base never carries these settings, so the golden
 * corpus cannot reach them. A target that seeds existing settings on bind exercises them directly.
 */
function seededTarget(seed: Record<string, unknown>): FamilyTarget {
  return {
    ...CONTAINER_TARGET,
    bind(source, template) {
      const binding = CONTAINER_TARGET.bind(source, template);
      for (const bound of binding.targets.values()) Object.assign(bound.settings as Record<string, unknown>, seed);
      return binding;
    },
  };
}

type Entry = { sourceNodeId: string };

function family(target: FamilyTarget, writes: FamilySettingWrite[], extra: Partial<ContainerPropertyFamily<Entry, Entry>> = {}): ContainerPropertyFamily<Entry, Entry> {
  return {
    id: 'engine-conflict-probe',
    issuePrefix: 'P15_PROBE',
    subject: 'Probe',
    manifestVersion: 'probe-manifest-v1',
    resultVersion: 'probe-result-v1',
    maxEntries: 10,
    evidence: { elementorVersion: '4.2.4' },
    statuses: { none: 'NO_PROBE', resolved: 'PROBE_RESOLVED' },
    summaryField: 'resolvedProbes',
    target,
    entryKeys: ['sourceNodeId'],
    entryEnvelopeMessage: 'Probe entry.',
    codecs: [],
    parseEntry: (raw) => ({ ok: true, entry: { sourceNodeId: raw.sourceNodeId } }),
    writes: () => writes,
    summarize: (entry) => ({ ...entry }),
    validSummary: () => true,
    ...extra,
  };
}

function manifest(): Record<string, unknown> {
  const source = sourceDocument();
  const generation = generateElementorV3TemplateCandidate(source);
  if (!generation.candidate) throw new Error('source must generate');
  return {
    schemaVersion: 1,
    manifestVersion: 'probe-manifest-v1',
    sourceIrFingerprint: fingerprintP15NeutralExportDocument(source),
    baseCandidateIdentityDigest: buildElementorTemplateCandidateIdentity(generation.candidate).digest,
    containers: [{ sourceNodeId: 'root' }],
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    responsiveClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
  };
}

const write = (settingKey: string, rank?: number, checkConflict?: boolean): FamilySettingWrite => ({
  settingKey,
  value: 'x',
  conflictSubject: settingKey,
  conflictMessage: `conflict ${settingKey}`,
  ...(rank === undefined ? {} : { conflictRank: rank }),
  ...(checkConflict === undefined ? {} : { checkConflict }),
});

describe('recovery M1.4 — engine conflict handling', () => {
  it('reports the lowest-ranked conflicting write first and writes nothing', () => {
    const result = resolveContainerPropertyFamily(family(seededTarget({ probe_a: 1, probe_b: 1 }), [write('probe_a', 5), write('probe_b', 1)]), sourceDocument(), manifest());
    expect(result.status).toBe('REJECTED_INVALID_MANIFEST');
    expect(result.issues).toEqual([{ code: 'P15_PROBE_EXISTING_OVERRIDE_CONFLICT', path: '$source.root', message: 'conflict probe_b' }]);
  });

  it('reports every conflicting write in all mode', () => {
    const result = resolveContainerPropertyFamily(family(seededTarget({ probe_a: 1, probe_b: 1 }), [write('probe_a'), write('probe_b')], { conflictMode: 'all' }), sourceDocument(), manifest());
    expect(result.issues.map((issue) => issue.message)).toEqual(['conflict probe_a', 'conflict probe_b']);
  });

  it('lets an unchecked enabling write overwrite an existing setting', () => {
    const result = resolveContainerPropertyFamily(family(seededTarget({ probe_starter: 'old' }), [write('probe_starter', undefined, false), write('probe_value')]), sourceDocument(), manifest());
    expect(result.status).toBe('PROBE_RESOLVED');
  });

  it('refuses a whole settings group through conflictScan, even for keys it would not write', () => {
    const scan = (settings: Record<string, unknown>) => {
      const key = Object.keys(settings).find((candidate) => candidate.startsWith('probe_'));
      return key === undefined ? null : `group conflict ${key}`;
    };
    const rejected = resolveContainerPropertyFamily(family(seededTarget({ probe_other: 1 }), [write('probe_value')], { conflictScan: scan }), sourceDocument(), manifest());
    expect(rejected.issues).toEqual([{ code: 'P15_PROBE_EXISTING_OVERRIDE_CONFLICT', path: '$source.root', message: 'group conflict probe_other' }]);
    const resolved = resolveContainerPropertyFamily(family(CONTAINER_TARGET, [write('probe_value')], { conflictScan: scan }), sourceDocument(), manifest());
    expect(resolved.status).toBe('PROBE_RESOLVED');
  });
});
