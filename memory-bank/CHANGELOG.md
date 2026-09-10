# Changelog

## 2026-09-10

### Plugin display-name rename — WP Builders Prepare

- User-requested shipped plugin/product display name changed from `Pella Elementor Prep` / `WP Elementor Prep` to exactly `WP Builders Prepare`.
- Updated development/release manifests, release contract config, Community listing, development/release UI titles, current operator docs and generic runtime manifest fixtures.
- Updated the release menu label from `Open Elementor Prep` to `Open WP Builders Prepare`.
- The canonical P5 #488 semantic-pin fixture intentionally retains `Pella Elementor Prep` because it models immutable accepted artifact bytes; registry hash and accepted provenance remain unchanged.
- Technical repository/npm/CLI slug `wp-elementor-prep`, Figma plugin ID/provenance identities and historical accepted runtime artifacts remain unchanged.
- Branding-only change: no progress percentage or runtime acceptance credit changes.

### P5 genuine Desktop acceptance, hardened closure and final integration

- Real Figma development plugin ID `1679803102348456572`; canonical #488 Desktop Runtime Self-Test accepted true with failures empty and leftovers 0.
- Rendered-pixel forced reject, restore and finalize calibration PASS.
- Current-main closure run `34463444342`: canonical ZIP SHA MATCH, immutable 5/5 MATCH, manifest semantic MATCH, same-artifact verifier exit 0.
- Evidence byte SHA-256 `ce5800eb3c5fb3e57d56ac61ffcb0e97d9d569d3d4097f103c546c1605c5a8b5`; retained closure artifact `10146495702`, ZIP SHA-256 `e17f0f25821fb52d8cf6427f2bda99e154eb188a62d278bbea299f6402a533d8`.
- Provenance: retained repository JSON is an exact reconstruction of user-provided JSON text because conversation inventory did not expose a separately mounted JSON attachment.
- Fresh 11-conflict integration resolution passed full suite; PR #99 CI #661 + P12 Offline #16 PASS; squash merge `91c3feda1e8841f5b07ec189c5289c701ce199f5`.
- Post-merge CI #662, Integration Readiness #118 and P12 Offline #17 PASS; issue #6 closed completed.
- P5 = 100%; historical P0–P7 core = 95%; P12 = 40%. P6 is the next final-line runtime gate.

## 2026-09-10


### P12 Vitest dependency advisory remediation
- Audited the recurring `npm install` warning with retained run `34422011818`: full audit reported exactly two moderate dev-only findings, while `npm audit --omit=dev` reported zero production vulnerabilities.
- Both findings mapped to Vitest / `@vitest/mocker` advisory `GHSA-82fw-gwwq-j7x9`; retained pre-fix artifact `10131236873` has ZIP SHA-256 `4d7c7b7f7d0e4bc5798e5d56465071e0bcf6fc28e04878ab96a292f9ed0ed8c9`.
- Filed #96 and updated only the dev dependency `vitest` from `^3.2.0` to `^4.1.11`; did not use `npm audit fix --force`.
- One-shot compatibility run `34423555371` installed Vitest 4.1.11 and passed status verification, typecheck, all tests, plugin/CLI builds, release checks, Community template check, P12 offline acceptance and import byte-preservation; both full and production audit totals were zero.
- Retained clean-audit artifact `10131793673`, ZIP SHA-256 `c64dd7a76bc61c9980f3a254e50fa90deeb16fc7e19ba06de4c7fccb4e21aa91`.
- PR #97 passed CI #657 and P12 Offline #12 on Linux/macOS/Windows, was mergeable with zero reviews/threads, and squash-merged at `01f959ebc792823ee67aa386a65335aab564d667`, auto-closing #96.
- Post-merge CI #658, Integration Readiness #115 and P12 Offline #13 all passed. No product/runtime acceptance percentages changed.
### P6/P7 downstream integration rehearsals
- Built a retained current-main/P5 downstream conflict probe and fixed its evidence-retention harness before treating any output as valid.
- P6 canonical head `9a6ae3b` produced 10 post-P5 conflicts; deterministic resolution preserved current-main P9–P12/import/provenance safety, added only P6-specific runtime surfaces, and passed run `34421353122`.
- Retained P6 rehearsal artifact `10131008051`, ZIP SHA-256 `96a175e83970a168c5ea2f0af0df2f057e50937330200632e468c86b7be6c650`.
- P7 canonical head `cbfdb66` produced 15 post-P5 conflicts. The first integrated run exposed old unbound-P5-proof API assumptions; the rehearsal was migrated to the stronger current build-bound P5 proof contract rather than weakening it.
- Final P7 rehearsal run `34421353146` passed 66 test files / 323 tests plus status, typecheck, builds, CLI, release, Community and P12-offline checks; exact-build P7 receipt and release-surface gating were preserved.
- Retained P7 rehearsal artifact `10131008310`, ZIP SHA-256 `22a9473bead40053fb07e80aa0b00e1dd117c9bd0bbd94e395dd8afd57567982`.
- Both rehearsals are non-authorizing and leave P6 80%, P7 80%, P12 20%; genuine runtime evidence and fresh final-line artifacts remain mandatory.

