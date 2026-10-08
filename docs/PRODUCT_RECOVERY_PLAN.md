# Product Recovery Plan: the canonical build backlog

Status: **ACTIVE / CANONICAL**
Established: 2026-10-08
Baseline main audited: `9fdbe6f16d56f77cbfaa179cda0b0ace25f307f6`
Owner branch for the first train: `claude/youthful-ritchie-uch0qp`

> **RESUME POINTER**: the machine copy is in `.ai/state/CURRENT-STATE.yaml` under `recovery_program`.
>
> - Active milestone: **M0 — Critical correctness fixes**
> - Next task: **M0.12**
> - Last completed task: **M0.11** (debounced background audit, panel preservation, scan bounds during traversal).

This file is the single backlog that turns the repository into the product described in §1. Every AI agent or developer resumes from the RESUME POINTER above, takes the first unchecked task of the active milestone and continues from there. Chat history is never required.

---

## 0. How to resume (mandatory for every session)

1. Run the normal `AGENTS.md` session start.
2. Read this file. Then read `recovery_program` in `.ai/state/CURRENT-STATE.yaml`.
3. Reconcile the live state: current main SHA, open Issues, open PRs. If a PR for the active milestone exists, continue that PR instead of starting a new one.
4. Take the first `[ ]` task in the active milestone. Tasks inside a milestone run in order unless a task says `parallel-safe`.
5. Do the task in this sequence:
   1. code;
   2. focused tests;
   3. `npm run typecheck && npm test`;
   4. tick the task: `[ ]` → `[x]`, with the commit SHA or PR number;
   5. move the RESUME POINTER in this file and in `CURRENT-STATE.yaml` to the next task;
   6. commit and push.
6. A task may be ticked only when its acceptance line is true. If a task is blocked, mark it `[!]` with a one-line blocker and continue with the next independent task.
7. When every task in a milestone is `[x]`:
   1. run the milestone acceptance (§5);
   2. sync the canonical memory-bank files once (see §3 rule R5);
   3. move the pointer to the next milestone.

Task ID format is `M<milestone>.<n>`. IDs never change. New tasks are appended with the next free number.

---

## 1. Product contract (what the system must become)

The product is a Figma plugin. The user installs it, selects an approved design, and picks a target and version: Elementor (v3 Container or v4 Atomic) or Gutenberg (WordPress 6.x).

The plugin then works in this order:

1. **Audit, read-only.** Sections, structure, Auto Layout coverage, mappable / REVIEW / BLOCKED properties, responsive risk, and an explainable Build-Ready score.
2. **Target-ready duplicate.** A copy is created next to the original and named `<frame> — Prepared for <target profile>`. The original is never modified.
3. **Structure alignment without visual change.** Manual layout in the duplicate is converted to Auto Layout, wrappers, rows, columns and grids. Every change goes through candidate → validate (geometry + text + image + pixel) → commit or rollback. **The prepared design must stay visually identical to the original.** Anything that cannot be converted safely stays as it is and is reported as REVIEW.
4. **Responsive breakpoint alignment.** The desktop, tablet and mobile frames of the same page or section are paired. Their duplicates are aligned to one shared hierarchy, so each element maps to **one** target element: desktop values form the base, and tablet and mobile become responsive overrides.
5. **Native export.**
   - Editable Elementor Template JSON: containers + core widgets, with typography, colours, spacing, sizing, borders, shadows and responsive settings.
   - Or valid Gutenberg block markup.
   - Plus an asset pack: original image bytes, SVG, font manifest and tokens.
6. **Proof.** Schema/package validation, then real import, render, and a screenshot round-trip against the Figma frames at every breakpoint. Each result carries an exact readiness label: `ARTIFACT VALIDATED`, `IMPORT VERIFIED`, `RENDER VERIFIED` or `ROUND-TRIP VERIFIED`.
7. **Atomic download plus a receipt.** The receipt records the source fingerprint, target profile, adapter version and validation level.

Non-negotiable invariants (unchanged from `AGENTS.md`):

- visual truth wins;
- the original stays untouched;
- core is AI-free and network-free;
- low confidence → REVIEW, never a guess;
- no silent fallback to screenshot, HTML or third-party widgets;
- versioned adapters;
- atomic artifacts;
- local validation ≠ real import/render proof.

"100% identical" is the goal. The engineering acceptance is: **everything mapped renders within the calibrated round-trip threshold at each breakpoint, and everything not mapped is listed explicitly as REVIEW.** Font rasterisation, theme CSS and browser differences are measured and reported. They are never hidden.

