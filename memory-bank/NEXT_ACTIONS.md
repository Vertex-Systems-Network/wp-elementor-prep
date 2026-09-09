# Next Actions

Last updated: 2026-09-09

## Mandatory order for every work cycle

Execute in this order before starting unrelated new implementation:

1. **Issues first**
   - list all open issues,
   - solve actionable code/docs/test issues,
   - identify dependency/manual-runtime blockers,
   - update/close only after real acceptance criteria pass.
2. **PR/MR second**
   - list all open PR/MR,
   - inspect CI, mergeability, conflicts and reviews,
   - fix safely actionable problems,
   - merge eligible work.
3. **Development third**
   - continue the highest-priority unblocked roadmap task.
4. **End-of-work sync**
   - run verification,
   - update memory-bank,
   - update README issue/PR status,
   - update module-wise progress percentages/bars and overall progress.

## Current repository queue

- Open issues: #6, #7, #8.
- #6 is blocked only on real imported-Figma runtime evidence.
- #7/#8 require P5 merge before integration/fresh runtime artifacts.
- Open PR/MR: `0` after PR #53 merge.
- PR #48 final head `d9aa202`: CI #565 PASS; squash-merged at `c97b9d7`; post-merge CI #566 + Integration Readiness #49 PASS.
- PR #49 pins every required artifact preflight read to one opened file descriptor so BUILD_INFO parsing, manifest parsing and immutable SHA-256 checks consume the exact bytes tied to the validated file identity.
- PR #49 head `dfdec23`: CI #570 PASS with no review/thread blockers; squash-merged at `7cc8a85`; post-merge CI #571 + Integration Readiness #53 PASS.
- PR #50 aligns artifact preflight identity matching with evidence intake by requiring matching `dev`/`ino`/size/mtime/ctime`, including a regression that simulates reused `dev`/`ino` after path replacement.
- PR #50 head `2160b6e`: CI #572 PASS with no review/thread blockers; squash-merged at `c99b2c65`; post-merge CI #573 + Integration Readiness #54 PASS.
- PR #51 removes the remaining same-artifact verifier execution-path race: closure intake re-opens the verifier through a stable descriptor after preflight, requires its SHA-256 to match the immutable verifier hash already accepted by preflight, and executes those exact bytes through a hash-checking in-memory Node module bootstrap rather than trusting the mutable artifact path at spawn time.
- Canonical P5 #488, P6 #494 and P7 #490 verifier artifacts were inspected before PR #51; all three current verifier scripts are self-contained bundled `.mjs` files with no relative imports/`require()` dependency.
- PR #51 head `bf7ba3c`: CI #577 PASS with no review/thread blockers; squash-merged at `15f3f023`; post-merge CI #578 + Integration Readiness #58 PASS.
- PR #52 makes the registered GitHub Actions artifact digest operationally verifiable when the original ZIP is retained: `runtime:preflight -- --archive=<zip>` hashes raw archive bytes from a stable descriptor and requires exact registry digest equality.
- Archive verification remains optional so extracted-artifact-only workflows continue to rely on descriptor-pinned BUILD_INFO/manifest/immutable-file checks; supplying a symlinked, replaced or wrong-digest archive fails closed.
- PR #52 head `1bf182f`: CI #582 PASS with no review/thread blockers; squash-merged at `5b75ff2e`; post-merge CI #583 + Integration Readiness #62 PASS.
- PR #53 closes the orchestration gap by adding optional `--archive=<zip>` to `runtime:closure-intake`; the same raw ZIP digest gate is now enforced inside final-closure preflight before evidence intake or verifier execution.
- PR #53 adds isolated regressions proving a matching retained archive reaches verifier PASS and a mismatching archive fails at preflight with verifier execution suppressed.
- PR #53 head `b813db3`: CI #587 PASS with no review/thread blockers; squash-merged at `6ffda876`; post-merge CI #588 + Integration Readiness #66 PASS.
- Closure evidence SHA-256 remains byte-exact and descriptor-pinned; invalid UTF-8 fails before verifier execution.
- Operator-supplied closure evidence paths must be regular non-symlink files and remain the same `dev`/`ino`/size/mtime/ctime identity between validation and descriptor open.
- Runtime artifact preflight requires a non-symlink artifact root, non-symlink required files, stable pre-open/opened file identity, and descriptor-pinned bytes for BUILD_INFO/manifest/hash verification; retained original ZIPs may additionally be bound to the registry digest with `--archive`.
- Closure intake now forwards the optional retained-ZIP digest gate into final-closure preflight, then requires stable evidence identity, stable post-preflight verifier identity, exact verifier SHA-256 equality with preflight, and `executionMode: verified-bytes-memory-bootstrap` before accepting a verifier result.
- Canonical P5/P6/P7 feature heads and registered runtime artifact bytes remain unchanged.

## P5 — first release gate / issue #6

1. Retain the original canonical `figma-plugin-dist-488` ZIP when practical and unpack P5 head `810d98d` / CI #488.
2. Run the hash-pinned preflight:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

