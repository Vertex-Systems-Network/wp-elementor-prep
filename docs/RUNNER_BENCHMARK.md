# Runner Benchmark

Status: CANONICAL / ACTIVE  
Owner issue: #631  
Established: 2026-09-21

Machine-readable canonical ledger: `.ai/state/RUNNER-BENCHMARK.yaml`. This Markdown file is the human-readable policy/view and must not contradict the machine-readable ledger.

## Active batch behavior while Runner work is pending

One explicit batch-start instruction authorizes in-scope reversible repository work for up to five hours or available Workspace credit/session, whichever ends first. A pending Runner is not by itself a batch stop: record exact PR/head/check identifiers, do independent safe work without mutating the candidate under certification, and revisit the check at a meaningful lifecycle boundary. If no independent work remains, persist the durable checkpoint and wait without polling. Never weaken a required merge/security gate or treat a queued/running result as PASS.

A green exact-head PR may merge only after all required workflows/security checks pass on that exact head, unresolved review threads are zero, the PR is mergeable, and an expected-head guard confirms no drift. After merge, reconcile the new main and continue with the next safe related in-scope batch. Re-consent is reserved for material scope/authority expansion or genuine manual/external prerequisites; existing production/release and live-runtime gates remain intact.

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

| RQ-727-FINAL | #727 / PR #728 | P15 Button responsive typography metrics v1 | Required PR exact-head gate set | repaired exact head `98a65b5f...` passed 7/7; review threads 0; merged main `ceb64cfd...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-729-TRANSPORT | #729 / PR #730 | Terminal post-PR #728 state finalization | Required PR exact-head gate set | repaired exact head `2250c7f5...` passed 7/7; review threads 0; merged main `9cf147db...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-731-FINAL | #731 / PR #732 | P15 Button responsive padding v1 | Required PR exact-head gate set | exact head `8ba3ec30...` passed 7/7; review threads 0; merged main `d0404cfc...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-733-TRANSPORT | #733 / PR #734 | Terminal post-PR #732 state finalization | Required PR exact-head gate set | repaired exact head `f64d29d8...` passed 7/7; review threads 0; merged main `9175c990...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-735-FINAL | #735 / PR #736 | P15 Button content metadata basics v1 | Required PR exact-head gate set | repaired exact head `80c63a72...` passed 7/7; review threads 0; merged main `0593dd79...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-737-TRANSPORT | #737 / PR #738 | Terminal post-PR #736 state finalization | Required PR exact-head gate set | exact head `abcd5c3a...` passed 7/7; review threads 0; merged main `bc6052cd...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-739-FINAL | #739 / PR #740 | P15 Button stretch content alignment v1 | Required PR exact-head gate set | exact head `0a4cc0d2...` passed 7/7; review threads 0; merged main `5e839f4e...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-741-TRANSPORT | #741 / PR #742 | Terminal post-PR #740 state finalization | Required PR exact-head gate set | exact head `23d39e56...` passed 7/7; review threads 0; merged main `6db4a456...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-743-FINAL | #743 / PR #744 | P15 Button icon basics v1 | Required PR exact-head gate set | exact head `a17d0ca3...` passed 7/7; review threads 0; merged main `4e5ea4eb...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-745-TRANSPORT | #745 / PR #746 | Terminal post-PR #744 state finalization | Required PR exact-head gate set | exact head `7c484349...` passed 7/7; review threads 0; merged main `c4095311...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-747-FINAL | #747 / PR #748 | P15 Button linear gradient backgrounds v1 | Required PR exact-head gate set | repaired exact head `b8da6da7...` passed 7/7; review threads 0; merged main `7659adaa...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-749-TRANSPORT | #749 / PR #750 | Terminal post-PR #748 state finalization | Required PR exact-head gate set | exact head `c18380eb...` passed 7/7; review threads 0; merged main `dd285d01...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

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
- During an active five-hour/credit-bounded batch, a queued or running Runner does not automatically end the batch.
- Preserve exact head/run identifiers through GitHub metadata, continue independent safe work without mutating the candidate under certification, and revisit status at a meaningful lifecycle boundary.
- If no independent safe work remains, persist the durable checkpoint and wait without busy polling.
- Never use sleep loops, repeated unchanged status fetches or retry-until-green behavior.
- `BLOCKING_NOW` still blocks merge and any work that depends on that result; it does not prevent independent safe work elsewhere in the active batch.

