import { DEFAULT_P14_INPUT_BOUNDS } from './p14-input-bounds';

export interface P14CancellationCheckAssessment {
  cancelled: boolean;
  failure: string | null;
}

function boundedText(value: string): string {
  const limit = DEFAULT_P14_INPUT_BOUNDS.maxDetailLength;
  return value.length <= limit ? value : value.slice(0, limit);
}

function safeErrorMessage(error: unknown): string {
  try {
    if (typeof error === 'string') return error.length > 0 ? error : 'Unknown cancellation-check failure.';
    if (error instanceof Error && typeof error.message === 'string') {
      return error.message.length > 0 ? error.message : 'Unknown cancellation-check failure.';
    }
    const rendered = String(error);
    return rendered.length > 0 ? rendered : 'Unknown cancellation-check failure.';
  } catch {
    return 'Unknown cancellation-check failure.';
  }
}

export function boundedP14CancellationFailureDetail(prefix: string, failure: string): string {
  return boundedText(`${prefix}: ${failure}`);
}

export async function assessP14CancellationCheck(
  check?: () => boolean | Promise<boolean>,
): Promise<P14CancellationCheckAssessment> {
  if (!check) return { cancelled: false, failure: null };
  try {
    const value: unknown = await check();
    if (typeof value !== 'boolean') {
      return {
        cancelled: false,
        failure: 'Cancellation callback returned a non-boolean runtime value.',
      };
    }
    return { cancelled: value, failure: null };
  } catch (error) {
    return {
      cancelled: false,
      failure: boundedText(safeErrorMessage(error)),
    };
  }
}
