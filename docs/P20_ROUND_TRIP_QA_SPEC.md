# P20 Round-Trip QA + Fidelity Verification — Preflight Specification

Status: PLANNING-ONLY / IMPLEMENTATION BLOCKED  
Owner roadmap issue: #119  
Dependencies: #84 internal P12 exit; accepted source/preparation contracts; P17-P19 artifact/provenance contracts; selected target adapter acceptance  
R0 source snapshot: `docs/R0_ROUND_TRIP_QA_SNAPSHOT_2026-09-11.md`  
Date: 2026-09-11

## 1. Purpose

P20 provides target-independent quality evidence for generated exports and reconstructions.

It answers separate questions:

- Did generation complete deterministically?
- Does the artifact build/validate?
- Does rendered output preserve source content?
- Does it preserve source geometry/visual appearance within the claimed profile?
- Does responsive behavior remain valid across required viewports?
- Do accepted interactions produce equivalent observable outcomes?
- Are assets/tokens traceable to the source package?
- If code was re-imported to Figma, how close is the reconstruction to the accepted code/render source?

No single PASS replaces the others.

## 2. Canonical export QA flow

`Accepted source snapshot -> source capture/evidence -> generated target artifact -> static/build validation evidence -> controlled preview -> stabilized capture at viewport/state matrix -> content/structure/geometry comparison -> visual diff -> interaction checks -> aggregate categorical verdict -> immutable QA receipt`

## 3. Canonical reconstruction QA flow

`Accepted code/package source -> controlled browser reference render -> P17 code-to-design reconstruction -> Figma reconstruction capture/structure scan -> content/geometry/visual comparison -> reconstruction QA receipt`

The reconstruction flow does not claim recovery of original source Figma structure unless that original structure is independently available and compared.

## 4. Evidence channels

Every QA run records applicable independent channel results:

- `CONTENT`;
- `SEMANTIC_STRUCTURE`;
- `GEOMETRY`;
- `VISUAL`;
- `RESPONSIVE`;
- `INTERACTION`;
- `ASSET_PROVENANCE`;
- `TOKEN_PROVENANCE`;
- `BUILD_STATIC`;
- `IMPORT_RECONSTRUCTION`.

Each channel is `PASS`, `REVIEW`, `FAIL`, `NOT_APPLICABLE`, or `INSUFFICIENT_EVIDENCE`.

An aggregate verdict cannot overwrite channel details.

## 5. QA identity

Suggested receipt identity:

```ts
interface QARunIdentityV1 {
  schemaVersion: 1;
  qaEngineVersion: number;
  source: {
    sourceKind: string;
    sourceSnapshotHash: string;
    sourceIRHash?: string;
    captureHash?: string;
  };
  target: {
    adapterId: string;
    adapterVersion: number;
    generationProfileHash: string;
    artifactManifestHash: string;
    buildArtifactHash?: string;
  };
  harness: {
    harnessVersion: number;
    browserEngine?: string;
    browserVersion?: string;
    platformImage?: string;
  };
}
```

A receipt is invalid if its compared source/target cannot be tied to exact immutable identities.

## 6. Source capture

For Figma source visual reference, P20 should request a deterministic export of the exact accepted source root/section at a declared scale/format.

Capture record includes:

- file/source identity available to the accepted source contract;
- node/root ID;
- source scan/IR hash;
- width/height;
- scale;
- export format/settings;
- byte/content hash;
- capture timestamp as metadata only, not identity.

If source capture dimensions do not correspond to the source geometry used by generation, QA is blocked until reconciled.

## 7. Target capture harness

Initial browser-based targets use one pinned primary browser environment.

Harness profile records:

- browser engine/version;
- OS/container image digest or equivalent immutable environment ID;
- viewport width/height;
- device scale factor;
- locale;
- timezone;
- color scheme;
- reduced motion setting;
- user agent policy;
- font inventory/hash policy;
- network policy;
- screenshot format;
- animation/caret stabilization policy.

The baseline and actual comparison must use compatible harness profiles.

## 8. Capture readiness

P20 must not depend on arbitrary sleeps such as “wait 3 seconds.”

Target readiness can require the applicable subset of:

