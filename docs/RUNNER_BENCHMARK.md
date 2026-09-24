# Runner Benchmark

Status: CANONICAL / ACTIVE  
Owner issue: #631  
Established: 2026-09-21

Machine-readable canonical ledger: `.ai/state/RUNNER-BENCHMARK.yaml`. This Markdown file is the human-readable policy/view and must not contradict the machine-readable ledger.

## Purpose

This file is the canonical queue for development work that requires GitHub Actions, hosted/self-hosted runners, CI matrices, target harness runners, or other repository Runner execution.

The objective is to avoid repeatedly spending Runner time after every small implementation step while preserving exact-head security, release, and acceptance requirements.

## Mandatory policy

Runner registration NEVER grants execution authority. Consumed, expired, historical, destructive, provider, production, deployment, release, or formal-runtime authorization must never be inferred or silently reused.

1. Every newly discovered Runner-dependent task MUST be added here when it is discovered.
2. Every entry MUST record its phase/issue, trigger, required workflow/runner, dependencies, expected evidence, execution class, and current status.
3. The default class for a safely deferable Runner activity that is not required for current merge/release correctness is `PROJECT_FINAL`: record it now and execute it with the consolidated project-final Runner pass. Use `FINAL_BATCH` for Runner gates required on the exact head before the current release-train/PR may merge.
4. Use `BLOCKING_NOW` instead of `FINAL_BATCH` when the Runner result is:
   - security-critical;
   - required to continue safely;
   - required to validate a migration or destructive/authority-changing change;
   - release-blocking for the current acceptance objective;
   - required by a repository rule before merge.
5. `POST_MERGE` is reserved for controls that can only observe the merged `main` state.
6. External/manual runtime evidence such as live Figma account or marketplace actions is not converted into synthetic Runner work. Track it in its owning phase/issue instead.
7. Batching never authorizes skipping, weakening, reinterpreting, or fabricating a required check.
8. After a final batch failure, fix the cause, rerun the directly affected Runner task(s), then rerun every exact-head gate required for merge/release.
9. A Runner task is complete only when retained evidence exists: workflow/run identity, exact commit SHA, conclusion, and any required artifact/receipt identity.

## Execution classes

| Class | Meaning |
|---|---|
| `PROJECT_FINAL` | Safely defer across ordinary development/release trains and execute together at the final project acceptance checkpoint; never use for a required merge/security/exact-head gate. |
| `FINAL_BATCH` | Defer until the consolidated exact-head Runner pass for the active development/release train because it is required before merge/release acceptance. |
| `BLOCKING_NOW` | Run immediately because later work would otherwise be unsafe, invalid, or blocked. |
| `POST_MERGE` | Run/observe only after the accepted PR is merged to `main`. |
| `CONDITIONAL` | Required only when the documented path/phase/target surface is touched. |

## Standing final-batch baseline

These are the standing repository Runner gates. A focused release train may require a subset during iteration, but the final exact-head checkpoint must satisfy every gate required by the repository/phase.

| Benchmark ID | Gate | Runner / workflow | Class | Trigger | Expected evidence | Status |
|---|---|---|---|---|---|---|
| RB-001 | Core CI | GitHub Actions / CI | `FINAL_BATCH` | Every merge candidate | exact-head typecheck, tests, build and repository contracts PASS | BASELINE |
| RB-002 | Security analysis | CodeQL + locked dependency audit | `FINAL_BATCH` | Every security/release candidate and whenever required by branch policy | CodeQL PASS and dependency audit meets configured threshold | BASELINE |
| RB-003 | Final release artifact | P12 Final Release Artifact | `FINAL_BATCH` | Release/provenance-sensitive merge candidate | exact-head artifact/provenance verification PASS | BASELINE |
| RB-004 | Cross-platform offline acceptance | P12 Offline Acceptance | `FINAL_BATCH` | Release/integration checkpoint | required Linux/Windows/macOS matrix PASS | BASELINE |
| RB-005 | Integration readiness | Integration Readiness | `FINAL_BATCH` | Every PR because the workflow is always-reporting | exact-head readiness PASS | BASELINE |
| RB-006 | Elementor real-target proof | P15 Real Elementor Target Proof | `CONDITIONAL` | P15 bridge/import/render/proof-chain or target-binding surface changes | exact-bound target proof PASS with retained run identity | CONDITIONAL |
| RB-007 | Main PR-origin audit | Main PR Origin Audit | `POST_MERGE` | Every push/merge to `main` | merged-PR association PASS and forced-update detection remains clean | POST_MERGE |
| RB-008 | P17 controlled local browser proof | P17 Local Browser Proof | `CONDITIONAL` | P17 neutral Web export/package-validation/browser-proof surfaces change | exact-head local-only Chrome render receipt PASS, bound to commit/run identity, with zero external/blocked requests and visual fidelity/reconstruction/production authority still false | CONDITIONAL |

