# Runtime Closure Intake

Use this command **after** real Figma runtime evidence has been exported. It combines the repository-side final-closure artifact preflight with evidence intake and the verifier shipped inside that exact artifact.

It does **not** create evidence, run Figma, or replace real imported-Figma observations.

## Command

For P5 issue #6:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json
```

If the original GitHub Actions artifact ZIP is still available, bind its registered raw SHA-256 digest into the same closure command:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json --archive=/path/to/figma-plugin-dist-488.zip
```

Machine-readable result:

```bash
npm run runtime:closure-intake -- p5 /path/to/unpacked/figma-plugin-dist-488 /path/to/p5-evidence.json --archive=/path/to/figma-plugin-dist-488.zip --json
```

Archive verification is optional so operators who retained only the extracted artifact are not blocked. When `--archive` is supplied, a digest mismatch is a preflight failure and verifier logic is not executed.

A successful intake exits `0` only when all required stages pass.

## Gate order

The intake is intentionally fail-closed and runs in this order:

1. **Final-closure artifact preflight**
   - registered source SHA / Actions run identity must match;
   - the supplied artifact directory must be a real non-symlink directory;
   - required artifact files must be regular non-symlink files;
   - required-file reads are bound to stable pre-open/opened `dev`/`ino`/size/mtime/ctime identity;
   - BUILD_INFO, manifest semantics and immutable hashes are evaluated from descriptor-pinned bytes;
   - all immutable SHA-256 pins must match;
   - manifest targets, required developer commands and offline network policy must pass;
   - the registered artifact must be eligible for `final-closure`;
   - when `--archive` is supplied, the archive must be a stable regular non-symlink file and its exact descriptor-pinned raw SHA-256 must match the registered artifact digest.
2. **Evidence file intake**
   - path must be a regular non-symlink, non-empty file;
   - default maximum size is 5 MiB;
   - pre-open/opened `dev`/`ino`/size/mtime/ctime identity must remain stable;
   - SHA-256 is calculated from the exact raw bytes read through that pinned descriptor;
   - content must decode as strict UTF-8;
   - content must be valid JSON with a top-level object.
3. **Same-artifact verifier preparation and execution**
   - only after stages 1 and 2 pass, closure intake re-opens the verifier through a stable descriptor;
   - the verifier SHA-256 must match the immutable verifier hash already accepted by preflight;
   - only those verified bytes are copied to a private temporary source;
   - a direct Node bootstrap re-hashes the temporary source and imports the exact verified bytes as an in-memory `data:` module;
   - the mutable original artifact verifier path is not trusted as the executable module path;
   - evidence JSON is sent through stdin without shell interpolation;
   - default verifier timeout is 30 seconds;
   - exit code must be exactly `0`.

If preflight, archive verification, evidence intake, verifier preparation, verifier hash validation, or verifier execution fails, closure intake fails closed.

## Current track behavior

- P5 #488 is currently registered as final-closure eligible, so it can reach the verifier stage when its artifact integrity passes.
- P6 #494 and P7 #490 are reference-only builds. `runtime:closure-intake` must fail at preflight for them until fresh post-P5 final-closure artifacts are registered.

## P5 closure sequence

1. retain the original `figma-plugin-dist-488` ZIP when practical and unpack it;
2. optionally run `runtime:preflight` before import, using `--archive` when the raw ZIP is available;
3. if needed, rebind only the manifest plugin ID with the helper packaged in the artifact;
4. import the exact artifact into Figma Desktop;
5. run `Developer: P5 Runtime Self-Test` and require `P5 Compiled Runtime Acceptance: PASS`;
6. collect real rendered-pixel forced-reject, restore, finalize and cleanup evidence;
7. export `p5-evidence.json` to a stable regular non-symlink path;
8. run `runtime:closure-intake` with the exact artifact directory, exported evidence, and `--archive` when the retained ZIP is available;
9. require `Runtime closure intake: PASS` / exit `0`;
10. only then proceed to P5 integration/merge and issue #6 closure.

## Safety properties

- No verifier logic runs when artifact integrity, optional archive digest, or final-closure eligibility fails.
- No verifier logic runs for malformed, empty, symbolic-link, non-file, oversized or replaced evidence input.
- Optional archive hashing is bound to stable descriptor identity and exact raw ZIP bytes.
- Artifact required-file validation/read/hash/parse is bound to stable descriptor identity and exact bytes.
- Evidence hashing is byte-exact and strict UTF-8 decoding is required before verification.
- Verifier execution is rebound after preflight to the immutable verifier SHA-256 and executes the exact re-verified bytes in memory.
- The child process is launched directly with `process.execPath`; no shell command is constructed from operator paths or evidence.
- A PASS means only that the supplied evidence was accepted by the registered artifact/verifier chain. It does not manufacture or substitute for the required real Figma runtime observation.

The canonical real-runtime acceptance procedure remains `docs/REAL_FIGMA_ACCEPTANCE_RUNBOOK.md`.