## Completion rule

A development/release train may not be called complete while:

- a required `BLOCKING_NOW` entry is unresolved;
- a required `FINAL_BATCH` entry for that train is unexecuted or failed;
- final project acceptance is being claimed while any required `PROJECT_FINAL` entry is unexecuted or failed;
- exact-head evidence is stale relative to the merge candidate;
- a required `POST_MERGE` control has not been observed;
- the Runner benchmark disagrees with the owning issue/roadmap state.

| RQ-751-FINAL | #751 / PR #752 | P15 Button radial gradient backgrounds v1 | Required PR exact-head gate set | exact head `bea1e621...` passed 7/7; review threads 0; merged main `702177b3...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-753-TRANSPORT | #753 / PR #754 | Terminal post-PR #752 state finalization | Required PR exact-head gate set | exact head `25fce9db...` passed 7/7; review threads 0; merged main `5b5519aa...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-755-FINAL | #755 / PR #756 | P15 Button responsive radial gradient positions v1 | Required PR exact-head gate set | exact head `180e3391...` passed 7/7; review threads 0; merged main `43a2e224...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-757-TRANSPORT | #757 / PR #758 | Terminal post-PR #756 state finalization | Required PR exact-head gate set | exact head `bf6d9d5d...` passed 7/7; review threads 0; merged main `eb8f8ec2...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-759-FINAL | #759 / PR #760 | P15 Button responsive linear gradient angles v1 | Required PR exact-head gate set | exact head `ef1687c1...` passed 7/7; review threads 0; merged main `105f7594...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-761-TRANSPORT | #761 / PR #762 | Terminal post-PR #760 state finalization | Required PR exact-head gate set | exact head `95258082...` passed 7/7; review threads 0; merged main `7f5a86b0...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-763-FINAL | #763 / PR #764 | P15 Button responsive linear gradient stop locations v1 | Required PR exact-head gate set | exact head `82bc12cc...` passed 7/7; review threads 0; merged main `143ffcab...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-765-TRANSPORT | #765 / PR #766 | Terminal post-PR #764 state finalization | Required PR exact-head gate set | exact head `944fc059...` passed 7/7; review threads 0; merged main `c3328728...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-767-FINAL | #767 / PR #768 | P15 Button responsive radial gradient stop locations v1 | Required PR exact-head gate set | exact head `db2dcdba...` passed 7/7; review threads 0; merged main `16a67afb...` | `FINAL_BATCH` | exact-head repository gates PASS | DONE |