## Project-final Runner queue

Every Runner-dependent activity that can safely wait until project completion is accumulated here instead of being executed repeatedly during normal development.

| Queue ID | Phase / issue | Task / trigger | Runner / workflow | Dependencies | Class | Expected evidence | Status |
|---|---|---|---|---|---|---|---|
| — | — | No safely deferable project-final Runner task recorded yet. | — | — | `PROJECT_FINAL` | — | EMPTY |

## Deferred Runner queue

Add one row immediately when a new Runner-dependent task is discovered. Do not wait until the end of the phase to remember it.

| Queue ID | Phase / issue | Task / trigger | Runner / workflow | Dependencies | Class | Expected evidence | Status |
|---|---|---|---|---|---|---|---|
| RQ-634-FINAL | #634 | Full exact-head acceptance after coordinated Node/toolchain migration | CI; CodeQL; P12 Final Release Artifact; P12 Offline Acceptance; Integration Readiness; P15 Real Elementor Target Proof; P17 Local Browser Proof | final exact PR head `a971db96dbfbf228329bdc185875f873724b27e1` observed PASS across all required gates; merged main `92c153a4acba2b53e02c938567241c82db880907`; post-merge PR-origin audit, CodeQL, CI, P12 Final, offline matrix, Integration and P17 observed PASS | DONE |
| RQ-639-FINAL | #639 | Durable post-toolchain merge state reconciliation | Required PR exact-head gate set | PR #640 exact head `e7a6a59c02e3959df6547283828e1e58cdc6cbc6`; required checks PASS; merged main `84c5809327afec2ddef0a6fb78bffc0cd9fcc2c6`; post-merge required checks observed PASS | `FINAL_BATCH` | exact-head governance tests and required repository checks PASS | DONE |
| RQ-641-FINAL | #641 | P14 vertical-stack qualification exact-head acceptance | CI; CodeQL; Integration Readiness; P12 Offline Acceptance; P12 Final Release Artifact; P15 Real Elementor Target Proof | exact PR head `b5a5b4382494c8922b1b625bb37ea39568871cd7`; all observed required gates PASS; merged main `f428114dd2276ebf2033f88e393872281d03b608`; first post-merge PR-triggered workflow refresh returned no runs and therefore grants no post-merge PASS claim | `FINAL_BATCH` | exact-head required gate set PASS bound to merged SHA | DONE |
| RQ-643-FINAL | #643 / PR #644 | Post-P14 R1 durable-state reconciliation | Required PR exact-head gate set | exact head `712a638086ce686d2c28e252a5f01e4bb2f8b2fb`; CI, CodeQL, Integration, P12 Offline, P12 Final, P15 and P17 observed PASS; merged main `c5d23152a704fb75c18970cb147a8f6ee4775ebd`; first post-merge PR-triggered workflow refresh returned no runs and therefore grants no post-merge PASS claim | `FINAL_BATCH` | exact-head governance tests and required repository checks PASS | DONE |
| RQ-645-FINAL | #645 / PR #646 | Post-PR #644 durable-state reconciliation | Required PR exact-head gate set | exact head `1e3d6b8b3753e0835803ea98a8b4ace585753f20`; CI, CodeQL, Integration, P12 Offline, P12 Final, P15 and P17 observed PASS; merged main `f77ac93460bcb4625b76b914d81bd63fd9706982`; first post-merge PR-triggered workflow refresh returned no runs and therefore grants no post-merge PASS claim | `FINAL_BATCH` | exact-head governance tests and required repository checks PASS | DONE |
| RQ-647-FINAL | #647 / PR #648 | Post-PR #646 durable-state reconciliation | Required PR exact-head gate set | exact head `52c47832b8108e543582fd7f26a9d7da2eec97ec`; CI, CodeQL, Integration, P12 Offline, P12 Final, P15 and P17 observed PASS; merged main `c8950242a2848b4f58828d7e3220f59062305442`; first post-merge PR-triggered workflow refresh returned no runs and therefore grants no post-merge PASS claim | `FINAL_BATCH` | exact-head governance tests and required repository checks PASS | DONE |
| RQ-649-FINAL | #649 / PR #650 | P14 R2 vertical-stack validation-profile contract | Required PR exact-head gate set | repaired exact head `5142487d8b1d55db8f0a156d4b5d3b675f4ff637`; CI, CodeQL, Integration, P12 Offline, P12 Final, P15 and P17 observed PASS; merged main `ef4895ae480744e70f5477fe4443411201dbf33f`; first post-merge PR-triggered refresh returned no runs and grants no post-merge PASS claim | `FINAL_BATCH` | repaired exact-head focused tests plus required repository checks PASS before merge | DONE |
| RQ-651-FINAL | #651 / PR #652 | P14 R3 vertical-stack candidate target-addressing contract | Required PR exact-head gate set | exact head `d4a858374eee45ffc54126f4b85db51804bfbbb1`; CI, CodeQL, Integration, P12 Offline, P12 Final, P15 and P17 observed PASS; merged main `d4cbf53d4e07c05df91f01bdec967262100452df`; first post-merge PR-triggered refresh returned no runs and grants no post-merge PASS claim | `FINAL_BATCH` | exact-head focused tests plus required repository checks PASS before merge | DONE |
| RQ-653-FINAL | #653 / PR #654 | P14 R4 vertical-stack retained-duplicate Figma runtime adapter + README progress contract | Required PR exact-head gate set | exact head `3810e8cd668ecd77d2371bc7c2f466037a81b05d`; CI, CodeQL, Integration, P12 Offline, P12 Final, P15 and P17 PASS; merged main `fa1f2ea8d1f8cfce078d1de299dfd36ad2c074d5` | `FINAL_BATCH` | exact-head focused fake-Figma + repository checks PASS | DONE |