If the original downloaded GitHub Actions ZIP is retained, also bind its raw bytes to the registered digest:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488 --archive=/path/to/figma-plugin-dist-488.zip
```

3. Require:
   - artifact directory is a real non-symlink directory,
   - if `--archive` is supplied, archive path is a stable regular non-symlink file and raw archive SHA-256 matches the registry digest exactly,
   - required artifact files are regular non-symlink files,
   - every required file retains matching `dev`/`ino`/size/mtime/ctime identity between validation and descriptor open,
   - BUILD_INFO, manifest semantics and immutable hashes are evaluated from descriptor-pinned bytes,
   - preflight PASS,
   - exact source SHA / run ID / run number,
   - `5/5` immutable SHA-256 pins matched.
4. If the artifact still has placeholder plugin ID, use the helper packaged **inside that same artifact**:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

5. Import `dist-local/manifest.json` (or original manifest if already rebound) in Figma Desktop.
6. Run `Developer: P5 Runtime Self-Test`.
7. Require `P5 Compiled Runtime Acceptance: PASS`.
8. Verify real rendered-pixel forced reject, restore and finalize flows.
9. Require checkpoint cleanup with `0` leftovers.
10. Export real closure JSON as `p5-evidence.json` to a regular non-symlink file path and do not replace it during intake.
11. From current `main`, run one-command closure intake:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json
```

If the original ZIP is retained, bind it into the same closure command:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json --archive=/path/to/figma-plugin-dist-488.zip
```

12. Require:
   - descriptor-pinned artifact preflight PASS,
   - when `--archive` is supplied, stable non-symlink archive identity + exact raw ZIP SHA-256 registry match,
   - evidence path is a regular non-symlink file,
   - stable pre-open/opened evidence-file identity acceptance,
   - raw evidence-file SHA-256 emitted for exact descriptor-pinned bytes,
   - `hashScope: raw-file-bytes`,
   - strict UTF-8 acceptance,
   - top-level JSON object acceptance,
   - same-artifact verifier re-opened through a stable descriptor after preflight,
   - verifier SHA-256 exactly matches the immutable verifier hash accepted by preflight,
   - `executionMode: verified-bytes-memory-bootstrap`,
   - exact re-verified verifier bytes execute through the hash-checking in-memory bootstrap rather than the original artifact path,
   - verifier exit `0`,
   - final `Runtime closure intake: PASS`.
13. Apply the proven documentation integration resolution, merge P5 and close #6.

Preflight/closure intake/CI cannot create runtime proof. The evidence must still come from the actual imported Figma Desktop runtime.

## P6 — after P5 merge / issue #7

Current #494 is reference-only. Both `runtime:preflight` final-closure mode and `runtime:closure-intake` must reject it before verifier execution.

1. Resolve/rebase P6 against merged P5.
2. Run full CI.
3. Produce a fresh exact-build P6 artifact.
4. Update `config/runtime-artifacts.json` with fresh identity, ZIP digest and immutable SHA-256 file pins; mark that fresh build final-closure eligible only when dependency conditions are satisfied.
5. Run preflight and require a non-symlink artifact root, optional retained-ZIP digest verification when available, non-symlink required files, stable descriptor identity, exact identity + immutable pins PASS.
6. Establish exact-build P5 prerequisite in that fresh build.
7. Run real image-bearing positive calibration and require Full P3 PASS with unchanged image-anchor count.
8. Run preservation-sensitive refusal and require `NO_CANDIDATE` / refusal PASS.
9. Require final P6 closure PASS in the plugin.
10. Export `p6-closure.json` to a stable regular non-symlink file path.
11. Run descriptor-pinned, byte-exact, verified-byte `runtime:closure-intake` against the fresh P6 artifact; when the fresh raw ZIP is retained, pass `--archive` and require the raw digest match before verifier execution.
12. Merge and close #7.

## P7 — after P5 merge / issue #8

Current #490 is reference-only. Both `runtime:preflight` final-closure mode and `runtime:closure-intake` must reject it before verifier execution.

1. Resolve/rebase P7 against merged P5.
2. Run full CI.
3. Produce a fresh exact-build P7 artifact.
4. Update `config/runtime-artifacts.json` with fresh identity, ZIP digest and immutable SHA-256 file pins; mark that fresh build final-closure eligible only when dependency conditions are satisfied.
5. Run preflight and require a non-symlink artifact root, optional retained-ZIP digest verification when available, non-symlink required files, stable descriptor identity, exact identity + immutable pins PASS.
6. Establish exact-build P5 prerequisite.
7. Run realistic 60+ Frame stress and require `maxConcurrentProcessors === 1`.
8. Request cancellation during genuinely active long Full P3.
9. Require cooperative settlement, final batch `CANCELLED`, and matching processor evidence.
10. Require final P7 closure PASS in the plugin.
11. Export `p7-closure.json` to a stable regular non-symlink file path.
12. Run descriptor-pinned, byte-exact, verified-byte `runtime:closure-intake` against the fresh P7 artifact; when the fresh raw ZIP is retained, pass `--archive` and require the raw digest match before verifier execution.
13. Merge and close #8.

## Development that may proceed while runtime is externally blocked

Only perform work that does **not** invalidate exact-build acceptance artifacts or violate dependency order, such as:

- repository/process hardening on `main`,
- fail-closed operator tooling around immutable artifacts,
- evidence intake/verification orchestration that does not mint evidence,
- non-mutating integration analysis,
- documentation/runbook consistency fixes,
- CI/tooling improvements,
- stale memory-bank synchronization,
- tests for newly discovered code-side defects on isolated branches.

Do not churn the canonical P5/P6/P7 feature branches for docs-only changes.
