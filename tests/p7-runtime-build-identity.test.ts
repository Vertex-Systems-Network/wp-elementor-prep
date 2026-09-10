import { describe, expect, it } from 'vitest';
import { P7RuntimeEvidenceRecorder } from '../src/core/batch-runtime-evidence';
import { createFigmaP7RuntimeEvidenceRecorder } from '../src/plugin/p7-runtime-evidence';

const BUILD = {
  sourceSha: '0123456789abcdef0123456789abcdef01234567',
  runId: '34217708751',
  runNumber: '292',
};

describe('P7 runtime build identity', () => {
  it('copies injected identity into snapshots so caller mutation cannot rewrite evidence provenance', () => {
    const identity = { ...BUILD };
    const recorder = new P7RuntimeEvidenceRecorder('run-key', { buildIdentity: identity });
    identity.runNumber = '999';

    expect(recorder.snapshot().build).toEqual(BUILD);
  });

  it('allows explicit build override in the Figma recorder for deterministic tests', () => {
    const recorder = createFigmaP7RuntimeEvidenceRecorder('run-key', {
      buildIdentity: BUILD,
      memorySampler: () => null,
    });
    expect(recorder.snapshot().build).toEqual(BUILD);
  });
});
