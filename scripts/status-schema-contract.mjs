export const STATUS_SCHEMA_ANCHORS = Object.freeze({
  'README.md': /Machine-readable operational registry:[^\n]*schema v(\d+)\b/i,
  'memory-bank/PROJECT_STATE.md': /`config\/runtime-artifacts\.json` is runtime artifact registry schema v(\d+)\b/i,
  'memory-bank/ROADMAP.md': /The artifact is registered in `config\/runtime-artifacts\.json` schema v(\d+)\b/i,
  'memory-bank/NEXT_ACTIONS.md': /Runtime artifact preflight requires[^\n]*schema-v(\d+)\b/i
});

function collectAnchorVersions(text, pattern) {
  const flags = pattern.flags.replace(/g/g, '');
  const matcher = new RegExp(pattern.source, `${flags}g`);
  return [...text.matchAll(matcher)].map((match) => Number(match[1]));
}

export function assertRegistrySchemaReferences(
  schemaVersion,
  documents,
  anchors = STATUS_SCHEMA_ANCHORS
) {
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
      throw new Error(`${path} must expose exactly one current runtime registry schema anchor.`);
    }

    const pattern = anchors?.[path];
    if (!(pattern instanceof RegExp)) {
      throw new Error(`${path} has no configured current runtime registry schema anchor.`);
    }

    const versions = collectAnchorVersions(text, pattern);
    if (versions.length === 0) {
      throw new Error(`${path} must expose exactly one current runtime registry schema anchor.`);
    }

    if (versions.length > 1) {
      throw new Error(`${path} exposes multiple current runtime registry schema anchors.`);
    }

    if (versions[0] !== schemaVersion) {
      throw new Error(
        `${path} current runtime artifact registry anchor is schema v${versions[0]} while active is ${expected}.`
      );
    }
  }

  return expected;
}
