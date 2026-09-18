# WP Builders Prepare

Deterministic Figma audit, safe-prep and target-readiness tooling for WordPress builders and web-code workflows.

The core product prepares approved designs **without visually redesigning them**, without requiring generative AI for correctness, and without network access in the current core plugin.

Current product surfaces:

- normal Figma plugin;
- npm/Node CLI;
- deterministic audit/backlog/Build-Ready outputs;
- safety-gated P5/P6/P7 preparation foundations;
- P13 Build-Ready Score 2.0 + Responsive Risk with analyzer-bound provenance;
- development-only read-only P14 Guided Prepare/review evidence surfaces;
- P15 Elementor R1 evidence chain plus bounded target-neutral IR, deterministic local Elementor v0.4 Template JSON candidate generation, read-only selected-Figma-Frame Auto Layout/plain-text extraction, normal/publishable sanitized Elementor preview and user-declared TargetProfile alignment preview;
- P16 Gutenberg R1 normalized candidate/native-validation evidence chain through an exact decision prerequisite, non-authorizing genuine-evidence retention requirements manifest, offline operator export, exact-current manifest validator, offline validation CLI, bounded local JSON I/O with stable immutable read snapshots + output-parent snapshot revalidation + temporary payload identity binding + non-recursive temporary cleanup + output-destination state binding, iterative structural bounds, depth/value/text-bounded + accessor/own-shape-safe direct canonicalization with object-cardinality preflight, prototype-safe canonicalization and alias-safe atomic output writes;
- exact-build release/provenance tooling.

Canonical planning/status docs:

- `docs/MARKET_RESEARCH_PLAN.md` — R0 market/platform research;
- `docs/RELIABILITY_AND_COMPATIBILITY_AUDIT.md` — R1 reliability/compatibility contract;
- `docs/COMMERCIAL_EXPANSION_PLAN.md` — P13-P26 roadmap; P27 final release gate is #182;
- `docs/P14_FOUNDATION_IMPLEMENTATION.md` — current P14 boundary plus synchronized downstream adapter status;
- `docs/R0_GUTENBERG_P16_2026-09-14.md` — retained P16 WordPress/Gutenberg R0 snapshot;
- `memory-bank/PROJECT_STATE.md` — current project truth;
- `memory-bank/NEXT_ACTIONS.md` — current execution queue.

Machine-readable operational registry: `config/runtime-artifacts.json`, schema v3.

## Live development status

> **Progress policy:** implementation, runtime acceptance and external review are separate evidence states. New future scope does not reduce already-completed historical core progress.

**Open PR/MR:** see the repository's current pull-request list; this README intentionally does not hardcode a count.

Open roadmap / acceptance dependencies:

- `#84` — P12 retained final validation/release-exit truth;
- `#119` — P13-P27 commercial/multi-target roadmap owner;
- `#159` — P13 real-plugin Build-Ready runtime/parity acceptance dependency;
- `#182` — P27 final production-release gate;
- `#287` — repository-admin branch-protection/ruleset hardening residual.

Current verified main before this documentation sync:

`553bfba0ae3cad4c94d7dd6b5c78c96ec3fde698`

### Recent verified P16 sequence

