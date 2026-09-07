# Next Actions

Last updated: 2026-09-07

Execute in this order:

1. Merge/review the Phase 0 foundation PR after CI passes.
2. Fix any build/type/test failures in the scaffold before adding features.
3. Implement robust `discoverSections()` using selected-frame/page-wrapper geometry rather than names alone.
4. Replace the simple score with an evidence-based weighted finding model.
5. Add normalized JSON fixtures for:
   - strong Auto Layout section,
   - manual two-column section,
   - 2x3 grid,
   - carousel-like overflow,
   - decorative-background overlap,
   - timeline chapter.
6. Add classifier unit tests for row/column/grid clustering.
7. Run the Audit-Only plugin against the live golden Figma page and compare section scores to the manual audit.
8. Record discrepancies in `memory-bank/PROJECT_STATE.md` and create focused issues.
9. Do **not** implement mutation recipes until P2 classifier confidence is validated and P3/P4 safety foundations are underway.

## Immediate definition of success

The next checkpoint is reached when the plugin can scan a selected desktop frame and produce a stable, explainable, read-only report that correctly separates strong and weak sections on the golden fixture.
