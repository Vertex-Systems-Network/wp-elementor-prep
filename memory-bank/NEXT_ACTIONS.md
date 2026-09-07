# Next Actions

Last updated: 2026-09-08

Execute in this order:

1. Commit the final P2 calibration/docs/memory synchronization to `feat/p2-classifier-semantics`.
2. Confirm CI remains green on that final P2 head.
3. Update PR #11 with final evidence: five-template semantic review, false-positive regressions, positive-case preservation, role safety and read-only status.
4. Mark PR #11 ready, merge it to `main`, and close issue #3 only if CI is green and there is no known high-confidence semantic/role false positive.
5. Create `feat/p3-validator` from the merged `main` head.
6. Start P3 with a pure validation model before any PNG/UI work:
   - geometry snapshots,
   - text-content fingerprints,
   - image-fill fingerprints,
   - structural sanity,
   - versioned threshold/result types,
   - no-op and known-drift fixtures.
7. Add section-level Figma `exportAsync()` capture and plugin-UI Canvas pixel-diff only after deterministic integrity checks are stable.
8. Keep all P3 behavior read-only; validator code may inspect/export, but must not apply layout transformations.
9. Do **not** enable Safe Fix before P4 transaction/rollback foundations also exist.

## Immediate definition of success

P2 is complete when PR #11 is merged and issue #3 is closed with green CI.

P3 foundation is successful when:

- identical snapshots pass,
- geometry drift produces explicit failure evidence,
- text-content drift produces explicit failure evidence,
- image-fill drift produces explicit failure evidence,
- thresholds are versioned/configurable,
- validation result is deterministic and serializable,
- no Figma design mutation is required to run tests.
