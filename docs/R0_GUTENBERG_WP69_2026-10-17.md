# R0 refresh — Gutenberg core blocks for WordPress 6.8 and 6.9 (recovery M8.1)

Date: 2026-10-17. Scope: the blocks the M8.2 adapter emits, plus the validity harness for M8.3.

## Sources (pinned)

- npm dist-tags as observed 2026-10-17:
  - `@wordpress/block-library`: `wp-6.8` = 9.19.7, `wp-6.9` = 9.33.11 (`wp-7.0` = 9.40.2 exists; out of scope);
  - `@wordpress/blocks`: `wp-6.8` = 14.8.2, `wp-6.9` = 15.6.3.
- The `block.json` files were read from `@wordpress/block-library@9.33.11` (`src/<block>/block.json`), all `apiVersion: 3`.
- WordPress core tags: latest 6.9.x is 6.9.10. Gutenberg plugin: v24.2.0.

## Block contract (subset, from block.json)

| Block | Attributes used | Supports used (serialised by the style engine into `style`/`layout`) |
| --- | --- | --- |
| `core/group` | `tagName`, `layout` (`constrained`, `flex` with `orientation`, `justifyContent`, `verticalAlignment`, `flexWrap`) | `spacing.padding`, `spacing.blockGap`, `spacing.margin` (top/bottom), `color.background`/`text`/`gradient`, `border`, `dimensions.minHeight`, `typography` |
| `core/columns` / `core/column` | `isStackedOnMobile`, `verticalAlignment` / `width` | `spacing.blockGap` (horizontal/vertical), `padding`, `color`, `border` |
| `core/heading` | `level`, `textAlign`, `content` | `typography` (`fontSize`, `lineHeight`, `fontFamily`, `fontWeight`, `fontStyle`, `letterSpacing`, `textTransform`, `textDecoration`), `color.text`, `spacing` |
| `core/paragraph` | `align`, `content` | same typography and colour supports |
| `core/image` | `url`, `alt`, `id`, `width`, `height`, `sizeSlug`, `scale` | `border`, `shadow`, `spacing.margin` |
| `core/buttons` / `core/button` | `url`, `text`, `linkTarget`, `rel`, `textAlign`, `width` | button colour, typography, padding and border are serialised on the inner `<a>` (`__experimentalSkipSerialization`) |
| `core/spacer` | `height` (string with unit), `width` | — |
| `core/cover` | `url`, `id`, `dimRatio`, `overlayColor`/`customOverlayColor`, `minHeight`, `minHeightUnit`, `contentPosition` | `spacing`, `layout` (no justification) |

## Validity harness (M8.3)

- The pinned `@wordpress/blocks@15.6.3` with `@wordpress/block-library@9.33.11` runs in Node 22 with a jsdom window, but only when every transitive `@wordpress/*` package is pinned to its `wp-6.9` dist-tag through npm `overrides`.
  - With floating `^` ranges, the install mixes `@wordpress/private-apis` 1.x and 2.x, and `registerCoreBlocks()` throws `Cannot unlock an object that was not locked before`.
- `isValid` alone is not enough. A malformed paragraph (`<div>` inside `wp:paragraph`) is accepted through a deprecation and logs `Updated Block`.
- So the gate is: every block in the tree is `isValid`, and `serialize(parse(markup)) === markup` byte for byte.
- The install is about 2.8 GB of `node_modules`. It therefore lives in an isolated tool workspace with its own lockfile, run in CI. It is not a dependency of the plugin or core.

## Responsive limits (input for M8.4)

- Core has no per-breakpoint style attributes.
- The only native responsive behaviours are:
  - `core/columns` `isStackedOnMobile` (stacks below 782 px);
  - flex `flexWrap: wrap`;
  - fluid typography (`clamp`) from theme settings.
- Any other tablet/mobile override (visibility, order, per-device sizes) has no core equivalent and is REVIEW.

## Network, privacy and licensing

The block contracts were read from GPL-licensed npm packages. No code was copied into the plugin. The core adapter stays network-free; only the CI validator installs packages.