### P12 P5 integration rehearsal and current-contract preflight
- Rehearsed canonical P5 `810d98d6e09cb4cf3fe4758fcb07e87734254a8e` against current main `3c3dc14bc48c3ea8e5df7620e223de0229737d9e` through a real branch-only three-way merge; exact conflict set was `11` paths and resolved to `0` unresolved entries.
- Latest repeat rehearsal run `34416999259` on head `536d4b0f3b07d1675ab5cf87b69a83dbce7d6ebc` passed `195/195` integrated tests plus status/typecheck/plugin build/CLI build/release-contract/release-package/Community/P12-offline/import-safety checks.
- Preserved P9 audit/backlog non-mutation, P5 runtime-gated Safe Fix seams, current-main source/output overlap protection, separate development/release UI exposure and P5 source/run provenance defines in release code.
- Retained latest rehearsal artifact `10129465465`, ZIP SHA-256 `faac0ca60f83c85931ccfd030f70d9672afbd03e55224a48631a2d5b029779b7`.
- Re-downloaded canonical P5 Actions artifact #488 and retained ZIP; current-contract `runtime:preflight` passed in run `34416999458`.
- Rehearsal evidence is explicitly non-authorizing; P5 remains 94%, P12 remains 20%, and real imported-Figma Desktop/rendered-pixel/closure-intake evidence is still required.

### Exact P5 operator preflight and closure rejection calibration
- Re-ran the mandatory issue-first/PR-first cycle from verified `main` `c3c1c7475395785e3db5ed753513a645e7dd42c7`; the product/runtime dependency chain remained #6/#7/#8 and there were no open PRs before the calibration.
- Downloaded the actual canonical P5 GitHub Actions artifact #488 (`figma-plugin-dist-488`, artifact id `10062772456`) and retained ZIP. Its raw SHA-256 matched the registered digest `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`.
- Reconstructed exact current-main `scripts/runtime-artifact-preflight.mjs` and `config/runtime-artifacts.json` bytes from GitHub and verified their Git blob SHAs (`8d2d459b310ed2426f353ea91687d2a6d1dd6e09` and `de517b340cf951896fa3e312b40d9ddb4e86f944`) before execution.
- Current-main final-closure preflight on canonical #488 + retained ZIP passed with exact BUILD_INFO source/workflow SHA + run identity, archive digest MATCH, `5/5` immutable file SHA-256 matches and schema-v3 id-excluded manifest semantic SHA-256 MATCH.
- Ran the helper packaged inside #488 to a sibling/non-nested prepared directory with a calibration numeric plugin ID. `code.js` and `ui.html` remained byte-identical; only top-level manifest `id` changed semantically, and the prepared copy passed the same current-main preflight with the same registered manifest semantic hash.
- The calibration numeric ID is not the actual Figma development-plugin ID and does not satisfy the required real Desktop import step.
- Reconstructed exact current-main `scripts/runtime-closure-intake.mjs` and verified Git blob SHA `52bb19fead394579e1e89f09141bfbc6900f5cc3` before execution.
- Exercised closure intake on both the canonical artifact and prepared sibling copy with intentionally invalid `{}` evidence. In both cases artifact/archive preflight passed, exact evidence bytes were accepted only as syntactically valid JSON, the immutable P5 verifier SHA remained `62568fdc30682830b0f6ab6b804385bcf8651cac62014aa370655f25ca75ca41`, execution used `verified-bytes-memory-bootstrap`, and the verifier correctly rejected absent runtime proof with exit `1`.
- Updated issue #6 so canonical current-main preflight and retained-ZIP digest verification are checked complete while all actual Figma import/runtime/rendered-pixel/real-evidence closure items remain open.
- Inspected the connected Figma capability: it can execute Plugin API JavaScript in a known design file, but does not establish importing/running this exact downloaded development-plugin artifact with its own manifest/menu/UI iframe. It therefore cannot substitute for P5 acceptance.
- Canonical P5/P6/P7 feature heads and registered artifact bytes were unchanged. P5 remains 94% and overall active product progress remains 93%.

## 2026-09-09

### Status synchronization and migration-safe schema contract
- Re-ran the mandatory issue-first/PR-first cycle; open product/runtime issues remained #6/#7/#8 and open PR/MR count was `0` before each tooling batch.
- Issue #60 / PR #61 synchronized runtime-registry schema state across README, PROJECT_STATE, ROADMAP and NEXT_ACTIONS and made `status:verify` derive the active schema version from `config/runtime-artifacts.json`.
- PR #61 head `d2dc43d` passed CI #606, squash-merged at `933b2fc2`, and post-merge CI #607 + Integration Readiness #82 passed.
- Issue #62 / PR #63 hardened the schema-status contract so mixed stale/current explicit registry schema references no longer pass by simple substring masking.
- PR #63 head `97c51b6` passed CI #609, squash-merged at `acef3c2c`, and post-merge CI #610 + Integration Readiness #84 passed.
- Follow-up migration review found whole-document stale-schema rejection would wrongly block future schema migrations whenever legitimate historical prose retained older schema references.
- Issue #64 / PR #72 replaced whole-document rejection with path-specific current-status anchors: current anchors must match the active registry schema, while historical older-schema prose remains valid.
- PR #72 head `52ea254` passed CI #611 with no review/thread blockers, squash-merged at `ed8b6b26`, and post-merge CI #612 + Integration Readiness #85 passed.
- Issues #60, #62 and #64 are completed/closed. Canonical P5/P6/P7 feature heads and registered runtime artifact bytes were unchanged throughout these tooling batches.
- Real imported-Figma P5 acceptance did not advance, so overall active project progress remains 93% and P6/P7 final integration/closure remain dependency-blocked on P5 merge.

