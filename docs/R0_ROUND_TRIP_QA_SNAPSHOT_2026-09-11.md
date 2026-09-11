# R0 Round-Trip QA Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P20 — Round-Trip QA + Fidelity Verification  
Dependencies: #84 P12 internal release exit; accepted P17-P19 artifact/provenance contracts  
Date: 2026-09-11

## 1. Purpose

P20 verifies that generated target artifacts preserve the intended source content, structure and visual behavior within explicitly claimed scope. It must prevent a common failure mode: treating “files generated” or “framework build passed” as proof that the exported result matches the design.

This snapshot records current visual-test constraints and freezes planning boundaries. It does not open P20 runtime implementation.

## 2. Browser screenshot observations

Current Playwright supports page/locator visual comparisons through screenshot assertions. It can control viewport/device emulation and exposes comparison limits such as pixel thresholds/diff pixels/ratios.

Current Playwright documentation also explicitly warns that browser screenshots can vary with host OS, browser version, settings, hardware and rendering environment. Consistent baselines require a consistent environment.

P20 consequence:

- visual acceptance must use a pinned browser/render environment;
- a single golden screenshot is not portable evidence across arbitrary OS/browser/font environments;
- comparison receipts must record browser/version/platform, viewport, device scale, font set and capture policy;
- thresholds must be calibrated against accepted fixtures, not copied from library defaults and called product accuracy.

## 3. Capture stabilization observations

Playwright screenshot assertions can disable animations, control viewport/device parameters and apply deterministic capture configuration. Screenshot matching waits for stable consecutive captures before comparison.

P20 consequence:

- animations/transitions/carets/dynamic clocks/random content must be stabilized or explicitly excluded;
- hover/focus/scroll state must be declared;
- capture readiness must be semantic and deterministic, not a fixed arbitrary sleep;
- target screenshots must not be compared before fonts/assets/layout have reached the accepted ready state.

## 4. Pixel comparison is necessary but insufficient

A visually similar screenshot can still contain wrong text semantics, missing links/buttons, inaccessible hierarchy, wrong route/state behavior or flattened images where editable/native structure was promised.

Conversely, harmless anti-aliasing differences can produce pixel drift without meaningful product failure.

P20 therefore needs multiple evidence channels:

- content/text comparison;
- structural/semantic comparison;
- geometry comparison;
- asset/token provenance comparison;
- visual screenshot comparison;
- responsive viewport comparison;
- interaction outcome comparison where claimed;
- round-trip/import reconstruction comparison where claimed.

## 5. Source reference boundary

The preferred visual source reference for a Figma design is a deterministic export/render of the exact source node/snapshot used by the generation job, not a manually cropped screenshot with unknown scale.

The source reference receipt should include:

- Figma source identity/snapshot evidence;
- root node ID;
- capture/export settings;
- width/height/scale;
- image content hash;
- source scan/IR hash used by the generation job.

This keeps visual comparison bound to the same source that generated the artifact.

## 6. Target reference boundary

The target reference is rendered from the exact generated artifact/build identity through a controlled preview harness.

Receipt should include:

- artifact/file-manifest hash;
- build/lockfile identity where applicable;
- route/entrypoint;
- browser engine/version;
- OS/container image identifier;
- viewport/device scale;
- locale/timezone/color-scheme/reduced-motion settings;
- loaded font/asset closure status;
- screenshot hash.

## 7. Frozen P20 decisions

1. **Build PASS != visual PASS.**
2. **Pixel PASS != semantic PASS.**
3. **Source and target captures are cryptographically bound to their generation receipts.**
4. **Comparison environment is pinned.**
5. **Thresholds are fixture-calibrated per comparison class.**
6. **Responsive fidelity is multi-viewport, not desktop-only.**
7. **Known target limitations become explicit expected deltas, never hidden masks.**
8. **Masks/exclusions require a reason and are included in the receipt.**
9. **Text/content mismatches fail independently of visual similarity.**
10. **Interaction verification compares observable outcomes, not implementation syntax.**
11. **Round-trip reconstruction is labeled separately from one-way export fidelity.**
12. **No universal numeric “99% accurate” claim until the metric is calibrated and shown to correlate with human acceptance.**

## 8. Comparison classes

P20 should distinguish:

- `STATIC_VISUAL`;
- `CONTENT`;
- `SEMANTIC_STRUCTURE`;
- `GEOMETRY`;
- `RESPONSIVE`;
- `INTERACTION`;
- `ASSET_TOKEN_PROVENANCE`;
- `IMPORT_RECONSTRUCTION`;
- future `DYNAMIC_DATA` only when a configured data fixture exists.

Each class has its own pass/review/block criteria.

## 9. Threshold calibration boundary

Initial product thresholds must be derived from fixtures covering:

- identical renders repeated in the same environment;
- known anti-aliasing/font-render noise;
- one-pixel geometry drift;
- spacing drift;
- typography mismatch;
- missing asset;
- wrong color/token;
- intentional target-native difference;
- substantial layout break.

The calibration must quantify false-positive and false-negative behavior before a threshold can become an acceptance gate.

## 10. R0 refresh triggers

Refresh before implementation if:

- selected browser/render harness materially changes;
- Playwright screenshot/comparison behavior changes materially;
- new source-capture APIs are selected;
- P20 adds browser engines beyond the accepted primary renderer;
- font rendering/runtime image changes;
- responsive/device matrix changes;
- AI/perceptual vision scoring is proposed as an acceptance metric;
- P20 begins validating dynamic/networked application data.

## 11. Non-authorizing statement

This snapshot is planning evidence only. It does not authorize P20 implementation, does not advance P12, and does not define production fidelity thresholds by itself.