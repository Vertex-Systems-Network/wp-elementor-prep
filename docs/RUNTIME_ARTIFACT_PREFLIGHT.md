# Runtime Artifact Preflight

Use this check **before** importing a runtime-acceptance artifact into Figma or collecting closure evidence.

The goal is to fail closed when an unpacked artifact has the wrong source SHA/run identity, altered immutable runtime bytes, missing required files or developer commands, or is a reference-only build that must not be used for final issue closure.

## Commands

For the canonical P5 issue #6 artifact:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

Expected result: `PASS`. The report must show all registered immutable SHA-256 pins matched. If the artifact still has placeholder Figma plugin ID `000000000000000000`, the preflight reports that local manifest rebinding is required. Run the **packaged artifact helper**:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-figma-plugin-id> . dist-local
```

Then import `dist-local/manifest.json` in Figma Desktop. Manifest rebinding does not replace runtime acceptance.

## Reference-only builds

Current P6 #494 and P7 #490 builds are retained as verified engineering/reference artifacts. They are intentionally registered as **not final-closure eligible** because both branches require post-P5 conflict resolution and fresh exact-build artifacts after P5 lands.

These commands therefore fail closed:

```bash
npm run runtime:preflight -- p6 /path/to/unpacked/figma-plugin-dist-494
npm run runtime:preflight -- p7 /path/to/unpacked/figma-plugin-dist-490
```

To inspect those builds only as references, use:

```bash
npm run runtime:preflight -- p6 /path/to/unpacked/figma-plugin-dist-494 --intent=reference
npm run runtime:preflight -- p7 /path/to/unpacked/figma-plugin-dist-490 --intent=reference
```

Reference inspection must never be treated as final runtime closure.

## What is checked

The preflight validates:

- artifact directory exists;
- `BUILD_INFO.txt` exact source/workflow SHA, run ID and run number;
- required `code.js`, `ui.html`, manifest, import helper and same-artifact verifier are present;
- SHA-256 of immutable packaged files matches `config/runtime-artifacts.json` exactly;
- `manifest.json` points to the packaged `code.js` / `ui.html`;
- required developer menu commands exist for the selected track;
- core manifest network access remains offline-only (`allowedDomains: ["none"]`);
- plugin ID is either the packaged placeholder or a numeric locally rebound ID;
- the registered artifact is eligible for the requested intent.

Current immutable pins cover:

- `BUILD_INFO.txt`;
- `code.js`;
- `ui.html`;
- packaged `prepare-figma-import.mjs`;
- the track's same-artifact closure verifier.

Any byte change to those files fails closed even if `BUILD_INFO.txt` still claims the expected source/run identity.

## Why manifest.json is intentionally excluded from SHA-256 pinning

`manifest.json` is the only artifact file allowed to change during supported local import preparation because Figma requires a real numeric development-plugin ID instead of the packaged placeholder. The packaged helper rebinds that ID while preserving compiled `code.js` and `ui.html` byte-for-byte.

Therefore:

- manifest structure, main/UI targets, menu commands, network policy and plugin-ID shape are validated semantically;
- immutable runtime/helper/verifier files are cryptographically pinned;
- an approved manifest-only plugin-ID rebind can still pass;
- compiled/runtime/verifier tampering cannot pass merely by copying expected metadata.

`--json` emits a machine-readable report including observed immutable file hashes and matched/checked counts.

## Canonical registry

`config/runtime-artifacts.json` schema v2 is the repository-side registry of currently accepted runtime artifacts, their closure eligibility and immutable file SHA-256 pins. It must be updated whenever a new exact-build runtime artifact supersedes a registered build.

The GitHub Actions artifact digest remains useful provenance for the downloaded ZIP. The per-file pins provide a second fail-closed check after extraction and after files have been handed between machines/operators.

The registry is operational metadata only. It cannot create runtime proof, replace the verifier shipped in an artifact, or substitute for real imported-Figma observation.