| RQ-769-TRANSPORT | #769 / PR #770 | Terminal post-PR #768 state finalization | Required PR exact-head gate set | head `d8b354c1...` passed 7/7, zero review threads; merged main `5f7fa2b5...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-773-FINAL | #773 / PR #774 | Explicit Button tablet/mobile border widths | Required PR exact-head gate set | head `3fd122cd...` passed 7/7, zero threads; merged main `6ef3ea58...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-775-FINAL | #775 / PR #776 | Container normal border and responsive widths | Required PR exact-head gate set | head `2c1a8c5d...` passed 7/7; zero threads; merged main `ebbe9ee8...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-777-FINAL | #777 / PR #778 | Container hover border and responsive widths | Required PR exact-head gate set | head `74641fd6...` passed 7/7; zero threads; merged main `21848e94...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-779-FINAL | #779 / PR #780 | Container classic hover background color | Required PR exact-head gate set | head `7d59a098...` passed 7/7; zero threads; merged main `cbec0be0...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-781-FINAL | #781 / PR #782 | Container normal and hover classic overlay colors | Required PR exact-head gate set | head `5e3976a1...` passed 7/7; zero threads; merged main `5eb93905...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-783-FINAL | #783 / PR #784 | Container normal/hover explicit responsive overlay opacity | Required PR exact-head gate set | head `4389969f...` passed 7/7; zero threads; merged main `d7c5cc87...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-785-FINAL | #785 / PR #787 | Four-family Container style composition | Required PR exact-head gate set | head `57a08f4b...` passed 7/7; zero threads; merged main `965bb48e...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-788-FINAL | #788 / PR #789 | Container normal/hover box shadows | Required PR exact-head gate set | head `9ec87232...` passed 7/7; zero threads; merged main `228b68a1...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-790-FINAL | #790 / PR #791 | Six-family Container style composition | Required PR exact-head gate set | head `2aa8d19c...` passed 7/7; zero threads; merged main `d24ed13b...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-792-FINAL | #792 / PR #793 | Explicit normal/hover Container responsive radius composition | Required PR exact-head gate set | head `5e404876...` passed 7/7; zero threads; merged main `e6de603b...` | `FINAL_BATCH` | exact-head gates PASS | DONE |

| RQ-794-FINAL | #794 / PR #795 | Five-family Button color composition | Required PR exact-head gate set | initial head `2ee1aaef...`; final head pending | `FINAL_BATCH` | all seven workflows and zero unresolved threads on final head | AWAITING_EXACT_HEAD_BATCH |

### RQ-796-FINAL — Container linear-gradient composition

- Source work: PR #797, Issue #796; exact head `dc56b3d41277d656ef956406039fe411838d4056`; merged main `c1beb26bf99e094b7ab0ea48fd51acfc4dacbbcc`.
- Required gate family: CI, CodeQL, Integration Readiness, P12 Offline Acceptance, P12 Final Release Artifact, P15 Real Elementor Target Proof and P17 Local Browser Proof.
- Input identity: exact Elementor 4.2.4 Container `background` and `background_hover` linear-gradient groups; explicit responsive values only.
- Authority: implementation evidence only; runtime/import, broad compatibility, production and download authority remain false.

### RQ-800-FINAL — Container hover transitions

- Source work: Issue #800 / PR #801; exact head `f6b1423ab7b6f304f8e385ba0e4d96a92f376a82`; merged main `adcb28f4054d700c5a42809e12318a96e5c45b64`.
- Required gate family: CI, CodeQL, Integration Readiness, P12 Offline Acceptance, P12 Final Release Artifact, P15 Real Elementor Target Proof and P17 Local Browser Proof.
- Input identity: explicit finite 0..3 second values at 0.1 step for the three documented Container hover transition keys.
- Authority: implementation evidence only; no responsive, runtime/import, compatibility, production or download authority.

### RQ-804-FINAL — Container radial gradients

- Source work: Issue #804 / PR #805; exact head `8b384f354ebbfe6a0e18bfd5b34c33525390eac2`; merged main `b90bf42a05dee28baddd300f19525234523798a5`.
- Required gate family includes P17 Local Browser Proof; no runtime or production authority is inferred.

### RQ-808-FINAL — Container overlay visual composition

- Source work: Issue #808 / PR #809; exact Elementor 4.2.4 overlay blend and CSS-filter controls.
- Authority remains implementation-only; P17 proof is required on the final head.

### RQ-808-FINAL — Container overlay visual composition

- Source work: Issue #808 / PR #809; exact head `1203cf4cb531307a0a31c73dae497fab0d70c888`; merged main `1c951a81831806892ab64a296a375cf864d26dc0`.
- Required gate family: CI, CodeQL, Integration Readiness, P12 Offline Acceptance, P12 Final Release Artifact, P15 Real Elementor Target Proof and P17 Local Browser Proof.
- Authority remains implementation-only; no runtime/import, production, compatibility or download claim.


