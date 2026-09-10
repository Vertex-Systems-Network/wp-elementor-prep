import { describe, expect, it } from 'vitest';
import { createBatchRunKey } from '../src/core/batch-run-key';

describe('P7 canonical batch run keys', () => {
  it('is deterministic for identical compatibility inputs', () => {
    const input = {
      pluginVersion: '0.1.0-alpha.1',
      safeRecipeSchemaVersion: 1,
      batchSchemaVersion: 1,
      runtimeProofVersion: 'p5-runtime-proof-v3',
      buildSourceSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    };
    expect(createBatchRunKey(input)).toBe(createBatchRunKey({ ...input }));
  });

  it('changes whenever a compatibility-sensitive version or build source changes', () => {
    const base = createBatchRunKey({
      pluginVersion: '0.1.0-alpha.1',
      safeRecipeSchemaVersion: 1,
      batchSchemaVersion: 1,
      runtimeProofVersion: 'p5-runtime-proof-v3',
      buildSourceSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    });

    expect(createBatchRunKey({
      pluginVersion: '0.1.0-alpha.2',
      safeRecipeSchemaVersion: 1,
      batchSchemaVersion: 1,
      runtimeProofVersion: 'p5-runtime-proof-v3',
      buildSourceSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    })).not.toBe(base);
    expect(createBatchRunKey({
      pluginVersion: '0.1.0-alpha.1',
      safeRecipeSchemaVersion: 2,
      batchSchemaVersion: 1,
      runtimeProofVersion: 'p5-runtime-proof-v3',
      buildSourceSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    })).not.toBe(base);
    expect(createBatchRunKey({
      pluginVersion: '0.1.0-alpha.1',
      safeRecipeSchemaVersion: 1,
      batchSchemaVersion: 2,
      runtimeProofVersion: 'p5-runtime-proof-v3',
      buildSourceSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    })).not.toBe(base);
    expect(createBatchRunKey({
      pluginVersion: '0.1.0-alpha.1',
      safeRecipeSchemaVersion: 1,
      batchSchemaVersion: 1,
      runtimeProofVersion: 'p5-runtime-proof-v4',
      buildSourceSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    })).not.toBe(base);
    expect(createBatchRunKey({
      pluginVersion: '0.1.0-alpha.1',
      safeRecipeSchemaVersion: 1,
      batchSchemaVersion: 1,
      runtimeProofVersion: 'p5-runtime-proof-v3',
      buildSourceSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    })).not.toBe(base);
  });

  it('keeps build source optional for generic/non-P7 callers', () => {
    expect(createBatchRunKey({
      pluginVersion: '1.0.0',
      safeRecipeSchemaVersion: 1,
      batchSchemaVersion: 1,
      runtimeProofVersion: 'p5-runtime-proof-v3',
    })).not.toContain('build-source:');
  });

  it('rejects missing or invalid version inputs', () => {
    expect(() => createBatchRunKey({ pluginVersion: ' ', safeRecipeSchemaVersion: 1, batchSchemaVersion: 1 })).toThrow();
    expect(() => createBatchRunKey({ pluginVersion: '1.0.0', safeRecipeSchemaVersion: 0, batchSchemaVersion: 1 })).toThrow();
    expect(() => createBatchRunKey({ pluginVersion: '1.0.0', safeRecipeSchemaVersion: 1, batchSchemaVersion: 0 })).toThrow();
  });
});