- PR #356 — deterministic non-authorizing `gutenberg-normalized-candidate-v1` -> `14a55bf31fc741adea0839d661e3c3358cfb7053`.
- PR #358 — exact canonical candidate identity -> `88617cde269393a3f886b2178c6c0a4765e3bb4a`.
- PR #360 — exact-bound caller-supplied native-serialization receipt -> `11499202e48d3c51ef416bbc447a729547eba4ce`.
- PR #364 — Node-20 offline exact-bound native-serialization evidence intake -> `75d77f5eeb0d63e838bceec8fe799c31ba179117`.
- PR #366 — sanitized native-serialization pre-decision review packet -> `d14e0416413531ca98bfd97dc57e839bef6440a1`.
- PR #370 — exact-bound externally reported evidence-authentication report -> `5328f6d0205a350e5e1f27b0106fd930e680ae17`.
- PR #374 — exact-bound decision prerequisite; external auth PASS stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED` -> `6dc86dfc900244616869e5ff289c3afa815a1d2d`.
- PR #376 — canonical decision-prerequisite docs sync -> `31080f673102206e6e6ae41801569d62e2eb7512`; exact head `e05e6e366626f43e99d6745dddbdc9d87c348f93` passed CI #1149, Integration Readiness #419, P12 Final Release Artifact #460 and P12 Offline Acceptance #504.
- PR #378 — deterministic `gutenberg-native-serialization-evidence-retention-requirements-v1`; READY only from the exact `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED` prerequisite and still non-authorizing -> `2d7c9e76eb293b8914dd1106c262064013d70b11`; exact head `8ffee524268d2fb1aac0a1dfefffd63014590d88` passed CI #1151, P12 Final Release Artifact #462 and P12 Offline Acceptance #506.
- PR #380 — synchronized canonical retention-requirements docs -> `c6f6009538e1e0f82bed087783f2c55fa0d9e75d`; corrected exact head `c64a3cd5936fcc2c0d055fe7810a6cf574003da9` passed CI #1155, Integration Readiness #424, P12 Final Release Artifact #466 and P12 Offline Acceptance #510.
- PR #382 — added package command `p16:evidence-retention-requirements` plus Node-20 offline/operator export for the sanitized requirements manifest -> `e2fe19364ac8615bc390f125c2afb4085bfc474c`; exact head `0626987afe962f54a7a89996219e12cf57744bc4` passed CI #1157, P12 Final Release Artifact #468 and P12 Offline Acceptance #512.
- PR #384 — synchronized canonical docs through the operator export -> `4c91cb3033672d6dc3a6fa28287e060a22e40734`; exact head `919df37267b195516f1b98dfd744502b58ecfe66` passed CI #1159, Integration Readiness #427, P12 Final Release Artifact #470 and P12 Offline Acceptance #514.
- PR #386 — added `gutenberg-native-serialization-evidence-retention-requirements-validation-v1`, an exact-current strict-JSON validator for exported requirements manifests -> `1532fa54ec9c26bb8904ca939a01754418a70602`; exact head `dd5d1a9674e9e4fbc86fe11b040a4c9f04d0bb68` passed CI #1162, P12 Final Release Artifact #473 and P12 Offline Acceptance #517.
- PR #388 — synchronized canonical docs through the exact-current manifest validator -> `d7532a98b71e5dc5ac6c100b0386f06422966cf9`; exact head `83d76c7f91e66d6ffdff8b141b3ffa2338d30a27` passed CI #1164, Integration Readiness #430, P12 Final Release Artifact #475 and P12 Offline Acceptance #519.
- PR #390 — added `p16:evidence-retention-requirements-validate`, a Node-20 offline CLI for exact-current saved-manifest validation -> `c173c617ad205f0fef4a5659f27bf007067e6eb5`; exact head `7fcd4b553830527ab5900355663c3412a63780bc` passed CI #1166, P12 Final Release Artifact #477 and P12 Offline Acceptance #521.
- PR #392 — synchronized canonical docs through the offline exact-current validation CLI -> `78f25d0cbc72427ea9824370762099db916750ed`; exact head `65d74941faa01a585e984d9d3b53c6932a864546` passed CI #1168, Integration Readiness #433, P12 Final Release Artifact #479 and P12 Offline Acceptance #523.
- PR #394 — hardened both retention operator CLIs with shared bounded local JSON I/O -> `19d36b87b71cdc0d8b8f862c733420d64a56d3d2`; exact head `adbdfa0da1f61d4b9ff2dab3272526c36b19c3e4` passed CI #1170, P12 Final Release Artifact #481 and P12 Offline Acceptance #525.
- PR #396 — synchronized canonical docs through retention operator file-bound hardening -> `12dc1e7e7e149e4da51a13c14722ac834f8a69ca`; exact head `6ac64e15f1c5fca058983a9a33ba4b9ab519a8d5` passed CI #1172, Integration Readiness #436, P12 Final Release Artifact #483 and P12 Offline Acceptance #527.
- PR #398 — made retention-manifest canonicalization prototype-safe so own enumerable `__proto__` keys remain canonical data and are rejected as hostile extra fields -> `4ec559f538899697d51138fc35ed79c2bea486b1`; exact head `b7f3eead07fd9305d9b2f9290a572c715466e981` passed CI #1174, P12 Final Release Artifact #485 and P12 Offline Acceptance #529.
- PR #400 — synchronized canonical docs through prototype-safe canonicalization -> `158132b4076fe5a70afa8e8778ae888fcca4db60`; exact head `b6cfb1922429f48e69e40d6a8c270454d10c99a2` passed CI #1176, Integration Readiness #439, P12 Final Release Artifact #487 and P12 Offline Acceptance #531.
- PR #402 — hardened retention CLI output writes against symlink/hardlink/real-parent aliases with same-directory temporary files and atomic rename -> `8445fc0632a58515a52d72e3cf85ed1364761b9c`; exact head `039f45aaf95571828b38dfc661a41dd2bcc62dc0` passed CI #1178, P12 Final Release Artifact #489 and P12 Offline Acceptance #533.
- PR #404 — synchronized canonical docs through alias-safe atomic output writes -> `4f66522ae9d8dc6fb82875b32634306918ed0a9a`; exact head `4917d79bad91086a5262b99f16091e3eff14c647` passed CI #1180, Integration Readiness #442, P12 Final Release Artifact #491 and P12 Offline Acceptance #535.
- PR #406 — added iterative retention-operator JSON structural bounds: maximum 64 container levels and 50,000 total JSON values -> `5feb04adcd6aaca2079b749d495e22e1da6f6671`; exact head `42c26747e6609cb4c890174baa5627a4e000e889` passed CI #1182, P12 Final Release Artifact #493 and P12 Offline Acceptance #537.
- PR #408 — synchronized canonical docs through retention JSON structural bounds -> `ab8cb5e783b14688180959017aa79b9a86adfa66`; exact head `8c984f124a5b22a5c05cb15527e1cf468b0ff772` passed CI #1184, Integration Readiness #445, P12 Final Release Artifact #495 and P12 Offline Acceptance #539.
- PR #410 — bounded direct retention-manifest canonicalization independently of CLI guards: 64 container levels / 50,000 total values -> `cb4de36d4922b31b1e278d4f55426d042736549b`; exact head `c3ef7329d430c3e450a8b8e4292a5293eace8865` passed CI #1186, P12 Final Release Artifact #497 and P12 Offline Acceptance #541.
- PR #412 — synchronized canonical docs through direct canonicalization bounds -> `1a7cb4b7692a0361d645ddf1396f6aac561ad093`; exact head `edd6b0166ed9184dde5168614f2b311cd62062b6` passed CI #1188, Integration Readiness #448, P12 Final Release Artifact #499 and P12 Offline Acceptance #543.
- PR #414 — added direct aggregate 1 MiB UTF-8 text budget across canonical string values and object keys, with pre-sort key charging and browser-safe Unicode accounting -> `86cc545456a1f994c9893069b878110662a60bbe`; exact head `6c92b2dd6707be8a7242bf1911cdb46c3ff4972a` passed CI #1190, P12 Final Release Artifact #501 and P12 Offline Acceptance #545.
- PR #416 — synchronized canonical docs through direct canonical text-byte bounds -> `5b0d3e9f08122c4df7cb29edfd0e51dabb8de440`; exact head `b463984615d3d1c78d872ee8e3ea85390093ca8f` passed CI #1192, Integration Readiness #451, P12 Final Release Artifact #503 and P12 Offline Acceptance #547.
- PR #418 — rejected accessor-backed direct canonicalization values without invoking getters/setters -> `4adc40d74b74f74f362cb635854dd2c8240134d8`; exact head `7038cd7434dc4da03c3c0e590a4c927a47e8b7f7` passed CI #1194, P12 Final Release Artifact #505 and P12 Offline Acceptance #549.
- PR #420 — synchronized canonical docs through accessor-safe direct canonicalization -> `b89dbba01dd85fc84d53761190581a2ab93ba8f0`; exact head `027b59c704fb8181c75df24e4e0f0487a49caeb5` passed CI #1196, Integration Readiness #454, P12 Final Release Artifact #507 and P12 Offline Acceptance #551.
- PR #422 — rejected hidden non-JSON own properties from direct canonicalization while retaining frozen/sealed JSON-shaped values -> `29285d205a61cc437e446367b3d8fefc52595e1d`; exact head `5c7256666b690533a1821cf4c087cbaa7963c47d` passed CI #1198, P12 Final Release Artifact #509 and P12 Offline Acceptance #553.
- PR #424 — synchronized canonical docs through strict own-property canonicalization -> `61ba4dc5b456a588383ed0169045387e0fc51482`; exact head `56cdf6d1314dcb59764a6c652e2d31a10fca297e` passed CI #1200, Integration Readiness #457, P12 Final Release Artifact #511 and P12 Offline Acceptance #555.
- PR #426 — added plain-object cardinality preflight before descriptor/text/sort work while preserving the exact 50,000-value boundary -> `06cdd845e46613541f555cc0de59237d261c1fa3`; exact head `03c41d0c4b6880038e24a1f35c854401c0223fee` passed CI #1202, P12 Final Release Artifact #513 and P12 Offline Acceptance #557.
- PR #428 — synchronized canonical docs through direct object-cardinality preflight -> `44186a19b5719ae3cd3b883140e6e2b8bf776553`; exact head `a140a6918df8cc6be46c990cc10dd1f6aaa13e88` passed CI #1204, Integration Readiness #460, P12 Final Release Artifact #515 and P12 Offline Acceptance #559.
- PR #430 — bound retention operator reads to stable file snapshots and carried those snapshots into output safety -> `146b2dd7a534ab12b4598fe1c78823d5e9733118`; exact head `211d24d7615217b9711debecc06d05dbff16c92d` passed CI #1206, P12 Final Release Artifact #517 and P12 Offline Acceptance #561.
- PR #432 — synchronized canonical docs through stable operator input snapshots -> `686a4e8bf65a2b0b43075baa20c6fa6eccadb10d`; exact head `2507049a686e9a757838da2dbfce427580b8ad40` passed CI #1208, Integration Readiness #463, P12 Final Release Artifact #519 and P12 Offline Acceptance #563.
- PR #434 — froze retention operator snapshot wrapper/file metadata while intentionally leaving parsed `.value` unfrozen -> `78c162728af3249a4ce5905eb831b7a0f72dcd4d`; exact head `250d8490ad4ceaaede0fa4a9af7daadbb74ae655` passed CI #1210, P12 Final Release Artifact #521 and P12 Offline Acceptance #565.
- PR #436 — synchronized canonical docs through immutable operator snapshot metadata -> `df3a5503eb274c4e9c5c5dccf6383b66138cec12`; exact head `352a670eb5b1d301ea8badccf71b6c2e35831286` passed CI #1212, Integration Readiness #466, P12 Final Release Artifact #523 and P12 Offline Acceptance #567.
- PR #438 — added frozen canonical output-parent snapshots, parent revalidation before temp creation/final rename and fail-safe temp cleanup -> `2b67f292d192b86f825e99860313978ee49dfb6f`; exact head `ca1c51df84ab96cf1b1ddfa2a0a53d20805a1e21` passed CI #1214, P12 Final Release Artifact #525 and P12 Offline Acceptance #569.
- PR #440 — synchronized canonical docs through output-parent snapshot revalidation -> `f58029610c5fc8e07c2cff467eae33490be6a92f`; exact head `1fe88eac56697e79dd548f4610e33f7c449bc4f0` passed CI #1216, Integration Readiness #469, P12 Final Release Artifact #527 and P12 Offline Acceptance #571.
- PR #442 — bound temporary payload creation/write/rename to captured temp-directory and payload-file identities -> `13cc556d87652a9f0f30a8749f98ae823c9dbd9a`; final exact head `1632207cefd8e3ea2882b23962d9172609fef39b` passed CI #1219, P12 Final Release Artifact #530 and P12 Offline Acceptance #574.
- PR #444 — synchronized canonical docs through temporary payload identity binding -> `f82a667f1e397e713af1447af2117e20c55150d4`; exact head `5609018b5af23340b08080699c69620dbb558b85` passed CI #1221, Integration Readiness #472, P12 Final Release Artifact #532 and P12 Offline Acceptance #576.
- PR #446 — removed recursive temporary-directory cleanup so cleanup attempts only non-recursive `rmdir` after parent/temp snapshot checks -> `0c9325fe995e983b4c904f59f788ac91167276aa`; exact head `efc6d1b34f238928635abb5eaa2d5afb20ff0b2b` passed CI #1223, P12 Final Release Artifact #534 and P12 Offline Acceptance #578.
- PR #448 — synchronized canonical docs through non-recursive temporary cleanup -> `af517e1477d57753993f805ccb4d0f770fdf51d5`; exact head `875c1ab816f67761be11f032a87cd3a4ec6e4d57` passed CI #1225, Integration Readiness #475, P12 Final Release Artifact #536 and P12 Offline Acceptance #580.
- PR #452 — bound final atomic rename to captured output-destination state -> `f3306a3aba5b42544cbdabe950f975ce5ce338a9`; exact head `ae6fff73839f874ca5eb0b92d50e7632e74ce533` passed CI #1231, P12 Final Release Artifact #542 and P12 Offline Acceptance #586.
- PR #454 — synchronized the four canonical status documents through output-destination state binding -> `b5e8f919156fb8dc75cab9bad418ce95c7e36f0a`; exact head `25aab78d4f198cf688522a1a1f5ff75df0467855` retained P12/P14/P15/P16/P17-P27 authority truth unchanged.

