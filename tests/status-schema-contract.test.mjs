import { describe, expect, it } from 'vitest';
import { assertRegistrySchemaReferences } from '../scripts/status-schema-contract.mjs';

describe('status registry schema contract', () => {
  it('accepts status documents synchronized to the active registry schema', () => {
    expect(assertRegistrySchemaReferences(3, {
      'README.md': 'Runtime registry schema v3.',
      'memory-bank/PROJECT_STATE.md': 'Current runtime artifact registry schema v3.',
      'memory-bank/ROADMAP.md': 'Operational registry schema v3.',
      'memory-bank/NEXT_ACTIONS.md': 'Preflight uses schema v3 manifest pins.'
    })).toBe('schema v3');
  });

  it('fails closed when one required status document advertises an older schema', () => {
    expect(() => assertRegistrySchemaReferences(3, {
      'README.md': 'Runtime registry schema v3.',
      'memory-bank/PROJECT_STATE.md': 'Runtime artifact registry schema v2.',
      'memory-bank/ROADMAP.md': 'Operational registry schema v3.',
      'memory-bank/NEXT_ACTIONS.md': 'Preflight uses schema v3 manifest pins.'
    })).toThrow('memory-bank/PROJECT_STATE.md must reference active runtime artifact registry schema v3');
  });

  it('rejects invalid registry schema versions', () => {
    expect(() => assertRegistrySchemaReferences(0, {
      'README.md': 'schema v0'
    })).toThrow('schemaVersion must be a positive integer');
  });
});