### Manifest semantic provenance pinning
- Re-ran the mandatory issue-first/PR-first cycle: product/runtime issues were #6/#7/#8 and open PR/MR count was `0` before the new provenance defect was filed.
- Audited the manifest exception in `runtime:preflight`: raw `manifest.json` bytes were intentionally not pinned so local Figma plugin-ID rebinding could remain supported, but selected-field validation still allowed unrelated non-ID semantic drift to pass.
- Filed focused issue #58 and defined a fail-closed semantic pin that removes only the top-level plugin `id`, recursively sorts object keys, preserves array order/content, serializes deterministic compact JSON and hashes those semantics with SHA-256.
- Upgraded `config/runtime-artifacts.json` to schema v3 with canonical id-excluded manifest semantic SHA-256 values: P5 #488 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`, P6 #494 `b687205564abb72ac7b00447d2bec3e00c266a1d4ddf9ec6980ce15c62c893f9`, P7 #490 `3cb617c2d47d8b3d887ca94897781998226f9ec6c1b242bc880a2e18d9f6587e`.
- Schema-v3 preflight now fails closed when a required manifest semantic pin is missing/invalid or any semantic content other than top-level plugin `id` changes. JSON formatting/object-key-order differences and placeholder/numeric ID-only rebinding remain accepted.
- Existing field-specific manifest checks remain as defense-in-depth for main/UI targets, required developer commands, offline network policy and plugin-ID shape.
- Added focused regressions proving canonical schema-v3 PASS, numeric ID-only rebind PASS with the same semantic hash, non-ID manifest drift FAIL, and missing schema-v3 semantic pin FAIL.
- PR #59 head `8246e3f` passed CI #600 with no review/thread blockers and was mergeable.
- PR #59 squash-merged to `main` at `8f0d5bbd`; post-merge CI #601 and Integration Readiness #77 passed.
- README, `memory-bank/NEXT_ACTIONS.md`, `docs/RUNTIME_ARTIFACT_PREFLIGHT.md` and issue #6 were synchronized to require schema-v3 manifest semantic MATCH in the P5 operator/closure path and in future fresh P6/P7 artifact registration.
- Canonical P5/P6/P7 feature heads and registered artifact bytes were not changed; real imported-Figma acceptance did not advance, so overall project progress remains 93%.

### Figma local-import sibling-output operator fix
- Continued the mandatory issue-first/PR-first cycle after the canonical artifact byte audit; product/runtime issues remained #6/#7/#8 and open PR/MR count was `0` before the new defect was filed.
- Exact canonical P5 #488 calibration exposed an actionable operator-path defect: the documented `node prepare-figma-import.mjs <id> . dist-local` command asks the packaged helper to recursively copy the source artifact into its own child and fails before producing a prepared import.
- Verified the current `main` helper already has an explicit source/output overlap guard, so future builds intentionally reject nested output as unsafe rather than recursing.
- Filed focused issue #54 and verified the safe canonical #488 workaround uses a sibling/non-nested output: `node prepare-figma-import.mjs <id> . ../figma-plugin-dist-488-local`.
- Canonical #488 sibling-output calibration preserved compiled bytes exactly: `code.js` SHA-256 `f6d772772268da119c5e5e4485a96539bb27db6102c63420bea78c31aa23692a` and `ui.html` SHA-256 `81d6f35562254a72e84ee3a815e24d6f6e68f325a62e2de34ad5e2e9efc1f8c0`; the prepared manifest changed only plugin `id` and the original artifact remained unchanged.
- PR #57 adds direct regression coverage proving current helper nested-output rejection and sibling-output success with byte-identical compiled targets, source manifest preservation and manifest-ID-only rebinding.
- PR #57 corrected `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md`, `docs/RUNTIME_ARTIFACT_PREFLIGHT.md` and `docs/RUNTIME_CLOSURE_INTAKE.md` to require separate non-nested local import output directories.
- Issue #6 runtime tracker was synchronized to the verified canonical sibling-output command before merge.
- PR #57 head `6852ac6` passed CI #595 with no review/thread blockers.
- PR #57 squash-merged to `main` at `5179eca3`; post-merge CI #596 and Integration Readiness #73 passed.
- README and `memory-bank/NEXT_ACTIONS.md` were synchronized after merge with the same sibling-output rule and the canonical #488 calibration details.
- Canonical P5/P6/P7 feature heads and registered artifact bytes were not changed; real imported-Figma acceptance did not advance, so overall project progress remains 93%.