### Recent verified governance sequence

- PR #456 — added read-only `Main PR Origin Audit` detection for pushes to `main`; unassociated direct-main commits fail the post-push audit, but the workflow does not prevent the push -> `1896ba5d576e6d33f693a2a5dc0a7fb09094d1d6`; exact head `6945cd73e5d852bb5069fbdb31831e11c7b7f144` passed CI #1239, P12 Final Release Artifact #550 and P12 Offline Acceptance #594; post-merge audit run #1 PASS.
- PR #458 — extended the same read-only audit to fail on `github.event.forced == true` before PR association lookup -> `cd4e8394dfaa6917d28676e51eec831591b6b99a`; exact head `40f036dcfd5814b3476d249b32cb113009269fc6` passed CI #1241, P12 Final Release Artifact #552 and P12 Offline Acceptance #596; post-merge audit #2, CI #1242, Integration Readiness #488, Final #553 and Offline #597 all PASS.
- `#287` remains OPEN because repository-admin branch protection/rulesets are still required for actual prevention; `main` is not represented as protected merely because post-push detection exists.

### Recent verified P15 commercial-V1 sequence

- PR #460 — expanded README phase visibility through P27 -> `e2c446b162607767e55dfaa8705d5ac446c49734`.
- PR #462 — added bounded target-neutral export IR plus deterministic local Elementor v0.4 Container/Widget Template JSON candidate generation -> `673a366ad3da25c5d3a327ed87572bcdb2af408d`; generation remains local/non-authorizing and REVIEW fails closed without partial output.
- PR #464 — added read-only selected-Figma-Frame extraction for bounded HORIZONTAL/VERTICAL Auto Layout/plain TEXT, documented-core `text-editor` mapping, HTML escaping/line-break retention and fail-closed manual/grid/wrap/absolute/image/depth/node review handling -> `9d7718dd19d56c28a183023f347947bcdc3123c9`; exact head `a4eb7eddcb60bdb00a15483775c1bb75cbcc1410` passed CI #1250, P12 Final Release Artifact #561 and P12 Offline Acceptance #605.
- PR #468 — exposed the accepted local path in normal + publishable plugin UI through sanitized `p15-elementor-plugin-preview-report-v1`; no template/candidate bytes, download/import/network/mutation authority -> `089cd53b990763bc0236d08888306682cbe1f202`; exact head `5df10945869f92fd1c89c901eeaa2c222f3034d7` passed CI #1256, P12 Final Release Artifact #567 and P12 Offline Acceptance #611.
- PR #471 — added bounded user-declared WordPress/Elementor TargetProfile inputs and sanitized profile/candidate fingerprint + declared-alignment preview; `PROFILE_ALIGNED_REFERENCE_REVIEW_PENDING` remains declared metadata alignment only -> `553bfba0ae3cad4c94d7dd6b5c78c96ec3fde698`; exact head `e65c09d38ea3e65743572bfc964007ff75fee169` passed CI #1258, P12 Final Release Artifact #569 and P12 Offline Acceptance #613.
- PR #518 / #483 — retained the first genuine controlled Elementor target proof on exact WordPress `6.8` + Elementor `4.2.4`; exact head `4f09efda101e5a2771df9bfc3ac8960a43655e96`, proof run `35403469986`, artifact `10570709987` / `sha256:206b703ab8185f1e5b1a83346074accb23cc458b9fdcb94f5eaad0c4752e33aa`; import/editor/render plus bounded structure/background/radius fidelity all PASS; authority remained false.

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | REPO-SIDE DETECTION COMPLETE / ADMIN ENFORCEMENT IN PROGRESS | N/A | `──────────` | Main PR-origin + forced-update audit is active; #287 admin branch/ruleset enforcement still required |
| P0–P4 historical core aggregate | COMPLETE | 100% | `██████████` | Compatibility summary only; individual P0-P4 rows below are canonical for phase visibility |
| P0 AI-native foundation + audit-only scaffold | COMPLETE | 100% | `██████████` | Planning, memory-bank, deterministic audit-only scaffold and CI foundation established |
| P1 Audit-Only MVP + golden-fixture calibration | COMPLETE | 100% | `██████████` | Read-only selected-frame audit, explainable scoring and fixture calibration complete |
| P2 Deterministic layout classifier + evidence/confidence | COMPLETE | 100% | `██████████` | Classifier families, preservation roles and adversarial regression coverage complete |
| P3 Geometry/content/image integrity + visual-diff validator | COMPLETE | 100% | `██████████` | Full validation and fail-closed pixel-broker path retained |
| P4 Candidate transaction engine + rollback guarantees | COMPLETE | 100% | `██████████` | Candidate clone -> transform -> validate -> commit/discard transaction foundation complete |
| P5 Conservative Safe Fix | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained real Figma closure |
| P6 Advanced structures | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained positive/refusal closure |
| P7 Batch queue | COMPLETE / PRODUCTION ACCEPTED | 100% | `██████████` | Retained 64-Frame stress/cancellation closure |
| P8 Historical exporter placeholder | DEFERRED / SUPERSEDED | N/A | `──────────` | Replaced by P15+ neutral target adapters |
| P9 Backlog generator | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real plugin export quality retained |
| P10 npm/Node CLI | COMPLETE / P12 ACCEPTED | 100% | `██████████` | Real REST/auth/plugin parity retained |
| P11 Normal Figma distribution | IMPLEMENTATION COMPLETE | 100% | `██████████` | Live publisher/install evidence remains in P12 |
| P12 Final integrated validation | IN PROGRESS | 80% | `████████░░` | Fresh exact-#20 runtime/final-details/2FA evidence + final internal exit review |
| R0 Market/platform research gate contract | DEFINED / RECURRING | 100% | `██████████` | Refresh per major adapter |
| R1 Reliability/compatibility gate contract | DEFINED / RECURRING | 100% | `██████████` | Execute profile/capability/validator/harness gate per adapter |
| P13 Build-Ready Score 2.0 + Responsive Risk | IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING | 100% impl | `██████████` | #159 real-plugin parity/internal runtime acceptance remains |
| P14 Target-Ready Duplicate + Guided Prepare | CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED | N/A | `──────────` | Read-only review is active; production registry remains empty; #159 required before real mutation exposure |
| P15 Elementor native export + validation | CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED | N/A | `──────────` | Exact WP 6.8 + Elementor 4.2.4 Container proof retained; #545 adds exact declared-profile reference alignment while broader semantic/media/responsive mapping and additional matrix evidence remain pending |
| P16 Gutenberg native export + transfer | CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED | N/A | `──────────` | Exact chain + retention requirements/export/current-manifest validator + offline validation CLI + byte/structure-bounded/prototype-safe/alias-safe local I/O with stable immutable read snapshots + output-parent snapshot revalidation + temporary payload identity binding + non-recursive temporary cleanup + output-destination state binding + depth/value/text-bounded accessor/own-shape-safe direct canonicalization with object-cardinality preflight exist; genuine authenticated evidence and native target/editor/import/render validation remain unwired |
| P17 HTML/CSS/JS + code-to-design | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Static-first contract retained; JS execution separately gated |
| P18 Framework adapter platform | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Neutral Web IR + adapter/build matrix retained |
| P19 Assets/fonts/design-system export | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Asset/token provenance and font constraints retained |
| P20 Round-trip QA + section portability | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Controlled render harness + calibrated QA required |
| P21 Handoff/client QA/a11y-SEO advisories | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Build from accepted target outputs |
| P22 Complexity / effort estimator | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Transparent effort-unit/calibration contract retained |
| P23 Agency/project/component bindings | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Stable implemented adapters first |
| P24 CMS/dynamic/forms/interactions | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Typed mappings retained; production writes out of first slice |
| P25 Free / Pro / Agency packaging | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Capability-based entitlement contract retained |
| P26 Optional AI assistance | PREFLIGHT FROZEN / IMPLEMENTATION NOT STARTED | 0% | `░░░░░░░░░░` | Non-authoritative AI authority firewall retained |
| P27 Final production release + publisher/runtime evidence | GATE DEFINED / EXECUTION DEFERRED | 0% exec | `░░░░░░░░░░` | Coordinate retained #84 truth + final live runtime/publisher/2FA evidence |

