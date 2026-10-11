# Product Recovery Plan: the canonical build backlog

Status: **ACTIVE / CANONICAL**
Established: 2026-10-08
Baseline main audited: `9fdbe6f16d56f77cbfaa179cda0b0ace25f307f6`
Owner branch for the first train: `claude/youthful-ritchie-uch0qp`

> **RESUME POINTER**: the machine copy is in `.ai/state/CURRENT-STATE.yaml` under `recovery_program`.
>
> - Active milestone: **M3 — Assets** (M2 accepted: PR #907, exact head `ff86754`, 10/10 checks green, merged as `850c517`; golden landing page with zero silent drops)
> - Next task: **M3.2** (atomic asset-pack ZIP)
> - Last completed task: **M3.1** (asset collector)

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
- [x] **M0.12** _(done 2026-10-08: PROJECT_STATE, NEXT_ACTIONS, ROADMAP, CHANGELOG, README row, Runner rows and checkpoint synced once for M0.)_ M0 milestone sync, done once per R5: memory-bank, README module row and changelog.

### M1 — Table-driven Elementor mapping engine

- [x] **M1.1** _(done 2026-10-08: added `src/targets/elementor/mapping-engine/property-family.ts` (`ContainerPropertyFamily`, `responsiveSettingKey`), `codecs.ts` (px number, dimensions box, gap axes, hex colour, enum, switcher) and `shared-validation.ts`; tests in `m1-mapping-engine-codecs`. The typography-group, box-shadow, gradient and border codecs are added with the families that consume them (M1.3d, M1.4), so every encoding is proven by golden equivalence rather than written speculatively.)_ Define the `PropertyFamily` schema: `family`, `target kind`, `devices`, `key(device)`, value codec, `requires`/`conflictsWith`, and evidence (Elementor version, source path, SHA). Add value codecs: `dimension`, `dimensions box`, `color`, `typography group`, `box-shadow`, `gradient`, `border`, `enum`, `boolean`.
- [x] **M1.2** _(done 2026-10-08: `mapping-engine/container-family-engine.ts` owns the full manifest/authority/binding/conflict/rebuild/summary/serializer contract (`resolveContainerPropertyFamily`, `serializeContainerPropertyFamilySummary`). The golden baseline `tests/golden/m1-responsive-{gap,padding,margin}.golden.json` (118 cases) was recorded from the original resolvers with `GOLDEN_WRITE=1`, and `tests/m1-container-family-golden.test.ts` replays it.)_ Create one shared module for the manifest envelope, authority flags, fingerprint/binding, conflict detection and result serialisation. This replaces the 48 copied helper sets.
- [x] **M1.3** Migrate the container families. This is split into M1.3a–d, and each part ships its golden baseline before the switch:
  - [x] **M1.3a** spacing _(done 2026-10-08: gap, padding and margin are families in `mapping-engine/families/responsive-spacing.ts`; the resolver files are thin typed wrappers, about 2,120 lines down to 436; 118/118 golden cases are identical and the original resolver tests pass unchanged; the README verifier now checks the gap-axis family table)._
  - [x] **M1.3b** layout _(done 2026-10-08):_
    - direction, wrap and alignment are `responsiveEnumFamily` definitions in `mapping-engine/families/responsive-layout.ts`; about 2,070 lines became 596.
    - 112/112 golden cases recorded from the original resolvers (commit `baaa286`) are identical, and the original tests pass.
    - The engine gained per-family issue-code and message overrides, binding-issue ordering and an all-conflicts mode.
    - Scope moved: text-alignment and button-alignment bind widgets, so they move to M1.4. Align-content is chained on the wrap result (a wrapped-candidate base), so it moves to M1.5.
  - [x] **M1.3c** flex item and sizing _(done 2026-10-08):_
    - Nine families moved onto the shared `responsiveEnumFamily` factory: align-self, basis, factors, order preset, custom order, min-height, boxed width, full width and z-index. Their codecs live in `mapping-engine/families/responsive-flex-item-sizing.ts` and `codecs.ts`.
    - Golden equivalence: 333/333 cases recorded from the original resolvers (commit `bc805ef`) are identical.
    - The engine gained parse-time condition codes with path suffixes, `extraIssueSuffixes`, a bound-target `precondition` hook, writes without a conflict check, required entry fields, type/value pairs, leading writes and an authority-message override.
    - The original contract wording, typos included (for example "min-height" in the z-index and boxed-width conflict messages), is preserved exactly.
    - Resolver files shrank by about 5,200 lines.
    - The README verifier now checks the family tables.
  - [x] **M1.3d** container styles _(done 2026-10-08):_
    - Nine families now run on the engine:
      - through the new `containerStyleFamily` factory in `mapping-engine/families/container-style.ts`: border style, hover border style, hover background colour, overlay colour, hover overlay colour, overflow and semantic HTML tag;
      - through the existing `responsiveEnumFamily` factory: responsive border radius and responsive hover border radius.
    - Golden equivalence: 371/371 cases recorded from the original resolvers (commit `03230aa`) are identical. The original resolver tests and the `container-style-composition` tests pass unchanged.
    - The engine gained:
      - required entry keys for exact-entry envelopes;
      - leading family authority flags (`styleInferencePerformed`);
      - a binding-missing message override;
      - conflict ranks, so a conflict is reported in the contract's order while writes keep their original order.
    - New codecs: `lowerHexColorCodec`, `hundredthsOpacityCodec`, `elementorLinkedDimensionsPx` and `intDimensionsBoxCodec`.
    - Resolver files shrank from 6,167 lines to 1,710.
    - Scope moved to M1.5: box-shadow, the linear and radial gradient compositions, the overlay-visual and hover-transition compositions, and `container-style-composition`. These are compact compositions with their own result shape (for example `BLOCKED | REJECTED | RESOLVED` with bare issue strings), not manifest-bound families, so they belong to the one ordered composer. They stay unchanged until then.
- Original M1.3 wording, for reference: migrate the container families: gap, padding, margin, direction, alignment, wrap, align-content, boxed/full width, min-height, radius, border, shadow, overflow, z-index, html tag, background/overlay/gradient, and opacity. Each migration ships a golden equivalence test (old resolver output == engine output on every existing fixture). Then delete the old file.
- [x] **M1.4** Migrate the widget families: heading and text-editor colour, and every `button-*` family. This is split into M1.4a–d, and each part ships its golden baseline before the switch:
  - [x] **M1.4a** text widgets and alignment _(done 2026-10-09):_
    - The engine gained a bound-target abstraction (`FamilyTarget`): the manifest array field, result count fields, the not-target issue, source collection and generated-tree binding. Containers stay the default.
    - `mapping-engine/widget-binding.ts` holds one lockstep widget binder (`widgetTarget`) that reproduces the four hand-written binders exactly, plus the Heading, Text Editor and Button base-setting matchers.
    - Moved onto the engine: heading text colour and text-editor text colour (`containerStyleFamily`), responsive button alignment (`responsiveEnumFamily`) and responsive text alignment (a node-aware family that accepts `justify` only for text and reports `nodeKind`).
    - Golden equivalence: 150/150 cases recorded from the original resolvers (commit `3054cff`) are identical. The golden corpus gained a widget source.
    - Resolver files shrank from 3,151 lines to 772, plus the 164-line shared widget binder.
  - [x] **M1.4b** button colour and content _(done 2026-10-09):_
    - `buttonWidgetTarget` in `mapping-engine/widget-binding.ts` is the one `buttons` target every `button-*` family binds through. Its `buttonBaseSettingsMatch` checks text, desktop alignment and link exactly as the copied per-resolver binders do.
    - Moved onto the engine:
      - text, background, hover text, hover background and hover border colour, through `containerStyleFamily`;
      - content metadata (type, size, CSS id, with every conflict reported);
      - stretch/content alignment, which rejects a source Button that already has an explicit alignment.
    - The engine gained:
      - omitted shared authority flags (content metadata carries no `responsiveClosureClaim`);
      - an entries-invalid message override;
      - a `serializerId` for refusals that name a copied slug. The background and hover text colour serializers keep the original `button-text-color` wording.
    - Golden equivalence: 270/270 cases recorded from the original resolvers (commit `242ae5b`) are identical.
    - Resolver files shrank from 5,656 lines to 1,327.
  - [x] **M1.4c** button style _(done 2026-10-09):_
    - `mapping-engine/families/border-style.ts` holds one `borderStyleFamily` for the Elementor border group. The container, container hover and Button border-style contracts now share it, since their wording differs only in subject and noun.
    - `mapping-engine/families/button-style.ts` holds bounded text-shadow, box-shadow and responsive-radius codecs, plus the Elementor box-shadow position encoding.
    - Moved onto the engine: Button border style, visual depth/radius, responsive padding (every conflict reported), icon basics (a Font Awesome class/library pair, alignment and indent) and hover interaction (box shadow, transition, core animation).
    - The engine and factories gained:
      - a complete authority-flag order (the icon contract interleaves `iconInferencePerformed` and `svgImportPerformed`);
      - `requireAny` entry checks;
      - `'defined'` optional fields (an explicit `undefined` counts as absent);
      - flag and refusal-slug passthrough in `responsiveEnumFamily`.
    - Golden equivalence: 202/202 cases recorded from the original resolvers (commit `a97a415`) are identical. The 9 M1.3d container style goldens still pass on the shared border factory.
    - Resolver files shrank from 4,443 lines to 1,104.
  - [x] **M1.4d** button typography and gradients _(done 2026-10-09):_
    - Moved onto the engine:
      - typography basics and typography metrics: any existing `typography_*` setting refuses the whole group;
      - responsive typography metrics: the starter is enabled without a check, and only the device keys are conflict-checked;
      - linear and radial gradients, through `mapping-engine/families/button-gradient.ts`. Normal conflicts rank before hover, and the requested-key order differs from the write order.
    - The engine gained:
      - a `conflictScan` hook for group-wide refusals;
      - a separate manifest-message subject.
    - `button-style.ts` gained the safe-integer, stepped-number and group-prefix helpers.
    - `tests/m1-mapping-engine-conflicts.test.ts` exercises the engine conflict paths directly: rank order, all mode, unchecked enabling writes and `conflictScan`. The generated base never carries these settings, so no golden case reaches them.
    - Golden equivalence: 199/199 cases recorded from the original resolvers (commit `786a2c9`) are identical.
    - Resolver files shrank from 4,384 lines to 1,098.
    - The README verifier reads each gradient resolver together with its shared family.
    - `button-color-composition` moves to M1.5 with the other compositions.
  - M1.4 totals: 21 widget resolvers on the engine, with 821 golden cases identical.
  - Not property families, so outside M1: `image-asset-resolution.ts` and `semantic-resolution.ts` rewrite the neutral IR before generation; they do not write Elementor settings.
- [ ] **M1.5** Build one ordered composer that applies any set of families to one tree, with single key-ownership conflict handling. Responsive families must chain. Also absorbs align-content (chained on wrap) and the container compositions moved from M1.3d: box-shadow, linear/radial gradient, overlay visual, hover transition and `container-style-composition`. This is split into M1.5a–f, and each part ships its golden baseline before the switch:
  - [x] **M1.5a** ordered composer _(done 2026-10-09):_
    - `mapping-engine/composer.ts` holds one ordered composer (`composeFamilies`, `serializeCompositionSummary`). Each family still runs its own exact resolver. The composer applies the families in spec order, whatever the manifest key order, and merges only allowlisted new keys. It has two merge strategies: through the container binding, or a whole-tree walk that only lets accepted widget kinds change.
    - Key ownership is single: a key belongs to the base candidate or to exactly one family. A second writer is a `KEY_CONFLICT`, never an overwrite.
    - `container-style-composition` (8 families) and `button-color-composition` (5 families) are now composer specs. They went from 438 lines to 157, plus the 282-line shared composer.
    - Hardening: each family's template must equal its own candidate, and its resolved status must be that family's own status, not any family's. Real resolvers already satisfy both, so outputs are unchanged.
    - Golden equivalence: 111/111 cases recorded from the original compositions (commit `ceec371`) are identical. `tests/m1-composer.test.ts` covers the ordering, ownership, drift and serializer refusals the public compositions cannot reach.
  - [x] **M1.5b** responsive chaining _(done 2026-10-09):_
    - The engine now supports chained families (`FamilyChain` in `property-family.ts`). A chained family names a prerequisite family. The engine resolves that family first and blocks unless it is ready. It binds the manifest to the prerequisite's exact resolved candidate digest, writes on top of that candidate and gives the prerequisite result to `parseEntry`. An entry refusal may now carry several issues.
    - Align-content is a chained family on responsive wrap (`BLOCKED_WRAP_PREREQUISITE`, `wrappedCandidateIdentityDigest`, `WRAP_REQUIRED` per breakpoint). The resolver went from 771 lines to 216.
    - Golden equivalence: 148/148 cases recorded from the original resolver (commit `4b2ea19`), across four wrap prerequisites (wrap on both breakpoints, tablet only, none, invalid), are identical.
  - [x] **M1.5c** box-shadow and hover transition _(done 2026-10-09):_
    - Both are engine families: box-shadow on the new normal/hover `statePairFamily` factory (`mapping-engine/families/state-pair.ts`), and hover transition on the enum factory with an exact seconds codec. They went from 282 lines to 242, plus the 83-line shared factory, and the old ad-hoc result shapes are gone.
    - Contract: each publishes the standard engine result under a new result version (`p15-container-box-shadow-result-v2`, `p15-elementor-container-hover-transition-result-v2`). The v1 manifests are unchanged. `container-style-composition` now expects `CONTAINER_BOX_SHADOWS_RESOLVED`.
    - Write equivalence: the baseline (commit `1670b0c`) records which corpus cases each original accepted and the exact settings it wrote. The engine versions accept the same cases and write identical settings, with a candidate that always matches the template. The one deliberate change: an empty transition entry list is a no-op (`NO_*_OVERRIDES`), not an invalid manifest. The 111 composition goldens are still identical.
    - The shared engine serializer is stricter: issues must be exactly `code`/`path`/`message`, accepted results carry no issues and refusals at least one. Every existing golden still passes.
  - [x] **M1.5d** page composition _(done 2026-10-09):_
    - `page-composition.ts` (`composeP15ElementorPage`, `p15-elementor-page-composition-v1`) applies, in one composer call, direction, wrap, align-content, alignment, gap, padding, margin, the Container style composition and the Button colour composition to one tree. Nested compositions are ordinary steps.
    - The composer gained per-step node acceptance and chained steps: `after` names an earlier step, the chained step is diffed against that step's result, and its `baseDigestField` must equal that step's resolved digest. Align-content chains on wrap. Without its wrap step it is `FAMILY_REJECTED`.
    - `tests/m1-page-composition.test.ts` proves three things: every single-family page equals that family resolved alone; the full page is exactly the base plus every family's own additions; and manifest key order never changes the result. Stale nested bindings, a wrong wrapped digest and authority inflation are refused.
  - [x] **M1.5e** container gradient target repair _(done 2026-10-09):_
    - R0 evidence: in Elementor 4.2.4 `includes/controls/groups/background.php` (blob `ac8e1a5`, matching the recorded evidence), `color_stop`, `color_b_stop` and `gradient_angle` are SLIDER controls, and the CSS reads `{{color_stop.SIZE}}{{color_stop.UNIT}}`. v1 wrote bare numbers. The v1 radial composition also returned the unchanged linear candidate.
    - The linear and radial Container gradients are engine `statePairFamily` families on the proven Button gradient codec and writes (`families/button-gradient.ts`, prefixes `background`/`background_hover`). The Button goldens are unchanged. Contract: manifest and result v2. Inputs are integer stops 0..100 with stopA ≤ stopB, tablet/mobile stop pairs, integer angles, and the nine documented radial positions, plus responsive radial positions (`gradient_position` is responsive in 4.2.4).
    - The two files went from 60 dense lines to 187 readable ones. The radial candidate is now always rebuilt from its exact writes.
    - Diff proof: `tests/m1-container-composition-family-golden.test.ts` checks the v2 writes against the v1 write baseline. They are exactly the v1 writes with slider encoding. Exactly 7 corpus cases change acceptance, each listed with its reason: unpaired responsive stops are refused, an empty list is a no-op, and unknown radial entry keys are refused.
    - This is a local contract repair only. No real-target render is claimed: real-target proof stays with the P15 harness and #846.
  - [x] **M1.5f** overlay visual target repair _(done 2026-10-09):_
    - R0 evidence (Elementor 4.2.4):
      - `includes/controls/groups/base.php` (blob `6117c06`, line 324): every CSS-filter field needs its popover starter `<group>_css_filter` to be non-empty.
      - `includes/controls/groups/css-filter.php` (blob `5ab0523`): the filter sliders are declared in `px` only.
      - `includes/elements/container.php` (blob `3486766`, lines 834–890): the normal `css_filters` and `overlay_blend_mode` need an overlay colour or image.
    - v2 (manifest and result) is an engine family chained on the Container overlay-colour family. It writes `css_filters[_hover]_css_filter: 'custom'` and `{ unit: 'px', size, sizes: [] }` sliders. It refuses normal filters or a blend mode on a container without an explicit overlay colour (`OVERLAY_COLOR_REQUIRED`), while hover filters need none. It binds the source fingerprint and the exact overlay-colour candidate digest, refuses authority inflation, unknown keys and empty filter objects, and blocks on an invalid overlay-colour prerequisite.
    - Diff proof: `tests/m1-container-overlay-visual-golden.test.ts` against the v1 write baseline (commit `41d0a21`). The v2 writes are exactly the v1 writes plus the starter keys, px sliders and the prerequisite's own overlay-colour keys. The 17 cases v1 wrongly accepted (stale bindings, authority inflation, unknown keys, empty filters) are all refused, each with its listed reason.
    - This is a local contract repair only. No real-target render is claimed.
  - M1.5 totals: one ordered composer with chained steps, a page composition, chained engine families, and 7 more resolvers/compositions on the engine (align-content, box-shadow, hover transition, linear and radial gradients, overlay visual, plus the 2 compositions). Three target defects were repaired with Elementor source evidence.
- [x] **M1.6** _(done 2026-10-09):_ Bundle the engine into the plugin preview and download path, so the plugin and CLI use the same code.
  - `export-pipeline.ts` (`buildP15ElementorExport`, `p15-elementor-export-pipeline-v1`) is the one export path. The neutral source always goes through the v3 generator first. Without a page manifest the generated base candidate is the export, byte for byte. With one, the page composition applies the requested families, and only a RESOLVED composition yields a candidate.
  - The plugin preview/download extractor now runs through it. The plugin has no manifest source yet (M2/M4 supply one), so its output is unchanged.
  - The CLI gains `export:elementor --input <ir.json> [--page-manifest <m.json>]`. It writes `elementor-template.json` and `elementor-export-summary.json` atomically, only for a ready candidate; otherwise it exits 3 and writes nothing.
  - `tests/m1-export-pipeline.test.ts` proves: the no-manifest output equals the generator's output; a manifest's output equals the page composition's; refusals give no candidate; the bundled CLI behaves end to end; and the bundled plugin contains the engine and the page composition. The release package builds and is byte-reproducible locally.
- [x] **M1.7** _(done 2026-10-10)_ M1 sync. Update `verify-readme-progress.mjs` so it no longer reads deleted resolver files, and replace those checks with engine-table checks.
  - No resolver file was deleted: each is now an aliasing wrapper. The verifier gained the engine authority-refusal check and reads `FamilyAuthorityFlag` contracts (M1.8). PROJECT_STATE, NEXT_ACTIONS, ROADMAP, CHANGELOG, DECISIONS (D-050), the README row, the Runner ledger (`RQ-REC-M1-ENGINE-TRAIN`) and the checkpoint are synced.

- [x] **M1.8** _(done 2026-10-09; commits `9604ce2`, `0b8065c`, `1c82a50`, `1783fe6`)_ Collapse the wrapper contracts. `mapping-engine/contract-types.ts` gives every engine family generic manifest, result, status and issue-code types (`FamilyManifestV1`, `FamilyResultV1`, `FamilyStatus`, `FamilyIssueCode`) and one typed `familyApi` resolve/serialize pair. Each wrapper keeps its exported names as aliases and drops its hand-written interfaces, with no runtime change and every golden identical.

  - Result: all 50 engine wrappers plus button-icon-basics now declare one `Contract` and alias their exported Manifest, IssueCode, Issue, Status and Result names. No hand-written envelope interfaces remain. Issue-code unions only widen to the shared suffix set. Every golden is identical, and the full suite (335 files, 1979 tests), typecheck, `status:verify` and the builds pass.
  - The README verifier now accepts a `<flag>: false` fragment when the family declares that flag in its `FamilyAuthorityFlag` contract. It separately checks that the shared engine refuses authority-inflated manifests and results. A negative check (removing a declared flag) fails the verifier as expected.
  - Measured after M1.8: the wrappers are 6.8k lines (2.6k family tables/constants/codecs, 1.5k domain types and Contract blocks, 1.0k comments, 1.0k evidence, 0.7k imports) plus the 2.6k engine, so 9.3k total, down from 11.7k before M1.8 and about 36.0k at the audited baseline. An interim under-7k bar was not met. The remaining reduction is only available from evidence, comments or dense code, so the user accepted 9.3k (D-050).

*M1 acceptance (D-050):* all existing P15 behaviour tests pass through the engine. No family wrapper carries hand-written manifest/result/issue/status interfaces, and every Elementor evidence block, message and comment is kept (measured 9.3k lines, from about 36.0k). The bundle contains the engine. **Accepted 2026-10-10:** PR #900 exact head `69ccfd1` passed 11/11 checks with zero review threads and was merged as `47ada79` (`RQ-REC-M1-ENGINE-TRAIN` DONE).
  - Revised 2026-10-09 and again 2026-10-10 by user decision (D-050). The original bar was "under 5k LOC". Measured at M1.7, the layer was about 11.7k lines (from about 36.0k at the audited baseline): 2.5k engine, plus 9.5k of wrappers made of 2.9k duplicated types, 2.1k constants/codecs/messages, 1.2k comments, 1.2k family tables, 1.0k evidence, 0.6k functions and 0.6k imports. Under 5k could only be reached by stripping evidence, messages and comments or packing code into dense lines, which repeats the defect pattern M1.5 removed.

### M2 — Full single-frame Figma extraction

- [x] **M2.1** _(done 2026-10-10)_ Typography. Read the styled text segments: family, style/weight, size, line height, letter spacing, case, decoration and fill colour. Mixed spans become inline `<span style>`. Paragraphs become separate `<p>`, with `paragraphSpacing` mapped.
  - R0 evidence (Elementor 4.2.4, tag commit `0e29220`): `includes/widgets/text-editor.php` (blob `72ff868`) has the `typography` group, `text_color` and the responsive `paragraph_spacing` slider. `includes/controls/groups/typography.php` (blob `eea951b`) has the font_family/size/weight/transform/style/decoration/line_height/letter_spacing fields, using the same `typography_*` + `custom` starter encoding the Button families already use.
  - Neutral IR (same IR version; additive optional fields, so existing fingerprints and every M1 golden are unchanged): a text node may carry `typography` (family, weight 100..900, italic, size, line height, letter spacing, case, decoration, lowercase hex colour), `paragraphs` of `spans` (each span holds only its differences, and the spans must join back to exactly `text`), and `paragraphSpacingPx`. It also gains a new issue code, `P15_IR_TYPOGRAPHY_INVALID`.
  - Generator: writes the `typography_*` group with px sliders, `text_color` and `paragraph_spacing`. Each paragraph becomes its own `<p>` (empty lines become `<p></p>`, soft breaks `<br>`). Styled runs become `<span style>`, whose CSS is built only from validated values, so no caller text reaches a style attribute. The family binding helper builds the same HTML (`typography.ts`).
  - Extractor: reads `getStyledTextSegments`. The style covering most characters becomes the node typography. Percentage line height and letter spacing convert to px. Small caps, gradient/translucent/multiple text fills, weights outside 100..900, out-of-bounds values and runs that would have to unset a property become explicit style reviews. Uniform single-paragraph text keeps its old HTML.
  - Tests: `tests/m2-typography.test.ts` covers extraction, refusals, IR validation (including style-injection attempts) and generator output.
- [x] **M2.2** Semantic widgets (split into M2.2a–c). Detect headings by relative size/weight rank, with the name as a secondary hint. Detect buttons as a frame with one text, a fill or stroke, and padding. Detect hyperlinks, dividers and spacers. Low confidence → text-editor + REVIEW.
  - [x] **M2.2a** headings _(done 2026-10-10)_:
    - `semantic-detection.ts` (`detectP15Headings`) runs on the extracted IR. The body size is the font size covering the most characters. A uniform, single-paragraph, non-justified text of at most 160 characters becomes a heading at ≥1.25× the body size, or ≥1.1× with weight ≥600. Levels rank distinct heading sizes, largest first (h1..h6). An `h1`..`h6` layer name sets the level.
    - A layer named as a heading that the rule does not support gets `HEADING_DETECTION_REQUIRES_REVIEW`, unless the document has a single font size and so no rank. Text without typography is never touched.
    - Headings carry `typography`. The generator writes the heading `typography` group and `title_color` (heading.php blob `5b193f9`).
    - Tests: `tests/m2-semantic-headings.test.ts`.
  - [x] **M2.2b** buttons _(done 2026-10-10)_:
    - `detectP15Buttons` runs before heading detection. A container whose layer name says button/btn/cta, whose only child is a uniform single-line text of at most 80 characters, with a solid background, non-zero padding and no style reviews, becomes a native button carrying text, typography, background, padding and radius. Without the name hint the frame and text are left as they are: they already render the same visuals, so badges and chips are never guessed into buttons. A button-named frame that does not match gets `BUTTON_DETECTION_REQUIRES_REVIEW`.
    - Generator: the button style uses the Button families' proven keys (`typography_*` + `button_text_color`, `background_background`/`background_color`, `text_padding`, `border_radius`).
    - Outline-only buttons need stroke mapping (M2.4).
    - Tests: `tests/m2-semantic-buttons.test.ts`.
  - [x] **M2.2c** hyperlinks, dividers and spacers _(done 2026-10-10)_:
    - R0 evidence (Elementor 4.2.4): `includes/widgets/divider.php` (blob `7dfbea2`) has `style` (solid), `color`, `weight` (px slider 1..10, step 0.1) and `width`. `includes/widgets/spacer.php` (blob `b1c14d7`) has `space` (px slider).
    - Divider: a horizontal LINE with one opaque solid stroke of 0.1..10px, or a thin solid RECTANGLE (height ≤10px, width ≥4× height). A line that cannot map exactly gets `DIVIDER_REQUIRES_REVIEW`.
    - Spacer: an empty, unpainted leaf FRAME/RECTANGLE inside a vertical Auto Layout becomes its height. In a row it keeps its previous handling, because the Elementor spacer is vertical only.
    - Links: a URL link across the whole text becomes a node `href` (the text editor wraps it in `<a>`, a heading writes its `link` control, a button label becomes the button URL). Partial links become `<a>` runs. Links to Figma nodes and unsafe URLs become `LINK_TO_NODE_REQUIRES_REVIEW` / `LINK_URL_REQUIRES_REVIEW`. URL validation is now one shared rule (`link-url.ts`).
    - Capability registry, by user decision: `v2` = `v1` + divider + spacer. Each candidate is stamped with the **lowest covering version**. A template using only the v1 widgets stays `v1` with byte-identical identity, so every golden and the retained real-target reference stay valid. Only templates using divider/spacer are `v2`. The 4.2.4 target profiles still declare `v1`, so a `v2` candidate is honestly reported as not covered by them until a profile is extended (M6).
    - Identity coverage fix (commit `7e964af`): the neutral IR fingerprint now covers typography, paragraphs, links, button style, dividers, spacers and style reviews.
    - Tests: `tests/m2-rules-and-links.test.ts`, `tests/m2-identity-coverage.test.ts`.
- [x] **M2.3** Sizing. FIXED/HUG/FILL on both axes maps to Elementor width/height, `content_width`, flex grow/shrink and basis. Map min/max width and height. The root frame width becomes the page content width.
  - [x] **M2.3a** Exact container sizing (`src/targets/elementor/container-sizing.ts`; R0: `container.php` blob `3486766`, `flex-item.php` blob `dc95ad4`, `_container.scss` blob `d6c65cb`). Only cases with an exact CSS equivalent are written:
    - Root frame width → `content_width: full` + `width` px. Elementor centres a top-level container with `max-width: min(100%, var(--width))`, so the page is exactly the frame width and keeps the frame's own background bounds (chosen over `boxed`, whose outer box is full-bleed).
    - FIXED width → `content_width: full` + `width`; FIXED height, or a minimum height on a non-fixed height → `min_height`; FIXED on the parent's main axis → `_flex_size: none`.
    - FILL on a column's main axis → `_flex_size: grow`; FILL on a row's main axis keeps the default `width: 100%; flex: 0 1 auto`, which fills what fixed siblings leave; FILL across a row under a non-stretch parent → `_flex_align_self: stretch`.
    - REVIEW: `SIZE_CONSTRAINT_REQUIRES_REVIEW` (minWidth, maxWidth, maxHeight), `SIZE_FILL_DISTRIBUTION_REQUIRES_REVIEW` (more than one FILL child in a column with free height), `SIZE_OUT_OF_RANGE`.
    - IR: optional container `sizing` (validated, in the source identity). Tests: `tests/m2-sizing.test.ts`.
  - [x] **M2.3b** HUG and heading/text widget sizing (same module; extra R0: `common-base.php` blob `77c497b` `_element_width`/`_element_custom_width`, `base-units.php` blob `6ec6d40` custom unit renders its size verbatim, `_global.scss` blob `c844122` every element is `flex: 0 1 auto` by default, `heading.scss`/`text-editor.scss` set no container width; `flex-container.php` blob `ce9e412` gives only divider/spacer the row `--container-widget-*` behaviour).
    - HUG container width → `content_width: full` + `width: {unit: custom, size: fit-content}`; FIXED or HUG on the main axis → `_flex_size: none` (Figma never shrinks either).
    - FILL along a row (containers by default, widgets via `_element_custom_width: 100%`) gives every FILL item the same 100% basis and shrink, so they split the free width equally, as Figma does. Multi-FILL review therefore stays column-only and now counts widgets too.
    - Heading/text: FIXED width → `_element_width: initial` + `_element_custom_width` px; FILL across a non-stretch parent → `_flex_align_self: stretch`; FILL on a column's main axis → `_flex_size: grow`. A FIXED text height → `SIZE_WIDGET_HEIGHT_REQUIRES_REVIEW`; any min/max on a widget → `SIZE_CONSTRAINT_REQUIRES_REVIEW`. Sizing follows a text into its detected heading and is in the identity.
  - [x] **M2.3d** Button and divider sizing (R0: `general/_button.scss` blob `2300e58`, `_global.scss` blob `c844122` button alignment mixin, `button-trait.php` blob `31192aa`, `divider.php` blob `7dfbea2`, `divider.scss` blob `96c448b`).
    - Buttons: semantic detection now receives the frame's Figma sizing facts from the extractor. HUG → `_flex_size: none`; FIXED/FILL width → widget width (as for text) plus `align: justify` (`.elementor-button { width: 100% }`) plus the frame's label alignment as `content_align` start/end (centred by default). A FIXED height must equal padding + px line height, else `SIZE_BUTTON_HEIGHT_REQUIRES_REVIEW`; FILL height and constraints are REVIEW; an unmappable label alignment is `BUTTON_LABEL_ALIGNMENT_REQUIRES_REVIEW`. Button nodes gain validated `sizing` and `styleReviews`; container/label `SIZE_*` reviews no longer block the button shape (they are re-derived for the button).
    - Divider repair (M2.2c): the `gap` control defaults to 15px padding above and below the line, so `gap: 0` is written; a column's center/end cross alignment becomes the divider `align`; a FILL line keeps the default 100% width; a divider inside a row (where the widget grows) is `DIVIDER_IN_ROW_REQUIRES_REVIEW`. The rendered effect of `gap: 0` (below the editor's 2px slider minimum) is part of the M6 real-render proof.
    - Image widget sizing stays with **M3.4**: no image widget is extracted before M3, and every image fill is already explicit REVIEW. Spacers keep their own height.
    - Tests: `tests/m2-sizing-buttons-dividers.test.ts`.
  - [x] **M2.3c** Target repair of the M1 responsive flex-item factors family. `flex-item.php` conditions `grow`/`shrink` on `size === 'custom'`, and `controls-stack.php` `is_control_visible` (blob `00b280e`) reads the same-device `size` first, so the v1 `_flex_grow_*`/`_flex_shrink_*` writes were ignored by Elementor. The family (manifest/result `v2`) now also writes `_flex_size_tablet`/`_flex_size_mobile: 'custom'` for each device that sets a factor, with a base-conflict check; a desktop `_flex_size` from M2.3 sizing is kept. The engine gained entry-dependent `conditionWrites`. `tests/m1-container-family-golden-sizing.test.ts` proves v2 = the never-re-recorded v1 golden plus exactly those writes and evidence fields.
