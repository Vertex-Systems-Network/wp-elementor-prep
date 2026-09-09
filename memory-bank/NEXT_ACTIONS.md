# Next Actions

Last updated: 2026-09-10

## Mandatory order for every work cycle

1. **Issues first** — inspect all open issues and distinguish actionable implementation from deferred final validation.
2. **PR/MR second** — inspect CI, mergeability, conflicts, reviews and threads; merge only eligible work.
3. **Development third** — continue the highest-priority unblocked implementation track.
4. **End-of-work sync** — run verification and synchronize README + memory-bank state.

Never fabricate real Figma observations or closure evidence.

## Current release policy

Issue #84 defers manual/runtime/end-to-end product acceptance to P12 final integrated validation. This means:

- P5/P6/P7 engineering can remain implementation-complete/validation-pending without blocking P9/P10/P11;
- implementation-only automation may proceed behind existing safety locks;
- no deferred module is production accepted merely because code/CI exists;
- final real Figma/runtime/release validation is still mandatory in P12.

## Current queue

- P5 #6 — implementation complete, final real Figma/closure/integration validation pending P12.
- P6 #7 — implementation complete, final fresh integrated artifact + positive/refusal validation pending P12.
- P7 #8 — implementation complete, final fresh integrated artifact + 60+ stress/cancel validation pending P12.
- P9 #81 — PR #87 implementation complete; automated CI/merge then P12 product validation pending.
- P10 #82 — **next implementation target** after P9 merge.
- P11 #83 — planned after P10.
- P12 #84 — final integrated validation/release acceptance.

## P9 completion state

P9 provides:

- pure deterministic `src/core/backlog.ts` shared with future CLI;
- semantic stable ids/fingerprints;
- ERROR/WARNING/INFO/IMPROVEMENT categories;
- severity/priority/source/code and contextual evidence;
- proposed actions/recipe candidates with fail-safe auto-fix flag;
- OPEN/RESOLVED/REGRESSED/ACCEPTED_RISK status;
- NEW/RESOLVED/REGRESSED/UNCHANGED delta;
- repeated-occurrence dedupe + durable resolved history;
- generic runtime-finding adapter input;
- deterministic JSON + Markdown serialization;
- plugin clientStorage prior-run persistence;
- plugin UI backlog view and `backlog.json` / `backlog.md` export;
- focused core + plugin contract tests;
- no design mutation.

Manual/plugin runtime acceptance is intentionally deferred to P12.

## P10 — next implementation / issue #82

### Shared architecture

Keep one deterministic analysis core. Add source adapters outside core:

1. `FigmaRestSourceAdapter`
   - accept Figma design URL or explicit file key;
   - use official Figma REST API only;
   - explicit token/credential input;
   - never serialize tokens into report/backlog outputs.
2. `CanonicalSnapshotSourceAdapter`
   - accept a versioned repository-owned snapshot JSON format;
   - deterministic offline input for local files/CI;
   - enough node/layout/text/image metadata to reproduce plugin audit semantics.
3. future local bridge only if a supported documented mechanism exists.

### CLI contract

Target commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

Add script-friendly exit codes, summary-only mode and output-directory support.

### Raw `.fig` rule

Raw proprietary `.fig` parsing is forbidden unless a supported safe adapter exists. Until then a `.fig` path must fail clearly with `UNSUPPORTED_FIG_LOCAL_FILE` and direct the operator to URL/file-key or canonical snapshot input.

## P11 — after P10 / issue #83

Prepare the deterministic plugin for normal use/distribution:

- production manifest with real plugin ID;
- dev vs release command/menu surface;
- Audit, Backlog, Safe Fix/Prep, Batch, Export Report user commands as applicable;
- hide developer-only self-test/evidence commands from release UI where appropriate;
- reproducible minimal release package;
- local/private/team distribution docs;
- Community listing assets/checklist/privacy/support/versioning.

## P12 — final validation / issue #84

Batch all real/manual/end-to-end checks here, including:

- final artifact provenance/reproducibility;
- local development import + normal plugin install/run;
- P5 rendered-pixel reject/restore/finalize/cleanup;
- P6 positive/refusal;
- P7 60+ sequential stress + active cancellation;
- P9 backlog categories/dedupe/delta/UI/export;
- P10 REST/snapshot/raw-fig behavior + plugin/CLI parity;
- P11 release manifest/install/distribution surface;
- final closure-intake on final registered artifacts/evidence;
- Windows/macOS Node CLI path/error handling.

## Runtime safety retained

Runtime artifact preflight requires stable non-symlink descriptor-backed reads, exact build identity, immutable file pins and schema-v3 id-excluded manifest semantic equality; optional retained ZIP raw digest binding remains available.

Current `runtime:closure-intake` remains the normative final verifier boundary after real evidence exists. Direct packaged-verifier execution remains diagnostic-only.

## Immediate action

Finish PR #87 automated merge gates, keep #81 implementation-complete/validation-pending, then begin P10 #82 from the latest `main` without waiting for repeated manual P5/P6/P7 tests.