**Overall progress is intentionally not collapsed into one synthetic percentage.**

## Current P14 boundary

P14 remains **CORE IMPLEMENTATION IN PROGRESS / RUNTIME UNWIRED**. `PRODUCTION_P14_SAFE_RECIPE_REGISTRY` remains empty. Read-only preview/review evidence does not create confirmation or production mutation authority. #159 genuine Figma Desktop evidence remains required before real P14 mutation exposure.

## Current P15 boundary

P15 remains **CORE FOUNDATION IN PROGRESS / CONTROLLED TARGET PROOF RETAINED**.

The bounded local code path now includes target-neutral IR, deterministic Elementor v0.4 Template JSON candidate generation and read-only selected-Figma-Frame extraction for supported Auto Layout/plain-text facts. REVIEW-bearing extraction/generation fails closed with no partial candidate, and layer names are not used to invent heading/button semantics.

Normal and publishable plugin UI expose a sanitized read-only Elementor preview and bounded declared TargetProfile alignment. The local preview omits template/candidate bytes and exposes status/count/widget/reason-code metadata only. TargetProfile assessment uses user-entered declared WordPress/Elementor versions, reruns the current selected-Frame extraction and fingerprints the profile/candidate. PR #518 additionally retained one real clean-Core reference observation on exact WordPress `6.8` + Elementor `4.2.4`; #545 exposes only an exact retained-reference match for that declared envelope. Declared input is never promoted to an observed target environment.

