# R0 Handoff + Accessibility/SEO Advisory Snapshot — 2026-09-11

Status: RESEARCH / PLANNING-ONLY  
Owner roadmap issue: #119  
Target phase: P21 — Developer Handoff + Client/QA + Accessibility/SEO Advisories  
Dependencies: #84 P12 internal release exit; accepted P13-P20 evidence contracts  
Date: 2026-09-11

## 1. Purpose

This snapshot records current public accessibility and search guidance that constrains P21 advisory output. It is planning evidence only. It does not open P21 runtime implementation and does not convert deterministic advisories into legal, regulatory or ranking guarantees.

P21 should transform the evidence produced by the audit/export/QA pipeline into a useful human and machine handoff without overstating what automated checks prove.

## 2. Accessibility baseline — WCAG 2.2

W3C currently recommends WCAG 2.2 as the current WCAG 2 standard. WCAG conformance applies at a full-page level and combines testable success criteria with technology-specific techniques and human evaluation. WCAG 2.2 adds criteria including Focus Not Obscured, Dragging Movements, Target Size, Redundant Entry and Accessible Authentication.

P21 consequences:

- automated findings are evidence/advisories, not a full WCAG conformance claim;
- a generated report must identify the WCAG version/criterion only when the product has an accepted deterministic mapping;
- criteria requiring human judgment remain `MANUAL_REVIEW_REQUIRED` rather than guessed PASS/FAIL;
- full-page conformance must not be inferred from checks on a selected Figma frame/section alone;
- Level A/AA/AAA claims require explicit accepted conformance logic and complete applicable coverage, which is outside the first P21 scope.

## 3. Accessible names and native semantics

Current W3C ARIA Authoring Practices guidance emphasizes that interactive elements require effective accessible names and recommends visible text and native HTML naming techniques before ARIA overrides. It warns that incorrect `aria-label`/ARIA use can hide descendant content from assistive technologies.

P21 consequences:

- the advisory layer should prefer native semantic correction suggestions before ARIA-only workarounds;
- missing/ambiguous button/link/form labels can be detected only where target/source evidence is sufficient;
- the report must distinguish `VISIBLE_LABEL_PRESENT`, `ACCESSIBLE_NAME_VERIFIED`, `NAME_MISSING`, `NAME_AMBIGUOUS`, and `INSUFFICIENT_EVIDENCE`;
- P21 should never auto-suggest a fabricated factual label/alt description as accessibility truth;
- generated target accessibility verification from P20 has higher authority than a visual-only source guess.

## 4. ARIA patterns are guidance, not automatic certification

The W3C APG documents patterns for accessible widgets and keyboard behavior, but APG examples/practices are not themselves a legal compliance certificate or a substitute for testing the generated target with assistive technologies.

P21 consequences:

- accepted P17/P20 interaction recipes may link to known keyboard/name/state expectations;
- a recipe can be reported as `BEHAVIOR_VERIFIED` only when P20 actually observed the required interaction outcome;
- absence of an APG-style issue does not imply overall accessibility compliance.

## 5. SEO baseline — Google Search Central

Google Search Central's current SEO Starter Guide emphasizes helpful, well-organized content, descriptive/unique page titles, useful link text, understandable images/alt text and crawlable site structure. It explicitly states there is no secret that automatically ranks a site first and notes that heading order is valuable for screen readers but is not a magical Google ranking requirement.

P21 consequences:

- P21 is an SEO/readiness advisory, never a ranking guarantee;
- page-title/meta-description checks are document/page metadata checks, not Figma-only visual checks unless explicit source metadata exists;
- heading hierarchy is primarily a semantic/accessibility quality signal in the product and must not be marketed as a direct Google ranking score;
- descriptive anchor text and image alt text can be checked where target/source values are available;
- crawlability, canonicalization, robots, sitemap, redirects, structured data, Core Web Vitals and index status require target/site/runtime evidence and are outside a static Figma-only report unless supplied by a later connected/site audit capability.

## 6. Frozen P21 architecture decisions

1. **Evidence-first handoff.** P21 summarizes accepted evidence from P13-P20; it does not recompute target readiness from prose.
2. **Advisory != certification.** Accessibility, SEO, performance and legal labels are bounded and explicit.
3. **Source vs target findings remain separate.** A Figma design advisory is not the same as an observed generated-site defect.
4. **Automated vs manual review remains separate.** Human-judgment criteria are not auto-passed.
5. **No fabricated content.** Missing alt text, labels, metadata or SEO copy are reported as missing/review unless the user explicitly authors them.
6. **No ranking prediction.** P21 may report technical/content hygiene evidence but not expected Google position or traffic uplift.
7. **No legal conformance statement.** The report may state tested rules and limitations, never blanket legal compliance.
8. **P20 verification has higher target authority.** If a generated target was actually rendered/interaction-tested, that observed evidence supersedes design-only inference for the same property.
9. **Every finding is source-traceable.** Node/element/route/adapter provenance is retained.
10. **Client-safe wording is deterministic.** Severity, status and limitation text are template/rule driven rather than free-form AI claims in the core.
11. **Machine-readable + human-readable outputs share the same finding IDs.**
12. **Optional future AI may explain findings but cannot change status/severity/evidence.**

