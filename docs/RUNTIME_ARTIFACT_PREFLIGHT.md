# Runtime Artifact Preflight

Use this check **before** importing a runtime-acceptance artifact into Figma or collecting closure evidence.

The goal is to fail closed when an unpacked artifact has the wrong source SHA/run identity, is missing required files or developer commands, or is a reference-only build that must not be used for final issue closure.

## Commands

For the canonical P5 issue #6 artifact:

```bash
npm run runtime:preflight -- p5 /path/to/unpacked/figma-plugin-dist-488
```

Expected result: `PASS`. If the artifact still has placeholder Figma plugin ID `000000000000000000`, the preflight reports that local manifest rebinding is required. Run the **packaged artifact helper**:

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
- `manifest.json` points to the packaged `code.js` / `ui.html`;
- required developer menu commands exist for the selected track;
- core manifest network access remains offline-only (`allowedDomains: ["none"]`);
- plugin ID is either the packaged placeholder or a numeric locally rebound ID;
- the registered artifact is eligible for the requested intent.

`--json` emits a machine-readable report.

## Canonical registry

`config/runtime-artifacts.json` is the repository-side registry of currently accepted runtime artifacts and their closure eligibility. It must be updated whenever a new exact-build runtime artifact supersedes a registered build.

The registry is operational metadata only. It cannot create runtime proof, replace the verifier shipped in an artifact, or substitute for real imported-Figma observation.
