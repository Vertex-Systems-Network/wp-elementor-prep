import { describe, expect, it } from 'vitest';
import { DEFAULT_P14_INPUT_BOUNDS } from '../src/core/p14-input-bounds';
import {
  assessP14CancellationCheck,
  boundedP14CancellationFailureDetail,
} from '../src/core/p14-cancellation-check';

describe('P14 cancellation check assessment', () => {
  it('accepts explicit boolean cancellation evidence', async () => {
    await expect(assessP14CancellationCheck(() => true)).resolves.toEqual({ cancelled: true, failure: null });
    await expect(assessP14CancellationCheck(() => false)).resolves.toEqual({ cancelled: false, failure: null });
    await expect(assessP14CancellationCheck()).resolves.toEqual({ cancelled: false, failure: null });
  });

  it('treats a non-boolean runtime value as check failure rather than cancellation', async () => {
    const result = await assessP14CancellationCheck((() => 'yes') as unknown as () => boolean);
    expect(result.cancelled).toBe(false);
    expect(result.failure).toContain('non-boolean');
  });

  it('captures synchronous throw without rejecting', async () => {
    const result = await assessP14CancellationCheck(() => {
      throw new Error('sync cancellation probe failed');
    });
    expect(result).toEqual({ cancelled: false, failure: 'sync cancellation probe failed' });
  });

  it('captures asynchronous rejection without rejecting', async () => {
    const result = await assessP14CancellationCheck(async () => {
      throw new Error('async cancellation probe failed');
    });
    expect(result).toEqual({ cancelled: false, failure: 'async cancellation probe failed' });
  });

  it('bounds hostile failure detail', async () => {
    const hostile = 'x'.repeat(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength * 3);
    const result = await assessP14CancellationCheck(() => {
      throw new Error(hostile);
    });
    expect(result.failure?.length).toBe(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);

    const detail = boundedP14CancellationFailureDetail('Cancellation check failed', result.failure ?? 'missing');
    expect(detail.length).toBeLessThanOrEqual(DEFAULT_P14_INPUT_BOUNDS.maxDetailLength);
  });
});
