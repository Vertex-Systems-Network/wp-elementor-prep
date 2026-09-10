import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const write = (path, value) => fs.writeFileSync(path, value);

function replaceOne(path, from, to) {
  const source = read(path);
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${path}: expected one match, found ${count}: ${from.slice(0, 90)}`);
  write(path, source.replace(from, to));
}

function replaceRegexOne(path, regex, to) {
  const source = read(path);
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const matches = [...source.matchAll(new RegExp(regex.source, flags))];
  if (matches.length !== 1) throw new Error(`${path}: expected one regex match, found ${matches.length}`);
  write(path, source.replace(regex, to));
}

// README live status.
replaceRegexOne('README.md', /^\| P5 Conservative Safe Fix \|.*$/m,
  '| P5 Conservative Safe Fix | ✅ COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Real Figma Desktop acceptance + hardened closure-intake + PR #99 merge PASS |');
replaceRegexOne('README.md', /^\| P6 Advanced structures \|.*$/m,
  '| P6 Advanced structures | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P5 merged; refresh onto current main → fresh final artifact → real positive/refusal closure #7 |');
replaceRegexOne('README.md', /^\| P7 60\+ Frame batch queue \|.*$/m,
  '| P7 60+ Frame batch queue | 🟠 IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | After final P6/P5 line → fresh artifact → 60+ stress + active cancellation closure #8 |');
replaceRegexOne('README.md', /^\| P12 Final integrated validation \|.*$/m,
  '| P12 Final integrated validation | 🧪 IN PROGRESS | 40% | `████░░░░░░` | Offline cross-platform slice + genuine P5 Desktop/closure/integration slice PASS → next P6 final-line runtime closure |');
replaceRegexOne('README.md', /^\*\*Overall active project progress:\*\*.*$/m,
  '**Overall active project progress:** `██████████ 95%`');
replaceRegexOne('README.md', /^> The 93% figure.*$/m,
  '> Historical P0–P7 core progress is now 95%: P0–P5 are 100%, P6/P7 remain 80% (760 / 800 phase-points). P12 validation is tracked separately.');
replaceRegexOne('README.md', /^- P12 final validation:.*$/m,
  '- P12 final validation: `████░░░░░░ 40%`');
replaceRegexOne('README.md', /^The P12 `20%` credit.*$/m,
  'The P12 `40%` credit is two retained major validation slices: 20% cross-platform/offline acceptance + 20% genuine P5 Figma Desktop/runtime closure and final integration. P6/P7 real closure, credentialed API/plugin parity and final Community readiness remain uncredited.');
replaceOne('README.md',
  '- P5/P6/P7 runtime acceptance must use genuine final-line evidence and current-main closure intake;',
  '- P5 runtime acceptance is complete and merged; P6/P7 runtime acceptance must still use genuine final-line evidence and current-main closure intake;');
replaceRegexOne('README.md', /### Next critical path — P5[\s\S]*?## Current P5 integration map/,
`### P5 final acceptance checkpoint — COMPLETE

- ✅ real Figma development plugin ID \`1679803102348456572\` used for canonical #488-derived import;
- ✅ real Figma Desktop \`P5 Compiled Runtime Acceptance: PASS\`: accepted true, failures empty, leftovers 0;
- ✅ rendered-pixel forced reject, restore and finalize calibration PASS;
- ✅ current-main hardened closure run \`34463444342\`: canonical ZIP SHA MATCH, immutable 5/5 MATCH, manifest semantic MATCH, verifier exit 0;
- ✅ retained closure artifact \`10146495702\`, SHA-256 \`e17f0f25821fb52d8cf6427f2bda99e154eb188a62d278bbea299f6402a533d8\`;
- ✅ final integration PR #99: CI #661 + P12 Offline #16 PASS, mergeable, reviews 0, threads 0;
- ✅ merge \`91c3feda1e8841f5b07ec189c5289c701ce199f5\`; issue #6 closed completed;
- ✅ post-merge CI #662, Integration Readiness #118 and P12 Offline #17 PASS.

Evidence provenance: the repository-retained JSON was reconstructed exactly from the JSON text supplied by the user because conversation inventory did not expose a separately mounted JSON attachment. The real Desktop screenshot/result and hardened verifier agree on acceptance.

### Next critical path — P6

Freshly resolve/rebuild P6 on merged P5/current main, register a fresh final-closure-eligible artifact, collect genuine image-bearing positive + preservation-refusal evidence, pass current-main closure intake, then merge/close #7.

## Current P5 integration map — historical pre-merge`);