- document ready state;
- framework route ready signal;
- generated app QA marker;
- network idle only when network is intentionally enabled and bounded;
- `document.fonts.ready` or equivalent font closure;
- required images decoded;
- target root dimensions non-zero/stable;
- two consecutive layout/capture samples stable;
- accepted async fixture data loaded;
- animation stabilization complete.

Timeout produces `INSUFFICIENT_EVIDENCE`/`CAPTURE_FAILED`, not a fabricated visual result.

## 9. Dynamic/volatile content

Initial deterministic QA should use static/local fixtures.

Volatile fields such as clocks, random IDs, third-party embeds, videos or live network data are handled by one of:

- deterministic fixture substitution configured before render;
- explicit region exclusion with reason;
- separate behavior test;
- QA block if the volatile region is material and cannot be stabilized.

Masks are never silently auto-added merely to improve a score.

## 10. Exclusion registry

Any visual exclusion/mask must include:

- region/selector identity;
- source/target reason;
- evidence class;
- approved policy/rule ID;
- materiality classification;
- whether exclusion affects visual-only or additional channels.

A receipt surfaces excluded pixel/area ratio. Excessive excluded area can block acceptance even when remaining pixels match.

## 11. Content comparison

Content QA compares source-supported text/content identity independently of pixels.

Checks may include:

- normalized text content;
- text run/order;
- required labels;
- link/button accessible names where deterministically mapped;
- image/asset presence;
- content count/card/list item count where source structure proves it.

Normalization may handle defined whitespace/Unicode differences but must not erase meaningful punctuation/case/content differences.

Missing or changed meaningful text is not excused by a visually similar placeholder.

## 12. Semantic structure comparison

Where P17/P18 claims semantic markup, P20 checks the generated/preview structure against the semantic plan.

Potential evidence:

- landmark roles;
- heading hierarchy;
- list/list-item relationships;
- button vs link intent;
- image/alt/decorative state;
- table semantics where applicable;
- target component boundary/role receipt.

P20 does not invent stronger semantic expectations than the source/adapter plan claimed.

## 13. Geometry comparison

Geometry QA compares normalized boxes/anchors between source and rendered target.

Potential record per mapped element:

- source normalized box;
- target box;
- x/y delta;
- width/height delta;
- edge delta;
- center delta;
- overlap/intersection relationships;
- clipping/overflow state;
- visibility state.

Geometry is compared after coordinate normalization for scale and viewport mapping.

## 14. Element mapping

Reliable geometry/content comparison requires source -> target provenance.

P17/P18 generators should emit stable QA instrumentation in development/verification builds or a sidecar mapping, for example:

- source node ID -> generated component/element QA ID;
- repeated item occurrence index;
- route/section ownership;
- interaction recipe ID.

Production artifacts may omit QA attributes if desired, provided the controlled verification build is tied to the same normalized generation plan and code identity.

Selectors based only on brittle nth-child layout are a fallback and receive lower confidence.

## 15. Visual comparison

Visual QA compares aligned source/target reference images after accepted normalization.

The engine may compute:

- changed pixel count/ratio;
- pixel comparator result using calibrated color threshold;
- diff bounding regions;
- structural region diff summaries;
- optional perceptual metrics after independent validation.

Raw library defaults are not product acceptance thresholds.

Output retains source image, target image and diff image hashes plus metric results.

## 16. Visual alignment

Before pixel comparison, P20 validates that images represent the same intended coordinate domain.

Allowed normalization may include:

- deterministic scale conversion;
- cropping to the same explicit source root bounds;
- transparent/background normalization only when target profile defines equivalence;
- viewport/root offset alignment from provenance.

Forbidden normalization:

- arbitrary image warping;
- auto-shifting large regions to maximize similarity without reporting layout drift;
- resizing width/height independently to hide geometry mismatch;
- removing mismatched content.

## 17. Threshold calibration

Thresholds are versioned by comparison class/profile, not scattered magic numbers.

A calibration corpus must include known PASS, REVIEW and FAIL cases with intentionally introduced defects.

Calibration report records:

- fixture IDs;
- environment;
- metric values;
- human-reviewed expected outcome;
- false positive/negative analysis;
- chosen thresholds and rationale;
- limitations.

