import { readFile, writeFile } from 'node:fs/promises';

async function load(path) { return readFile(path, 'utf8'); }
async function save(path, content) { await writeFile(path, content, 'utf8'); }

function replaceOnce(text, from, to, label) {
  if (!text.includes(from)) throw new Error(`Missing sync anchor: ${label}`);
  const first = text.indexOf(from);
  if (text.indexOf(from, first + from.length) !== -1) throw new Error(`Duplicate sync anchor: ${label}`);
  return text.replace(from, to);
}

const checkpoint = `### P6/P7 downstream integration rehearsal checkpoint — non-authorizing\n\n- ✅ both rehearsals are based on current main \`84ea74f7550edb1a4857e40fe4addb14369abb6f\` after applying the proven canonical P5 resolution;\n- ✅ P6 canonical \`9a6ae3b29e2f70ebbd987a686856c2957f590b75\`: exact post-P5 conflict set \`10 → 0\`; latest same-head rehearsal run \`34421353122\` PASS; retained artifact \`10131008051\`, ZIP SHA-256 \`96a175e83970a168c5ea2f0af0df2f057e50937330200632e468c86b7be6c650\`;\n- ✅ P7 canonical \`cbfdb66db531da8613582c84523265e42dad63a2\`: exact post-P5 conflict set \`15 → 0\`; latest rehearsal run \`34421353146\` PASS with 66 test files / 323 tests plus status/typecheck/build/CLI/release/Community/P12-offline checks;\n- ✅ P7 rehearsal preserves the current stronger build-bound P5 proof contract plus exact-build P7 receipt rather than adopting the older unbound P5 proof model from the P7 branch;\n- ✅ P7 development batch/runtime controls remain present in the development artifact while the normal release manifest/UI stays gated; prepared-import code/UI bytes remain unchanged;\n- ✅ retained P7 artifact \`10131008310\`, ZIP SHA-256 \`22a9473bead40053fb07e80aa0b00e1dd117c9bd0bbd94e395dd8afd57567982\`;\n- ⚠️ both evidence bundles are explicitly \`acceptanceAuthority: false\`. P6 stays 80%, P7 stays 80%, P12 stays 20%; real Figma closure and fresh final-line artifacts remain mandatory.\n\n`;

let readme = await load('README.md');
readme = replaceOnce(
  readme,
  '| P6 Advanced structures | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 merge: resolve P6 → fresh artifact → real positive/refusal closure #7 |',
  '| P6 Advanced structures | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | Post-P5 rehearsal 10→0 PASS; after actual P5 merge refresh resolution → fresh artifact → real positive/refusal closure #7 |',
  'README P6 row',
);
readme = replaceOnce(
  readme,
  '| P7 60+ Frame batch queue | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P12 after P5 merge: resolve P7 → fresh artifact → 60+ stress + active cancellation closure #8 |',
  '| P7 60+ Frame batch queue | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | Post-P5 rehearsal 15→0 PASS; after actual P5 merge refresh resolution → fresh artifact → 60+ stress + active cancellation closure #8 |',
  'README P7 row',
);
readme = replaceOnce(
  readme,
  '| P12 Final integrated validation | 🧪 IN PROGRESS | 20% | `██░░░░░░░░` | Offline cross-platform slice PASS → next genuine P5 Desktop/runtime closure + real API/plugin acceptance |',
  '| P12 Final integrated validation | 🧪 IN PROGRESS | 20% | `██░░░░░░░░` | Offline cross-platform + P5/P6/P7 integration rehearsals PASS → next genuine P5 Desktop/runtime closure + real API/plugin acceptance |',
  'README P12 row',
);
if (!readme.includes('### P6/P7 downstream integration rehearsal checkpoint — non-authorizing')) {
  readme = replaceOnce(
    readme,
    'Detailed engineering history is retained in `memory-bank/CHANGELOG.md`.',
    `${checkpoint}Detailed engineering history is retained in \`memory-bank/CHANGELOG.md\`.`,
    'README detailed history marker',
  );
}
await save('README.md', readme);

const memorySection = `\n## P6/P7 downstream integration rehearsal checkpoint — 2026-09-10\n\n- Current-main basis: \`84ea74f7550edb1a4857e40fe4addb14369abb6f\`, after the proven P5 rehearsal resolution.\n- P6 \`9a6ae3b29e2f70ebbd987a686856c2957f590b75\`: 10 real post-P5 conflicts → 0 unresolved; latest run \`34421353122\` PASS; artifact \`10131008051\`; SHA-256 \`96a175e83970a168c5ea2f0af0df2f057e50937330200632e468c86b7be6c650\`.\n- P7 \`cbfdb66db531da8613582c84523265e42dad63a2\`: 15 real post-P5 conflicts → 0 unresolved; run \`34421353146\` PASS; 66 test files / 323 tests PASS; artifact \`10131008310\`; SHA-256 \`22a9473bead40053fb07e80aa0b00e1dd117c9bd0bbd94e395dd8afd57567982\`.\n- P7 compatibility was migrated to the stronger current build-bound P5 proof contract plus exact-build P7 receipt; the older unbound P5 proof model was not restored.\n- Development-only P6/P7 controls remain excluded from the normal release surface.\n- These rehearsals are \`acceptanceAuthority: false\`; they do not change P6/P7/P12 percentages or remove real-Figma/fresh-artifact closure requirements.\n`;

for (const path of ['memory-bank/PROJECT_STATE.md', 'memory-bank/ROADMAP.md', 'memory-bank/NEXT_ACTIONS.md']) {
  let text = await load(path);
  if (!text.includes('## P6/P7 downstream integration rehearsal checkpoint — 2026-09-10')) {
    text = `${text.trimEnd()}\n${memorySection}\n`;
  }
  await save(path, text);
}

let changelog = await load('memory-bank/CHANGELOG.md');
const changelogEntry = `### P6/P7 downstream integration rehearsals\n- Built a retained current-main/P5 downstream conflict probe and fixed its evidence-retention harness before treating any output as valid.\n- P6 canonical head \`9a6ae3b\` produced 10 post-P5 conflicts; deterministic resolution preserved current-main P9–P12/import/provenance safety, added only P6-specific runtime surfaces, and passed run \`34421353122\`.\n- Retained P6 rehearsal artifact \`10131008051\`, ZIP SHA-256 \`96a175e83970a168c5ea2f0af0df2f057e50937330200632e468c86b7be6c650\`.\n- P7 canonical head \`cbfdb66\` produced 15 post-P5 conflicts. The first integrated run exposed old unbound-P5-proof API assumptions; the rehearsal was migrated to the stronger current build-bound P5 proof contract rather than weakening it.\n- Final P7 rehearsal run \`34421353146\` passed 66 test files / 323 tests plus status, typecheck, builds, CLI, release, Community and P12-offline checks; exact-build P7 receipt and release-surface gating were preserved.\n- Retained P7 rehearsal artifact \`10131008310\`, ZIP SHA-256 \`22a9473bead40053fb07e80aa0b00e1dd117c9bd0bbd94e395dd8afd57567982\`.\n- Both rehearsals are non-authorizing and leave P6 80%, P7 80%, P12 20%; genuine runtime evidence and fresh final-line artifacts remain mandatory.\n\n`;
if (!changelog.includes('### P6/P7 downstream integration rehearsals')) {
  changelog = replaceOnce(changelog, '## 2026-09-10\n\n', `## 2026-09-10\n\n${changelogEntry}`, 'CHANGELOG 2026-09-10');
}
await save('memory-bank/CHANGELOG.md', changelog);

console.log('Downstream rehearsal status surfaces synchronized.');