// Project state.
replaceRegexOne('memory-bank/PROJECT_STATE.md', /^P9–P11 implementation is complete\. P12 #84.*$/m,
  'P9–P11 implementation is complete. P12 #84 is the sole release-expansion final validation gate and is now `40%` complete after cross-platform offline acceptance plus genuine P5 Desktop/runtime closure and final integration.');
replaceRegexOne('memory-bank/PROJECT_STATE.md', /^Only properties directly exercised.*$/m,
  'Only properties directly exercised by retained evidence receive P12 credit. P5 real Desktop/runtime closure is complete; real Figma API/plugin parity, P6/P7 closure and Community review remain pending.');
replaceRegexOne('memory-bank/PROJECT_STATE.md', /^- #6 — P5 Safe Fix:.*$/m,
  '- #6 — P5 Safe Fix: CLOSED COMPLETED after real Desktop acceptance, closure-intake PASS and PR #99 merge;');
replaceRegexOne('memory-bank/PROJECT_STATE.md', /^- #7 — P6 Advanced structures:.*$/m,
  '- #7 — P6 Advanced structures: implementation complete on reference head, now unblocked for a fresh post-P5 final-line artifact/runtime closure;');
replaceRegexOne('memory-bank/PROJECT_STATE.md', /^\| P5 Safe Fix \|.*$/m,
  '| P5 Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | Real Desktop + closure-intake + PR #99 merge PASS |');
replaceRegexOne('memory-bank/PROJECT_STATE.md', /^\| P12 final validation \|.*$/m,
  '| P12 final validation | IN PROGRESS | 40% | Next critical path: P6 fresh final-line runtime closure |');
replaceRegexOne('memory-bank/PROJECT_STATE.md', /^Historical P0–P7 core progress.*$/m,
  'Historical P0–P7 core progress is now `95%` under its original eight-phase denominator: P0–P5 at 100%, P6/P7 at 80%.');
replaceRegexOne('memory-bank/PROJECT_STATE.md', /## P5 current technical state[\s\S]*?## P6\/P7 state/,
`## P5 final technical state — COMPLETE

Canonical P5 #488 real Desktop evidence passed for source \`810d98d6e09cb4cf3fe4758fcb07e87734254a8e\` / run \`34242984963\` (#488). Current-main closure run \`34463444342\` completed with canonical archive SHA MATCH, immutable 5/5 MATCH, manifest semantic MATCH and same-artifact verifier exit 0. Final integration PR #99 passed CI #661 and merged as \`91c3feda1e8841f5b07ec189c5289c701ce199f5\`; post-merge CI #662, Integration Readiness #118 and P12 Offline #17 passed. Issue #6 is closed completed.

## P6/P7 state`);
replaceOne('memory-bank/PROJECT_STATE.md',
  'P6 #494 and P7 #490 remain engineering/reference artifacts only. Final production integration requires fresh exact builds after final P5 merge and real runtime evidence in P12.',
  'P6 #494 and P7 #490 remain engineering/reference artifacts only. P5 is now merged, so P6 is unblocked for a fresh exact final-line build and real closure; P7 follows on the resulting final line.');
replaceRegexOne('memory-bank/PROJECT_STATE.md', /## Immediate target[\s\S]*?## P6\/P7 downstream integration rehearsal checkpoint/,
`## Immediate target

P6 fresh post-P5 integration/build → final-closure-eligible registry/preflight → genuine real-Figma positive/refusal evidence → current-main closure intake → merge/close #7.

## P6/P7 downstream integration rehearsal checkpoint`);

