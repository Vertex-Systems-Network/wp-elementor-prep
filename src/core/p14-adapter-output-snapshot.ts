export interface P14AdapterOutputSnapshot<T> {
  valid: boolean;
  failures: string[];
  value: T | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Capture a known adapter-output record exactly once per declared property.
 *
 * This is intentionally shallow and schema-driven. It prevents readable stateful getters/proxies
 * from changing evidence between shape checks and semantic validation without creating a generic
 * recursive clone or granting any new adapter authority.
 */
export function snapshotP14AdapterOutputRecord<K extends string>(
  value: unknown,
  keys: readonly K[],
  label: string,
): P14AdapterOutputSnapshot<Record<K, unknown>> {
  if (!isRecord(value)) {
    return {
      valid: false,
      failures: [`${label} must be an object.`],
      value: null,
    };
  }

  const failures: string[] = [];
  const snapshot = {} as Record<K, unknown>;
  for (const key of keys) {
    try {
      snapshot[key] = value[key];
    } catch {
      failures.push(`${label}.${key} could not be read safely.`);
    }
  }

  return failures.length > 0
    ? { valid: false, failures, value: null }
    : { valid: true, failures: [], value: snapshot };
}

/**
 * Capture one already-read adapter-owned array into a plain bounded array using guarded index reads.
 */
export function snapshotP14AdapterOutputArray(
  value: unknown,
  maxLength: number,
  label: string,
  countLabel = 'item count',
): P14AdapterOutputSnapshot<unknown[]> {
  if (!Array.isArray(value)) {
    return {
      valid: false,
      failures: [`${label} must be an array.`],
      value: null,
    };
  }

  let length: number;
  try {
    length = value.length;
  } catch {
    return {
      valid: false,
      failures: [`${label}.length could not be read safely.`],
      value: null,
    };
  }

  if (!Number.isSafeInteger(length) || length < 0) {
    return {
      valid: false,
      failures: [`${label} has invalid length evidence.`],
      value: null,
    };
  }
  if (length > maxLength) {
    return {
      valid: false,
      failures: [`${label} exceeds bounded ${countLabel} ${maxLength}.`],
      value: null,
    };
  }

  const snapshot: unknown[] = [];
  const failures: string[] = [];
  for (let index = 0; index < length; index += 1) {
    try {
      snapshot.push(value[index]);
    } catch {
      failures.push(`${label}[${index}] could not be read safely.`);
    }
  }

  return failures.length > 0
    ? { valid: false, failures, value: null }
    : { valid: true, failures: [], value: snapshot };
}
