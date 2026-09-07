export interface BatchRunKeyParts {
  pluginVersion: string;
  safeRecipeSchemaVersion: number;
  batchSchemaVersion: number;
  runtimeProofVersion?: string | null;
}

function clean(value: string): string {
  return value.trim().replace(/\s+/g, '-');
}

/**
 * Canonical key for deciding whether a finalized frame can be skipped by a later batch run.
 * Any compatibility-sensitive version change produces a different key and therefore forces re-audit.
 */
export function createBatchRunKey(parts: BatchRunKeyParts): string {
  const pluginVersion = clean(parts.pluginVersion);
  const runtimeProofVersion = parts.runtimeProofVersion ? clean(parts.runtimeProofVersion) : 'none';
  if (!pluginVersion) throw new Error('Batch run key requires a plugin version.');
  if (!Number.isInteger(parts.safeRecipeSchemaVersion) || parts.safeRecipeSchemaVersion < 1) {
    throw new Error('Batch run key requires a positive safe-recipe schema version.');
  }
  if (!Number.isInteger(parts.batchSchemaVersion) || parts.batchSchemaVersion < 1) {
    throw new Error('Batch run key requires a positive batch schema version.');
  }

  return [
    `plugin:${pluginVersion}`,
    `safe-recipe-schema:${parts.safeRecipeSchemaVersion}`,
    `batch-schema:${parts.batchSchemaVersion}`,
    `runtime-proof:${runtimeProofVersion}`,
  ].join('|');
}