// Roadmap live status; preserve the runtime-artifact schema anchor in its existing section.
replaceRegexOne('memory-bank/ROADMAP.md', /^\| P5 \|.*$/m,
  '| P5 | Conservative Safe Fix recipes + exact-build proof | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Real Desktop + closure-intake + PR #99 merge PASS |');
replaceRegexOne('memory-bank/ROADMAP.md', /^\| P6 \|.*$/m,
  '| P6 | Advanced timeline/carousel/milestone/page normalization | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | P5 merged → fresh post-P5 registered artifact → real positive/refusal closure #7 |');
replaceRegexOne('memory-bank/ROADMAP.md', /^\| P12 \|.*$/m,
  '| P12 | Final integrated validation/release acceptance | IN PROGRESS | 40% | `████░░░░░░` | Offline slice + genuine P5 slice PASS; next P6 final-line runtime closure |');
replaceRegexOne('memory-bank/ROADMAP.md', /^\*\*Historical core P0–P7 progress:\*\*.*$/m,
  '**Historical core P0–P7 progress:** `██████████ 95%`');
replaceOne('memory-bank/ROADMAP.md','This remains the original core denominator.','This remains the original eight-phase core denominator: P0–P5 are complete, P6/P7 remain at 80%.');
replaceRegexOne('memory-bank/ROADMAP.md', /^\*\*P12 final validation:\*\*.*$/m,
  '**P12 final validation:** `████░░░░░░ 40%`.');
replaceRegexOne('memory-bank/ROADMAP.md', /^The 20% credit.*$/m,
  'The 40% credit consists of retained cross-platform/offline acceptance (20%) plus genuine P5 Figma Desktop/runtime closure and final integration (20%). P6/P7, real API/plugin parity and Community readiness remain pending.');
replaceRegexOne('memory-bank/ROADMAP.md', /## P5 — next critical path[\s\S]*?## P6\/P7/,
`## P5 final acceptance — COMPLETE

Canonical P5 #488 remains registered in \`config/runtime-artifacts.json\` schema v3 as final-closure eligible. Real Figma Desktop acceptance passed using plugin ID \`1679803102348456572\`; closure run \`34463444342\` passed archive/artifact/evidence/verifier gates. PR #99 merged at \`91c3feda1e8841f5b07ec189c5289c701ce199f5\` after CI #661; issue #6 is closed.

## P6 — next critical path

Resolve/rebuild P6 on merged P5/current main, publish/register a fresh exact artifact, collect genuine image-bearing positive + preservation-refusal observations, pass current-main closure intake, then merge/close #7.

## P6/P7`);
replaceOne('memory-bank/ROADMAP.md', '- P5 real Desktop/rendered-pixel closure + final integration;\n', '');
replaceRegexOne('memory-bank/ROADMAP.md', /^This is maintenance, not product\/runtime acceptance\..*$/m,
  'This maintenance did not itself consume acceptance credit; subsequent genuine P5 completion moved P5 to 100%, P12 to 40%, and historical core to 95%.');

// Next actions.
replaceRegexOne('memory-bank/NEXT_ACTIONS.md', /^P9–P11 implementation is complete\. P12 #84.*$/m,
  'P9–P11 implementation is complete. P12 #84 is active at `40%` after cross-platform offline acceptance plus genuine P5 Desktop/runtime closure and final integration.');
replaceRegexOne('memory-bank/NEXT_ACTIONS.md', /^- #6 — P5 Safe Fix:.*$/m,
  '- #6 — P5 Safe Fix: CLOSED COMPLETED; real Desktop acceptance + closure-intake + PR #99 merge PASS;');
replaceRegexOne('memory-bank/NEXT_ACTIONS.md', /^- #7 — P6 Advanced structures:.*$/m,
  '- #7 — P6 Advanced structures: **next critical path**; fresh post-P5 artifact + real positive/refusal closure;');
replaceRegexOne('memory-bank/NEXT_ACTIONS.md', /^- #8 — P7 Batch queue:.*$/m,
  '- #8 — P7 Batch queue: follows final P6/P5 line with fresh 60+ stress/cancel closure;');