## PR #814 governance batch — completed

- Exact PR head: `f9b957333e7db190e6a8aa3621714bab914a5352`; exact merged main: `5fdaab6cb50e3651da4b44c48ca9e81157dca843`.
- Required exact-head workflows passed: CI #36291435136, CodeQL #36291435188, Integration Readiness #36291435113, P12 Offline Acceptance #36291435158, P12 Final Release Artifact #36291435129, P15 Real Elementor Target Proof #36291435116, P17 Local Browser Proof #36291435146.
- Unresolved review threads: 0. Expected-head merge succeeded. Issue #813 completed; #812 duplicate closed.
- Governance evidence only; no product/runtime/compatibility/production authority added.

## PR #816 state reconciliation — completed

- Owner Issue #815; exact head `14ae0c87b00776060ae3a05c83a8388c51da4e30`; merged main `bdebce3e0efcf06d4c7596e2572e5611e254c267`.
- Required exact-head gates CI #36293709996, CodeQL #36293710011, Integration Readiness #36293710030, P12 Offline Acceptance #36293709972, P12 Final Release Artifact #36293709938, P15 Real Elementor Target Proof #36293709969 and P17 Local Browser Proof #36293709957 passed; zero unresolved review threads; expected-head merge succeeded.


## PR #818 state finalization — active

- Owner Issue #817; branch `ai-native/finalize-pr-816-state-817`; base main `bdebce3e0efcf06d4c7596e2572e5611e254c267`.
- Required exact-head gates: CI, CodeQL, Integration Readiness, P12 Offline Acceptance, P12 Final Release Artifact, P15 Real Elementor Target Proof and P17 Local Browser Proof. No gate result is claimed before PR creation.


## 2026-09-27 — PR #818 and #820 state reconciliation

- PR #818 exact head `dea45549df14cc23df01939139fa65793d654cc3` passed all seven required workflows: CI #36294778484, CodeQL #36294778509, Integration Readiness #36294778470, P12 Offline Acceptance #36294778583, P12 Final Release Artifact #36294778491, P15 Real Elementor Target Proof #36294778564 and P17 Local Browser Proof #36294778461. Zero unresolved review threads; expected-head merge produced main `13fb2f5b9200dc9ece2174be3d24d5d259ea29bd`.
- Issue #819 / PR #820 reconciles canonical state after #818. Its PR creation head was `c3b80b8ea50ea28e7790640d48bcf2274f9286c6`; current exact head must be resolved from live PR metadata before checking gates.
- P17 Local Browser Proof is path-filtered and runs when `docs/RUNNER_BENCHMARK.md` changes. This documentation records the relevant exact-head gate handoff; it claims no P17 result for PR #820.


## P15 #821 — responsive Container gap-axis implementation

PR #821 exact head `0ff80cb98fffeb444fc3ce0e610842c2d9ad9d43` passed all seven required workflows, had zero unresolved review threads, and merged with an expected-head guard as main `a3396e9030e33e9a0a8146eab5ec6dbeaa9a412f`. The implementation preserves linked-px compatibility, desktop settings, source/base-candidate binding and omitted-breakpoint behavior while supporting complete explicit tablet/mobile row/column px pairs. No broader compatibility or responsive-closure claim follows from these gates.

## P15 #823 — responsive Flex Item custom basis implementation

PR #823 exact head a89bee55c3d43a0f40b2c97701c4a473ef9cce6b passed all seven required workflows, had zero unresolved review threads, and merged under expected-head guard as main b34f5b254dfe7bf8f217d691ecf8d58652674428. The implementation is bounded to complete tablet/mobile custom-type and integer px value pairs in 0..1000. Broader target compatibility, responsive closure and production authority remain unclaimed.


## P15 #823 — responsive Flex Item custom basis candidate