---

## 2. Audit baseline (2026-10-08, main `9fdbe6f`)

These findings are the reason for this plan. File references are as of the baseline SHA.

### 2.1 Vision vs reality

| Contract step | Reality at baseline |
|---|---|
| Target/version selection | Cosmetic. Each option-bank select has one entry, and the selection changes nothing in audit, duplicate or export. `optionBankId` is never posted by the UI (`src/ui/ui.html:147`). A Gutenberg bank id can be attached to an Elementor preview (`src/plugin/main.ts:1080`). |
| Audit | Works and is deterministic. The classifier counts only container children (`src/core/classifier.ts:59-75`), so text, image and vector siblings are ignored. The section score is an unweighted mean (`src/core/scoring.ts:140-143`). |
| Duplicate | The P14 duplicate exists only in the dev build (`scripts/build.mjs:35` vs `scripts/build-release.mjs:89`). It lands exactly on top of the source with the same name (`src/plugin/p14-vertical-stack-retained-duplicate-adapter.ts:97,377-383`). The shipped P5 Safe Fix swaps the original out, and finalize deletes it (`src/plugin/figma-transaction-adapter.ts:185-199,295`). |
| Structure alignment | There is one mutation: set Auto Layout FIXED/MIN on an existing frame. Vertical stack confidence is `70+min(20,2n)` with a 90 gate, so it needs ≥10 container children (`classifier.ts:268`, `safe-recipe-planner.ts:13-25`). Real conversion is about 0–5% of a landing page. P14 accepts exactly one action (adapter `:440,494`). |
| No-visual-change proof | P5: pixel diff at ≤0.5% changed pixels, downscaled to 2048px (`full-frame-validator.ts:111-118`, `validator.ts:12-20`). P14: geometry only, no pixel diff. The UI runs its own pixel-diff copy; `src/core/pixel-diff.ts` is not bundled. |
| Responsive alignment | **Absent.** There is no breakpoint frame pairing or matching. The `responsive-*-resolution.ts` modules consume hand-written manifests (`responsiveInferencePerformed: false`) and are not bundled. |
| Elementor export | The extractor emits only `container`, `text` and `review` (`src/plugin/p15-neutral-export-extractor.ts:345-371`). It maps 6 container facts (`v3-template-generator.ts:137-167`). It has no typography, text colour, sizing, strokes, shadows, opacity, images or vectors. Any REVIEW node → `template: null` (`v3-template-generator.ts:324-330`). |
| Gutenberg export | **Absent.** There is no `<!-- wp:` generator. `src/targets/gutenberg/*` is validators and receipts only. |
| Round-trip proof | Absent. The P15 browser proof captures screenshots, but nothing compares them to Figma. |

### 2.2 Critical defects (fixed in M0)

1. The release UI never substitutes `__OPTION_BANK_REGISTRY__`. `dist-release/plugin/ui.html:114` keeps the raw token, so a ReferenceError stops every listener.
2. The release build omits the `__WPEP_BUILD_*` defines. Build identity stays `local`, so Safe Fix and batch never unlock.
3. An image-fill check runs before the container branch, so frames with image backgrounds lose their entire subtree (`p15-neutral-export-extractor.ts:363`).
4. Strokes, effects, opacity, blend modes and clipping are dropped silently, with no REVIEW.
5. The undo checkpoint key is global in `clientStorage` (`figma-transaction-adapter.ts:5`), so a stale checkpoint from another file locks Safe Fix.
6. Opening any viewer (`figma.showUI`) replaces the pixel-broker UI, and later validations hang until the 30 s timeout.
7. The Build-Ready freshness hash ignores text content (length only), fills, fonts and effects (`src/core/build-ready.ts:128-170`).
8. The README claims the option-bank is carried into the P15 preview receipt, and the code does not do this.

### 2.3 Structural debt

- `src/targets/elementor/*-resolution.ts` is 55 files and about 37k LOC. About 70% is copy-pasted validation boilerplate; for example, `isRecord` and `validFingerprint` each appear in 48 files. Only 10 of the 85 Elementor modules are bundled into the plugin.
- 95 of the last 100 commits did not touch `src/`. The governance, state and docs surface is about 0.5 MB.
- Tests are 1,858/1,858 green, but they run entirely on mocks and fixtures. The only real target check imports fixed vectors, not plugin output.