replaceRegexOne('memory-bank/NEXT_ACTIONS.md', /^- #84 — P12 final integrated validation,.*$/m,
  '- #84 — P12 final integrated validation, 40% complete.');
replaceRegexOne('memory-bank/NEXT_ACTIONS.md', /## Immediate P5 sequence[\s\S]*?## Current integration fact[\s\S]*?This list is a pre-closure planning fact only; refresh again before final P5 integration\./,
`## Completed P5 final sequence

- real Figma development plugin ID \`1679803102348456572\` used;
- canonical #488-derived plugin imported and Runtime Self-Test passed in genuine Figma Desktop;
- accepted true / failures empty / leftovers 0, with rendered-pixel reject/restore/finalize PASS;
- current-main closure run \`34463444342\` PASS with canonical ZIP SHA MATCH, immutable 5/5, manifest semantic MATCH and verifier exit 0;
- final integration PR #99 CI #661 + P12 Offline #16 PASS;
- merge \`91c3feda1e8841f5b07ec189c5289c701ce199f5\`; #6 closed;
- post-merge CI #662 + Integration Readiness #118 + P12 Offline #17 PASS.

## Immediate P6 sequence

1. refresh/resolve canonical P6 against merged P5/current main;
2. run full repository/provenance/release checks;
3. publish and register a fresh exact P6 artifact as final-closure eligible;
4. current-main final-closure preflight PASS;
5. genuine Figma image-bearing positive calibration + preservation refusal;
6. export unedited \`p6-closure.json\`;
7. current-main \`runtime:closure-intake -- p6 ...\` PASS;
8. merge P6 and close #7.`);
replaceRegexOne('memory-bank/NEXT_ACTIONS.md', /^- historical P0–P7 core progress:.*$/m,
  '- historical P0–P7 core progress: `95%`;');
replaceRegexOne('memory-bank/NEXT_ACTIONS.md', /^- P12 final validation:.*$/m,
  '- P12 final validation: `40%`.');
replaceRegexOne('memory-bank/NEXT_ACTIONS.md', /^- This does not consume P12 acceptance credit\..*$/m,
  '- This maintenance did not itself consume P12 credit. Genuine P5 completion subsequently moved the immediate product action to P6 final-line closure.');

// Changelog prepend.
const changelog = 'memory-bank/CHANGELOG.md';
let history = read(changelog);
const marker = '### P5 genuine Desktop acceptance, hardened closure and final integration';
if (history.includes(marker)) throw new Error('P5 final changelog marker already exists');
const entry = `## 2026-09-10\n\n${marker}\n\n- Real Figma development plugin ID \`1679803102348456572\`; canonical #488 Desktop Runtime Self-Test accepted true with failures empty and leftovers 0.\n- Rendered-pixel forced reject, restore and finalize calibration PASS.\n- Current-main closure run \`34463444342\`: canonical ZIP SHA MATCH, immutable 5/5 MATCH, manifest semantic MATCH, same-artifact verifier exit 0.\n- Evidence byte SHA-256 \`ce5800eb3c5fb3e57d56ac61ffcb0e97d9d569d3d4097f103c546c1605c5a8b5\`; retained closure artifact \`10146495702\`, ZIP SHA-256 \`e17f0f25821fb52d8cf6427f2bda99e154eb188a62d278bbea299f6402a533d8\`.\n- Provenance: retained repository JSON is an exact reconstruction of user-provided JSON text because conversation inventory did not expose a separately mounted JSON attachment.\n- Fresh 11-conflict integration resolution passed full suite; PR #99 CI #661 + P12 Offline #16 PASS; squash merge \`91c3feda1e8841f5b07ec189c5289c701ce199f5\`.\n- Post-merge CI #662, Integration Readiness #118 and P12 Offline #17 PASS; issue #6 closed completed.\n- P5 = 100%; historical P0–P7 core = 95%; P12 = 40%. P6 is the next final-line runtime gate.\n\n`;
if (!history.startsWith('# Changelog\n\n')) throw new Error('Unexpected CHANGELOG header');
history = history.replace('# Changelog\n\n', `# Changelog\n\n${entry}`);
write(changelog, history);
