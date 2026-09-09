# AI-Native Planning

Status: approved foundation plan  
Date: 2026-09-07  
Operational workflow updated: 2026-09-10

## 1. Product intent

Build a deterministic Figma plugin that audits an approved desktop design and prepares its internal structure for WordPress Elementor without requiring generative AI credits.

The plugin should eventually support dozens of pages/templates with one repeatable workflow rather than per-section AI prompting.

The final product must support two user-facing execution surfaces backed by one deterministic analysis core:

1. a normal Figma plugin experience inside Figma Design;
2. an npm/Node CLI for supported Figma inputs and canonical exported snapshots.

Every audit/prep run should also be able to generate a structured improvement backlog rather than only a flat report.

## 2. Core workflow

1. User selects one desktop frame, supplies a supported Figma URL/file key, or supplies a canonical exported snapshot path.
2. Source adapter produces the normalized document/frame model.
3. Scanner performs read-only audit.
4. Classifier detects layout patterns and risks.
5. Scoring engine produces Elementor-readiness score and reasons.
6. Backlog generator classifies findings as ERROR / WARNING / INFO / IMPROVEMENT and produces deterministic actionable items.
7. Recipe matcher proposes a known structural recipe.
8. In mutation-enabled phases, Safe Fix creates a candidate clone.
9. Candidate is refactored deterministically.
10. Geometry/content/image integrity and visual diff are validated.
11. Passing candidate replaces the original working section; failed candidate is discarded.
12. Product writes report, backlog, and optional private processing metadata.

## 3. AI-native does not mean AI-dependent

The project is AI-native in its engineering process: plans, decisions, state, tasks, and future-agent handoff are explicitly documented so an AI agent can resume development safely.

The runtime product itself is intentionally AI-free for core functionality:

- no Figma AI dependency,
- no OpenAI/Claude dependency,
- no remote inference for audit/refactor correctness,
- no token/credit consumption for audit/refactor,
- plugin core remains usable without network access.

The CLI may use the official Figma REST API when the user deliberately supplies a Figma cloud URL/file key and credentials. That network adapter must remain isolated from the deterministic analysis core.

Optional AI assistance can be considered later as a separate feature flag, never as a requirement for correctness.

## 4. Canonical knowledge architecture

The repository must maintain a persistent memory-bank:

- `PROJECT_STATE.md`: current truth.
- `ROADMAP.md`: phases, progress and remaining work.
- `NEXT_ACTIONS.md`: immediate executable queue.
- `DECISIONS.md`: architectural/product decisions and rationale.
- `CHANGELOG.md`: session-by-session material changes.

`AGENTS.md` enforces reading and updating these files.

## 5. Development philosophy

### Audit before mutate

No structural auto-fix should ship before the product can detect and explain the same problem in Audit mode.

### Explainable classification

Each recommendation must include evidence such as:

- same Y / X clusters,
- consistent widths/heights,
- repeated gaps,
- parent coverage,
- overlap profile,
- clipping/overflow,
- existing Auto Layout state,
- text/image composition.

### Confidence-gated mutation

Proposed thresholds (calibrate on fixtures):

- 90–100: Safe Auto Fix candidate.
- 75–89: Candidate only with strict validation; default review in early versions.
- 50–74: Review.
- <50: Preserve and explain.

### Visual truth wins

If correct Auto Layout cannot be achieved without visible drift, the plugin must preserve the design and flag the section rather than redesign it.

### Backlog before guesswork

When a problem cannot be safely auto-fixed, it must become a traceable backlog item rather than being silently ignored or guessed away.

## 6. Golden-fixture strategy

Start with a real, complex desktop page containing multiple pattern families. Never hard-code its IDs. Convert observations into generic fixture JSON and rule-based tests.

Additional fixtures are required before Safe Fix is considered reliable:

- clean marketing page,
- editorial/asymmetric page,
- image-heavy page,
- long timeline page,
- carousel/overflow page,
- complex footer,
- intentionally overlapping hero.

Final manual/runtime/end-to-end validation of these flows is deferred to P12 so implementation can be completed first without repeatedly stopping for manual Figma testing.

## 7. Product modes

### Audit Only — v0.1

