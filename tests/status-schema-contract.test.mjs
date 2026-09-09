import { describe, expect, it } from 'vitest';
import { assertRegistrySchemaReferences } from '../scripts/status-schema-contract.mjs';

const synchronizedDocs = {
  'README.md': [
    'Machine-readable operational registry: `config/runtime-artifacts.json` schema v3.',
    'Historical migration note: schema v2 was used previously.'
  ].join('\n'),
  'memory-bank/PROJECT_STATE.md': [
    '`config/runtime-artifacts.json` is runtime artifact registry schema v3.',
    'Historical checkpoint: schema v2.'
  ].join('\n'),
  'memory-bank/ROADMAP.md': [
    'The artifact is registered in `config/runtime-artifacts.json` schema v3 as the current final-closure-eligible P5 build.',
    'Earlier roadmap note: schema v2.'
  ].join('\n'),
  'memory-bank/NEXT_ACTIONS.md': [
    'Runtime artifact preflight requires stable descriptor reads and schema-v3 manifest pins.',
    'Closure payload remains schema-v2.'
  ].join('\n')
};

describe('status registry schema contract', () => {
  it('accepts current schema anchors while allowing historical older schema prose', () => {
    expect(assertRegistrySchemaReferences(3, synchronizedDocs)).toBe('schema v3');
  });

  it('fails closed when the current anchor is stale even if active schema appears historically', () => {
    expect(() => assertRegistrySchemaReferences(3, {
      ...synchronizedDocs,
      'README.md': [
        'Machine-readable operational registry: `config/runtime-artifacts.json` schema v2.',
        'Historical note mentions schema v3.'
      ].join('\n')
    })).toThrow('README.md current runtime artifact registry anchor is schema v2 while active is schema v3');
  });

  it('fails closed when a required current schema anchor is missing', () => {
    expect(() => assertRegistrySchemaReferences(3, {
      ...synchronizedDocs,
      'memory-bank/PROJECT_STATE.md': 'Historical note only: schema v3.'
    })).toThrow('memory-bank/PROJECT_STATE.md must expose exactly one current runtime registry schema anchor');
  });

  it('fails closed when a document exposes duplicate current schema anchors', () => {
    expect(() => assertRegistrySchemaReferences(3, {
      ...synchronizedDocs,
      'memory-bank/NEXT_ACTIONS.md': [
        'Runtime artifact preflight requires schema-v3 manifest pins.',
        'Runtime artifact preflight requires schema-v3 manifest pins.'
      ].join('\n')
    })).toThrow('memory-bank/NEXT_ACTIONS.md exposes multiple current runtime registry schema anchors');
  });

  it('rejects documents without a configured current schema anchor', () => {
    expect(() => assertRegistrySchemaReferences(3, {
      'UNTRACKED.md': 'schema v3'
    })).toThrow('UNTRACKED.md has no configured current runtime registry schema anchor');
  });

  it('rejects invalid registry schema versions', () => {
    expect(() => assertRegistrySchemaReferences(0, synchronizedDocs)).toThrow(
      'schemaVersion must be a positive integer'
    );
  });
});
