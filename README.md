# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** after every meaningful verified work batch, this README must be synchronized with issue/PR state, module-wise progress, blockers and next actions.

**Open PR/MR:** `0`

### Module-wise progress

| Module | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---:|---|---|
| AI-native governance + repo tooling | ✅ COMPLETE | 100% | `██████████` | Keep Issues → PR/MR → development lifecycle, status verification and artifact registry synchronized |
| P0–P4 core audit/validation/transaction | ✅ COMPLETE | 100% | `██████████` | None |
| P5 Conservative Safe Fix | 🟡 RUNTIME ACCEPTANCE | 94% | `█████████░` | Hash-pinned #488 → real imported-Figma proof → descriptor-pinned, optional ZIP-bound, verified-byte closure intake PASS → merge #6 |
| P6 Advanced structures | 🟠 INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P6 conflicts → fresh registered artifact → real closure #7 |
| P7 60+ Frame batch queue | 🟠 INTEGRATION BLOCKED | 80% | `████████░░` | P5 merge → resolve P7 conflicts → fresh registered artifact → stress/cancel closure #8 |
| P8 Elementor exporter adapters | ⏸ DEFERRED | N/A | `──────────` | Re-evaluate after normalization line is stable |

**Overall active project progress:** `█████████░ 93%`

> Overall progress covers the active P0–P7 delivery line plus governance/tooling. Deferred P8 is not counted as an active unfinished blocker. Percentages represent verified scope, not optimistic completion claims.

### Mandatory AI-native work order

Every work cycle must execute in this order:

1. **Issues first** — list all open issues, solve actionable code/docs/test issues, identify dependency/manual-runtime blockers, and never fabricate evidence to close a blocked issue.
2. **PR/MR second** — inspect all open Pull Requests / Merge Requests for CI, conflicts, mergeability and review feedback; fix and merge eligible work.
3. **Development third** — only then begin the highest-priority unblocked roadmap work, using safe parallel workstreams where useful.
4. **End-of-work sync** — run verification, update memory-bank files, and update this module-wise + overall progress before declaring the batch complete.