### Canonical Actions artifact byte/package audit
- Re-ran the mandatory issue-first/PR-first cycle: open issues remain #6/#7/#8 and open PR/MR count was `0` before the audit.
- Downloaded the exact canonical GitHub Actions ZIPs rather than relying only on registry/API metadata: P5 artifact id `10062772456` / run id `34242984963`, P6 artifact id `10063239506` / run id `34244113623`, and P7 artifact id `10062907870` / exact run id `34243303097` for CI run #490.
- Independently computed raw ZIP SHA-256 and confirmed three-way equality with GitHub artifact metadata and `config/runtime-artifacts.json`: P5 `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`, P6 `82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3`, P7 `c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43`.
- Independently extracted all three ZIPs and confirmed top-level packaged entries are regular files, with no symlinked packaged runtime/helper/verifier entries.
- Verified exact BUILD_INFO source/workflow SHA, Actions run ID and run number for all three canonical artifacts.
- Recomputed every immutable registry pin from the downloaded packages and confirmed `5/5` matches on P5, P6 and P7 for BUILD_INFO, compiled code, UI, packaged import helper and same-artifact verifier.
- Verified manifest semantics independently: `main=code.js`, `ui=ui.html`, required developer commands present, `allowedDomains=["none"]`, and placeholder plugin id `000000000000000000` retained as expected before local rebind.
- No new provenance defect was found; no product/runtime acceptance state advanced, canonical P5/P6/P7 feature heads/artifact bytes were not modified, open PR/MR remains `0`, and overall project progress remains 93%.

### Closure intake archive digest binding
- Re-ran the mandatory issue-first/PR-first cycle: open issues remain #6/#7/#8 and open PR/MR count was `0` before development.
- Confirmed PR #52 made the registered Actions ZIP digest operationally verifiable in `runtime:preflight`, but the one-command `runtime:closure-intake` flow did not expose or forward that optional archive gate.
- PR #53 adds optional `archivePath` / `--archive=/path/to/artifact.zip` support to closure intake and forwards it into the existing final-closure preflight before evidence intake or verifier preparation.
- A supplied retained ZIP therefore must satisfy the same regular non-symlink, stable `dev`/`ino`/size/mtime/ctime descriptor identity and exact raw SHA-256 registry digest equality already enforced by preflight.
- Archive verification remains optional so operators retaining only the extracted artifact continue to use descriptor-pinned BUILD_INFO/manifest/immutable-file verification without a new mandatory file requirement.
- Human closure output now surfaces archive digest MATCH/MISMATCH when an archive is supplied.
- Added isolated regressions proving a matching archive reaches verifier PASS and a mismatching archive fails at preflight with verifier execution suppressed.
- Refreshed `docs/RUNTIME_CLOSURE_INTAKE.md` so the current descriptor-pinned artifact/evidence gates, optional raw ZIP digest binding and verified-byte in-memory verifier execution are documented together.
- PR #53 head `b813db3` passed CI #587 with no review/thread blockers.
- PR #53 squash-merged to `main` at `6ffda876`; post-merge CI #588 and Integration Readiness #66 passed.
- Open PR/MR count returned to `0`; overall project progress remains 93% because no real imported-Figma acceptance gate advanced and canonical P5/P6/P7 exact-build feature heads/artifact bytes were not modified.

### Runtime artifact archive digest verification
- Re-ran the mandatory issue-first/PR-first cycle: open issues remain #6/#7/#8 and open PR/MR count was `0` before development.
- Concurrent repository work had already completed PR #51 verifier-execution pinning, so duplicate work was skipped and the next unaddressed provenance gap was audited instead.
- Confirmed `config/runtime-artifacts.json` records a GitHub Actions artifact `digest` for P5/P6/P7, while existing runtime preflight enforced extracted-file hashes but did not directly verify the original downloaded ZIP bytes.
- PR #52 adds optional `--archive=/path/to/artifact.zip` support to `runtime:preflight` so a retained original archive can be bound to the registry digest without making ZIP retention mandatory for normal extracted-artifact workflows.
- Supplied archives must be regular non-symlink files, preserve matching `dev`/`ino`/size/mtime/ctime identity between validation and descriptor open, and are hashed from the exact bytes read through that descriptor.
- A supplied archive fails closed on missing/non-regular/symlink paths, validation/open replacement, invalid registered digest, or raw SHA-256 mismatch.
- Added regressions for a matching registered archive digest, a wrong digest, and archive replacement between path validation and descriptor open.
- Updated `docs/RUNTIME_ARTIFACT_PREFLIGHT.md` with the optional archive verification workflow and the distinction between raw ZIP digest verification and extracted immutable-file pinning.
- PR #52 head `1bf182f` passed CI #582 with no review/thread blockers.
- PR #52 squash-merged to `main` at `5b75ff2e`; post-merge CI #583 and Integration Readiness #62 passed.
- Open PR/MR count returned to `0`; overall project progress remains 93% because no real imported-Figma acceptance gate advanced and canonical P5/P6/P7 exact-build feature heads/artifact bytes were not modified.