Until calibration is accepted, P20 may report metrics but not use them as production PASS gates.

## 18. Typography drift

Text rendering requires special handling because font mismatch can dominate screenshot diffs.

Before visual verdict:

- target font family/weight/style closure is checked;
- unavailable font/substitution is surfaced;
- source font intent is compared with P19/font receipt;
- text bounds/line count can be compared separately;
- baseline cannot be accepted if required fonts silently fell back.

Anti-aliasing noise with identical font/layout is addressed by calibrated visual thresholds, not by ignoring text regions wholesale.

## 19. Asset provenance QA

P20 validates generated target references against P19 Asset Manifest.

Checks include:

- required source asset mapped;
- referenced target file exists;
- content hash/derivative receipt matches;
- dimensions/format policy match;
- no unexpected remote replacement;
- no placeholder asset where source asset was required.

A browser screenshot showing “something similar” does not replace asset provenance.

## 20. Token provenance QA

For target values emitted from P19 Token IR, P20 can validate:

- expected source token -> target token/reference mapping;
- selected mode;
- resolved target value;
- target stylesheet/theme/framework reference presence;
- no unexpected literal override where token binding was promised.

Visual equivalence alone is insufficient if the product claim is “design-system aware export.”

## 21. Responsive QA matrix

Responsive fidelity is tested across a declared viewport matrix.

Initial matrix should be profile-driven and may include:

- source-native desktop width;
- one or more accepted tablet widths;
- one or more accepted mobile widths;
- target-specific breakpoint boundary samples.

A design with insufficient responsive source evidence cannot be given an invented mobile fidelity PASS. The channel becomes `INSUFFICIENT_EVIDENCE` or tests only the explicitly claimed adaptive behavior.

## 22. Responsive invariants

Beyond screenshots, P20 can test invariants derived from the responsive plan:

- no unintended horizontal page overflow;
- required controls remain reachable;
- text does not clip unexpectedly;
- grid/list cardinality preserved;
- intentional carousel overflow remains intentional;
- visibility/reorder changes match explicit plan;
- min/max sizing constraints behave as declared.

These checks help catch failures that isolated screenshots may miss.

## 23. Interaction QA

Accepted P17 interaction recipes define framework-neutral observable scenarios.

Example disclosure scenario:

1. initial state asserted;
2. activate named control via semantic locator;
3. expanded state asserted;
4. content visibility asserted;
5. keyboard behavior asserted where recipe requires it;
6. reload/reset state semantics asserted if specified.

Adapters may implement the interaction differently; P20 tests the declared behavior contract.

## 24. Interaction visual states

For selected recipes, visual QA may capture multiple deterministic states:

- default;
- hover/focus only when relevant and reproducible;
- expanded/open;
- selected/active;
- next carousel position;
- modal open.

Each state has a unique state ID and receipt. State screenshots are not mixed into the default-state baseline.

## 25. Accessibility-oriented checks

P20 is not a complete accessibility certification, but can verify deterministic claims such as:

- semantic role/accessible name plan retained;
- keyboard-reachable generated controls where recipe requires it;
- modal focus/escape behavior where recipe specifies it;
- image alt/decorative status from P19 retained;
- no obvious hidden-but-focusable generated leftovers;
- target accessibility tree snapshot fixture where the selected harness supports it.

These results are separate from visual score.

## 26. Build/static channel

P20 consumes, rather than duplicates, target adapter build evidence.

It verifies that the exact previewed artifact corresponds to the exact build/static PASS receipt.

A source file changed after build invalidates downstream preview/visual evidence.

## 27. Reconstruction QA

For Web -> Design import, compare the generated Figma reconstruction against the controlled browser/source representation.

Channels include:

- text/content;
- element/card counts;
- geometry;
- image/vector presence;
- typography intent/closure;
- normalized visual capture;
- editable/native structure coverage where claimed;
- unsupported/lossy annotations.

A reconstruction can be visually strong but receive REVIEW for editability/structure if significant regions were flattened.

## 28. Editability metric boundary

If P20 later reports editability, the denominator must be explicit.

Potential classes:

- native text;
- native frame/layout;
- native vector/media;
- target component instance;
- flattened raster;
- unsupported/unknown.