Canonical policy: `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, and `memory-bank/DECISIONS.md` D-012.

## Latest verified checkpoint — 2026-09-09

- ✅ issue-first sweep confirmed open issues remain exactly #6, #7 and #8; no new actionable product/code defect issue was found.
- ✅ open PR/MR count returned to `0` after the latest hardening merge.
- ✅ issue #6 remains blocked only on real imported-Figma runtime evidence; #7/#8 remain dependency-blocked on P5 merge.
- ✅ PR #42 upgraded the artifact registry/preflight with immutable SHA-256 file pins and merged to `main` at `92a4440`.
- ✅ PR #43 added `runtime:closure-intake`, combining final-closure preflight, bounded evidence intake, evidence SHA-256 traceability and the exact hash-pinned same-artifact verifier; it merged at `7d9f22b`.
- ✅ PR #44 hardened closure evidence traceability so SHA-256 is computed from the **exact raw file bytes**, not decoded text.
- ✅ PR #45 made operator evidence paths non-symlink and merged at `8444698`; post-merge CI #552 + Integration Readiness #40 passed.
- ✅ PR #46 made all required runtime artifact files non-symlink and merged at `15cc973`; post-merge CI #558 + Integration Readiness #44 passed.
- ✅ PR #47 made the supplied artifact root directory non-symlink and merged at `8297b69`; post-merge CI #560 + Integration Readiness #45 passed.
- ✅ PR #48 closes the evidence-path TOCTOU window by opening evidence once, comparing pre-open/opened `dev`/`ino`/size/mtime/ctime identity, and hashing/decoding the exact bytes from that pinned file descriptor.
- ✅ PR #48 initial CI #564 intentionally exposed that `dev` + `ino` alone were insufficient under inode reuse; the final metadata-strengthened head `d9aa202` passed CI #565 with no review/thread blockers.
- ✅ PR #48 squash-merged to `main` at `c97b9d7`; post-merge CI #566 + Integration Readiness #49 passed.
- ✅ PR #49 closes the matching artifact-file TOCTOU window: every required file is opened once and BUILD_INFO parsing, manifest parsing and immutable SHA-256 checks consume descriptor-pinned bytes from the validated file identity.
- ✅ PR #49 head `dfdec23` passed CI #570 with no review/thread blockers; squash-merged at `7cc8a85`; post-merge CI #571 + Integration Readiness #53 passed.
- ✅ PR #50 strengthens artifact-file identity to `dev`/`ino`/size/mtime/ctime and includes an inode-reuse regression where `dev`/`ino` are deliberately reused after path replacement.
- ✅ PR #50 head `2160b6e` passed CI #572 with no review/thread blockers; squash-merged at `c99b2c65`; post-merge CI #573 + Integration Readiness #54 passed.
- ✅ PR #51 closes the remaining verifier-execution path race: closure intake re-reads the verifier through a stable descriptor, requires the same immutable SHA-256 observed by preflight, and executes those exact bytes through a hash-checking in-memory Node module bootstrap instead of spawning the mutable artifact path.
- ✅ canonical P5 #488, P6 #494 and P7 #490 verifier artifacts were inspected before PR #51; all three current verifier scripts are self-contained bundled `.mjs` files with no relative imports/`require()` dependency.
- ✅ PR #51 head `bf7ba3c` passed CI #577 with no review/thread blockers; squash-merged at `15f3f023`; post-merge CI #578 + Integration Readiness #58 passed.
- ✅ PR #52 makes each registry Actions artifact digest directly verifiable when the original ZIP is retained: `runtime:preflight -- --archive=<zip>` hashes raw archive bytes from a stable descriptor and requires exact registered digest equality.
- ✅ PR #52 head `1bf182f` passed CI #582 with no review/thread blockers; squash-merged at `5b75ff2e`; post-merge CI #583 + Integration Readiness #62 passed.
- ✅ PR #53 binds the same optional retained-ZIP digest gate into `runtime:closure-intake`; a supplied archive now passes through final-closure preflight before evidence intake or verifier logic can run.
- ✅ PR #53 regressions prove a matching archive reaches verifier PASS while a mismatching archive fails at preflight with verifier execution suppressed.
- ✅ PR #53 head `b813db3` passed CI #587 with no review/thread blockers; squash-merged at `6ffda876`; post-merge CI #588 + Integration Readiness #66 passed.
- ✅ archive verification remains optional; extracted-artifact-only workflows still enforce stable descriptor identity, BUILD_INFO/manifest checks and all immutable per-file SHA-256 pins.
- ✅ canonical P5/P6/P7 feature heads and registered runtime artifact bytes remained unchanged by these tooling batches.

## Phase status

| Phase | Scope | Current status |
|---|---|---|
| P0–P4 | Core audit, validation, transaction/rollback | ✅ Complete |
| P5 | Conservative Safe Fix recipes | 🟡 Engineering/exact-build/offline verification + descriptor-pinned hash-pinned artifact preflight + optional raw archive digest verification + descriptor-pinned evidence + verified-byte verifier execution complete; imported-Figma acceptance pending (#6) |
| P6 | Advanced clone-only calibration | 🟠 Engineering complete on reference head; post-P5 integration + fresh exact-build real-Figma closure pending (#7) |
| P7 | Sequential 60+ Frame batch queue | 🟠 Engineering complete on reference head; post-P5 integration + fresh exact-build stress/cancellation closure pending (#8) |
| P8 | Optional exporter adapters | ⏸ Deferred / #9 closed as not planned |

## Canonical runtime artifact registry

| Track | Branch / head | CI / artifact | Digest | Closure eligibility |
|---|---|---|---|---|
| P5 | `feat/p5-safe-recipes` · `810d98d` | ✅ #488 · `figma-plugin-dist-488` | `sha256:9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` | ✅ Final #6 runtime acceptance build |
| P6 | `feat/p6-advanced-structures` · `9a6ae3b` | ✅ #494 · `figma-plugin-dist-494` | `sha256:82324e0ea98b0c13b55eda103d2945ed7e6371f046af1eee93e20fc032fb8fc3` | ⚠️ Reference only; rebuild after P5 merge |
| P7 | `feat/p7-batch-queue-core` · `cbfdb66` | ✅ #490 · `figma-plugin-dist-490` | `sha256:c5c7c6c30ccaaf56901d121ef9166e75f7628b77ad22fdb7238bf931a3e91f43` | ⚠️ Reference only; rebuild after P5 merge |

Machine-readable operational registry: `config/runtime-artifacts.json` schema v2. It records exact build identity, ZIP digest, closure eligibility and immutable per-file SHA-256 pins. If the original Actions ZIP is retained, the registered digest can be enforced directly with `--archive` in preflight or closure intake.

## Runtime artifact preflight

Before importing an artifact into Figma or collecting closure evidence, run the main-side fail-closed preflight:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

If the original downloaded Actions artifact ZIP is available, optionally verify its raw bytes too:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488 --archive=/path/to/figma-plugin-dist-488.zip
```

