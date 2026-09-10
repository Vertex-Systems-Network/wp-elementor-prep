import { readFile, writeFile } from 'node:fs/promises';

async function rewrite(path, transform) {
  const before = await readFile(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`${path}: P7 integration contract migration made no changes.`);
  await writeFile(path, after, 'utf8');
}

await rewrite('src/plugin/main.ts', (text) => text
  .replaceAll('beginP5ExclusiveOperation', 'beginExclusiveP5Operation')
  .replaceAll('endP5ExclusiveOperation', 'endExclusiveP5Operation')
  .replaceAll('operationInFlight', 'p5OperationInFlight'));

await rewrite('tests/p5-runtime-proof-evidence-integration.test.ts', (text) => {
  let next = text;
  const marker = 'class MemoryStorage {';
  const build = `const TEST_BUILD = {\n  sourceSha: '0123456789abcdef0123456789abcdef01234567',\n  runId: '34217708751',\n  runNumber: '292',\n};\n\n`;
  if (!next.includes('const TEST_BUILD =')) next = next.replace(marker, `${build}${marker}`);
  next = next.replaceAll('updateP5RuntimeProofFromCalibration(storage, passingResult())', 'updateP5RuntimeProofFromCalibration(storage, passingResult(), TEST_BUILD)');
  next = next.replaceAll('updateP5RuntimeProofFromCalibration(storage, inconsistent)', 'updateP5RuntimeProofFromCalibration(storage, inconsistent, TEST_BUILD)');
  next = next.replace(
    "      pluginVersion: '0.1.0-alpha.1',\n      result: passingResult(),",
    "      pluginVersion: '0.1.0-alpha.1',\n      build: TEST_BUILD,\n      result: passingResult(),",
  );
  return next;
});

await rewrite('tests/p7-p5-build-proof.test.ts', (text) => text.replace(
  /createP5RuntimeProof\('([^']+)'\)/g,
  "createP5RuntimeProof(BUILD_A, '$1')",
));

await rewrite('tests/p7-closure-verifier.test.ts', (text) => text.replace(
  /createP5RuntimeProof\('([^']+)'\)/g,
  "createP5RuntimeProof(BUILD, '$1')",
));

await rewrite('tests/p7-runtime-closure-inspector.test.ts', (text) => text.replace(
  /createP5RuntimeProof\('([^']+)'\)/g,
  "createP5RuntimeProof(build, '$1')",
));

await rewrite('tests/p7-p5-proof-entrypoint-contract.test.ts', (text) => text.replace(
  "// @ts-expect-error Vitest executes in Node; this repository intentionally omits @types/node from plugin typecheck.\n",
  '',
));

console.log('P7 rehearsal migrated to current build-bound P5 proof contract.');