Do not call a screenshot placed in a Figma frame a “100% reconstructed design.”

## 29. Round-trip loops

Potential round-trip scenarios are distinct:

- Figma -> web target -> browser QA;
- HTML/CSS -> Figma reconstruction -> capture QA;
- Figma -> target -> supported static import -> reconstruction QA;
- future target-native artifact -> target import -> rendered QA.

Each loop uses separate receipts and known lossy boundaries. There is no generic “round trip passed” label without naming the loop/profile.

## 30. Expected-delta contract

Some target adapters intentionally transform source representation while preserving user-visible intent.

Expected delta record includes:

- source region/feature;
- target transformation;
- reason;
- target capability limitation or profile policy;
- affected QA channels;
- expected visual/semantic consequence;
- approval/policy source.

Expected deltas reduce false failures but remain visible in the final report.

## 31. Severity taxonomy

Detected QA differences may be classified:

- `BLOCKER` — missing content, major layout break, failed required interaction, invalid artifact identity;
- `MAJOR` — material geometry/typography/asset/semantic mismatch;
- `MINOR` — visible but localized drift below major criteria;
- `INFO` — expected/known non-material variance;
- `UNKNOWN` — insufficient classification evidence.

Severity thresholds are versioned/calibrated.

## 32. Aggregate verdict

Suggested aggregate states:

- `VERIFIED`;
- `VERIFIED_WITH_REVIEW`;
- `NOT_VERIFIED`;
- `INSUFFICIENT_EVIDENCE`.

Example hard rules:

- any BLOCKER channel -> `NOT_VERIFIED`;
- missing required source/target identity -> `INSUFFICIENT_EVIDENCE`;
- build FAIL -> visual result cannot promote aggregate to VERIFIED;
- visual PASS with content FAIL -> `NOT_VERIFIED`;
- unsupported responsive evidence cannot become responsive PASS.

Exact rules are frozen after calibration.

## 33. No misleading percent score

P20 should initially expose channel metrics and categorical verdicts rather than a single “98% fidelity” number.

If a later score is introduced, it requires:

- fixed denominator definition;
- channel weighting validation;
- calibration against human-reviewed outcomes;
- confidence interval/uncertainty handling where relevant;
- explicit statement of what the percentage measures.

Pixel similarity percentage alone must not be marketed as overall conversion accuracy.

## 34. QA report

A QA report should contain:

- run/source/target identities;
- exact profiles/tool versions;
- channel verdicts;
- viewport/state matrix;
- differences grouped by severity/region;
- source/target/diff image references/hashes;
- content/geometry summary;
- asset/token provenance summary;
- expected deltas/exclusions;
- build/preview evidence;
- limitations/insufficient evidence;
- aggregate verdict.

Reports should be machine-readable plus human-readable.

## 35. Artifact retention

Retained QA evidence can include:

- machine receipt JSON;
- source captures;
- target captures;
- diff images;
- selected geometry/content snapshots;
- build receipt references;
- logs for failed captures/interactions.

Retention policy and package size limits are explicit. Large disposable runtime artifacts should not automatically enter the Figma plugin package or Git history.

## 36. Atomic QA run

Partial channel results may be shown during execution, but final aggregate receipt is committed only after the run reaches a terminal state.

Cancellation/staleness prevents a VERIFIED result.

If source or artifact identity changes mid-run, state becomes `STALE` and downstream captures/results are non-authorizing.

## 37. Job state machine

`IDLE -> IDENTITY_PREFLIGHT -> SOURCE_CAPTURE -> TARGET_BUILD_BIND -> PREVIEW_START -> READINESS -> CAPTURE_MATRIX -> CONTENT_COMPARE -> STRUCTURE_COMPARE -> GEOMETRY_COMPARE -> VISUAL_COMPARE -> INTERACTION_COMPARE? -> PROVENANCE_COMPARE -> AGGREGATE -> COMPLETE`

Failure/interrupt states:

- `CANCELLED`;
- `STALE`;
- `IDENTITY_MISMATCH`;
- `SOURCE_CAPTURE_FAILED`;
- `PREVIEW_FAILED`;
- `READINESS_TIMEOUT`;
- `TARGET_CAPTURE_FAILED`;
- `COMPARE_FAILED`;
- `INSUFFICIENT_EVIDENCE`.