It validates:

- the supplied artifact root is a real directory and not a symbolic link;
- if `--archive` is supplied, the archive is a regular non-symlink file, retains matching pre-open/opened `dev`, `ino`, size, mtime and ctime metadata, and its descriptor-pinned raw SHA-256 exactly matches the registered artifact digest;
- required `BUILD_INFO.txt`, `code.js`, `ui.html`, manifest, packaged import helper and same-artifact verifier are real regular files and not symbolic links;
- each required file retains matching pre-open/opened `dev`, `ino`, size, mtime and ctime metadata;
- BUILD_INFO parsing, manifest semantics and immutable hashing consume the exact bytes read from each validated file descriptor;
- exact `BUILD_INFO.txt` source/workflow SHA, Actions run ID and run number;
- exact SHA-256 for immutable packaged runtime/helper/verifier files;
- manifest main/UI targets and required developer menu commands;
- offline-only network policy (`allowedDomains: ["none"]`);
- placeholder vs locally rebound Figma plugin ID;
- whether the registered build is eligible for the requested final-closure intent.

`manifest.json` is intentionally not hash-pinned because the supported local import flow changes only its plugin ID. Its semantics are still validated from descriptor-pinned bytes, while compiled/runtime/helper/verifier bytes remain cryptographically pinned.

Expected current behavior:

```text
P5 #488 + final-closure  -> PASS with 5/5 immutable SHA-256 pins matched
P6 #494 + final-closure  -> FAIL CLOSED
P7 #490 + final-closure  -> FAIL CLOSED
P6/P7 + reference intent -> PASS with warning and immutable hash verification
```

Reference inspection:

```bash
npm run runtime:preflight -- p6 /path/to/unpacked/figma-plugin-dist-494 --intent=reference
npm run runtime:preflight -- p7 /path/to/unpacked/figma-plugin-dist-490 --intent=reference
```

Use `--json` for machine-readable output. Full guide: `docs/RUNTIME_ARTIFACT_PREFLIGHT.md`.

Preflight is operational safety tooling only. It cannot mint runtime proof and never replaces real imported-Figma observation or the verifier shipped inside the exact artifact.

## Runtime closure intake

After real runtime evidence has been exported, use one fail-closed command to bind artifact preflight and same-artifact verification together:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json
```

If the original downloaded Actions ZIP is retained, bind it into the same closure command:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json --archive=/path/to/figma-plugin-dist-488.zip
```

It requires, in order:

1. final-closure artifact preflight PASS, including a non-symlink artifact root, non-symlink required files, stable descriptor identity and immutable SHA-256 pins; when `--archive` is supplied, its stable descriptor-pinned raw SHA-256 must match the registered artifact digest;
2. an operator-supplied regular, non-symlink, non-empty evidence file no larger than 5 MiB by default;
3. opening that evidence file once and requiring its pre-open/opened `dev`, `ino`, size, mtime and ctime metadata to match;
4. SHA-256 of the **exact raw bytes read from that pinned descriptor** for forensic traceability;
5. strict valid UTF-8 decoding with no replacement-character recovery;
6. valid JSON with a top-level object;
7. re-opening the same-artifact verifier through a stable descriptor and requiring its SHA-256 to match the exact immutable verifier hash already accepted by preflight;
8. copying only those verified verifier bytes into a private temporary file, then having a direct Node bootstrap re-hash that temporary source and import the exact bytes as an in-memory `data:` module;
9. same-artifact verifier exit code exactly `0`.