| RQ-655-FINAL | #655 / PR #656 | P14 R5 exact vertical-stack production planning-registry binding | Required PR exact-head gate set | repaired exact head `545c23b4e796540da07a789288857dedc19a50e9`; CI, CodeQL, Integration, P12 Offline, P12 Final, P15 and P17 PASS; merged main `ee406e2cafdc714e074cfb5d1e5a594db93ff727`; no authority/security gate weakened | `FINAL_BATCH` | exact-head registry/handoff/adapter/qualification + repository checks PASS | DONE |

| RQ-657-FINAL | #657 / PR #658 | P14 R6 explicit confirmation + internal retained-duplicate activation | Required PR exact-head gate set | exact head `d1daaccd8ed8ed912a171c307e123ca1d83d6b0a`; CI, CodeQL, Integration, P12 Offline, P12 Final, P15 and P17 PASS; merged main `64c8077eb37a728efa86a749a95e10f7bdce03c2`; acceptance/target authority remain false | `FINAL_BATCH` | exact-head activation/session/UI/release-boundary/transaction + repository checks PASS | DONE |

| RQ-659-FINAL | #659 / PR #660 | P15 explicit full-width responsive Container width | Required PR exact-head gate set | exact head `4e58c5ad...`; CI `35672164045`, CodeQL `35672164148`, Integration `35672164115`, P12 Offline `35672164084`, P12 Final `35672164127`, P15 `35672164051`, P17 `35672164085` PASS; merged main `5125e041...`; authority unchanged | `FINAL_BATCH` | exact-head focused responsive-full-width tests + required repository gates PASS | DONE |

