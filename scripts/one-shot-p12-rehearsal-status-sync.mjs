import { readFile, writeFile } from 'node:fs/promises';

const checkpoint = {
  main: '3c3dc14bc48c3ea8e5df7620e223de0229737d9e',
  p5: '810d98d6e09cb4cf3fe4758fcb07e87734254a8e',
  rehearsalHead: '536d4b0f3b07d1675ab5cf87b69a83dbce7d6ebc',
  rehearsalRun: '34416999259',
  rehearsalArtifact: '10129465465',
  rehearsalDigest: 'faac0ca60f83c85931ccfd030f70d9672afbd03e55224a48631a2d5b029779b7',
  preflightRun: '34416999458',
};

async function insertBefore(path, anchor, marker, block) {
  const text = await readFile(path, 'utf8');
  if (text.includes(marker)) return;
  const index = text.indexOf(anchor);
  if (index < 0) throw new Error(`${path}: anchor not found: ${anchor}`);
  await writeFile(path, `${text.slice(0, index)}${block}\n\n${text.slice(index)}`, 'utf8');
}

await insertBefore(
  'README.md',
  'Detailed engineering history is retained in `memory-bank/CHANGELOG.md`.',
  '### P5 integration rehearsal checkpoint — non-authorizing',
  `### P5 integration rehearsal checkpoint — non-authorizing\n\n- ✅ current-main + canonical P5 three-way integration rehearsal PASS: main \`${checkpoint.main}\` + P5 \`${checkpoint.p5}\`;\n- ✅ exact current conflict set resolved in rehearsal: \`11 → 0\` unresolved paths, with no conflict markers;\n- ✅ latest repeat rehearsal run \`${checkpoint.rehearsalRun}\` on head \`${checkpoint.rehearsalHead}\` passed \`195/195\` integrated tests plus status/typecheck/plugin build/CLI build/release/Community/P12-offline checks;\n- ✅ P9 audit/backlog remained non-mutating while P5 Safe Fix stayed separately runtime-gated;\n- ✅ P5 development UI remained available without leaking P5 validation/mutation controls into the normal P11 release UI;\n- ✅ P5 source/run provenance globals were resolved in release code and current local-import overlap safety remained enforced;\n- ✅ retained rehearsal artifact \`${checkpoint.rehearsalArtifact}\`, ZIP SHA-256 \`${checkpoint.rehearsalDigest}\`;\n- ✅ canonical Actions artifact #488 + retained ZIP re-downloaded and current-contract \`runtime:preflight\` PASS in run \`${checkpoint.preflightRun}\`;\n- ⚠️ rehearsal evidence is explicitly \`acceptanceAuthority: false\`: P5 remains 94%, P12 remains 20%, and real Figma Desktop/rendered-pixel/closure evidence is still mandatory.`,
);

await insertBefore(
  'memory-bank/PROJECT_STATE.md',
  '## P5 current technical state',
  '## P5 integration rehearsal — non-authorizing PASS',
  `## P5 integration rehearsal — non-authorizing PASS\n\nA branch-only three-way rehearsal integrated canonical P5 \`${checkpoint.p5}\` with current main \`${checkpoint.main}\` without merging P5 or changing acceptance state. Latest repeat run \`${checkpoint.rehearsalRun}\` on rehearsal head \`${checkpoint.rehearsalHead}\` resolved the exact \`11\` current conflicts to \`0\`, then passed \`195/195\` integrated tests, status verification, strict typecheck, plugin/CLI builds, release-contract/package verification, Community template verification, P12 offline acceptance and local-import overlap invariants.\n\nThe rehearsal retained P9 audit/backlog non-mutation, P5 runtime-gated Safe Fix seams, current-main import safety, separate development vs normal-release UI exposure, and resolved P5 source/run provenance defines in release code. Retained artifact: \`${checkpoint.rehearsalArtifact}\`, SHA-256 \`${checkpoint.rehearsalDigest}\`.\n\nCanonical #488 + retained ZIP also passed current-contract \`runtime:preflight\` in run \`${checkpoint.preflightRun}\`. The rehearsal is explicitly non-authorizing and does not replace genuine Figma Desktop evidence; P5 remains \`94%\` and P12 remains \`20%\`.`,
);

