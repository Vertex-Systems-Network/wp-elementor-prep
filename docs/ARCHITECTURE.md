# Architecture

## Runtime architecture

```text
Figma Plugin Main Thread
├─ Selection Validator
├─ Scanner
├─ Normalizer
├─ Section Discovery
├─ Classifier
├─ Scoring Engine
├─ Recipe Matcher
├─ Transaction Engine (later)
└─ Figma Mutation Adapter (later)
        │
        └─ postMessage
             ▼
Plugin UI iframe
├─ Audit Report
├─ Evidence Explorer
├─ Visual Diff Canvas (later)
└─ User Controls
```

Core runtime must remain offline. The plugin manifest should use `documentAccess: "dynamic-page"` and `networkAccess.allowedDomains: ["none"]`.

## Domain layers

### 1. Raw Figma adapter

Converts Figma nodes into normalized, serializable snapshots. Figma node objects must not leak deeply into pure classifier/scoring modules.

### 2. Normalized model

A lightweight immutable structure containing:

- id/name/type,
- geometry,
- layout mode and sizing,
- parent/children,
- text/image flags,
- clipping/overflow hints,
- visual-role hints,
- semantic-name score.

This enables pure unit testing without a live Figma document.

### 3. Analysis engine

Pure functions:

- layout statistics,
- section discovery,
- geometric clustering,
- pattern candidates,
- confidence/evidence,
- readiness scoring.

### 4. Recipe layer

Each recipe will eventually expose:

```ts
interface LayoutRecipe {
  id: string;
  detect(node: AuditNode): DetectionResult;
  plan(node: AuditNode): TransformPlan;
  apply(context: TransformContext, plan: TransformPlan): Promise<TransformResult>;
}
```

Detection and planning must be testable without mutation.

### 5. Transaction + validation layer

Future contract:

```text
clone -> transform candidate -> validate -> commit OR discard
```

Validators are composed:

- geometry validator,
- text integrity,
- image integrity,
- structural sanity,
- pixel diff.

## Scoring architecture

Readiness should not equal Auto Layout percentage.

Initial categories:

- layout flow,
- nesting/structure,
- sizing behavior,
- semantic clarity,
- overlay safety,
- repeated-pattern consistency,
- content integrity risk.

Each score includes findings and evidence. Weighting must remain configurable/versioned.

## Performance rules

- Scope to current selection for MVP.
- Do not eager-load all Figma pages.
- Avoid serializing paint/effect data that is not needed for the current audit.
- Prefer iterative traversal to uncontrolled deep recursion for very large subtrees.
- Defer PNG export until a transformed candidate needs validation.
- Cache normalized snapshots during one run.

## Compatibility boundary

The Figma engine must not depend directly on Elementor JSON keys. Instead it should emit a neutral semantic layout model. A future exporter translates that model to Elementor schema adapters.

This is required because Elementor supports modern nested containers and is evolving atomic elements. Export format changes must not destabilize audit/refactor logic.

## Security/privacy

- Core plugin has no network access.
- Do not upload screenshots/design content.
- Plugin-private metadata is used only for version/status markers, never as a security boundary.
- Do not store large design snapshots in plugin data.
