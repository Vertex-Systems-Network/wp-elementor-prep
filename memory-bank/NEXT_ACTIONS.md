# Next Actions

Last updated: 2026-09-07

Execute in this order:

1. Confirm CI on the latest P2 timeline fallback + regression-test head; fix any typecheck/test/build failure immediately.
2. Run read-only semantic calibration on representative sections from the five-template set and record any false positive/negative.
3. Harden semantic hints only with general geometric/subtree evidence; never use customer copy or calibration node IDs in production rules.
4. Add/verify dedicated fixtures for facts-list and footer-columns, including adversarial non-footer rows and ordinary stacked content.
5. Review special-role output from Marcus/Doctor/Esthetic/Lawyer/Legacy; keep low-opacity decorative detection conservative.
6. Update PR #11 with final P2 acceptance evidence and mark ready only when CI is green and no known high-confidence semantic false positive remains.
7. Close issue #3 only after P2 acceptance criteria are satisfied.
8. After P2 merge, start P3 validator design: geometry snapshot, text integrity, image integrity, export/pixel diff and threshold policy.
9. Do **not** enable Safe Fix before P3 validator and P4 transaction/rollback foundations exist.

## Immediate definition of success

P2 is merge-ready when:

- same-target redundant patterns are de-duplicated by specificity,
- semantic hints remain explainable and conservative,
- timeline semantics work for both structured and manual chapter stacks,
- background/absolute/decorative roles are reported without mutation,
- adversarial overlap/overflow tests pass,
- five real templates remain broadly explainable,
- typecheck/tests/build are green,
- runtime remains read-only.