await insertBefore(
  'memory-bank/ROADMAP.md',
  '## P5 — next critical path',
  '## P5 integration rehearsal checkpoint',
  `## P5 integration rehearsal checkpoint\n\nBefore real runtime closure, current main \`${checkpoint.main}\` and canonical P5 \`${checkpoint.p5}\` were exercised through a real three-way merge rehearsal. Latest repeat run \`${checkpoint.rehearsalRun}\` resolved the \`11\` known conflicts to \`0\` and passed the full integrated repository/release/offline suite, including \`195/195\` tests. Retained artifact \`${checkpoint.rehearsalArtifact}\` has ZIP SHA-256 \`${checkpoint.rehearsalDigest}\`.\n\nCurrent-contract canonical #488 + retained-ZIP preflight also passed in run \`${checkpoint.preflightRun}\`. This lowers final integration risk but has no acceptance authority; the conflict map must still be refreshed after genuine P5 closure and no progress percentage changes from this rehearsal.`,
);

await insertBefore(
  'memory-bank/NEXT_ACTIONS.md',
  '## Immediate P5 sequence',
  '## Completed P5 integration rehearsal — no acceptance credit',
  `## Completed P5 integration rehearsal — no acceptance credit\n\nLatest repeat run \`${checkpoint.rehearsalRun}\` on rehearsal head \`${checkpoint.rehearsalHead}\` proved a current-main/P5 resolution path: \`11 → 0\` conflicts, \`195/195\` tests PASS, all status/build/release/offline checks PASS, P5 dev UI retained, normal release UI gated, provenance globals resolved and import-overlap safety retained. Evidence artifact: \`${checkpoint.rehearsalArtifact}\` / SHA-256 \`${checkpoint.rehearsalDigest}\`.\n\nCanonical #488 + retained ZIP current-contract preflight also PASSed in run \`${checkpoint.preflightRun}\`. Do not merge the rehearsal branch or count this as runtime acceptance. The next action remains genuine exact-artifact Figma Desktop closure, followed by a fresh integration refresh.`,
);

const changelogPath = 'memory-bank/CHANGELOG.md';
const changelog = await readFile(changelogPath, 'utf8');
const changelogMarker = '### P12 P5 integration rehearsal and current-contract preflight';
if (!changelog.includes(changelogMarker)) {
  const anchor = '## 2026-09-10\n';
  const index = changelog.indexOf(anchor);
  if (index < 0) throw new Error('CHANGELOG 2026-09-10 anchor not found.');
  const insertAt = index + anchor.length;
  const block = `\n### P12 P5 integration rehearsal and current-contract preflight\n- Rehearsed canonical P5 \`${checkpoint.p5}\` against current main \`${checkpoint.main}\` through a real branch-only three-way merge; exact conflict set was \`11\` paths and resolved to \`0\` unresolved entries.\n- Latest repeat rehearsal run \`${checkpoint.rehearsalRun}\` on head \`${checkpoint.rehearsalHead}\` passed \`195/195\` integrated tests plus status/typecheck/plugin build/CLI build/release-contract/release-package/Community/P12-offline/import-safety checks.\n- Preserved P9 audit/backlog non-mutation, P5 runtime-gated Safe Fix seams, current-main source/output overlap protection, separate development/release UI exposure and P5 source/run provenance defines in release code.\n- Retained latest rehearsal artifact \`${checkpoint.rehearsalArtifact}\`, ZIP SHA-256 \`${checkpoint.rehearsalDigest}\`.\n- Re-downloaded canonical P5 Actions artifact #488 and retained ZIP; current-contract \`runtime:preflight\` passed in run \`${checkpoint.preflightRun}\`.\n- Rehearsal evidence is explicitly non-authorizing; P5 remains 94%, P12 remains 20%, and real imported-Figma Desktop/rendered-pixel/closure-intake evidence is still required.\n`;
  await writeFile(changelogPath, `${changelog.slice(0, insertAt)}${block}${changelog.slice(insertAt)}`, 'utf8');
}

console.log('P12 rehearsal status surfaces synchronized without changing acceptance percentages.');