## 7. Initial accessibility advisory families

P21 should initially support only evidence that can be bounded deterministically:

- heading-level/hierarchy advisories from accepted semantic plans/targets;
- image alt/decorative metadata state from P19/P20;
- interactive accessible-name completeness from P17/P20 target evidence;
- link/button naming completeness;
- form label presence only where form semantics are explicit;
- color contrast where foreground/background values are deterministically resolvable;
- focus visibility/obscuration only when target interactive-state evidence exists;
- target-size advisory only when rendered target geometry is available;
- keyboard interaction verification only for accepted P17 recipes/P20 scenarios;
- obvious landmark/semantic structure advisories from target plan/output;
- language declaration presence only on generated/observed document targets;
- reduced-motion/animation advisories only where actual motion rules are known.

Anything requiring user intent, content meaning, disability-specific usability judgment or assistive-technology interpretation may require manual review.

## 8. Contrast boundary

Contrast checks are valid only when the rendered/used foreground and background can be resolved deterministically.

Complications that can force REVIEW include:

- gradients;
- background images;
- transparency/blend modes;
- text over video;
- multiple overlapping backgrounds;
- state-dependent colors;
- dynamic themes/modes not selected;
- unknown browser/theme overrides.

P21 does not flatten ambiguous visual stacks and report a false precise contrast ratio.

## 9. SEO advisory families

Initial target-aware SEO advisories may include:

- document title present/unique within supplied project scope;
- meta description present/duplicate within supplied project scope;
- one clear page-level primary heading advisory where source/target semantics are known;
- descriptive anchor/link text completeness;
- image alt-state completeness;
- crawlable link target presence where generated target hrefs are known;
- no obvious placeholder/empty metadata;
- canonical/robots only when explicit target metadata is present;
- structured-data presence/validation only when the target artifact actually contains it;
- content duplication only within the supplied bounded project corpus, never against the entire web.

P21 does not infer search-index status or ranking from a static artifact.

## 10. Performance advisory boundary

P21 may expose obvious handoff/performance risk evidence already known from artifacts, such as:

- oversized source/display asset mismatch;
- unusually large packaged media;
- duplicate asset payloads;
- missing responsive image strategy;
- excessive generated client-side interaction/hydration relative to the accepted profile;
- font payload/missing subset strategy where deterministic evidence exists.

It must not report synthetic Core Web Vitals unless a runtime harness actually measures them under a versioned test profile.

## 11. Client/developer report boundary

The same underlying evidence may have different presentation layers:

- **Developer Handoff** — exact source/target IDs, file paths, tokens, mappings, blockers, unsupported features, code/import/build/QA evidence.
- **Client QA Summary** — high-level readiness, major review items, what was verified, what still needs manual review, limitations.
- **Accessibility Advisory** — deterministic accessibility-related findings plus manual-review requirements.
- **SEO Advisory** — deterministic target/site metadata/semantic findings plus scope limits.

Presentation can differ; underlying status cannot.

## 12. Severity vocabulary

Suggested common severity:

- `BLOCKER`;
- `HIGH`;
- `MEDIUM`;
- `LOW`;
- `INFO`;
- `UNKNOWN`.

Severity is not equivalent to legal impact or ranking impact. The report should say what dimension the severity represents, such as build readiness, accessibility usability risk, target incompatibility or handoff completeness.

## 13. Confidence/provenance vocabulary

Every advisory should include evidence provenance such as:

- `SOURCE_OBSERVED`;
- `TARGET_GENERATED`;
- `TARGET_RENDER_OBSERVED`;
- `INTERACTION_OBSERVED`;
- `USER_DECLARED`;
- `DERIVED_DETERMINISTIC`;
- `MANUAL_REVIEW_REQUIRED`;
- `UNKNOWN`.

This prevents a visual-source heuristic from being presented with the same authority as a target-runtime observation.

## 14. R0 refresh triggers

Refresh this snapshot before implementation if:

- WCAG publishes a new Recommendation/version relevant to the target scope;
- WAI-ARIA/APG naming/widget guidance materially changes;
- Google Search Essentials/SEO Starter guidance materially changes;
- P21 adds legal/compliance claims;
- P21 adds automated accessibility tree/assistive-technology execution;
- P21 adds live-site crawl/index/Search Console evidence;
- P21 adds Core Web Vitals/Lighthouse-style runtime metrics;
- P21 adds AI-authored alt text/SEO copy as a product feature;
- supported target adapters add new semantics/dynamic content capabilities.

## 15. Source references retained

Checked 2026-09-11:

- W3C WCAG 2.2 Recommendation;
- W3C WAI-ARIA Authoring Practices Guide, including Accessible Names and Descriptions guidance;
- Google Search Central SEO Starter Guide.

These sources guide advisory boundaries. Product acceptance still depends on repository-owned tests and retained runtime evidence.

## 16. Non-authorizing statement

This snapshot does not advance P12, does not authorize P21 runtime implementation, does not establish WCAG/legal conformance, and does not guarantee SEO ranking or search traffic outcomes.