If artifact/archive/evidence/verifier preparation stages fail, no verifier logic is executed. Symbolic-link artifact roots/files, archive mismatch/replacement, artifact-file path replacement, symbolic-link evidence paths, evidence path replacement, verifier replacement after preflight, invalid UTF-8, verifier hash drift, and bootstrap hash drift all fail closed.

The original artifact verifier path is not used as the executable module path after verification. The child Node process receives the validated evidence text through stdin and executes the exact re-verified verifier bytes in memory; no shell command is constructed from operator paths or evidence. The temporary verified source is removed after execution.

Current P6 #494 / P7 #490 reference builds cannot reach verifier execution through this command because final-closure preflight rejects them first.

Use `--json` for a machine-readable intake report. Full guide: `docs/RUNTIME_CLOSURE_INTAKE.md`.

Closure intake validates supplied evidence; it does **not** create Figma observations or weaken the requirement for real imported-Figma runtime proof.

## Self-contained Figma artifact import

If a verified artifact still uses placeholder plugin ID `000000000000000000`, use the **helper packaged inside that artifact**:

```bash
cd /path/to/unpacked/artifact
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json`. `LOCAL_IMPORT_INFO.txt` proves compiled `code.js` / `ui.html` stayed unchanged. Manifest preparation is not runtime acceptance.

## Integration readiness

Non-mutating `scripts/check-integration-readiness.mjs` + `.github/workflows/integration-readiness.yml` simulate the dependency edges without changing exact-build feature refs.

- ✅ P5 → current `main`: runtime source is compatible; known integration difference is documentation-side. Isolated integration proof PR #37 became mergeable and CI #500 passed.
- ⚠️ P6 → latest P5: real shared-code conflicts across build/provenance/runtime/P5 proof surfaces.
- ⚠️ P7 → latest P5: real shared-code conflicts across build/runtime/P5 proof/acceptance surfaces.
- ⚠️ final P6/P7 closure evidence must not be collected on builds that require later rebasing.

Run locally after fetching canonical refs:

```bash
npm run integration:readiness
```

## Planned closure / merge order

### 1. P5 / issue #6

- retain the original canonical `figma-plugin-dist-488` Actions ZIP when practical and unpack it;
- if the original Actions ZIP is retained, optionally run preflight with `--archive=<zip>` and require raw archive digest MATCH;
- run preflight on the real non-symlink artifact directory and require all required files to be non-symlink regular files, stable descriptor identity, exact build identity + `5/5` immutable SHA-256 matches;
- rebind manifest locally if needed using the packaged helper;
- import the exact build into Figma Desktop;
- run `Developer: P5 Runtime Self-Test` and require `P5 Compiled Runtime Acceptance: PASS`;
- prove rendered-pixel forced rejection, restore, finalize and `0` leftovers;
- export `p5-evidence.json` to a stable regular non-symlink path;
- run `npm run runtime:closure-intake -- p5 <artifact-dir> p5-evidence.json [--archive=<zip>]` and require optional raw archive digest match + descriptor-pinned artifact/evidence identity + raw-byte evidence SHA-256 + strict UTF-8/JSON acceptance + re-verified verifier SHA-256 + verified-byte in-memory verifier execution + verifier exit `0` + final PASS;
- apply the CI-proven documentation integration resolution, merge P5 and close #6.

### 2. P6 / issue #7 — only after P5 lands

- resolve/rebase P6 against merged P5/main;
- run full CI and create a fresh exact-build artifact;
- update `config/runtime-artifacts.json` with new identity, digest and immutable file hashes;
- optionally verify the fresh retained Actions ZIP against its new registered digest;
- establish its exact-build P5 prerequisite;
- run image-bearing positive page-flow clone calibration with Full P3 PASS and unchanged image-anchor count;
- run preservation-sensitive refusal and require `NO_CANDIDATE` / refusal PASS;
- require combined P6 closure PASS;
- export `p6-closure.json` to a stable regular non-symlink path and run descriptor-pinned, verified-byte `runtime:closure-intake` against the fresh final-closure-eligible P6 artifact; pass `--archive` when the fresh ZIP is retained;
- merge and close #7.

