# Runtime Artifact Preflight

Use this check **before** importing a runtime-acceptance artifact into Figma or collecting closure evidence.

The goal is to fail closed when an unpacked artifact has the wrong source SHA/run identity, altered immutable runtime bytes, non-ID manifest semantic drift, missing required files or developer commands, or is a reference-only build that must not be used for final issue closure.

## Commands

For the canonical P5 issue #6 artifact:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

Expected result: `PASS`. The report must show all registered immutable SHA-256 pins matched and `Manifest semantics (plugin id excluded): MATCH`. If the artifact still has placeholder Figma plugin ID `000000000000000000`, use the **packaged artifact helper** with a separate, non-nested output directory. From inside canonical #488:

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
- schema-v3 manifest semantic SHA-256 matches the registered canonical manifest after removing only the top-level `id` field and recursively sorting object keys;
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

Any byte change to those immutable files fails closed even if `BUILD_INFO.txt` still claims the expected source/run identity.

## Manifest semantic pinning

`manifest.json` raw bytes are intentionally not pinned because supported local import preparation rewrites JSON and changes the Figma development-plugin ID. Schema v3 instead records `manifestSemanticSha256` for each track.

The semantic digest is calculated by:

1. parsing the manifest JSON;
2. removing only the **top-level** `id` field;
3. recursively sorting object keys;
4. preserving array order and all array content;
5. hashing the resulting compact canonical JSON as SHA-256.

This means formatting and object-key order do not matter, and placeholder/numeric plugin-ID-only rebinding remains valid. Any other semantic change — including plugin name, API/editor type, document access, menu entries/labels/order, network policy or newly added fields — changes the digest and fails closed.

Canonical semantic pins:

- P5 #488: `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`
- P6 #494: `b687205564abb72ac7b00447d2bec3e00c266a1d4ddf9ec6980ce15c62c893f9`
- P7 #490: `3cb617c2d47d8b3d887ca94897781998226f9ec6c1b242bc880a2e18d9f6587e`

Local preparation must always copy into a **separate non-nested directory**. The source artifact remains immutable; the prepared copy may change top-level manifest `id` only. Compiled `code.js` and `ui.html` remain byte-for-byte pinned.

`--json` emits a machine-readable report including optional archive integrity, observed immutable file hashes, matched/checked counts and `manifestSemanticIntegrity`.

## Canonical registry

`config/runtime-artifacts.json` schema v3 is the repository-side registry of currently accepted runtime artifacts, their closure eligibility, GitHub Actions artifact digest, id-excluded manifest semantic digest and immutable file SHA-256 pins. It must be updated whenever a new exact-build runtime artifact supersedes a registered build.

The GitHub Actions artifact digest can be verified directly against an operator-supplied original ZIP with `--archive`. The manifest semantic pin and per-file immutable pins provide independent fail-closed checks after extraction and after files have been handed between machines/operators.

The registry is operational metadata only. It cannot create runtime proof, replace the verifier shipped in an artifact, or substitute for real imported-Figma observation.