### Same-artifact verifier execution hardening
- Re-ran the mandatory issue-first/PR-first cycle: open issues remain #6/#7/#8 and open PR/MR count was `0` before the new hardening work.
- Identified the remaining closure-intake execution TOCTOU boundary: immutable verifier bytes were accepted by preflight, but `runtime:closure-intake` later spawned the verifier again by its mutable artifact filesystem path.
- Inspected the exact P5 #488, P6 #494 and P7 #490 artifact verifiers before implementation and confirmed all three current verifier scripts are self-contained bundled `.mjs` files with no relative imports or `require()` dependency.
- PR #51 re-opens the same-artifact verifier after final-closure preflight through a stable descriptor, requires matching `dev`/`ino`/size/mtime/ctime`, hashes the exact bytes read from that descriptor and requires the SHA-256 to equal the immutable verifier hash already accepted by preflight.
- Only those re-verified bytes are copied to a private temporary file; a direct Node bootstrap independently re-hashes that temporary source and imports the exact bytes as an in-memory `data:` module before verifier logic can run.
- The original artifact verifier path is no longer used as the executable module path after verification; evidence stdin, artifact cwd, timeout/output bounds and no-shell execution semantics remain preserved.
- Added a regression proving verifier replacement between post-preflight validation and descriptor open fails closed with verifier execution suppressed.
- Added a regression proving replacement of the original artifact verifier path at the exact spawn boundary cannot alter executed verifier bytes; the original verified logic still runs and the tampered artifact path is ignored for execution.
- PR #51 head `bf7ba3c` passed CI #577 with no review/thread blockers.
- PR #51 squash-merged to `main` at `15f3f023`; post-merge main CI #578 and Integration Readiness #58 passed.
- Open PR/MR count returned to `0`; canonical P5/P6/P7 exact-build feature heads and registered runtime artifact bytes were not modified.

### Runtime artifact stable-descriptor hardening
- Re-ran the mandatory issue-first/PR-first cycle: open issues remain #6/#7/#8 and there were no open PRs before the new hardening work.
- Identified a matching TOCTOU gap in `runtime:preflight`: required artifact files were validated with `lstatSync()` but BUILD_INFO, manifest and immutable hash reads later reopened those paths.
- PR #49 pins every required artifact file to one opened file descriptor, compares pre-open/opened identity before consuming bytes, and evaluates BUILD_INFO, manifest semantics and immutable SHA-256 from that same pinned byte snapshot.
- Added an atomic `code.js` replacement regression proving path replacement between validation and open fails closed.
- PR #49 head `dfdec23` passed CI #570 with no review/thread blockers.
- PR #49 squash-merged to `main` at `7cc8a85`; post-merge main CI #571 and Integration Readiness #53 passed.
- Follow-up consistency review caught that PR #49 initially used only `dev` + `ino`, even though PR #48 had already demonstrated immediate inode reuse can make that identity insufficient.
- PR #50 strengthens artifact-file identity to matching `dev`, `ino`, size, mtime and ctime and adds a regression that deliberately reuses `dev`/`ino` after replacing `code.js`.
- PR #50 head `2160b6e` passed CI #572 with no review/thread blockers.
- PR #50 squash-merged to `main` at `c99b2c65`; post-merge main CI #573 and Integration Readiness #54 passed.
- Open PR/MR count returned to `0`; canonical P5/P6/P7 exact-build feature heads and registered runtime artifact bytes were not modified.

### Closure evidence stable-descriptor hardening
- Continued the mandatory issue-first/PR-first cycle: open issues remain #6/#7/#8 and there were no open PRs before this hardening batch.
- Identified a TOCTOU gap in `runtime:closure-intake`: evidence was validated with `lstatSync()` but then reopened by path for reading, allowing replacement between validation and read.
- PR #48 now opens the evidence once, compares pre-open and opened file identity metadata, reads exact bytes from that pinned descriptor, and only then hashes/decodes/verifies them.
- File identity comparison now includes `dev`, `ino`, size, mtime and ctime so inode reuse or same-path replacement fails closed.
- Added an injected race regression that replaces the evidence path exactly between validation and descriptor open and requires verifier suppression.
- Initial CI #564 correctly failed because `dev` + `ino` alone did not reliably detect immediate inode reuse in the test environment.
- Strengthened identity matching with size/mtime/ctime; final PR #48 head `d9aa202` passed CI #565 with no review/thread blockers.
- PR #48 squash-merged to `main` at `c97b9d7`.
- Post-merge main CI #566 and Integration Readiness #49 passed.
- Open PR/MR count returned to `0`; canonical P5/P6/P7 exact-build feature heads and registered runtime artifact bytes were not modified.

### Runtime artifact symlink hardening
- Continued the mandatory issue-first/PR-first cycle with open issues still #6/#7/#8 and no actionable product issue unblocked by real runtime evidence.
- Identified that runtime artifact preflight followed symbolic links for required packaged files.
- PR #46 switched required artifact-file inspection to `lstatSync()` and now fails closed when `BUILD_INFO.txt`, `manifest.json`, `code.js`, `ui.html`, `prepare-figma-import.mjs`, or the same-artifact verifier is a symbolic link.
- Added regression coverage proving a symlinked compiled runtime file is rejected before immutable-hash acceptance.
- Removed duplicate required-file diagnostics while preserving fail-closed behavior.
- PR #46 head `7fa579e` passed CI #557 with no review/thread blockers.
- PR #46 squash-merged to `main` at `15cc973`.
- Post-merge main CI #558 and Integration Readiness #44 passed.
- Identified the remaining matching provenance gap: the supplied artifact root directory itself could still be a symbolic link.
- PR #47 switched artifact-root inspection to `lstatSync()` and now rejects a symbolic-link artifact directory before required-file/identity/hash/manifest checks.
- Added regression coverage proving a symlinked artifact root fails closed.
- PR #47 head `6a90c11` passed CI #559 with no review/thread blockers.
- PR #47 squash-merged to `main` at `8297b69`.
- Post-merge main CI #560 and Integration Readiness #45 passed.
- Open PR/MR count returned to `0`; canonical P5/P6/P7 exact-build feature heads and registered runtime artifact bytes were not modified.