Pinned Elementor 4.2.4 flex-item.php source blob dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a defines responsive basis_type and a conditional basis slider (px range max 1000). The QUnit Container fixture blob f06c5f60afa8fbef34ed922af419284cece09692 confirms responsive basis setting keys _flex_basis_tablet and _flex_basis_mobile. PR exact-head gates and controlled serialization proof are pending; all broader authority remains false.

## P15 #825 — runtime custom-order control observation

PR #826 adds a bounded probe to the existing real Elementor 4.2.4 target workflow. It retains the Container control count, Flex/order control names and selected order control metadata from the exact installed version. The initial exact Elementor 4.2.4 observation found 227 regular Container controls and 145 style controls. `_flex_order` and `_flex_order_custom` are present in `style_controls`, whereas the six probed keys were absent from the regular control view. The corrected probe records the stack provenance and selected metadata; tablet/mobile saved template keys and editor-produced values remain unobserved. This records control registration; saved template serialization and editor-produced values remain unobserved. It grants no resolver, import parity, compatibility, download, production or release authority. The seven exact-head gate results must be recorded after completion.

## P15 #825 — controlled custom-order target roundtrip

A focused probe imports a script-authored two-child Container template with explicit tablet/mobile `order=custom` and `order_custom` values (2/-2 and 1/0) into exact Elementor 4.2.4, observes saved `_elementor_data`, and exports it through Elementor's local Template Library source. The run retains input, import observation and target-exported JSON. This establishes only target persistence and export of the authored values if assertions pass. It does not establish editor-generated serialization, frontend order rendering, broad compatibility, download, or release authority. Exact-head gate results are pending.

## P15 #825 — real target responsive order render

The controlled custom-order template from PR #827 is rendered through exact Elementor 4.2.4 on local WordPress 6.8. A token-bound frontend endpoint and Chrome probe record computed order and visual top positions for two child Containers at desktop (1280px), tablet (768px) and mobile (375px). The values were authored by the probe and imported via the target library; the result establishes only behavior for those explicit cases. Editor-generated serialization, arbitrary templates, broad compatibility, download, production and release authority remain outside this proof. Exact-head gate results are pending.

## P15 #825 — explicit custom-order resolver candidate

The implementation uses source/base-candidate binding and complete tablet/mobile custom-order pairs in the repository policy range -1000..1000. The controlled Elementor 4.2.4 import/export and browser evidence is retained under PRs #827 and #828. This code adds no automatic breakpoint inference, production or download authority. Exact-head gates are pending.

## 2026-09-28 — CodeQL action pin coherence

The separate Dependabot init/analyze pin candidates #832/#834 each failed CodeQL because a 4.38.2 step read the other step's 4.38.1 configuration. This PR pins both steps to the same immutable 4.38.2 revision. The repaired exact head requires its own CI, CodeQL, Integration, P12 Offline, P12 Final, P15 target and P17 browser gate observations before guarded merge; prior failed runs grant no pass claim. This change does not modify product, release or acceptance authority.


## 2026-09-28 — exact-head closure through PR #835

The earlier P15 #825 custom-order probe and resolver pending notes are historical pre-gate records. PRs #826–#829 completed their required exact-head gates and merged; the controlled authored values do not establish editor-generated serialization or arbitrary demo parity. Dependency PRs #830, #832 and #835 each passed all seven required exact-head workflows, zero unresolved threads and guarded merges. Their merge SHAs are respectively `a80d37f6f587a4bf2a5e7b9941f944fbae2e6327`, `d562ca20c3c67484bce52005c887b8d0d845f993` and `12758d9d19b634948adc07aa798b4593734abe2c`. Separate #831/#833/#834 candidates closed unmerged. This state transport requires its own fresh gates and grants no production or compatibility authority.


## P15 #838 — transient Figma Image MEDIA review candidate

