import { readFile, writeFile } from 'node:fs/promises';

async function insertBefore(path, anchor, marker, block) {
  const before = await readFile(path, 'utf8');
  if (before.includes(marker)) return;
  const index = before.indexOf(anchor);
  if (index < 0) throw new Error(`${path}: anchor not found: ${anchor}`);
  const after = `${before.slice(0, index)}${block}\n\n${before.slice(index)}`;
  await writeFile(path, after, 'utf8');
}

async function appendSection(path, marker, block) {
  const before = await readFile(path, 'utf8');
  if (before.includes(marker)) return;
  const after = `${before.trimEnd()}\n\n${block}\n`;
  await writeFile(path, after, 'utf8');
}

async function insertAfter(path, anchor, marker, block) {
  const before = await readFile(path, 'utf8');
  if (before.includes(marker)) return;
  const index = before.indexOf(anchor);
  if (index < 0) throw new Error(`${path}: anchor not found: ${anchor}`);
  const at = index + anchor.length;
  const after = `${before.slice(0, at)}\n\n${block}${before.slice(at)}`;
  await writeFile(path, after, 'utf8');
}

const readmeBlock = `### P12 dependency security checkpoint — complete\n\n- ✅ pre-fix dependency audit run \`34422011818\` found exactly 2 moderate **dev-only** findings in Vitest / \`@vitest/mocker\` under \`GHSA-82fw-gwwq-j7x9\`; production-only \`npm audit --omit=dev\` was already 0;\n- ✅ retained pre-fix audit artifact \`10131236873\`, ZIP SHA-256 \`4d7c7b7f7d0e4bc5798e5d56465071e0bcf6fc28e04878ab96a292f9ed0ed8c9\`;\n- ✅ issue #96 / PR #97 updated only dev dependency \`vitest\` from \`^3.2.0\` to \`^4.1.11\`, without \`npm audit fix --force\`;\n- ✅ one-shot compatibility run \`34423555371\` installed Vitest 4.1.11 and passed status/typecheck/tests/plugin build/CLI build/release/Community/P12-offline/import-integrity checks; full audit = 0 and production-only audit = 0;\n- ✅ retained clean-audit artifact \`10131793673\`, ZIP SHA-256 \`c64dd7a76bc61c9980f3a254e50fa90deeb16fc7e19ba06de4c7fccb4e21aa91\`;\n- ✅ PR #97 CI #657 PASS and P12 Offline #12 PASS on Linux/macOS/Windows; squash merge \`01f959ebc792823ee67aa386a65335aab564d667\`;\n- ✅ post-merge CI #658 PASS, Integration Readiness #115 PASS and P12 Offline #13 PASS on Linux/macOS/Windows; issue #96 closed completed;\n- ⚠️ this is dependency-security maintenance only: P5 stays 94%, P6/P7 stay 80%, P12 stays 20%, historical core stays 93%, and all genuine Figma/runtime gates remain unchanged.`;

const projectStateBlock = `## P12 dependency security checkpoint — complete\n\nIssue #96 / PR #97 cleared the two moderate dev-toolchain audit findings without changing runtime/product code. The pre-fix retained audit (run \`34422011818\`, artifact \`10131236873\`, SHA-256 \`4d7c7b7f7d0e4bc5798e5d56465071e0bcf6fc28e04878ab96a292f9ed0ed8c9\`) showed both findings were Vitest / \`@vitest/mocker\` advisory \`GHSA-82fw-gwwq-j7x9\`; production-only audit was already zero.\n\nVitest was updated from \`^3.2.0\` to \`^4.1.11\`. Compatibility run \`34423555371\` passed the full repository/release/offline/import suite and both full + production audits at zero; retained artifact \`10131793673\` has SHA-256 \`c64dd7a76bc61c9980f3a254e50fa90deeb16fc7e19ba06de4c7fccb4e21aa91\`. PR #97 CI #657 and cross-platform P12 Offline #12 passed, squash merge \`01f959ebc792823ee67aa386a65335aab564d667\` closed #96, and post-merge CI #658 / Integration Readiness #115 / P12 Offline #13 all passed.\n\nNo P5/P6/P7/P12 acceptance percentage changes from this maintenance checkpoint; genuine real-Figma/API/runtime/Community gates remain pending.`;