### Closure evidence symlink hardening
- Re-ran the mandatory issue-first/PR-first cycle: open issues remain #6/#7/#8 and there were no open PRs before the new hardening batch.
- Identified a provenance-boundary gap in `runtime:closure-intake`: `statSync()` followed operator-supplied evidence symlinks.
- Switched evidence-path metadata inspection to `lstatSync()` and fail closed when the supplied closure evidence path is a symbolic link.
- Added regression coverage proving symbolic-link evidence is rejected before evidence read/hash/verifier execution.
- Kept the change main-side only; canonical P5/P6/P7 exact-build feature heads and registered runtime artifact bytes were not modified.
- PR #45 head `f2233fb` passed CI #551 with no review/thread blockers.
- PR #45 squash-merged to `main` at `8444698`.
- Post-merge main CI #552 passed status verification, typecheck, tests, build and local-import safety.
- Post-merge Integration Readiness #40 passed.
- Open PR/MR count returned to `0` after merge.

### Runtime closure intake
- Performed the mandatory issue-first sweep: open issues remain #6/#7/#8; no new actionable issue was found.
- Confirmed open PR/MR count was `0` before development began.
- Added `scripts/runtime-closure-intake.mjs` and `npm run runtime:closure-intake`.
- Closure intake requires final-closure artifact preflight PASS before verifier execution.
- Evidence intake requires a regular non-empty JSON file with a top-level object and a default 5 MiB size bound.
- Evidence SHA-256 is recorded for operator traceability.
- The verifier is the exact hash-pinned verifier inside the registered artifact and is launched directly through Node without shell interpolation.
- Preflight failure, reference-only closure eligibility, malformed/oversized evidence, verifier execution error, signal or non-zero exit all fail closed.
- Added regression tests proving verifier suppression on preflight/evidence failure and PASS/non-zero verifier behavior.
- Added `docs/RUNTIME_CLOSURE_INTAKE.md`.
- PR #43 first implementation head `07bc91e` passed CI #535.
- Final PR #43 head `2ea96d2` passed CI #540 and Integration Readiness #30 with no review/thread blockers.
- PR #43 squash-merged to `main` at `7d9f22b`.
- Post-merge main CI #541 and Integration Readiness #31 both passed.
- Open PR/MR count returned to `0` after merge.
- Issue #6 tracker was synchronized to require `runtime:closure-intake` after real Figma evidence export.
- Canonical P5/P6/P7 feature heads were not modified.

### Immutable runtime artifact hash pinning
- Recorded previously missing PR #42 state in the canonical changelog.
- Upgraded `config/runtime-artifacts.json` to schema v2 with immutable per-file SHA-256 pins.
- Pinned `BUILD_INFO.txt`, `code.js`, `ui.html`, packaged `prepare-figma-import.mjs` and each track's same-artifact verifier.
- Intentionally left `manifest.json` outside byte-hash pinning so the supported plugin-ID-only local rebind remains possible while manifest semantics are still validated.
- Added fail-closed tests for compiled runtime and verifier tampering plus allowed manifest plugin-ID rebinding.
- PR #42 final head `e9c718c` passed CI #529 with no review/thread blockers.
- PR #42 squash-merged to `main` at `92a4440`.
- Post-merge CI #530 and Integration Readiness #22 passed.
- Final synchronized pre-batch main checkpoint `659efc6` passed CI #534 and Integration Readiness #26.

## 2026-09-08

### Runtime artifact preflight + issue tracker correction
- Performed the mandated issue-first sweep: open issues remain #6/#7/#8; no new actionable defect issue appeared.
- Corrected #7 and #8 tracker bodies so current P6 #494 / P7 #490 artifacts are explicitly reference-only and final closure requires fresh post-P5 integration builds.
- Confirmed open PR/MR count was `0` before starting new implementation.
- Inspected the actual canonical artifact packages for P5 #488, P6 #494 and P7 #490, including `BUILD_INFO.txt`, manifest commands, packaged import helper and verifier names.
- Added `config/runtime-artifacts.json` as repository-side operational registry for exact source SHA, run ID/number, artifact name/digest, verifier and final-closure eligibility.
- Added `scripts/runtime-artifact-preflight.mjs` and `npm run runtime:preflight`.
- Preflight validates build identity, required files, manifest targets, required developer commands, offline-only network policy and plugin-ID rebinding state.
- P5 #488 passes final-closure preflight; current P6 #494 and P7 #490 fail closed for final-closure intent and pass only as reference inspections with warnings.
- Added regression tests for P5 PASS, P6 final-closure rejection, P6 reference-mode PASS, build-identity mismatch rejection and missing-menu-command rejection.
- Added `docs/RUNTIME_ARTIFACT_PREFLIGHT.md` operator guide.
- PR #41 first implementation head passed CI #517.
- Final PR #41 head `69fd91b` passed CI #522 and Integration Readiness #16 with no review/thread blockers.
- PR #41 squash-merged to `main` at `4b4a3be`.
- Post-merge main CI #523 and Integration Readiness #17 both passed; open PR/MR count returned to `0`.