Representative external Package 13/14 handoff evidence identified 44/45 unique temporary Figma asset URLs, while browser render and permanent media localization remained pending. Only aggregate evidence is retained here; raw design URLs and client template data are not committed. The candidate recognizes exact HTTPS Figma MCP asset links in the documented core Image MEDIA control, emits a path and fingerprint plus review reason, and keeps all closure/compatibility/download/production flags false. It does not inspect arbitrary ZIP media fields or CSS backgrounds. Seven exact-head gates must be observed before merge.


## P15 #840 — documented Container background MEDIA review candidate

PR #839 passed the seven required exact-head workflows and merged as `f6bbbd7db3d9220e8ade26cc59443fd1184f9f55`. The scoped #840 follow-up adds the exact normal Container background MEDIA keys (desktop/tablet/mobile) backed by pinned Elementor 4.2.4 source. Template 2's desktop/mobile background refs are temporary Figma URLs; the tests are synthetic and do not prove image loading, target-managed media, imported visual parity, or production acceptance. RQ-840-FINAL is merge-blocking on the final bound PR head; its gate results are pending.


## 2026-09-28 — P15 #840 merge and terminal README reconciliation

PR #841 exact head `449ffa6e9c1aa533a425d595e358e0a43eb3f2cd` passed CI, CodeQL, Integration Readiness, P12 Offline Acceptance, P12 Final Release Artifact, P15 Real Elementor Target Proof and P17 Local Browser Proof; zero unresolved threads; guarded merge as `d1fc115b9f6764d90c0c319b880e291009eb7199`. The first head failed CI/P12 Final only on a deterministic path-order test assertion, repaired on final head. This does not establish media upload/load or visual parity. RQ-842-FINAL tracks terminal README/state-only PR #843; exact-head gates pending.


## 2026-09-28 — README P15–P17 current progress clarity #844

PR #843 exact head `2649487fc978134387ae9ba7c635d8fcb240dd8a` passed all seven required workflows and merged as `2ca818d500474182a3e04eacdd477df4761a1269`. Issue #844 / PR #845 archives the former 858-line README and makes current P15/P16/P17 delivered scope and missing acceptance evidence visible at the top, without synthetic progress percentages. The verifier checks current README truth directly and historical contracts in the archive. RQ-844-FINAL is merge-blocking and awaits final exact-head gate results.


## 2026-09-28 — pre-P19 evidence gate #846

PR #845 exact head `02450b354a31d7149f64da5f5b27f180d53e4bae` passed all seven required workflows, zero unresolved threads and guarded merged as `6b79b569b14618dec67744310b2794a2bab49e29`; #844 closed. PR #847 records phase-specific P15–P18 exits before P19 without granting actual target/release authority, and opens only P18 R0/R1 preflight. RQ-846-FINAL is blocking on final exact-head seven-workflow results.


## P18 adapter handoff (2026-09-28)

The P18 React R0/R1 preflight and #850 React static adapter consume the existing P17 static Web IR and local browser proof contract. This note records workflow-path continuity only; it does not claim visual parity or target acceptance. State reconciliation after #853 and #854 keeps this boundary explicit. The P15 asset probe remains a separate evidence blocker.


## P18 runtime receipt (2026-09-28)

PR #858 merged exact head `2de98fa367243f155eacd1f0d71afe8f71ec8377` as main `4fc693b33051435ad5309e0e4cbcf068582cd95f`. The dedicated P18 workflow run `36443412796` passed the pinned React 19.3.0 / ReactDOM 19.3.0 / Vite 8.3.1 fixture, npm ci, Vite build, loopback preview and Chrome DOM/source-ref checks with zero external requests and zero console/page errors. This is runtime-preview evidence only; visual parity, Figma parity, Elementor target acceptance and production authority remain false.


State reconciliation after PR #859 keeps P18 runtime receipt scope aligned with Project State and Next Actions; no new browser or target authority is inferred.


## 2026-09-29 — ANPOS adoption and durable-state reconciliation

