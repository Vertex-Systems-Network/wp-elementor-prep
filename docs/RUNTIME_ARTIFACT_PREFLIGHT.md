# Runtime Artifact Preflight

Use this check **before** importing a runtime-acceptance artifact into Figma or collecting closure evidence.

The goal is to fail closed when an unpacked artifact has the wrong source SHA/run identity, altered immutable runtime bytes, missing required files or developer commands, or is a reference-only build that must not be used for final issue closure.

## Commands

For the canonical P5 issue #6 artifact:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

Expected result: `PASS`. The report must show all registered immutable SHA-256 pins matched. If the artifact still has placeholder Figma plugin ID `000000000000000000`, use the **packaged artifact helper** with a separate, non-nested output directory. From inside canonical #488:

```bash
cd /path/to/unpacked/figma-plugin-dist-488
node prepare-figma-import.mjs <your-figma-plugin-id> . ../figma-plugin-dist-488-local
```

Then import `../figma-plugin-dist-488-local/manifest.json` in Figma Desktop. The source artifact and local import output must be separate/non-nested directories. The old `. dist-local` form is invalid: canonical #488's packaged helper cannot copy the source into its own child, and the current main helper explicitly rejects path overlap. Manifest rebinding does not replace runtime acceptance.

## Optional raw archive verification

If you retained the original GitHub Actions artifact ZIP, bind those raw archive bytes to the registry digest as well:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488 --archive=/path/to/figma-plugin-dist-488.zip
```

When `--archive` is supplied, preflight additionally requires:

- the archive path exists as a regular non-symlink file;
- the same `dev`, `ino`, size, mtime and ctime identity is preserved between path validation and descriptor open;
- hashing consumes the bytes from that opened descriptor;
- the raw archive SHA-256 exactly matches the track `digest` in `config/runtime-artifacts.json`.

Archive verification is intentionally optional because operators may receive or retain only an extracted artifact directory. Omitting `--archive` does **not** weaken the existing extracted-file checks: BUILD_INFO, manifest semantics and all immutable runtime/helper/verifier file pins are still enforced. Supplying an archive with a mismatching digest fails closed.

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

- artifact directory exists and is not a symbolic link;
- optional supplied archive raw SHA-256 against the registered Actions artifact digest;
- `BUILD_INFO.txt` exact source/workflow SHA, run ID and run number;
- required `code.js`, `ui.html`, manifest, import helper and same-artifact verifier are present;
- required artifact files are regular non-symlink entries and retain stable file identity between validation and descriptor open;
- BUILD_INFO/manifest/hash checks consume descriptor-pinned bytes;
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

Local preparation must always copy into a **separate non-nested directory**. The source artifact remains immutable; only the prepared copy's manifest ID changes.

Therefore:

- manifest structure, main/UI targets, menu commands, network policy and plugin-ID shape are validated semantically;
- immutable runtime/helper/verifier files are cryptographically pinned;
- an approved manifest-only plugin-ID rebind can still pass;
- compiled/runtime/verifier tampering cannot pass merely by copying expected metadata.

`--json` emits a machine-readable report including optional archive integrity, observed immutable file hashes and matched/checked counts.

## Canonical registry

`config/runtime-artifacts.json` schema v2 is the repository-side registry of currently accepted runtime artifacts, their closure eligibility, GitHub Actions artifact digest and immutable file SHA-256 pins. It must be updated whenever a new exact-build runtime artifact supersedes a registered build.

The GitHub Actions artifact digest can now be verified directly against an operator-supplied original ZIP with `--archive`. The per-file pins provide the independent fail-closed check after extraction and after files have been handed between machines/operators.

The registry is operational metadata only. It cannot create runtime proof, replace the verifier shipped in an artifact, or substitute for real imported-Figma observation.
