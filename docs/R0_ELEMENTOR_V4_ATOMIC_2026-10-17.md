# R0 refresh — Elementor v4 Atomic (recovery M6.3)

Date: 2026-10-17. Scope: the subset needed by the M6.4 v4-Atomic adapter (`e-flexbox`, `e-div-block`, `e-heading`, `e-paragraph`, `e-image`, `e-button`).

## Sources

- Elementor source, `modules/atomic-widgets`, `elementor/elementor` main at `a1680caf4bdeb38be6ecbb6736af0d2970d5b4ec` (committed 2026-10-16). Latest `v4.*` git tag seen: `v4.0.8`.
- Elementor Developers — Atomic Elements: https://developers.elementor.com/docs/data-structure/atomic-elements. This host could not be resolved from the session network. The shape below is taken from the source, which outranks the page.
- Field report (secondary): msrbuilds/elementor-mcp issue #56. It shows an Elementor 4.0.9 export where `e-heading.title` is persisted as `html-v3`.

## Element JSON shape (source: `elements/base/element-builder.php`, `widget-builder.php`, `atomic-element-base.php`)

- Layout element: `{ id, elType: "e-flexbox" | "e-div-block" | "e-grid", settings, isLocked, editor_settings, elements, version?, styles?, interactions? }`.
- Widget: `{ id, elType: "widget", widgetType: "e-heading" | "e-paragraph" | "e-image" | "e-button", settings, isLocked, editor_settings, elements: [], version?, styles?, interactions? }`.
- `version` defaults to `"0.0"`. `interactions` may be absent, an array, or a JSON string.

## Typed props

Every settings value and every style prop is a typed envelope `{ "$$type": <key>, "value": <v> }`.

| Key | Value |
| --- | --- |
| `string`, `color`, `url` | plain string |
| `classes` | string[] (local style ids) |
| `size` | `{ size: number\|string, unit }` |
| `dimensions` | `{ block-start, inline-end, block-end, inline-start }`, each a `size` |
| `image` | `{ src: image-src, size? }` |
| `image-src` | `{ id: null\|attachment, url: url, alt? }` |
| `link` | `{ destination: url\|query, isTargetBlank?, tag? }` |
| `background` | `{ color?: color, background-overlay?, clip? }` |
| `escaped-html` | string. Source schema for `e-heading.title`, `e-paragraph.paragraph` and `e-button.text` |
| `html-v3` | `{ content: string, children }`. Observed in a 4.0.9 export for the heading title |

## Element props (subset)

| Element | Settings |
| --- | --- |
| `e-flexbox` / `e-div-block` | `classes`, `tag` (`div`, `header`, `section`, `article`, `aside`, `footer`, `a`, `button`, `main`, `nav`), `link`, `attributes` |
| `e-heading` | `classes`, `tag` (`h1`–`h6`, default `h2`), `title`, `link` |
| `e-paragraph` | `classes`, `tag` (`p`, `span`), `paragraph`, `link` |
| `e-image` | `classes`, `image`, `link` |
| `e-button` | `classes`, `text`, `link`, `tag` (default `button`) |

## Local styles (source: `styles/style-definition.php`, `style-variant.php`, `local-style.php`, `import-export/modifiers/styles-ids-modifier.php`)

- `styles: { [id]: { id, type: "class", label, variants: [ { meta: { breakpoint: "desktop"|"tablet"|"mobile", state: null|"hover"|… }, props: { <css-prop>: typed } } ] } }`.
- The element points at its style through `settings.classes = { $$type: "classes", value: [id] }`.
- Import re-keys ids as `e-{elementId}-…`, so the adapter uses `e-<elementId>-local`.
- Breakpoint variants other than `desktop` emit media queries.
- Style props are CSS-named (`style-schema.php`):
  - sizing: `width`, `min-height`, `max-width`;
  - spacing: `padding`, `margin`, `gap` (`size` or `dimensions`);
  - flex: `display`, `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, `align-self`;
  - typography: `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-align`, `color`;
  - border: `border-radius`, `border-width`, `border-color`, `border-style`;
  - effects and position: `background`, `box-shadow`, `opacity`, `position`, `z-index`.

## Stability and risk

- Atomic is evolving. The text prop key has moved between `escaped-html` and `html-v3` across 4.x releases. The adapter emits `string` for text props and records this as a REVIEW limit until a real-target import proves which key 4.x accepts.
- Not in scope for this adapter, so explicitly UNSUPPORTED: Pro atomic elements, `e-grid`, components, interactions and global classes and variables.
- Privacy and network: there are no network calls and no licensing constraint. The facts were read from GPL source; no code was copied.

## Acceptance impact

- The `elementor-v4-atomic@4` profile gains an adapter (`elementor-v4-atomic-v1`) in M6.4.
- The output label stays `LOCAL_ARTIFACT_VALIDATED` / `REVIEW REQUIRED`. Real import proof is a `PROJECT_FINAL` real-target harness run (Runner row `RQ-M6-ATOMIC-IMPORT`).
