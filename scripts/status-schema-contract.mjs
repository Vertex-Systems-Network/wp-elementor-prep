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
    if (typeof text !== 'string') {
      throw new Error(`${path} must reference active runtime artifact registry ${expected}.`);
    }

    const versions = [...text.matchAll(/\bschema v(\d+)\b/gi)].map((match) => Number(match[1]));
    if (!versions.includes(schemaVersion)) {
      throw new Error(`${path} must reference active runtime artifact registry ${expected}.`);
    }

    const staleVersions = [...new Set(versions.filter((version) => version !== schemaVersion))]
      .sort((a, b) => a - b);

    if (staleVersions.length > 0) {
      const staleLabels = staleVersions.map((version) => `schema v${version}`).join(', ');
      throw new Error(
        `${path} references stale runtime artifact registry ${staleLabels} while active is ${expected}.`
      );
    }
  }

  return expected;
}