| RQ-661-FINAL | #661 / PR #662 | Post-PR #660 AI-native reconciliation | Required PR exact-head gate set | exact head `f4d188ef...`; all seven gates PASS; merged main `143808f4...`; no product/authority change | `FINAL_BATCH` | exact-head governance/README/repository gates PASS | DONE |

| RQ-663-FINAL | #663 / PR #664 | P15 responsive Container hover border-radius | Required PR exact-head gate set | repaired exact head `5100c664...`; all seven required gates PASS; merged main `15b2825e...`; authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-665-FINAL | #665 / PR #666 | P15 responsive Container flex-item align-self | Required PR exact-head gate set | repaired exact head `5e975dcb...`; all seven gates PASS; merged main `e2839d8e...`; authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-667-FINAL | #667 / PR #668 | P15 responsive Container flex-item binary grow/shrink factors | Required PR exact-head gate set | exact head `c50627b6...`; all seven gates PASS; merged main `0ce4d23a...`; authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-669-FINAL | #669 / PR #670 | P15 responsive Container flex-item start/end order presets | Required PR exact-head gate set | exact head `e244b3a2...`; all seven gates PASS; merged main `687bb210...`; authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-671-FINAL | #671 / PR #672 | P15 bounded Container overflow hidden/auto | Required PR exact-head gate set | repaired exact head `6454ac8e...`; all seven gates PASS; merged main `1f8b8ed3...`; authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-673-FINAL | #673 / PR #674 | P15 bounded Container semantic HTML tags | Required PR exact-head gate set | exact head `8c54239d...`; all seven gates PASS; merged main `42496445...`; authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-675-FINAL | #675 / PR #676 | P15 bounded Heading normal text color | Required PR exact-head gate set | repaired exact head `5d40e176...`; all seven gates PASS; merged main `1ab21408...`; authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-677-FINAL | #677 / PR #678 | P15 bounded Text Editor normal text color | Required PR exact-head gate set | exact head `94ee08c1...`; all seven gates PASS; merged main `9ef893af...`; authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-679-FINAL | #679 / PR #680 | P15 bounded Button normal text color | Required PR exact-head gate set | exact head `ccd2c19d...`; all seven gates PASS; merged main `878ffa04...`; review threads clear; authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-682-FINAL | #682 / PR #683 | Post-PR #680 AI-native reconciliation | Required PR exact-head gate set | repaired head `82806d00...`; all seven required gates PASS; review threads 0; merged main `e8ce67ab...`; product/runtime/security authority unchanged | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-685-FINAL | #685 / PR #686 | Post-PR #683 AI-native reconciliation | Required PR exact-head gate set | repaired head `5d22c87c...`; all seven required gates PASS; review threads 0; merged main `36e65638...`; rolling-journal repair retained; no product/runtime/security authority change | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-687-FINAL | #687 / PR #688 | Post-PR #686 AI-native reconciliation | Required PR exact-head gate set | head `bd383220...`; all seven required gates PASS; review threads 0; merged main `2eb809f4...`; no product/runtime/security authority change | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-689-FINAL | #689 / PR #690 | Post-PR #688 AI-native reconciliation | Required PR exact-head gate set | head `c7d5169e...`; all seven required gates PASS; review threads 0; merged main `d96b5514...`; no product/runtime/security authority change | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-691-FINAL | #691 / PR #692 | Post-PR #690 AI-native reconciliation | Required PR exact-head gate set | head `6bf02099...`; all seven required gates PASS; review threads 0; merged main `b048569f...`; no product/runtime/security authority change | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-693-FINAL | #693 / PR #694 | Post-PR #692 AI-native reconciliation | Required PR exact-head gate set | head `d709e9b2...`; all seven required gates PASS; review threads 0; merged main `75e42027...`; no product/runtime/security authority change | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-695-FINAL | #695 / PR #696 | Post-PR #694 AI-native reconciliation | Required PR exact-head gate set | head `df7a6ee7...`; all seven required gates PASS; review threads 0; merged main `8c6895ec...`; no product/runtime/security authority change | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-697-FINAL | #697 / PR #698 | Post-PR #696 AI-native reconciliation | Required PR exact-head gate set | head `010fe3c0...`; all seven required gates PASS; review threads 0; merged main `d389c554...`; no product/runtime/security authority change | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-699-FINAL | #699 / PR #700 | Post-PR #698 AI-native reconciliation | Required PR exact-head gate set | head `7f1a5178...`; all seven required gates PASS; review threads 0; merged main `456a7a7f...`; no product/runtime/security authority change | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-701-FINAL | #701 / PR #702 | P15 Button normal classic background color v1 | Required PR exact-head gate set | initial head `28de25ae...` failed CI + P12 Final on one syntax-generation defect; repaired head `c8a2e930...` passed all seven gates; threads 0; merged main `02a1225c...`; exact write surface retained | `FINAL_BATCH` | repaired exact-head focused/repository gates PASS | DONE |
| RQ-703-FINAL | #703 / PR #704 | P15 Button hover text color v1 | Required PR exact-head gate set | final exact head `39ce33bf...` passed all seven required gates; threads 0; merged main `a36219fb...`; exact `hover_color` write surface retained | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-705-FINAL | #705 / PR #706 | P15 Button hover classic background color v1 | Required PR exact-head gate set | repaired exact head `34f1714d...` passed all seven required gates; threads 0; merged main `1258ba08...`; exact hover classic background write surface retained | `FINAL_BATCH` | exact-head focused/repository gates PASS | DONE |
| RQ-707-FINAL | #707 / PR #708 | P15 Button hover border color v1 | Required PR exact-head gate set | exact head `0fe42e93...` passed all seven required gates; threads 0; merged main `17832e37...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |
| RQ-709-FINAL | #709 / PR #710 | P15 Button hover interaction Fast Batch v1 | Required PR exact-head gate set | exact head `e019e903...` passed all seven required gates; threads 0; merged main `c2c001d1...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |
| RQ-711-FINAL | #711 / PR #712 | P15 Button normal border Fast Batch v1 | Required PR exact-head gate set | exact head `56607e9a...` passed all seven required gates; threads 0; merged main `012edb7f...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |
| RQ-713-FINAL | #713 / PR #714 | P15 Fast Batch Button visual depth and radius v1 | Required PR exact-head gate set | repaired exact head `4e2cc76a...` passed all seven required gates; review threads 0; merged main `f25acc0e...`; prior 5/7 journal-ceiling failure repaired without product/security/authority change | `FINAL_BATCH` | repaired exact-head repository gates PASS | DONE |

