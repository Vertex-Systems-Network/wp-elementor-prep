# Integration Readiness Automation

P5, P6 and P7 use exact-build runtime evidence, so canonical feature branches should not be rebased or documentation-churned merely to discover whether they still integrate cleanly.

This repository therefore provides a **read-only merge simulation**:

```bash
npm run integration:readiness
```

The checker inspects these dependency edges:

1. `feat/p5-safe-recipes` → `main`
2. `feat/p6-advanced-structures` → `feat/p5-safe-recipes`
3. `feat/p7-batch-queue-core` → `feat/p5-safe-recipes`

It uses `git merge-tree --write-tree`, which performs Git's merge logic without checking out, rebasing, committing, updating refs, or changing the index/working tree.

## Required refs

Fetch the canonical refs before running locally:

```bash
git fetch --no-tags origin \
  '+refs/heads/main:refs/remotes/origin/main' \
  '+refs/heads/feat/p5-safe-recipes:refs/remotes/origin/feat/p5-safe-recipes' \
  '+refs/heads/feat/p6-advanced-structures:refs/remotes/origin/feat/p6-advanced-structures' \
  '+refs/heads/feat/p7-batch-queue-core:refs/remotes/origin/feat/p7-batch-queue-core'
```

## Result classes

- `CLEAN` — Git can integrate the two refs without conflicts.
- `DOCS_ONLY_CONFLICT` — every conflicted path is a documentation/status file. This still needs an explicit resolution before merge, but it does not imply runtime-code divergence.
- `CODE_CONFLICT` — one or more conflicted paths affect runtime, tests, build/provenance, workflow, or another non-documentation path. Do not collect final exact-build runtime closure before this integration is resolved and rebuilt.
- `ERROR` — refs could not be resolved or Git could not complete the simulation.

Default mode reports state and exits successfully so known dependency conflicts do not turn routine monitoring red:

```bash
node scripts/check-integration-readiness.mjs
```

Machine-readable output:

```bash
node scripts/check-integration-readiness.mjs --json
```

Strict mode is intended for the point where an integration is expected to be code-clean:

```bash
node scripts/check-integration-readiness.mjs --strict
```

Strict mode exits non-zero for `CODE_CONFLICT` or `ERROR`.

## GitHub Actions

`.github/workflows/integration-readiness.yml` runs on `main`, on relevant pull requests, and manually through `workflow_dispatch`. It:

1. fetches the canonical refs without modifying them;
2. writes a human-readable table to the Actions job summary;
3. uploads `integration-readiness.json` as an artifact for machine review.

The workflow is observational. It must never be treated as a substitute for P5/P6/P7 imported-Figma runtime acceptance or same-artifact offline verification.