Read-only. Scan, classify, score, explain, report, and generate backlog.

### Safe Fix — v0.2+

Only proven high-confidence recipes. Candidate/validate/rollback mandatory.

### Full Prep — later

Advanced recipes, section/page normalization, batch queue.

### CLI / automation surface

Run the same deterministic audit/backlog core from npm/Node using supported source adapters.

### Figma plugin distribution

Package the product so it can be imported during development and later installed/distributed like a normal Figma plugin.

### Elementor Export — optional later milestone

Generate Elementor JSON only after Figma normalization itself is reliable. Support current Elementor nested structures and keep exporter versioned behind explicit schema adapters.

## 8. Success criteria

The project is successful when a non-developer can:

- open a Figma Design file and run the product like a normal Figma plugin;
- run Audit / Backlog / enabled Prep features from the plugin UI;
- invoke equivalent audit/backlog functionality from npm/Node for supported inputs;
- pass a Figma cloud URL/file key to the CLI;
- pass a canonical exported snapshot/package path to the CLI for offline analysis;
- receive a trustworthy readiness score;
- receive exact reasons for problems;
- receive a categorized backlog of ERROR / WARNING / INFO / IMPROVEMENT items;
- receive safe automatic cleanup for common patterns where enabled;
- avoid silent visual damage;
- receive clear manual-review flags for ambiguous layouts;
- reproduce behavior across many templates;
- use the core without AI credits.

## 9. Mandatory AI-native engineering cycle

Every AI/developer work cycle MUST follow this order before starting new implementation work.

### A. Issues first

1. Read the canonical memory-bank and current README status.
2. List all open issues for the repository.
3. For each open issue, classify it as:
   - actionable code/docs/test work,
   - blocked by another phase/merge,
   - blocked by external/manual runtime evidence,
   - intentionally deferred/not planned.
4. Solve actionable issues before creating unrelated new development.
5. Do not claim acceptance for any item whose required final validation has been deferred to P12.
6. Never fake, synthesize, or prematurely close an issue that requires real external/runtime evidence.

### B. PR/MR second

After the issue sweep, list all open Pull Requests / Merge Requests.

For every open PR/MR:

1. inspect current status and conflicts;
2. inspect unresolved review feedback when present;
3. fix failures/conflicts when safely actionable;
4. merge only when the applicable implementation gate is satisfied;
5. keep production/runtime acceptance explicitly pending when it belongs to P12;
6. close superseded/invalid work only with a clear reason.

Do not start duplicate implementation when an existing issue or PR/MR already owns that work.

### C. New development third

Only after issues and PR/MRs are processed should the agent begin the next planned development task.

New development should:

- follow the current roadmap/dependency order,
- use parallel independent workstreams when safe,
- avoid mutating exact-build/provenance-sensitive branches without a real need,
- keep safety locks in place while final runtime acceptance is deferred,
- create focused branches/PRs for meaningful changes.

### D. Mandatory end-of-work status sync

After every meaningful work batch, before declaring the implementation batch complete:

1. update `memory-bank/PROJECT_STATE.md`, `NEXT_ACTIONS.md`, `ROADMAP.md` when phase state changed, and `CHANGELOG.md`;
2. update `DECISIONS.md` when a durable policy/architecture decision changed;
3. update the root `README.md` with current issue/PR status;
4. maintain module-wise progress tables;
5. distinguish implementation-complete from validation/acceptance-complete;
6. record blockers and exact next work;
7. do not count deferred manual/runtime/end-to-end testing as passed until P12.

Automated repository checks may still exist as implementation safeguards, but they do not count as final product acceptance under the P12 policy.

## 10. P9 — Continuous improvement backlog

Issue: #81.

Every audit/prep execution should be able to emit a structured backlog with four top-level categories:

- `ERROR` — blocking invariant, processing, source-adapter, or runtime failures;
- `WARNING` — risky/ambiguous structures requiring review;
- `INFO` — non-blocking observations and contextual findings;
- `IMPROVEMENT` — actionable opportunities for Elementor-readiness, consistency, performance, accessibility, maintainability, or future recipe coverage.

Each backlog item should include at least:

- deterministic fingerprint/id;
- category, severity, and priority;
- rule/finding code;
- file/page/frame/section/node context when available;
- title and explanation;
- evidence and confidence;
- proposed action or recipe candidate;
- auto-fix eligibility;
- `firstSeen`, `lastSeen`, and occurrence count;
- status such as `OPEN`, `RESOLVED`, `REGRESSED`, or `ACCEPTED_RISK`.

Outputs:

- `backlog.json`;
- `backlog.md`;
- counts by category/severity;
- deterministic deduplication;
- run-to-run delta: new/resolved/regressed/unchanged;
- plugin UI view/export;
- CLI-compatible export.

The backlog is advisory/operational data. It must never silently mutate the Figma design.

## 11. P10 — npm/CLI execution surface

Issue: #82.

The CLI must share scanner/classifier/scoring/backlog logic with the plugin instead of implementing a second analysis engine.

Target commands include:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

A convenience dispatcher may later support:

```bash
npm run audit -- --input "<url|file-key|supported-path>"
```

Source adapters must be isolated:

- `FigmaRestSourceAdapter` for official Figma cloud URL/file-key access;
- `CanonicalSnapshotSourceAdapter` for our own versioned exported snapshot/package files;
- future `LocalFigmaBridgeAdapter` only if a documented/supported mechanism exists.

### Local `.fig` path rule

Do not create an undocumented parser for proprietary `.fig` files.

If the user passes `/path/file.fig` before a supported bridge exists, the CLI must fail clearly with a stable error such as `UNSUPPORTED_FIG_LOCAL_FILE` and explain the supported alternatives: Figma URL/file key or canonical snapshot path.

If a safe supported bridge becomes available later, it can be added behind a versioned adapter without changing the analysis core.

CLI outputs should include JSON/Markdown report, JSON/Markdown backlog, machine-usable exit codes, summary-only mode, and output-directory controls. Credentials/tokens must never be written into reports/backlogs.

## 12. P11 — Normal Figma plugin distribution

Issue: #83.

The repository already uses a classic Figma plugin manifest shape. P11 completes the production packaging/distribution layer so users can use the product like other Figma plugins.

Planned deliverables:

- production manifest generation with real plugin ID;
- separate development vs release manifest/menu configuration;
- reproducible release package containing only required runtime/UI/assets;
- stable user-facing commands: Audit, Backlog, Safe Fix/Prep, Batch, Export Report;
- developer self-test/evidence commands hidden from normal release UI where appropriate;
- local development-plugin import instructions;
- private/team/organization distribution guidance;
- Figma Community submission package/checklist;
- icon, thumbnail/cover, screenshots, description, category/tags, support contact;
- version/changelog/update process;
- privacy/network declaration matching actual release behavior;
- release provenance/build metadata.

Community publication is a final release action and may require Figma review. The plan must never assume automatic approval.

## 13. P12 — Final integrated validation and release acceptance

Issue: #84.

Current project policy is to finish implementation first and batch manual/runtime/end-to-end product testing into one final validation phase.

Until P12:

- continue implementation where safe;
- keep production mutation locks and exact-build safety gates intact;
- do not fabricate Figma observations;
- do not mark runtime-gated modules production-accepted;
- do not repeatedly block feature planning/implementation merely because final manual testing is unavailable.

P12 final validation must cover at least:

- production/release artifact provenance and reproducibility;
- local development-plugin import;
- normal release/plugin install and run flow;
- P5 rendered-pixel reject/restore/finalize and zero-leftover acceptance;
- integrated P6 positive + preservation-refusal scenarios;
- integrated P7 realistic 60+ queue + active Full-P3 cancellation;
- P9 backlog categories, dedupe, delta, and export;
- P10 CLI via official Figma URL/file key;
- P10 CLI via canonical snapshot path;
- raw `.fig` unsupported/supported-adapter behavior;
- plugin/CLI parity on equivalent snapshots;
- deterministic report/backlog outputs;
- final closure-intake on registered artifacts/evidence;
- P11 release manifest and user command surface;
- private/local distribution package;
- Community submission-package readiness;
- Windows/macOS CLI path handling where applicable;
- error/warning/info/improvement quality.

Only after this matrix is completed should the expanded release be promoted to production-accepted/100%.