const nextActionsBlock = `## Completed dependency-security maintenance — 2026-09-10\n\n- #96 / PR #97 updated dev-only Vitest \`^3.2.0 → ^4.1.11\` for \`GHSA-82fw-gwwq-j7x9\`; no force audit fix was used.\n- Pre-fix run \`34422011818\`: 2 moderate dev-only findings, production audit 0; artifact \`10131236873\` / SHA-256 \`4d7c7b7f7d0e4bc5798e5d56465071e0bcf6fc28e04878ab96a292f9ed0ed8c9\`.\n- Compatibility run \`34423555371\`: full suite PASS, full audit 0, production audit 0; artifact \`10131793673\` / SHA-256 \`c64dd7a76bc61c9980f3a254e50fa90deeb16fc7e19ba06de4c7fccb4e21aa91\`.\n- PR #97 CI #657 + P12 Offline #12 PASS; merge \`01f959ebc792823ee67aa386a65335aab564d667\`; post-merge CI #658 + Integration Readiness #115 + P12 Offline #13 PASS.\n- This does not consume P12 acceptance credit. The immediate next product action remains genuine P5 Figma Desktop/rendered-pixel closure.`;

const roadmapBlock = `## Dependency security checkpoint — 2026-09-10\n\nP12 maintenance issue #96 / PR #97 cleared Vitest advisory \`GHSA-82fw-gwwq-j7x9\` by moving the dev dependency from \`^3.2.0\` to \`^4.1.11\`. Pre-fix audit run \`34422011818\` had 2 moderate dev-only findings and zero production findings; compatibility run \`34423555371\` passed the complete repository/release/offline/import matrix with full audit = 0 and production audit = 0. PR #97 merged at \`01f959ebc792823ee67aa386a65335aab564d667\`; post-merge CI #658, Integration Readiness #115 and P12 Offline #13 all passed.\n\nThis is maintenance, not product/runtime acceptance. P12 remains 20%, P5 94%, P6/P7 80%, and historical core 93%.`;

const changelogBlock = `### P12 Vitest dependency advisory remediation\n- Audited the recurring \`npm install\` warning with retained run \`34422011818\`: full audit reported exactly two moderate dev-only findings, while \`npm audit --omit=dev\` reported zero production vulnerabilities.\n- Both findings mapped to Vitest / \`@vitest/mocker\` advisory \`GHSA-82fw-gwwq-j7x9\`; retained pre-fix artifact \`10131236873\` has ZIP SHA-256 \`4d7c7b7f7d0e4bc5798e5d56465071e0bcf6fc28e04878ab96a292f9ed0ed8c9\`.\n- Filed #96 and updated only the dev dependency \`vitest\` from \`^3.2.0\` to \`^4.1.11\`; did not use \`npm audit fix --force\`.\n- One-shot compatibility run \`34423555371\` installed Vitest 4.1.11 and passed status verification, typecheck, all tests, plugin/CLI builds, release checks, Community template check, P12 offline acceptance and import byte-preservation; both full and production audit totals were zero.\n- Retained clean-audit artifact \`10131793673\`, ZIP SHA-256 \`c64dd7a76bc61c9980f3a254e50fa90deeb16fc7e19ba06de4c7fccb4e21aa91\`.\n- PR #97 passed CI #657 and P12 Offline #12 on Linux/macOS/Windows, was mergeable with zero reviews/threads, and squash-merged at \`01f959ebc792823ee67aa386a65335aab564d667\`, auto-closing #96.\n- Post-merge CI #658, Integration Readiness #115 and P12 Offline #13 all passed. No product/runtime acceptance percentages changed.`;

await insertBefore(
  'README.md',
  'Detailed engineering history is retained in `memory-bank/CHANGELOG.md`.',
  '### P12 dependency security checkpoint — complete',
  readmeBlock,
);
await insertBefore(
  'memory-bank/PROJECT_STATE.md',
  '## P5 current technical state',
  '## P12 dependency security checkpoint — complete',
  projectStateBlock,
);
await appendSection(
  'memory-bank/NEXT_ACTIONS.md',
  '## Completed dependency-security maintenance — 2026-09-10',
  nextActionsBlock,
);
await insertBefore(
  'memory-bank/ROADMAP.md',
  '## Execution policy',
  '## Dependency security checkpoint — 2026-09-10',
  roadmapBlock,
);
await insertAfter(
  'memory-bank/CHANGELOG.md',
  '## 2026-09-10\n',
  '### P12 Vitest dependency advisory remediation',
  changelogBlock,
);

console.log('P12 Vitest dependency-security status synchronization applied.');