### AI-native lifecycle + canonical state synchronization
- Added mandatory engineering order: Issues first, PR/MR second, new development third.
- Added explicit rule that actionable issues are fixed before unrelated work while real external/runtime gates may not be fabricated or prematurely closed.
- Added PR/MR gate covering CI, mergeability, conflicts and unresolved review feedback before new development begins.
- Added mandatory end-of-work README synchronization with module-wise percentage, 10-cell progress bar, blocker/next work and overall progress.
- Added decision D-012 documenting the durable lifecycle policy.
- Replaced stale P4-era `PROJECT_STATE.md`, `NEXT_ACTIONS.md` and `ROADMAP.md` with current P5/P6/P7 engineering/runtime/integration state.
- Recorded current canonical P5/P6/P7 heads, artifacts, open issues #6/#7/#8, integration dependencies and the real-Figma closure order.
- Deferred P8 remains outside the active delivery percentage rather than being represented as unfinished active work.

### P4 candidate transaction + rollback
- Merged P3 validator through PR #12 and closed issue #4.
- Created `feat/p4-transaction-engine` and draft PR #13.
- Added explicit transaction states and serializable event journal.
- Added candidate handle + adapter boundary so transformers never receive the approved original root.
- Added deterministic `clone -> transform candidate -> validate -> commit/swap OR discard` state machine.
- Added discard behavior for transform failures, validator crashes and rejected validation reports.
- Added explicit cleanup-failure and commit-stage failure handling.
- Added small commit evidence and opaque undo-token contract; no large node/PNG snapshots are stored in transaction metadata.
- Added concrete Figma transaction adapter with top-level off-layout candidate staging, stale-parent/transaction guards and root-boundary commit.
- Added hidden bounded original backup and `restoreLastCommit()` through a compact clientStorage checkpoint.
- Fixed adapter null-safety after CI caught nullable parent accesses.
- Applied Auto Layout child properties only after candidate insertion into the destination parent.
- Ran live isolated forced-failure calibration in the connected Figma file: original root/index/geometry/content remained unchanged, failed candidate was removed and cleanup left 0 temporary nodes.
- Ran live manual-parent swap + undo calibration: original restored exactly, candidate/backup removed, 0 temporary nodes remained.
- Ran live vertical Auto Layout parent swap + undo calibration: sibling order, layoutAlign/layoutGrow/layoutPositioning and resolved root geometry were preserved and restored; 0 temporary nodes remained.

### P3 validator foundation + pixel layer
- Merged P2 classifier semantics through PR #11 and closed issue #3.
- Created `feat/p3-validator` and draft PR #12.
- Added versioned P3 integrity snapshot/result types.
- Added deterministic text-content fingerprints and image-fill integrity fingerprints.
- Added section-relative text/image anchor geometry and duplicate matching independent of Figma node IDs.
- Allowed wrapper/node-count changes when visible invariants remain equivalent.
- Added explicit failures for root, text, image and invalid snapshot drift.
- Added section-level PNG export using Figma `exportAsync()` with a 2048 px longest-edge cap.
- Added plugin-UI Canvas/ImageData decoding and deterministic RGBA pixel comparison.
- Added pixel failure reasons for dimension mismatch and excessive visual drift.
- Added `p3-v1` pixel thresholds: channel tolerance 8/255, changed pixels <=0.5%, mean channel delta <=0.5.
- Added pixel regression tests for exact no-op, tolerated deltas, changed pixels, dimension mismatch, malformed buffers and threshold failures.
- Ran live read-only no-op export calibration on Marcus About, Journey and Contact; repeated PNG exports were byte-identical for all three sections.
- PR #12 merged to `main`; issue #4 closed.

### P2 semantic hardening
- Completed representative read-only semantic review across the five-template calibration set.
- Confirmed positive semantics for Marcus/Doctor/Lawyer Journey, Marcus About facts, and Marcus/Doctor/Legacy contact-channel rows.
- Found and fixed a Doctor About false footer-columns classification by requiring footer/contact rows to remain shallow relative to section height.
- Found and fixed a Lawyer Biography Opening false facts-list classification by requiring repeated container items with text, broad-width and height-consistency evidence.
- Found and fixed Legacy Numbers/Media false timeline semantics by requiring at least five repeated vertical-stack items before timeline inference.
- Added regression fixtures for tall lower card rows, loose text/divider pseudo-lists and four-item non-timeline stacks.
- Confirmed the hardened rules preserve real positive cases after the fixes.
- PR #11 merged to `main`; issue #3 closed.

## 2026-09-07

### Foundation
- Established AI-native development approach with mandatory memory-bank.
- Completed repository/product/technical audit.
- Defined deterministic, AI-free runtime direction.
- Defined Elementor-readiness rules and neutral-schema architecture.
- Added TypeScript/Figma plugin Audit-Only scaffold, tests and CI.
- PR #1 merged to `main` after green CI.
- Created roadmap issues #2–#9.