| RQ-715-FINAL | #715 / PR #716 | Post-PR #714 AI-native reconciliation | Required PR exact-head gate set | repaired exact head `ac5e6768...` passed all seven required gates; threads 0; merged main `d99695e8...`; no product/security/authority change | `FINAL_BATCH` | repaired exact-head repository gates PASS | DONE |

| RQ-717-FINAL | #717 / PR #718 | P15 Fast Batch Button typography basics v1 | Required PR exact-head gate set | exact head `747ce431...` passed all seven required gates; review threads 0; merged main `1cd8181c...`; font weight + text transform + font style only | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-719-FINAL | #719 / PR #720 | Post-PR #718 AI-native reconciliation | Required PR exact-head gate set | exact head `243e0aa9...` passed all seven required gates; review threads 0; merged main `f3384739...`; no product/security/authority change | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-721-TRANSPORT | #721 / PR #722 | Terminal post-reconciliation finalization | Required PR exact-head gate set | repaired exact head `e1ccf916...` passed 7/7; review threads 0; merged main `1a89e7f3...`; recursive reconciliation disabled | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-723-FINAL | #723 / PR #724 | P15 Button typography metrics v1 | Required PR exact-head gate set | repaired exact head `ea3d8447...` passed 7/7; review threads 0; merged main `c887ab4d...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-725-TRANSPORT | #725 / PR #726 | Terminal post-PR #724 state finalization | Required PR exact-head gate set | exact head `221a94f7...` passed 7/7; review threads 0; merged main `3b632502...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-727-FINAL | #727 | P15 Button responsive typography metrics v1 | Required PR exact-head gate set | PR not yet opened; four-capability exact responsive typography contract | `FINAL_BATCH` | final bound PR head must pass all seven required gates before merge | PR_NOT_YET_OPEN |