The retained #483 proof is one bounded reference, not a general Elementor support claim. Current user-declared/local preview state still keeps `referenceClosureStatus=NOT_RUN`, `targetEnvironmentValidationStatus=NOT_RUN`, `environmentObserved=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false` and `downloadEnabled=false`. An exact reference match means only that the registry contains the retained WP `6.8` + Elementor `4.2.4` Container/Template JSON proof; no exact match is not an incompatibility verdict. Atomic-v4, Pro/addons, responsive/media closure, broader semantic mapping, production acceptance and transfer authority remain outside that proof or otherwise unvalidated.

## Current P16 boundary

P16 remains **CORE FOUNDATION IN PROGRESS / TARGET VALIDATION UNWIRED** with `N/A` progress.

Current bounded chain now includes:

- normalized parsed-block/capability contract;
- immutable declared `gutenberg-target-profile-v1` + profile fingerprint;
- profile-bound assessment with strongest metadata state `PROFILE_ALIGNED_NATIVE_VALIDATION_PENDING`;
- deterministic normalized candidate + exact candidate identity;
- exact-bound caller-supplied native-serialization receipt;
- offline receipt revalidation/intake;
- sanitized pre-decision review packet;
- exact-bound externally reported evidence-authentication report;
- sanitized decision-prerequisite packet that stops at `GENUINE_AUTHENTICATION_EVIDENCE_REQUIRED`;
- deterministic `gutenberg-native-serialization-evidence-retention-requirements-v1`, READY only from that exact prerequisite. It preserves exact candidate identity, canonical receipt SHA-256, canonical authentication-report SHA-256 and declared WordPress version, then fingerprints a requirements profile for a future separate trusted intake;
- `p16:evidence-retention-requirements`, a Node-20 offline/operator export that accepts only the existing local document/profile/receipt/authentication-report chain and writes the sanitized manifest. Exit 0 means only requirements metadata is READY; it is not evidence authentication or decision authority;
- `gutenberg-native-serialization-evidence-retention-requirements-validation-v1`, which rebuilds the current exact manifest and validates a previously exported manifest with strict JSON-only, key-order-independent semantic equality. It rejects stale/tampered/extra/missing fields and reports only sanitized fingerprints/status metadata;
- `p16:evidence-retention-requirements-validate`, a Node-20 offline/operator validation CLI that accepts only local document/profile/receipt/authentication-report/manifest JSON, writes only the sanitized validator result, and exits 0 only for `CURRENT_REQUIREMENTS_MANIFEST_VALID`;
- shared bounded operator JSON I/O for both retention CLIs: every input is limited to 1 MiB before parse with a post-read byte-length recheck, must be a regular file, cannot be zero-byte/whitespace-only, and the normalized output path cannot collide with any input path;
- stable operator input snapshots: the existing initial path inspection remains before content read, the opened handle must still match the inspected regular file before read, handle/path metadata is rechecked after read, and the parsed value is carried together with resolved/canonical path + read-time identity/metadata into output safety;
- immutable snapshot metadata: `P16OperatorJsonInputSnapshot` wrapper fields and nested file metadata are TypeScript-readonly and runtime-frozen, so later internal code cannot replace captured paths or file identity/metadata. Parsed `.value` is intentionally not deep-frozen and remains usable by existing builders/validators;
- output snapshot revalidation: the exact files read by the CLIs are checked again before temporary output creation and immediately before atomic rename; observed post-read pathname replacement fails closed and temporary output state is cleaned before failure. Stable dev/ino identity is used where available; otherwise canonical path plus size/mtime/ctime consistency is a bounded fallback, not a perfect filesystem-race-elimination guarantee;
- output-parent snapshot revalidation: the canonical output directory is captured as a frozen path/dev/ino snapshot after creation/resolution, checked again before temp creation and immediately before final rename, and must still be a directory that self-resolves to the same canonical path. When stable identity existed at capture, the same dev/ino directory identity is required; otherwise the fallback is canonical-path/directory consistency only;
- output-destination state binding: the final output entry is captured before staging as either `ABSENT` or a frozen `EXISTING_REGULAR` canonical path + file snapshot. Immediately before rename, an absent destination must still be absent and an existing destination must still be the same observed regular file; observed creation, replacement, removal or type change fails closed with `Output path changed during write.`;
- non-recursive temp cleanup: after output-parent and temporary-directory snapshot checks, cleanup attempts only `rmdir`. Successful writes remove the now-empty owned temp directory after payload rename; failed/non-empty temp state is left untouched and may remain as a bounded orphan rather than recursively traversing a pathname whose ownership cannot be continuously proven;
- temporary-directory identity binding: the `mkdtemp` directory is captured and must remain a directory that self-resolves to the same path; it is revalidated before payload open, immediately after payload open, after payload write and immediately before final rename, with same dev/ino required where stable identity was captured;
- opened temporary payload binding: `payload.json` is created exclusively with `open(..., 'wx')`, the opened handle and current pathname must identify the same regular file before any content write, content is written through that `FileHandle`, a frozen post-write file snapshot is captured, and the source pathname must still match that snapshot before rename;
- iterative post-parse structural validation: input is rejected before target builders/validators when container nesting exceeds 64 levels or total JSON values exceed 50,000; the traversal itself is non-recursive;
- direct retention-manifest canonicalization independently enforces 64 container levels, 50,000 visited values and an aggregate 1 MiB UTF-8 text budget across string values + object keys for exported validator/fingerprint callers that bypass the CLIs;
- accessor-safe direct canonicalization: own property descriptors are inspected instead of invoking values through ordinary property access, so object/array accessors fail closed without getter/setter execution;
- strict own-shape direct canonicalization: plain objects reject own symbol and non-enumerable string properties; arrays allow only standard `length` plus canonical own indices and reject extra named/symbol properties; frozen/sealed JSON-shaped data remains accepted;
- object-cardinality preflight: plain-object own string-property count must fit the remaining 50,000-value budget before descriptor scanning, UTF-8 key charging or sorting; root + 49,999 primitive properties is accepted while root + 50,000 rejects;
- prototype-safe exact-current canonicalization: canonical object snapshots are created without `Object.prototype`, so own enumerable JSON keys such as `__proto__` remain canonical data fields, affect fingerprints, and are rejected when added to the manifest instead of being silently dropped;
- alias-safe output writes: existing symlink/non-regular targets are rejected, hardlink identity against the files actually read is rejected where stable identity is available, output is staged in a unique same-directory regular temp file, and input/output-parent/output-destination/temp-directory/payload snapshots are revalidated before atomic rename.