- [x] **M2.4** Visual styles. Map uniform and individual strokes to border, drop/inner shadows to box-shadow, layer opacity, linear and radial gradients, non-uniform radius, and `clipsContent` to overflow hidden.
  - [x] **M2.4a** Container borders, non-uniform radii and clipping (`src/targets/elementor/container-visual-style.ts`; R0: `container.php` blob `3486766` Border group/`border_radius`/`overflow`, `_global.scss` blob `c844122` `box-sizing: border-box` inside `.elementor`).
    - One visible, opaque, solid INSIDE stroke (uniform or per side, 0-100px) → `border_border: solid` + `border_width` + `border_color`. Figma draws an INSIDE stroke over the content while a CSS border moves it, so the padding is lowered by the border width per side (unless `strokesIncludedInLayout`); a stroke wider than its padding, CENTER/OUTSIDE, dashes, translucent/gradient/multiple paints stay `STROKE_REQUIRES_REVIEW`.
    - Non-uniform corner radii → `border_radius` (TOP RIGHT BOTTOM LEFT = top-left, top-right, bottom-right, bottom-left) unless a corner exceeds half the shorter side (Figma clamps per corner, CSS scales all).
    - `clipsContent` → `overflow: hidden` only where the clip is visible (a child extends past the frame, or a rounded frame with children); this replaces `CLIPPED_OVERFLOW_REQUIRES_REVIEW` on containers.
    - A button-named frame with a border or non-uniform radius stays an exact container with `BUTTON_DETECTION_REQUIRES_REVIEW` (the Button widget border mapping is not built yet).
    - Tests: `tests/m2-visual-borders.test.ts`.
  - [x] **M2.4b** Drop and inner shadows (`src/targets/elementor/container-shadow.ts`; R0: `groups/box-shadow.php` blob `1c068c9`, `controls/box-shadow.php` blob `e55cf9a` whose own default colour `rgba(0,0,0,0.5)` proves a CSS colour string is stored). Exactly one visible DROP_SHADOW/INNER_SHADOW with normal blending → `box_shadow_box_shadow_type: yes` + `box_shadow_box_shadow` {horizontal, vertical, blur, spread, color} + position `' '`/`inset`; a translucent colour is written `rgba(r,g,b,a)` (alpha to two decimals), an opaque one `#rrggbb`. Several shadows, blurs, other blend modes, `showShadowBehindNode` and values outside -100..100 (blur 0..100) stay `EFFECT_REQUIRES_REVIEW`; text shadows stay review. Tests: `tests/m2-visual-shadows.test.ts`.
  - [x] **M2.4c** Gradient container backgrounds (`src/targets/elementor/container-gradient.ts`; R0: `groups/background.php` blob `ac8e1a5`), in the repaired M1.5e slider encoding (`background_background: gradient`, colours, `%` stop sliders, `deg` angle slider / `background_gradient_position`). Elementor holds two stops, so only two-stop opaque gradients map. Linear maps when the gradient runs along one axis (180/0deg vertical, 90/270deg horizontal; stop positions follow the handles linearly); diagonals depend on the aspect ratio in CSS → `GRADIENT_REQUIRES_REVIEW`. Radial maps for the default centred transform with stops divided by √2 (CSS farthest-corner ellipse vs Figma's edge-touching one). Translucent/blended paints, more stops and stops outside the box are review. Reading `gradientTransform` as the layer→gradient-space matrix is an assumption the M6 real-render proof must confirm. Tests: `tests/m2-visual-gradients.test.ts`.
  - [x] **M2.4d** Layer opacity R0: Elementor 4.2.4 core has no opacity control for Containers or widgets (`container.php` blob `3486766` has only `background_overlay_opacity`, `common-base.php` blob `77c497b` none; `groups/css-filter.php` has no opacity term). Layer opacity therefore stays `LAYER_OPACITY_REQUIRES_REVIEW` rather than being faked through a background overlay or custom CSS. The Image widget's own `opacity` control belongs to **M3.4**.
- [x] **M2.5** Absolutely positioned children map to `_position: absolute` with offsets relative to the parent, plus z-index from layer order _(done 2026-10-10)_.
  - `src/targets/elementor/absolute-position.ts`; R0 (Elementor 4.2.4): `container.php` blob `3486766` has `position` (`--position`), `_offset_orientation_h/v`, `_offset_x`/`_offset_x_end`/`_offset_y`/`_offset_y_end` and `z_index` (`--z-index`); `common-base.php` blob `77c497b` has the same offsets on widgets with `_position` and `_z_index`; `_container.scss` blob `d6c65cb` makes every `.e-con` `position: relative`; `_global.scss` blob `c844122` positions `.elementor-absolute` children and gives absolute widgets `z-index: 1` by default.
  - A text or Auto Layout frame with `layoutPositioning: ABSOLUTE` gets offsets from its parent's top-left: constraint MIN → start (left/top), MAX → end (right/bottom). A CSS absolute box starts inside the parent's border, so a mapped parent border width is subtracted. An absolute frame needs a FIXED or HUG width (the Container default is 100%). CENTER/STRETCH/SCALE constraints, rotation, other node types and offsets beyond ±16384px stay `ABSOLUTE_POSITION_REQUIRES_REVIEW`.
  - Stacking: every Container child is a flex item, where `z-index` applies without positioning. From the first absolute child on, siblings get z-index 1, 2, 3… in layer order (this also overrides the default `z-index: 1` of absolute widgets); the parent gets z-index 0 so the stack stays inside it. A painted sibling that cannot carry a z-index → `ABSOLUTE_STACKING_REQUIRES_REVIEW` on the parent.
  - Headings and detected buttons keep the placement; an absolute label blocks the button shape. IR: optional `position` and `zIndex` (container, text, heading, button; divider `zIndex` only), validated (`P15_IR_POSITION_INVALID`) and in the identity only when present, so every golden is unchanged. Real-render confirmation belongs to the M6 proof.
  - Tests: `tests/m2-absolute-position.test.ts`.
- [x] **M2.6** Map wrap to `flex_wrap`. Map a strict grid to a v3 Grid container: columns, rows and gaps (split into M2.6a–b).
  - [x] **M2.6a** Wrap _(done 2026-10-11)_ (`src/targets/elementor/container-wrap.ts`; R0: `flex-container.php` blob `ce9e412` `wrap`/`gap`/`align_content` (condition `wrap = wrap`), `_container.scss` blob `d6c65cb` `flex-wrap`/`align-content` vars, whose unset default stretches the lines; Figma typings 1.140.0 `counterAxisAlignContent` documents AUTO as "align-content: start | center | end" by `counterAxisAlignItems`).
    - A horizontal wrapped frame → `flex_wrap: wrap`, `flex_gap` column = item spacing and row = line spacing, `flex_align_content` start/center/end (AUTO, from the counter alignment) or space-between (SPACE_BETWEEN).
    - REVIEW: all children stretching (CSS `stretch` is not an Elementor option), missing/out-of-range line spacing, vertical wrap → `WRAPPED_AUTO_LAYOUT_REQUIRES_REVIEW`; a FILL-width child (it would take a whole line) → `SIZE_FILL_IN_WRAP_REQUIRES_REVIEW` on the container.
    - Note for M4: Elementor makes flex Containers wrap on mobile by default (`--flex-wrap-mobile: wrap`, `_container.scss`); cross-breakpoint alignment must account for it.
    - IR: optional container `wrap` (row only), validated and in the identity only when present. Tests: `tests/m2-wrap.test.ts`.
  - [x] **M2.6b** Strict grid → Grid Container _(done 2026-10-11)_ (`src/targets/elementor/container-grid.ts`; R0: `container.php` blob `3486766` `container_type` + group `grid`, `grid-container.php` blob `bd00e17` `columns_grid`/`rows_grid` (`fr` → `repeat(N, 1fr)`, `custom` → verbatim template), `gaps`, `justify_items`/`align_items`; `_container.scss` blob `d6c65cb` `.e-grid` rules, default rows `repeat(2, 1fr)`; Figma typings 1.140.0 `GridTrackSize` FLEX = `fr`, FIXED = px, HUG = `fit-content(100%)`).
    - A Figma GRID frame whose in-flow children each take one cell in row-major layer order (so CSS auto placement matches) → `container_type: grid`, column/row templates (equal 1fr tracks as the native `fr` count, otherwise a `custom` template built only from validated numbers), `grid_gaps`, and explicit `stretch` item alignment (the `--justify-items`/`--align-items` variables are not reset per Container, so a nested grid would inherit them). Rows are always written.
    - REVIEW: spans, out-of-order or skipped cells, more children than cells, unknown or unbounded tracks → `GRID_LAYOUT_REQUIRES_REVIEW`; children that do not FILL their cell with AUTO alignment → `GRID_CHILD_PLACEMENT_REQUIRES_REVIEW` on the grid.
    - IR: optional container `grid` (direction `row`, no flex gap/alignment/wrap), validated and in the identity only when present. Tests: `tests/m2-grid.test.ts`.
- [x] **M2.7** Map SPACE_BETWEEN, negative spacing (REVIEW where unsupported), baseline alignment, and child `layoutAlign`/`layoutGrow` _(done 2026-10-11)_.
  - `src/targets/elementor/container-spacing.ts`; R0: `flex-container.php` blob `ce9e412` (`justify_content` incl. space-around/evenly; `align_items` has no baseline; `gap` non-negative), `container.php` blob `3486766` Container `margin` (`--margin-*`), `common-base.php` blob `77c497b` widget `_margin` targets the inner `.elementor-widget-container`; Figma typings 1.140.0 (`primaryAxisAlignItems` incl. SPACE_EVENLY/SPACE_AROUND, `layoutAlign`, `layoutGrow`, `itemReverseZIndex`).
  - SPACE_BETWEEN / SPACE_EVENLY / SPACE_AROUND write gap 0, so CSS divides exactly the free space Figma divides (previously the item spacing was written as a CSS minimum gap).
  - Negative item spacing → gap 0 plus a negative leading Container `margin` on every in-flow sibling after the first (later siblings paint on top, as in Figma). Overlapping widgets, a wrapped row or `itemReverseZIndex` → `NEGATIVE_SPACING_REQUIRES_REVIEW` with the layout kept at gap 0; beyond ±4096px stays `SPACING_OUT_OF_RANGE`.
  - BASELINE counter alignment → laid out as start with `BASELINE_ALIGNMENT_REQUIRES_REVIEW`, instead of dropping the whole frame.
  - Without `layoutSizing*`, `layoutGrow: 1` (along) and `layoutAlign: STRETCH` (across) still mean FILL.
  - IR: optional container `marginPx`, validated and in the identity only when present. Tests: `tests/m2-spacing-alignment.test.ts`; two expectations in `tests/p15-figma-neutral-export-extractor.test.ts` changed on purpose (space-between gap 0, baseline flagged).
- [x] **M2.8** Font manifest: the families and weights used, with Google Fonts availability flagged. Non-Google fonts → REVIEW with an upload instruction _(done 2026-10-11)_.
  - R0: Elementor 4.2.4 `includes/fonts.php` (blob `1ddfd95`) `get_native_fonts()`: 7 system, 1652 Google and 8 Google early-access families, gated by the `elementor_google_font` option (default on). Copied offline into `src/targets/elementor/elementor-font-registry.ts` with a content digest, so the core stays network-free. Elementor enqueues a Google family for a page only when a typography control names it.
  - `src/targets/elementor/font-manifest.ts` builds `p15-font-manifest-v1`: each family with its source (system / google / google-early-access / upload-required), sorted weights (`400`, `700italic` …), usage (control or span-only) and first node. The export pipeline result carries it as `fontManifest`.
  - REVIEW: a family outside the registry → `FONT_UPLOAD_REQUIRED` with an upload instruction (family and weights); a Google family used only inside styled runs → `FONT_NOT_LOADED_FOR_SPAN`. Either blocks the candidate instead of a silent fallback. Site-added fonts (`elementor/fonts/additional_fonts`) are not known here.
  - Tests: `tests/m2-font-manifest.test.ts` (registry counts and digest, exact classification, manifest, reviews, generator and pipeline).
- [x] **M2.9** Golden landing-page fixture. Every visible property is either mapped or listed as REVIEW, with no silent drop. A partial template is allowed only with an explicit `REVIEW_ITEMS` list, and the user sees exactly what is missing (D-049). (split into M2.9a–c)
  - [x] **M2.9a** D-049 review artifact _(done 2026-10-11)_ (`src/targets/elementor/review-artifact.ts`; R0: `element-base.php` blob `733769f` `hide_<device>` switchers → `elementor-hidden-<device>`, `_visibility.scss` blob `d5702c9` `display: none` per device range, `container.php` blob `3486766` `css_classes`).
    - A valid document with review items still returns `template: null` and `candidate: null`, plus `reviewArtifact` (`p15-elementor-review-artifact-v1`, label `REVIEW REQUIRED`, `targetImportReady: false`): the partial template and `reviewItems` with every review entry, its element id and kind (`placeholder` or `unmapped-property`).
    - Unmapped content stays an explicit placeholder: an empty Container hidden on desktop/tablet/mobile (no size or gap on the page, visible in the editor) with classes `p15-review-placeholder p15-review-<reason>`. Depth/node-limit failures are BLOCKED: no artifact.
    - The export pipeline passes it through for `BLOCKED_GENERATION`; the CLI writes `elementor-review-artifact.json` (never `elementor-template.json`) and still exits 3. The plugin UI already lists every review entry with its reason and detail.
    - Tests: `tests/m2-review-artifact.test.ts`.
  - [x] **M2.9b** Property-coverage auditor: for every visible Figma node and visual property, prove it is mapped into the IR or listed as review _(done 2026-10-11)_.
    - `src/plugin/p15-property-coverage-audit.ts` (`p15-property-coverage-audit-v1`) walks the Figma tree independently of the extractor. Every visible node must be an IR node, a review (which covers its subtree), or a button label folded into its button. Every non-default visual property must be carried by an IR field or named by a review on that node: fills, strokes, effects, corner radii, visible clipping, opacity, blend mode, rotation, masks, absolute placement, min/max sizes, wrap, grid, baseline, item spacing, padding and the text properties (colour, size, family, letter spacing, line height, case, decoration, text strokes/effects). A bounds review covers the whole tree.
    - The plugin preview (`buildP15ElementorV1PreviewFromFigmaFrame`) returns the audit as `coverageAudit`. Each finding becomes a `SILENT_DROP_DETECTED` review node on the root (at most 100 plus a count), so no candidate ever loses content unannounced; the D-049 review artifact lists them.
    - Tests: `tests/m2-property-coverage-audit.test.ts` (complete extraction, doctored IR with a dropped node / property / review, subtree and bounds coverage, button labels, preview gating).
  - [x] **M2.9c** Golden landing-page fixture through the auditor, the generator and a recorded golden _(done 2026-10-11)_.
    - `tests/fixtures/m2-landing-page.ts`: a Figma-shaped 1440px page (51 visible nodes) with a space-between nav and button, a gradient hero with headings, a fixed-width copy, a CTA row and an absolute badge, a 3-column card grid with borders and shadows, wrapped logo chips, overlapping bordered avatars, a mixed italic/bold quote, an image, a divider and a footer with a link.
    - `tests/m2-golden-landing-page.test.ts`: coverage audit COMPLETE (zero silent drops); the export is a REVIEW artifact whose only items are the two genuinely unmapped ones (outline button border → `BUTTON_DETECTION_REQUIRES_REVIEW`, image → `IMAGE_ASSET_EXPORT_REQUIRED` placeholder, owned by M3); font manifest = Inter (Google). Golden `tests/golden/m2-landing-page.golden.json` (IR, fingerprint, audit, manifest, review artifact), re-recorded only with `GOLDEN_WRITE=1`.
    - Two extractor gaps found by the fixture and fixed: (1) a run that drops the node's italic or case now writes the exact inherited reset `font-style: normal` / `text-transform: none` (span-only IR values; a dropped underline stays review because CSS decorations propagate); (2) a border on an empty frame with FIXED width and height clamps the padding at 0 instead of `STROKE_REQUIRES_REVIEW` (no content to move, fixed border-box). Tests: `tests/m2-golden-fixes.test.ts`.
- [x] **M2.10** Content width of unsized Containers. Elementor 4.2.4 `container.php` (blob `3486766`) defaults `content_width` to `boxed`, and `_container.scss` (blob `d6c65cb`) caps a boxed inner at `--content-width: min(100%, var(--container-max-width, 1140px))`. A FILL or unsized frame wider than 1140px (for example a full-bleed section in a 1440px page) is therefore narrowed and centred. Write `content_width: full` on every generated Container (Figma has no boxed concept), re-record the affected goldens with a diff test, and re-bind the retained real-target reference/profile evidence that pins the candidate identity. Found during M2.6b. _(done 2026-10-11)_
  - Design change from the original note: writing `content_width: full` on every generated Container would change the identity of the hand-authored first-proof vector, which the retained #483 real-target proof pins (`reference-proof-registry.ts` candidate `sha256:96ffe8a1…`, template `sha256:bf2c2294…`); re-binding it needs a new real-target run, not an edit. Instead the Figma extractor marks every Container it extracts with the IR flag `fullContentWidth: true`, and the generator writes `content_width: full` only for flagged Containers that sizing has not already given it. Hand-authored IR, every M1 golden and the retained proof binding are unchanged; only the extractor-produced landing-page golden was re-recorded (flag + `content_width` only).
  - Consequence: the responsive boxed-width family (which requires an unset or boxed `content_width`) now refuses extracted Containers, which is correct because a Figma frame is never Elementor's boxed layout.
  - Tests: `tests/m2-content-width.test.ts`.

### M3 — Assets

- [x] **M3.1** Image bytes. Read original bytes through `figma.getImageByHash(hash).getBytesAsync()`. Produce the rendered appearance through `exportAsync` (PNG @1x/@2x). Export vectors and icons as SVG. _(done 2026-10-11)_
  - `src/plugin/p15-asset-collector.ts` (`p15-asset-collector-v1`), with the Figma API injected (`getImageByHash` → `getBytesAsync`/`getSizeAsync`, `node.exportAsync`). **Stored Original**: one record per image hash (content-addressed `original-<hash>`, every using node listed, MIME sniffed from the PNG/JPEG/GIF/WebP signature, original pixel size). **Rendered Appearance**: every image layer as PNG @1x and @2x (`render-<node>@<scale>x`), capturing crop, scale mode, filters and effects. Vector layers and frames/groups made only of vectors (icons) → one SVG each (`svg-<node>`).
  - Every record has a byte SHA-256 (new `sha256BytesHex` in `src/core/sha256.ts`, cross-checked against `node:crypto`), byte length and pixel size. Bounds: 500 assets, 20 MB per asset, 200 MB total. Missing hashes, unreadable or unsupported images, failed exports, empty or oversized assets and id collisions are explicit reviews. No Figma mutation, no network, no URL.
  - Not yet wired into the plugin flow; the asset pack (M3.2) consumes it. Tests: `tests/m3-asset-collector.test.ts`, `tests/m3-sha256-bytes.test.ts`.
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
