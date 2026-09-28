# Option Bank

This directory is the versioned capability inventory for target platforms. It is an evidence index, not an automatic compatibility claim.

## Elementor

- Current snapshot: [elementor-4.3.2-4.3.0.json](./elementor-4.3.2-4.3.0.json)
- Free source: Elementor 4.3.2
- Pro source: Elementor Pro 4.3.0
- The snapshot records literal `add_control` and `add_responsive_control` registrations with source paths.
- Dynamic keys, hooks, generated responsive suffixes, runtime serialization and frontend selectors require a separate review/target proof.

Refresh after a plugin update:

```bash
npm run option-bank:refresh -- \
  --free-dir=/path/to/elementor \
  --pro-dir=/path/to/elementor-pro \
  --out=docs/option-bank/elementor-<free>-<pro>.json
```

The ZIP must be unpacked in an isolated directory first. Never execute plugin code during inventory.

## Versioned audit command and registry

Run the dedicated audit with both ZIPs attached. The command extracts each ZIP into an isolated temporary directory, rejects unsafe archive paths, detects the plugin headers, writes an immutable versioned snapshot, updates `registry.json`, and emits a version-specific gap report:

```bash
npm run audit:elementor -- \
  --elementor-free=/path/to/elementor.zip \
  --elementor-pro=/path/to/elementor-pro.zip
```

For a Gutenberg/WordPress contract snapshot, pass the documented version (and optionally a refreshed contract JSON):

```bash
npm run audit:gutenberg -- \
  --elementor-free=/path/to/elementor.zip \
  --elementor-pro=/path/to/elementor-pro.zip \
  --gutenberg-version=wordpress-6.8
```

The plugin UI is built from `registry.json` and exposes separate Elementor Free + Pro and Gutenberg selectors. Selecting a bank is included in the P15 preview receipt; it does not turn static inventory into a runtime compatibility claim.

## Gutenberg / WordPress

Gutenberg is not represented as one fixed plugin option list. The bank tracks the stable official contracts used by blocks:

- `block.json` metadata: registration, attributes and supports.
- Block attributes: stored values, types, enums, sources, defaults and roles.
- Block supports: generated UI/attributes such as color, spacing, typography, layout and dimensions.
- Core blocks reference: block-specific supports and availability.
- Registration, edit/save and InnerBlocks are runtime contracts and need WordPress/editor evidence.

Current official references are recorded in [gutenberg-official-contracts.json](./gutenberg-official-contracts.json). Refresh the references when WordPress/Gutenberg changes, then add a dated snapshot and re-run the implementation gap review.

## Status meanings

- `INVENTORIED`: source/documentation was captured.
- `MAPPED`: compared with this repository's adapter/resolver coverage.
- `RUNTIME_REQUIRED`: static evidence is insufficient.
- `UNSUPPORTED`: the system must refuse or keep the capability in review.