---

## 3. Working rules for the recovery program

- **R1. Safety invariants stay.** They are listed in §1 and in the `AGENTS.md` engineering rules.
- **R2. Batching.** One milestone is one focused branch/PR train. Tasks are commits inside it. Multiple milestones may share a branch only when they are sequential and the PR stays reviewable.
- **R3. Tests.** Every task ships tests. Every mapping, classifier, recipe or adapter change needs golden-fixture coverage.
- **R4. Merge gate.** The exact-head CI, security and release gates stay mandatory. They are not weakened.
- **R5. Lightweight doc sync (D-047).** While a milestone is in progress, only this file and `.ai/state/CURRENT-STATE.yaml` are updated per task. `memory-bank/*`, `README.md`, `docs/RUNNER_BENCHMARK.md` and `.ai/state/LAST-CHECKPOINT.md` are synced **once per milestone**, or immediately when phase status, authority or a target-support claim changes. No status-only PRs.
- **R6. Product before process.** No new governance, evidence-receipt or policy module is added unless a milestone task requires it. Existing ones are kept and are not expanded.
- **R7. Existing gates.** The existing P12, P13, P15–P18 authority boundaries and issues (#84, #159, #182, #287, #846, #856) stay open and truthful. Recovery work never claims their external evidence.
- **R8. Manual Figma Desktop verification.** Real-plugin checks that need a human are recorded as `[!] MANUAL` with exact steps. They are never simulated.
- **R9. Elementor first target (D-048).** The first target is the **v3 Container** schema, which imports on Elementor 3.16+ and 4.x. v4 Atomic follows in M6 after an R0 refresh. Gutenberg follows in M8.

---

## 4. Milestones and task backlog

Legend: `[ ]` todo · `[x]` done · `[!]` blocked (with reason) · `[~]` in progress.

### M-ALIGN — Plan alignment ✅

- [x] M-ALIGN.1 Audit the full system and record the baseline (§2).
- [x] M-ALIGN.2 Create this canonical backlog and its resume protocol.
- [x] M-ALIGN.3 Wire it into the startup read order: `AGENTS.md`, `AI_NATIVE_PLAN.md`, memory-bank, `CURRENT-STATE.yaml`, `LAST-CHECKPOINT.md` and README.

### M0 — Critical correctness fixes (shipped surfaces must work)

- [x] **M0.1** _(done 2026-10-08: shared `scripts/option-bank-ui.mjs` injector used by dev and release builds; `assertNoUnresolvedBuildPlaceholders` runs in `assertReleaseUiCapabilities` (build and release verifier); `tests/m0-release-ui-placeholders.test.mjs`; a Chromium smoke of the fixture release UI went from `__OPTION_BANK_REGISTRY__ is not defined` to 0 page errors. The `code.js` placeholder/identity check moves to M0.2.)_ Make the release UI build substitute `__OPTION_BANK_REGISTRY__`. Add a release-package test that fails if any `__[A-Z0-9_]+__` placeholder remains in `dist-release/plugin/ui.html` or `code.js`. Files: `scripts/release-ui-contract.mjs`, `scripts/build-release.mjs`, `scripts/verify-release-package.mjs`, tests. *Accept:* the fixture release build has no placeholders, and the test is in CI.
- [x] **M0.2** _(done 2026-10-08: `scripts/release-build-defines.mjs` maps the same source/run tuple to both the P5 and `__WPEP_BUILD_*` define families; the release build and package verifier reject any unresolved plugin build define in `code.js`; `tests/m0-release-build-identity.test.mjs`; the two-build reproducibility check still passes. Safe Fix / batch additionally require the existing P5 proof + P7 receipt at runtime.)_ Pass the `__WPEP_BUILD_SOURCE_SHA__`, `__WPEP_BUILD_RUN_ID__` and `__WPEP_BUILD_RUN_NUMBER__` defines in `build-release.mjs` from `--source-sha` and the CI env. Add a test that the release bundle carries a traceable identity when inputs are present. *Accept:* the release identity is not `local` in CI.
- [x] **M0.3** _(done 2026-10-08: neutral IR containers gain bounded `styleReviews`; unmappable background (image, gradient, multi or translucent fill) and radius facts become container-level REVIEW while layout and children are still extracted; the generator emits them as review entries and readiness classifies a background image as NATIVE_WITH_REVIEW; leaf and TEXT image fills stay node-level `IMAGE_ASSET_EXPORT_REQUIRED`; extractor v3; tests in `p15-figma-neutral-export-extractor`, `p15-container-fidelity` and `m0-neutral-style-reviews`.)_ Extractor: a frame with an image fill **and** children becomes a container plus a background-image REVIEW entry. The children are kept. A TEXT node with an image fill becomes a REVIEW reason on that node only. *Accept:* a regression test shows no subtree loss.
- [x] **M0.4** _(done 2026-10-08: container and text nodes report visible strokes, effects, layer opacity, blend mode, rotation, masks and clipped overflow as explicit `styleReviews` (`*_REQUIRES_REVIEW`); default, hidden and zero-weight facts and in-bounds clipping are not flagged; the node content is kept. Typography and text colour are still unmapped and stay owned by M2.1.)_ Extractor: visible strokes, effects, `opacity<1`, non-normal `blendMode`, `clipsContent`, rotation and masks produce explicit REVIEW entries. Each one is replaced by a real mapping in M2. *Accept:* a no-silent-drop test runs over a fixture with every property.
- [x] **M0.5** _(done 2026-10-08: at retention, after every candidate validation, the adapter places the duplicate at source page origin x + width + 100px, same y, and renames it `<source name> — Prepared`. The page origin uses `absoluteTransform` or else accumulated parent offsets, so nested sources work too. Clone-stable and preservation checks are unchanged. Tests are in `p14-vertical-stack-retained-duplicate-adapter`, covering top-level, nested and transform placement.)_ P14 duplicate placement. Place the duplicate at `source absolute x + width + 100px`, same y, at page level. Use the absolute transform, which also handles nested sources. Name it deterministically: `<name> — Prepared`. *Accept:* adapter tests cover top-level and nested sources.
- [x] **M0.6** _(done 2026-10-08: the checkpoint now lives in document plugin data (`wpep:p4-undo-checkpoint`) via `src/plugin/undo-checkpoint-store.ts` instead of the global `clientStorage` key. `figma.root.id` is the same in every file, so it was not used as a key. A legacy global token is adopted only when its backup Frame and retained original resolve in the current file, and is otherwise ignored there. The new "Clear stale checkpoint" action clears only a STALE checkpoint and refuses a VALID one; restore/finalize errors point to it. Tests in `m0-undo-checkpoint-store`.)_ Key the undo checkpoint per file and root (`figma.root.id` or the file key). Add a "clear stale checkpoint" action with an explanation. *Accept:* a test shows a checkpoint from file A does not block file B.
- [x] **M0.7** _(done 2026-10-08: `FullFrameValidator` takes a broker-availability check and throws a structured `PixelBrokerUnavailableError` (`P3_PIXEL_BROKER_UNAVAILABLE`) before and after export when the main panel is not active. `failAllPending()` rejects in-flight validations at once. `main.ts` routes every viewer through `showViewerUi`, which marks the main panel inactive and fails pending validations, so they no longer wait for the 30 s timeout. Main-panel restore is deliberately not attempted, because `postMessage` delivery to a freshly reloaded UI is not guaranteed. Tests in `full-frame-validator`.)_ Pixel broker resilience. A validation requested while a viewer UI is active either restores the main UI first or fails fast with a structured error. It never waits for the 30 s timeout. *Accept:* unit test.
- [x] **M0.8** _(done 2026-10-08: the scanner records a per-node `visualDigest` covering text characters, styled text segments, fonts, fills, strokes, effects, radii, blend mode, rotation and mask. Build-Ready reports carry a separate `source.contentHash`, and P14 preview freshness rejects content changes as well as legacy evidence that has no content hash. `structuralHash` is deliberately unchanged, so P13 REST/CLI parity (#159) still holds, and parity normalisers ignore the plugin-only `contentHash`. The P14 clone-stable witness also includes the digest. Tests in `m0-content-freshness`.)_ Build-Ready freshness hash. Include a text content digest, fills, font names and effects. *Accept:* a same-length text edit or a colour change marks the result stale.
- [x] **M0.9** _(done 2026-10-08: separate Elementor/Gutenberg selections, with `resolveElementorOptionBank` refusing a Gutenberg bank (`P15_OPTION_BANK_TARGET_MISMATCH`) or an unknown bank. The UI preview and download requests post `optionBankId`. The preview shows the bank label and status as a static inventory, and the local download result and receipt carry `optionBankId`. The README claim is corrected. A Chromium click smoke confirms both requests carry the id. Tests in `m0-option-bank-truth`. The bank does not change the mapping yet; that is M6.)_ Option-bank truth. Post the `optionBankId` from the UI, reject a Gutenberg bank on the Elementor preview, carry the bank id into the preview result and the download receipt, and correct the README claim. *Accept:* tests, and the README matches the code.
- [x] **M0.10** _(done 2026-10-08: `scripts/ui-pixel-diff-runtime.mjs` compiles `src/core/pixel-diff.ts` with esbuild and both the dev and release UI builds inject it in place of `__PIXEL_DIFF_RUNTIME__`. The hand-written UI copy and the unreferenced `src/ui/release-ui.html` (a third copy) are removed. Tests evaluate the injected runtime against `comparePixelBuffers`. A Chromium smoke of real PNG pixel requests returned 0% for identical images and 100% for different ones, with no errors.)_ Single pixel-diff implementation. The UI uses the bundled `src/core/pixel-diff.ts` (injected at build), and the UI copy is removed. *Accept:* the tested code is the runtime code.
- [x] **M0.11** _(done 2026-10-08: `createSelectionAuditScheduler` debounces selection-change audits by 250 ms and invalidates in-flight audits immediately. Automatic audits never post selection errors. The UI keeps an open P14/P15/Safe Fix/batch/validation panel and shows a background notice instead. `scanSceneNodeWithinBounds` enforces the Build-Ready visible-node budget (10k) and a 100k total cap during traversal and throws `SCAN_NODE_LIMIT_EXCEEDED`. Tests in `m0-audit-trigger-and-bounds`. A Chromium smoke confirmed the panel is preserved and the notice works; the manual re-render was smoked only with a stub report, whose render threw.)_ Debounce the selection-change auto-audit (or make it explicit). Do not overwrite an active P14, P15 or Safe Fix panel. Enforce `maxNodes` during the scan, not after it. *Accept:* tests.
- [ ] **M0.12** M0 milestone sync, done once per R5: memory-bank, README module row and changelog.

### M1 — Table-driven Elementor mapping engine

- [ ] **M1.1** Define the `PropertyFamily` schema: `family`, `target kind`, `devices`, `key(device)`, value codec, `requires`/`conflictsWith`, and evidence (Elementor version, source path, SHA). Add value codecs: `dimension`, `dimensions box`, `color`, `typography group`, `box-shadow`, `gradient`, `border`, `enum`, `boolean`.
- [ ] **M1.2** Create one shared module for the manifest envelope, authority flags, fingerprint/binding, conflict detection and result serialisation. This replaces the 48 copied helper sets.
- [ ] **M1.3** Migrate the container families: gap, padding, margin, direction, alignment, wrap, align-content, boxed/full width, min-height, radius, border, shadow, overflow, z-index, html tag, background/overlay/gradient, and opacity. Each migration ships a golden equivalence test (old resolver output == engine output on every existing fixture). Then delete the old file.
- [ ] **M1.4** Migrate the widget families: heading and text-editor colour, and every `button-*` family.
- [ ] **M1.5** Build one ordered composer that applies any set of families to one tree, with single key-ownership conflict handling. Responsive families must chain.
- [ ] **M1.6** Bundle the engine into the plugin preview and download path, so the plugin and CLI use the same code.
- [ ] **M1.7** M1 sync. Update `verify-readme-progress.mjs` so it no longer reads deleted resolver files, and replace those checks with engine-table checks.

*M1 acceptance:* all existing P15 behaviour tests pass through the engine. The resolution layer is under 5k LOC. The bundle contains the engine.

### M2 — Full single-frame Figma extraction

- [ ] **M2.1** Typography. Read the styled text segments: family, style/weight, size, line height, letter spacing, case, decoration and fill colour. Mixed spans become inline `<span style>`. Paragraphs become separate `<p>`, with `paragraphSpacing` mapped.
- [ ] **M2.2** Semantic widgets. Detect headings by relative size/weight rank, with the name as a secondary hint. Detect buttons as a frame with one text, a fill or stroke, and padding. Detect hyperlinks, dividers and spacers. Low confidence → text-editor + REVIEW.
- [ ] **M2.3** Sizing. FIXED/HUG/FILL on both axes maps to Elementor width/height, `content_width`, flex grow/shrink and basis. Map min/max width and height. The root frame width becomes the page content width.
- [ ] **M2.4** Visual styles. Map uniform and individual strokes to border, drop/inner shadows to box-shadow, layer opacity, linear and radial gradients, non-uniform radius, and `clipsContent` to overflow hidden.
- [ ] **M2.5** Absolutely positioned children map to `_position: absolute` with offsets relative to the parent, plus z-index from layer order.
- [ ] **M2.6** Map wrap to `flex_wrap`. Map a strict grid to a v3 Grid container: columns, rows and gaps.
- [ ] **M2.7** Map SPACE_BETWEEN, negative spacing (REVIEW where unsupported), baseline alignment, and child `layoutAlign`/`layoutGrow`.
- [ ] **M2.8** Font manifest: the families and weights used, with Google Fonts availability flagged. Non-Google fonts → REVIEW with an upload instruction.
- [ ] **M2.9** Golden landing-page fixture. Every visible property is either mapped or listed as REVIEW, with no silent drop. A partial template is allowed only with an explicit `REVIEW_ITEMS` list, and the user sees exactly what is missing (D-049).

### M3 — Assets

- [ ] **M3.1** Image bytes. Read original bytes through `figma.getImageByHash(hash).getBytesAsync()`. Produce the rendered appearance through `exportAsync` (PNG @1x/@2x). Export vectors and icons as SVG.
- [ ] **M3.2** Atomic asset-pack ZIP: Template JSON + `/assets/*` + manifest (hash, dimensions, alt text, usage).
- [ ] **M3.3** Elementor media references. The template references pack-relative asset ids, and an import guide plus an optional future WordPress companion handles media upload. The core stays network-free. Temporary Figma URLs are never emitted, which resolves the root cause of #856.
- [ ] **M3.4** Image widget sizing: width, height, object-fit and crop. Container background image: size, position and repeat.
- [ ] **M3.5** SVG icons → Icon or Image widget (SVG).
- [ ] **M3.6** Real-target harness. Import the asset pack into the disposable WordPress + Elementor instance (`p15-real-target-proof.yml`) and assert every image returns HTTP 200 in the render.

### M4 — Responsive breakpoint engine

- [ ] **M4.1** Breakpoint set. The user selects 2–3 frames, or a Section containing them. Classify them by width into desktop, tablet and mobile, using Elementor defaults ≤1024 tablet and ≤767 mobile; the classification is configurable per profile. The UI confirms the set.
- [ ] **M4.2** Deterministic node matcher. Go top-down per section and score candidate pairs on type, name, text digest, image hash, sibling order and normalised relative geometry. Use greedy matching with a confidence score. The output is a match map plus unmatched nodes.
- [ ] **M4.3** Merge. Desktop values form the base. Tablet and mobile diffs are emitted through the M1 engine as `_tablet`/`_mobile` keys. Order changes map to `_order_*`. Elements present on some breakpoints only map to `hide_desktop`/`hide_tablet`/`hide_mobile`.
- [ ] **M4.4** Mismatch policy. Nesting that differs in a way that cannot map → REVIEW with an explanation. The matcher never guesses.
- [ ] **M4.5** UI responsive report: per-section match status and confidence.
- [ ] **M4.6** Three-breakpoint golden fixture: the export renders at 1440, 1024 and 390 in the real-target harness.

### M5 — Smart target-ready duplicate and structure alignment

- [ ] **M5.1** Classifier v2. Count all visible children (text, image, vector). Decouple confidence from child count. Detect CENTER/MAX alignment and SPACE_BETWEEN. Add golden fixtures for 2–5 child sections.
- [ ] **M5.2** Recipes v2. Infer HUG/FILL sizing where geometry proves it. Support CENTER/MAX alignment. For non-uniform gaps, synthesise nested sub-stacks (create a wrapper). Every recipe is pixel-validated and rolled back on any violation.
- [ ] **M5.3** P14 multi-action plans: ordered actions, each validated, with rollback of the whole run.
- [ ] **M5.4** P14 pixel validation at full resolution, tiled with no downscale, with per-section budgets. Reuse `src/core/pixel-diff.ts`.
- [ ] **M5.5** Cross-breakpoint structure alignment of duplicates. Using the M4 match map, rename and wrap tablet and mobile duplicates so they share the desktop hierarchy. Visual geometry is never moved.
- [ ] **M5.6** Golden acceptance: at least 60% of the eligible containers on the golden fixtures are converted, with 0 pixel violations.
- [ ] **M5.7** `[!] MANUAL` Figma Desktop verification of the prepared duplicate on a real file. This is required before enabling the release activation of P14 duplicates.

### M6 — Real version-driven target profiles

- [ ] **M6.1** Option bank: Elementor v3-Container profile (3.16+/4.x) and v4-Atomic profile entries. Each profile's capability descriptor controls which property families export.
- [ ] **M6.2** Changing the target clears stale preview and validation results. The receipt carries the profile id and adapter version.
- [ ] **M6.3** R0 refresh for Elementor v4 Atomic.
- [ ] **M6.4** v4 Atomic adapter (`e-flexbox`, `e-div-block`, atomic heading/paragraph/image/button) over the same neutral IR, with its own validator.

### M7 — Round-trip visual proof

- [ ] **M7.1** Plugin "Export reference PNGs": per-breakpoint Figma frame renders at 1×, bundled with the export receipt.
- [ ] **M7.2** CI round-trip: render the imported template at each breakpoint width in the real-target harness, then compare it with the reference PNGs (`src/core/pixel-diff.ts` plus a structural metric) and produce a per-section report.
- [ ] **M7.3** Calibrate the thresholds on golden fixtures. Emit `ROUND-TRIP VERIFIED` only within threshold. Otherwise emit REVIEW with the diff regions.

### M8 — Gutenberg native export

- [ ] **M8.1** R0 refresh: the WordPress 6.8/6.9 core blocks, layout support and style engine.
- [ ] **M8.2** Neutral IR → block markup for group/row/stack, columns, heading, paragraph, image, buttons, spacer and cover, using the `style`/`layout` attributes.
- [ ] **M8.3** Validity: parse/serialise round-trip with pinned `@wordpress/blocks` in Node. Invalid → BLOCKED.
- [ ] **M8.4** Responsive strategy: document the core limits, use stack-on-mobile where possible, and mark the rest REVIEW.
- [ ] **M8.5** Real WordPress editor import and render harness in CI.

### M9+ — Remaining roadmap phases

These follow the existing P17–P27 order (`memory-bank/ROADMAP.md`). Each phase is rebuilt on the M1 engine and the M2–M4 extraction:

- P17/P18 code and React export get Figma-fed IR plus typography;
- P19 asset/token export reuses M3;
- P20 round-trip QA reuses M7;
- P21–P26 follow;
- P27 is the final release.

---

## 5. Milestone acceptance summary

| Milestone | Acceptance |
|---|---|
| M0 | The release build is usable: UI loads and Safe Fix can unlock in a traceable CI build. No subtree loss or silent drop. Duplicates sit beside the source. Tests are green. |
| M1 | The engine reproduces all existing P15 outputs, the old resolvers are deleted, and the plugin bundles the engine. |
| M2 | The golden landing page exports with zero silent drops, including typography and sizing. |
| M3 | Images and SVG ship in an atomic pack and load in the real-target render. |
| M4 | A three-breakpoint fixture imports as one responsive Elementor tree and renders at all widths. |
| M5 | ≥60% eligible conversion with 0 pixel violations, multi-action P14, and manual Figma verification recorded. |
| M6 | The profile selection really changes the adapter and output, and the v4 Atomic adapter is validated. |
| M7 | Per-breakpoint round-trip report, with calibrated thresholds and `ROUND-TRIP VERIFIED` labels. |
| M8 | Valid Gutenberg markup that passes parse/serialise and the real editor import. |

## 6. Runner tasks discovered by this plan

These are also recorded in `docs/RUNNER_BENCHMARK.md`.

| ID | Milestone | Workflow | Class |
|---|---|---|---|
| RQ-REC-M0-RELEASE-PLACEHOLDERS | M0.1–M0.2 | `ci.yml` release-package step | FINAL_BATCH |
| RQ-REC-M3-ASSET-IMPORT | M3.6 | `p15-real-target-proof.yml` | CONDITIONAL (blocking for M3 acceptance) |
| RQ-REC-M4-RESPONSIVE-RENDER | M4.6 | `p15-real-target-proof.yml` multi-width | CONDITIONAL (blocking for M4 acceptance) |
| RQ-REC-M7-ROUNDTRIP | M7.2 | real-target harness + pixel compare | CONDITIONAL (blocking for M7 acceptance) |
| RQ-REC-M8-GUTENBERG-EDITOR | M8.5 | new WordPress editor harness | CONDITIONAL (blocking for M8 acceptance) |
