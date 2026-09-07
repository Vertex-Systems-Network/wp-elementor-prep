# AI-Native Planning

Status: approved foundation plan  
Date: 2026-09-07

## 1. Product intent

Build a deterministic Figma plugin that audits an approved desktop design and prepares its internal structure for WordPress Elementor without requiring generative AI credits.

The plugin should eventually support dozens of pages/templates with one repeatable workflow rather than per-section AI prompting.

## 2. Core workflow

1. User selects one desktop frame.
2. Plugin performs read-only audit.
3. Scanner builds a normalized node/layout model.
4. Classifier detects layout patterns and risks.
5. Scoring engine produces Elementor-readiness score and reasons.
6. Recipe matcher proposes a known structural recipe.
7. In later phases, Safe Fix creates a candidate clone.
8. Candidate is refactored deterministically.
9. Geometry/content/image integrity and visual diff are validated.
10. Passing candidate replaces the original working section; failed candidate is discarded.
11. Plugin writes a report and optional private processing metadata.

## 3. AI-native does not mean AI-dependent

The project is AI-native in its engineering process: plans, decisions, state, tasks, and future-agent handoff are explicitly documented so an AI agent can resume development safely.

The runtime product itself is intentionally AI-free for core functionality:

- no Figma AI dependency,
- no OpenAI/Claude dependency,
- no remote inference,
- no token/credit consumption for audit/refactor,
- no network required for the core plugin.

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

No structural auto-fix should ship before the plugin can detect and explain the same problem in Audit mode.

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

## 7. Product modes

### Audit Only — v0.1

Read-only. Scan, classify, score, explain, and report.

### Safe Fix — v0.2+

Only proven high-confidence recipes. Candidate/validate/rollback mandatory.

### Full Prep — later

Advanced recipes, section/page normalization, batch queue.

### Elementor Export — optional later milestone

Generate Elementor JSON only after Figma normalization itself is reliable. Support current Elementor nested structures and keep exporter versioned behind explicit schema adapters.

## 8. Success criteria

The project is successful when a non-developer can select a desktop frame and receive:

- a trustworthy readiness score,
- exact reasons for problems,
- safe automatic cleanup for common patterns,
- no silent visual damage,
- clear manual-review flags for ambiguous layouts,
- repeatable behavior across many templates,
- no AI credits required for core usage.
