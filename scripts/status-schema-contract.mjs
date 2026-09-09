export function assertRegistrySchemaReferences(schemaVersion, documents) {
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new Error(`Runtime artifact registry schemaVersion must be a positive integer, got ${schemaVersion}`);
  }

  const expected = `schema v${schemaVersion}`;
  const entries = Object.entries(documents || {});
  if (entries.length === 0) {
    throw new Error('Status schema contract requires at least one document.');
  }

  for (const [path, text] of entries) {
    if (typeof text !== 'string' || !text.includes(expected)) {
      throw new Error(`${path} must reference active runtime artifact registry ${expected}.`);
    }
  }

  return expected;
}