The direct canonicalization budget bounds recursive descent to at most 64 container levels, total direct values to 50,000 and aggregate UTF-8 text to 1 MiB. Object keys are charged before sorting. UTF-8 accounting is browser-safe/manual and covers multi-byte Unicode, paired surrogates and lone-surrogate replacement width. Accessor-backed properties are rejected without invocation. Hidden JavaScript-only own state is rejected rather than omitted from fingerprints. Arrays and plain objects both preflight their child cardinality against the remaining value budget; plain objects do so before descriptor/text/sort work. Normal frozen/sealed JSON-shaped data and own enumerable `__proto__` data keys remain canonicalizable. Existing cycle, sparse-array, non-finite, non-JSON, non-plain-object and prototype-safe handling remain unchanged.

The operator structural guard prevents byte-bounded but deeply nested or high-cardinality JSON from reaching downstream validation/canonicalization. Stable read snapshots bind parsed content to the observed files and carry the same observation into output checks; immutable snapshot metadata prevents later path/identity redirection. Output-parent snapshots bind the final rename to the canonical directory that was safety-checked. Output-destination snapshots bind overwrite eligibility to the absent-or-existing regular entry observed before staging. Temporary-directory snapshots and the opened payload handle/file snapshot separately bind payload creation, content write and rename to the temp subtree that was actually observed. These checks narrow path-swap/TOCTOU ambiguity but do not claim perfect race elimination; a narrow final destination check→rename race remains without an OS-specific conditional-rename primitive, and metadata fallback is bounded when stable filesystem identity is unavailable.