## Blocking-now queue

| Queue ID | Phase / issue | Why blocking now | Runner / workflow | Expected evidence | Status |
|---|---|---|---|---|---|
| RQ-634-LOCK | #634 | Generate a deterministic Node 22 / Vitest 5 / Vite 8 / esbuild 0.28 lockfile before normal CI can run | Toolchain Lockfile Refresh | run `35601367894` on input `e21af5445bff02b81afa4bf556822e1a16fdf2ae`; artifact `10639475684`, digest `sha256:ef723a8f4015565c5c22d16abf14829aba6d4234526777c37adc0848e0a83066`; generated lock committed as `5597ef67ea2b6761c5b2db7f82e56aea237dee21` | DONE |
| RQ-634-WINSTAT | #634 | Diagnose Node 22 Windows path-stat vs open-handle stat identity mismatch without weakening race detection | Node 22 Windows Stat Probe | run `35602201294`: unchanged synthetic file had identical inode/size/mode/nlink/birthtime/mtime/ctime and canonical path; only `dev` differed (`lstat=0`, handle-stat non-zero). Fix compares device ids only when both are non-zero/comparable and retains exact inode + metadata checks. Probe workflow removed after diagnosis. | DONE |
| RQ-634-CODEQL | #634 | Resolve the high-severity CodeQL blocker before merge | CodeQL SARIF + PR Alert Diagnostic | SARIF run `35603467103`, artifact `10641031030` (`sha256:8f401b6f8583d8761e5ddedad4339dd95d78b07a9712b221120dfdfc552184b3`), plus PR-scoped alert run `35603958490`, identified alert #36: `js/file-system-race` high at `src/cli/source-adapters.ts`. Fix removes check-then-open by opening the handle first, then validating path/symlink/canonical identity around handle-only reads. Diagnostic workflows removed before acceptance. | DONE |

## Required workflow for AI agents

When developing:

1. inspect this file at session start;
2. whenever work implies a Runner action, create/update its benchmark row immediately;
3. run focused local/static/unit checks during implementation;
4. continue implementation while `PROJECT_FINAL` items accumulate for project-end acceptance and while current-train `FINAL_BATCH` items wait for the final exact-head merge checkpoint;
5. stop and execute any `BLOCKING_NOW` item before proceeding;
6. at each required merge/release integration checkpoint, execute only the required current-train `FINAL_BATCH`/`CONDITIONAL` gates; at final project acceptance, execute the accumulated `PROJECT_FINAL` queue together;
7. bind each result to the exact PR-head SHA/run ID and update the row;
8. fix failures and rerun affected checks;
9. rerun required exact-head gates before merge;
10. after merge, verify `POST_MERGE` controls and retain their result.

## Delivery-resilient Runner observation

Runner execution and Runner observation are separate concerns.

- Start required Runner work when the milestone requires it.
- After the batch starts, perform at most one Runner/check-status fetch in the current user turn.
- If required work is queued/in-progress, retain exact head/run identifiers through GitHub metadata, checkpoint the next action and end the turn.
- Never use sleep loops or repeated polling to keep a response open.
- The next user `continue` performs the next single observation/fix/merge milestone.
- `BLOCKING_NOW` blocks subsequent implementation across turns but does not override the one-fetch/no-busy-wait rule.

## Completion rule

A development/release train may not be called complete while:

- a required `BLOCKING_NOW` entry is unresolved;
- a required `FINAL_BATCH` entry for that train is unexecuted or failed;
- final project acceptance is being claimed while any required `PROJECT_FINAL` entry is unexecuted or failed;
- exact-head evidence is stale relative to the merge candidate;
- a required `POST_MERGE` control has not been observed;
- the Runner benchmark disagrees with the owning issue/roadmap state.
