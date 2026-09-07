# Next Actions

Last updated: 2026-09-08

Execute in this order:

1. Confirm CI is green on the final P3 documentation/code head.
2. Update PR #12 with completed P3 evidence:
   - integrity snapshots and fingerprints,
   - geometry/content/image failure reasons,
   - section-level PNG export,
   - Canvas/ImageData pixel diff,
   - versioned pixel thresholds,
   - representative live no-op export calibration,
   - read-only safety boundary.
3. Verify issue #4 acceptance criteria against the current branch and add any missing regression fixture before merge.
4. Mark PR #12 ready and merge only if CI remains green and P3 still contains no design mutation path.
5. Close issue #4 after merge.
6. Create `feat/p4-transaction-engine` from merged `main`.
7. Implement P4 around the invariant flow:
   `clone -> transform candidate -> validate -> commit/swap OR discard`.
8. First P4 milestone must prove a forced validation failure leaves the approved working section unchanged and candidate cleanup is reliable.
9. Do **not** enable general Safe Fix recipes until P4 rollback guarantees are proven.

## Immediate definition of success

P3 is complete when:

- identical integrity snapshots pass,
- geometry/text/image drift fails with explicit evidence,
- section-level PNG pixel comparison is implemented,
- pixel dimension/drift failures are explicit,
- thresholds are versioned/configurable,
- representative live no-op exports are deterministic,
- typecheck/tests/build are green,
- runtime remains read-only,
- PR #12 is merged and issue #4 is closed.

P4 foundation is successful when a candidate can be cloned and validated transactionally without any failed candidate altering the approved original.