The output writer rejects a destination entry that is created, replaced, removed or changes type after its captured destination state and before the final checked rename boundary, so an observed late-created final symlink is not followed or silently accepted. Temporary payload content is written through the exclusively opened handle rather than a path-based `writeFile`; handle/path identity is checked before content write and the post-write payload snapshot is checked before rename. Temporary cleanup is never recursive: after parent/temp snapshot revalidation it attempts only `rmdir`, so non-empty failed-path temp state is preserved rather than recursively deleting replacement-controlled contents. Focused tests cover output symlink, hardlink and symlinked-parent aliases, stable input snapshots, post-read input replacement, immutable snapshot metadata, stable/replaced output-parent snapshots, absent/existing/replaced output-destination snapshots including inode-zero metadata fallback and unchanged-overwrite support, stable/replaced temp-directory snapshots, opened payload handle/path mismatch, post-write payload replacement, empty owned-temp removal and non-empty temp-content preservation.

Focused canonicalization regressions cover top-level and nested own `__proto__` additions, direct structural/text boundaries, accessor-backed values, strict own-property shapes and exact object-cardinality boundaries, and confirm `Object.prototype` is not polluted. The validator schema/version/status remain unchanged because these hardenings preserve the existing strict exact-current metadata contract.

Operator/input failures remain exit code 2 with deterministic content-free errors. Windows path comparison is case-normalized for output/input collision checks.