### P1 Audit-Only engine
- Implemented selected-frame scanner, section discovery, readiness stats, scoring and report UI.
- Implemented deterministic two-column, grid, horizontal row, vertical stack and carousel-track detection.
- Added confidence/evidence payloads and conservative full-size background exclusion.
- Added multi-target pattern reporting.
- Added fragmented-grid detection for unwrapped visual cells.
- Removed Journey tiny-child two-column false positive.
- Calibrated PASS/REVIEW/NEEDS_WORK thresholds and PASS recipe suppression.
- Confirmed Numbers fragmented 2×3 grid and Media clipped carousel behavior on live Figma.
- PR #10 merged to `main`; issue #2 closed.

### Five-template calibration
- Completed broad read-only calibration on Marcus, Doctor, Esthetic, Lawyer and Legacy mixed desktops.
- Doctor (88% root Auto Layout) returned 19/19 PASS.
- Esthetic (~1% root Auto Layout) returned 19/19 NEEDS_WORK.
- Lawyer (~0% root Auto Layout) returned 18/18 NEEDS_WORK.
- Legacy mixed (64% root Auto Layout) returned 9 PASS, 6 REVIEW, 3 NEEDS_WORK.
- Confirmed section-level scoring works across highly structured, manual and mixed files.

### P2 classifier semantics
- Added same-target specificity ranking so specific patterns suppress redundant generic interpretations.
- Added semantic hints without replacing underlying geometry: repeated-cards, split-header, facts-list, footer-columns, timeline-chapter and carousel-viewport.
- Added special preservation roles: background-layer, absolute-overlay, decorative-overlay.
- Updated Audit UI to show semantic hints and role evidence.
- Added ranking, semantic and role tests including adversarial overlap coverage.
- Added top-level-context guard for split-header inference.
- Added manual full-width sequential text-rich chapter-stack fallback for timeline semantics.
- Hardened background-role inference so normal Auto Layout wrappers are not treated as backgrounds.

### Safety status
- General Safe Fix remains disabled until P4 is merged and each P5 recipe proves its own confidence + validation path.


## 2026-09-10 — P6 fresh final-line artifact registered and current-main preflight PASS

- Corrected the user-facing product name to **WP Builders Prepare** via PR #103; technical repo/npm slug remains `wp-elementor-prep`.
- Resolved canonical P6 `9a6ae3b29e2f70ebbd987a686856c2957f590b75` onto corrected post-P5 main and produced final-line source `ae691fac3c65dcdaf472392e6895fd402ae8fa3c`.
- Rebuilt after rejecting an earlier metadata-incomplete candidate; authoritative run `34472374285` produced `figma-plugin-dist-p6-final-v2-1`.
- Artifact ZIP SHA-256: `4d96a313c93865029737f6ce0f05c09dda9c38a15a0d2594e2428bf360fe26c0`; manifest semantic SHA-256: `cc4bcdd36099dbe578d4a640ae1ce1c143a4f8ce3bc1fb54c5672cf46dec3ba0`.
- Full final-line verification PASS: 48 test files / 259 tests, typecheck, plugin/CLI builds, release contract/package, Community verification, P12 offline and import-rebind integrity.
- PR #104 registered the fresh P6 artifact as `finalClosureEligible: true` on main `47b983bd45923f96486964453423de1800e89fd6`.
- Exact current-main archive-bound `runtime:preflight -- p6 ... --intent=final-closure` PASS: archive digest MATCH, immutable files 5/5 MATCH, manifest semantics MATCH.
- No P6/P12 acceptance percentage was added. Next authority gate remains genuine Figma Desktop image-bearing positive calibration + preservation refusal, unedited `p6-closure.json`, then current-main closure intake.

## 2026-09-10 — P6 production acceptance and merge

- Genuine Figma P6 closure accepted on exact build `ae691fac3c65dcdaf472392e6895fd402ae8fa3c` / run `34472374285` using the retained final artifact `figma-plugin-dist-p6-final-v2-1`.
- Positive real-image page-flow calibration passed Full P3 at 98% classifier confidence with image anchors `6 → 6`, zero text/image positional drift, candidate discard, zero leftover risk and no production commit attempt.
- Preservation-sensitive refusal evidence passed on the same exact P5 prerequisite/build.
- Untouched schema-v2 closure evidence raw SHA-256: `ab5f52fce30637b83d3dcf213a591c66d6bd24535cc27a81d57f7bf6ce9cdcc7`.
- Exact-current-main closure-intake run `34495685047` passed retained ZIP digest, immutable files `5/5`, manifest semantics, raw evidence hash and same-artifact verifier execution (`accepted: true`, failures empty).
- PR #106 passed CI #674 + P12 Offline #29 and merged as `dfbed556f0a6de564ca5c9afb395b7b2dd62abc8`; issue #7 closed completed.
- P6 is now `100% / PRODUCTION ACCEPTED`; historical P0–P7 core becomes `98%` (780/800 rounded); P12 retained final-validation evidence becomes `60%`. P7 is the next core runtime closure path.