### 3. P7 / issue #8 — only after P5 lands

- resolve/rebase P7 against merged P5/main;
- run full CI and create a fresh exact-build artifact;
- update `config/runtime-artifacts.json` with new identity, digest and immutable file hashes;
- optionally verify the fresh retained Actions ZIP against its new registered digest;
- establish its exact-build P5 prerequisite;
- execute a realistic 60+ Frame batch with every item terminal and `maxConcurrentProcessors === 1`;
- request cancellation during a genuinely long active Full P3 operation and retain matching cooperative settlement evidence;
- require final closure PASS;
- export `p7-closure.json` to a stable regular non-symlink path and run descriptor-pinned, verified-byte `runtime:closure-intake` against the fresh final-closure-eligible P7 artifact; pass `--archive` when the fresh ZIP is retained;
- merge and close #8.

Full real-runtime operator checklist: `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md`.

## Independent closure verification

The artifact verifier remains independently runnable from the same unpacked artifact:

```bash
node verify-p5-evidence.mjs < p5-evidence.json
node verify-p6-closure.mjs < p6-closure.json
node verify-p7-closure.mjs < p7-closure.json
```

For operator closure, prefer `runtime:closure-intake` because it requires the registry-backed final-closure artifact preflight, optional retained-archive digest binding, post-preflight verifier hash revalidation, and exact verified-byte execution before accepting that same verifier result.

Exit code `0` requires canonical acceptance and exact artifact-build binding. Offline verification cannot replace real Figma observation.

## Safety invariants

- approved original design is the visual source of truth;
- unsupported/ambiguous structures are refused, never guessed;
- candidate-only mutation; Full P3 before P4 commit;
- rendered-pixel evidence is mandatory where required by runtime acceptance;
- runtime evidence must be traceable to the exact CI-built artifact loaded in Figma;
- the supplied artifact root and required artifact files must be real non-symlink filesystem entries before acceptance;
- if an original Actions archive is supplied for verification, its validation/read/hash must bind to one stable descriptor identity and its raw SHA-256 must equal the registered digest exactly;
- required artifact-file validation/read/hash/parse operations must bind to one stable descriptor identity (`dev`/`ino`/size/mtime/ctime) and pinned byte snapshot;
- immutable runtime/helper/verifier files must match registry SHA-256 pins exactly;
- manifest-only plugin-ID rebinding is allowed, but compiled code/UI must remain byte-for-byte unchanged;
- closure intake must forward any supplied archive into final-closure preflight, accept only a regular non-symlink evidence path, bind validation/read/hash to one stable file identity and descriptor, hash exact evidence bytes, reject invalid UTF-8, require a top-level JSON object, and never execute verifier logic until final-closure artifact/archive/evidence gates pass;
- verifier execution must re-bind to the immutable verifier hash accepted by preflight and execute the exact re-verified bytes in memory rather than trusting the artifact path at spawn time;
- offline verifiers must recompute canonical acceptance and match that artifact build;
- proof chronology must be valid and cannot occur after evidence capture;
- P6 advanced calibration remains clone-only with no production commit seam;
- P7 processing remains strictly sequential with cooperative cancellation;
- final P6/P7 evidence must come from their post-P5 fresh integration builds.

## Development

```bash
npm install
npm run status:verify
npm run typecheck
npm test
npm run build
npm run integration:readiness
```

Runtime artifact preflight:

```bash
npm run runtime:preflight -- <p5|p6|p7> <unpacked-artifact-dir> [--archive=/path/to/artifact.zip]
```

Runtime closure intake:

```bash
npm run runtime:closure-intake -- <p5|p6|p7> <unpacked-artifact-dir> <evidence-json> [--archive=/path/to/artifact.zip]
```

For a repository-local development artifact:

```bash
npm run prepare:figma-import -- <your-figma-plugin-id>
```