The validation CLI stdout is limited to output path, validator status, current requirements status, exactSemanticMatch, and canonical expected/provided SHA-256 values. Rejection states exit 2. The supplied manifest payload is never echoed.

Validator states remain `REJECTED_CURRENT_CHAIN_NOT_READY`, `REJECTED_REQUIREMENTS_MANIFEST_INVALID_OR_STALE`, and `CURRENT_REQUIREMENTS_MANIFEST_VALID`. VALID means only that the non-authorizing requirements metadata exactly matches the current deterministic chain. It does not authenticate evidence, validate WordPress, create an internal decision, or grant compatibility/production authority.

The retention requirements manifest/export/validator/validation CLI accepts **no future evidence artifact or evidence PASS/FAIL**, performs no authentication, and makes no internal decision. Outputs remain sanitized and do not expose the raw evidence reference, source evidence-reference hash, supplied manifest payload or native Gutenberg post content.

Current authority remains fixed: `evidenceAuthenticationStatus=NOT_RUN`, `authenticationAuthority=false`, `nativeSerializationAuthority=false`, `targetEnvironmentValidated=false`, `editorImportValidated=false`, `renderValidated=false`, `decisionAuthority=false`, `acceptanceAuthority=false`, `targetCompatibilityClaim=false`, `productionAcceptance=false`, `generationEnabled=false`, `downloadEnabled=false`, `internalDecisionStatus=NOT_RUN`, and `internalDecisionEligible=false`.

The repository still does **not** execute WordPress/PHP/`@wordpress/blocks`, fetch or authenticate evidence, identify/verify an authenticator, validate signatures, connect to a WordPress site, prove editor/import/render behavior, map Figma semantics, transfer sections, or generate patterns/packages.

The normalized JSON model is not Gutenberg post-content serialization and intentionally omits WordPress `innerContent`. Custom/unregistered/freeform content remains `REVIEW_REQUIRED`.

## Current P12 publishing line

P12 remains at the retained **80%** release-exit state. The publishing-authoritative historical package remains Final Release Artifact #20 from source `5f12b1d28146d5c2af815cc9f83eb30431dce4b5` with plugin ID `1680034649341961379`. Later P13-P16 development commits do not silently replace that publishing candidate.

## Immediate execution order

1. keep P14 non-authorizing while #159 genuine Figma evidence remains pending;
2. continue P15 commercial-V1 from the retained #483 proof through exact reference alignment (#545), then concrete semantic/media/responsive mapping and closure gaps; keep target-compatibility/production/download authority false unless separate evidence explicitly changes it;
3. for P16, do not create a stronger authority-bearing intake/decision from caller-supplied metadata; genuinely retained authenticated evidence is now the prerequisite for the next authority-bearing step;
4. additional P16 code-only work may remain read-only/supporting, but must preserve every false authority flag above;
5. continue P17-P26 only in retained dependency order;
6. execute P27 #182 only after implementation/internal readiness is ready.