PR #872 exact head `901b89cc64db1a8edadb10d6d654a80428f12d39` passed the required workflow set and merged as `55474fb5fe03ca21ae53c7a8d883ce48bd1a9dd6`. PR #874 exact head `a17d9f955a2c7f708ab108a0f0bf144e1c634605` passed its applicable workflow set and merged as `a078ba40e75e0723ea71190e0d976edb423a27be`. Both preserved ANPOS authority=false and did not alter product/runtime evidence boundaries. The current state-reconciliation PR is the next exact-head batch.


## 2026-10-08 — Product Recovery Program Runner rows

These rows were discovered by `docs/PRODUCT_RECOVERY_PLAN.md` §6. Each `CONDITIONAL` row blocks only its own milestone acceptance. None of them is executed yet.

| Queue ID | Phase / issue | Task / trigger | Runner / workflow | Dependencies | Class | Expected evidence | Status |
|---|---|---|---|---|---|---|---|
| RQ-REC-M0-RELEASE-PLACEHOLDERS | Recovery M0.1–M0.2 (whole M0 train) | Release package must carry no unsubstituted build placeholders and a traceable build identity; full required gate set for the M0 train | ci.yml release-package step + required PR workflows | M0.1–M0.12 implemented | `FINAL_BATCH` | PR #895 exact head `e8672b0` passed 10/10 required checks; merged main `f18240e` | DONE |
| RQ-REC-M1-ENGINE-TRAIN | Recovery M1.6–M1.8 | Full required gate set on the exact M1.6–M1.8 PR head (engine bundled into plugin, CLI export, contract types, verifier change) | required PR workflows | M1.6–M1.8 implemented; local typecheck/suite/status:verify/build/build:cli and local release reproducibility PASS | `FINAL_BATCH` | PR #900 exact head `69ccfd1` passed 11/11 required checks, zero review threads; merged main `47ada79` | DONE |
| RQ-REC-M3-ASSET-IMPORT | Recovery M3.6 | Asset pack imports into disposable WP+Elementor; every image HTTP 200 in render | p15-real-target-proof.yml | M3.1–M3.5 | `CONDITIONAL` | exact-head real-target run with image-load receipt | QUEUED |
| RQ-REC-M4-RESPONSIVE-RENDER | Recovery M4.6 | Three-breakpoint fixture renders at 1440/1024/390 | p15-real-target-proof.yml (multi-width) | M4.1–M4.5 | `CONDITIONAL` | exact-head per-width render receipt | QUEUED |
| RQ-REC-M7-ROUNDTRIP | Recovery M7.2 | Imported render vs Figma reference PNG comparison per breakpoint | real-target harness + core pixel-diff | M7.1, M4 | `CONDITIONAL` | per-section round-trip report on exact head | QUEUED |
| RQ-REC-M8-GUTENBERG-EDITOR | Recovery M8.5 | Gutenberg markup parse/serialize + real editor import/render | new WordPress editor harness | M8.2–M8.4 | `CONDITIONAL` | exact-head editor-validity and render receipt | QUEUED |
| RQ-894-AUDIT | Recovery PR #894 | `npm audit --audit-level=moderate` failed on new advisory GHSA-68fv-2mgg-jv7q (source-map-js 1.2.1, transitive via vite→postcss); lockfile-only bump to 1.2.2 | codeql.yml analyze | none | `BLOCKING_NOW` | exact-head analyze PASS on `c7b5228`; merged main `4bc2042` | DONE |
| RQ-TOOLCHAIN-PATCH-1010 | Toolchain patch train (supersedes Dependabot #890–#893) | Full required gate set on the exact consolidated pin-update PR head (Vite 8.3.2, Vitest 5.0.3, @types/node 26.6.4, Figma typings 1.140.0) | required PR workflows | local typecheck, 345 files / 2069 tests, status:verify, build, build:cli PASS | `FINAL_BATCH` | exact-head required checks green, zero review threads | PENDING |