## 38. Determinism

For identical immutable source/target identities and QA harness profile:

- QA plan ordering is stable;
- viewport/state matrix is stable;
- content/geometry extraction ordering is stable;
- exclusion registry is stable;
- comparison configuration is stable;
- machine result serialization is stable.

Rendered image bytes are expected to be stable only within the accepted pinned environment and stabilized fixture class. Environment identity is always recorded.

## 39. Harness security

Browser preview executes generated/accepted target code only within the P17/P18 isolated validation boundary.

P20 does not expand permissions.

Defaults:

- no inherited cookies/session;
- no host credentials;
- network denied unless target fixture explicitly needs allowlisted local/network resources;
- downloads/popups/navigation bounded;
- isolated workspace/origin;
- bounded resource/time limits;
- teardown after run.

## 40. Calibration corpus

Before production visual gating, corpus should include at least:

- exact/static no-op render;
- repeated identical render;
- 1px/2px/4px spacing drift;
- width/height drift;
- font family fallback;
- font weight mismatch;
- text line-wrap difference;
- one missing word;
- wrong image;
- missing image;
- subtle color change;
- major color change;
- border/radius/shadow difference;
- carousel overflow intentional vs accidental;
- hidden/reordered responsive item;
- unsupported effect expected delta;
- rasterized-vs-native reconstruction case.

Fixtures should span multiple real page styles, not one golden template.

## 41. Target matrices

P20 does not require every target to support every channel on day one.

Each accepted adapter profile declares required QA channels. Example:

- static HTML/CSS: build/static + content + structure + geometry + visual + responsive + provenance;
- React/Next/Vue/etc.: same plus interaction where recipes exist;
- Elementor/Gutenberg artifacts: target import/render validation must be provided by P15/P16 harness before P20 visual claims;
- code-to-design reconstruction: content + geometry + visual + editability/structure.

Missing required channel implementation blocks production acceptance for that adapter profile.

## 42. P21 handoff

P21 handoff/advisory reports consume P20 evidence instead of claiming quality based on generation success.

P20 exposes:

- exact verified profile;
- channel verdicts;
- known limitations;
- review items;
- expected deltas;
- target/browser matrix actually tested.

## 43. Test strategy

Unit tests:

- coordinate normalization;
- content normalization;
- geometry deltas;
- verdict aggregation;
- exclusion policy;
- stale identity invalidation;
- stable receipt serialization.

Integration tests:

- source capture fixture;
- controlled local preview;
- viewport matrix;
- font/asset readiness;
- screenshot/diff artifact creation;
- interaction recipe scenarios;
- reconstruction capture.

Real acceptance fixtures:

- multiple genuine Figma pages;
- multiple target adapters;
- multi-viewport outputs;
- intentional known defects to prove detection sensitivity.

## 44. Production acceptance

P20 itself is production-accepted only after:

- pinned source/target identity works end-to-end;
- pinned browser harness works cross-run reproducibly in its declared environment;
- calibration report is accepted;
- false positive/negative behavior is measured;
- channel aggregation is tested;
- artifact tamper/stale-source cases fail closed;
- multi-viewport capture works;
- known font/asset failure modes are correctly identified;
- at least two materially different downstream adapter families are validated;
- evidence packages are independently reviewable.

## 45. Implementation-opening checklist

Before P20 runtime implementation opens:

- [ ] P12 internal release exit complete;
- [ ] selected target adapter implementation is accepted enough to produce an exact preview artifact;
- [ ] P17-P19 provenance/receipt contracts consumed by the selected target are frozen;
- [ ] R0 QA snapshot refreshed;
- [ ] primary browser/platform harness pinned;
- [ ] source-capture contract frozen;
- [ ] QA instrumentation/source-target mapping contract frozen;
- [ ] viewport/state matrix policy frozen;
- [ ] exclusion/expected-delta policy frozen;
- [ ] calibration corpus prepared;
- [ ] no production thresholds used before calibration report acceptance;
- [ ] security/isolation boundary accepted;
- [ ] evidence retention/package limits frozen.

Until those gates pass, this document remains planning-only.