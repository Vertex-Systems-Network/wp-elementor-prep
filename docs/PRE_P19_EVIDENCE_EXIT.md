# Pre-P19 evidence exit gate

Status: OPEN / NOT SATISFIED  
Owner: Issue #846  
Baseline main: `6b79b569b14618dec67744310b2794a2bab49e29` (2026-09-28)

P19 implementation stays frozen until P15, P16, P17 and P18 each have a separately reviewed, evidence-backed exit. This gate coordinates sequencing; it grants no runtime, production, publishing, download, or compatibility authority. Routine implementation and safe green merges before P19 are authorized by the user. Missing external proof remains missing even when code and CI pass.

| Phase | Current retained state | Required exit evidence | Refusal boundary |
|---|---|---|---|
| P15 Elementor | Deterministic Template JSON candidate, explicit mappings and controlled WP 6.8 / Elementor 4.2.4 proof; read-only Image/Container MEDIA diagnostics | Supported artifact/package and source identity; durable target-managed Package 13/14 media mapping; loaded images; Figma-vs-import desktop/mobile geometry and spacing comparison; documented scope-specific internal decision | No arbitrary ZIP parity, portable numeric attachment ID, general compatibility, production/download claim from diagnostics or a draft document save |
| P16 Gutenberg | Native candidate/receipt and offline retention validation; target validation unwired | Genuine authenticated evidence and current exact candidate; native serialization and editor/import/render on an identified WordPress target; explicit internal decision | Caller metadata, manifest READY or local validation cannot authenticate or approve native target behavior |
| P17 Web export/code-to-design | Static IR→HTML/CSS package validation and one controlled loopback Chrome observation | Calibrated source-to-render visual comparison; bounded static HTML/CSS-to-new-Figma reconstruction with explicit unsupported-feature report; JS only after separate sandbox policy and runtime proof | A page loading in Chrome is not visual fidelity; no arbitrary JS execution or silent source mutation |
| P18 Framework adapters | Planned; neutral Web IR exists, adapter implementation not started | Fresh R0 official-source research + R1 matrix; bounded adapter SDK and a first named framework slice with build/render/source binding; later frameworks require their own proof | One adapter cannot certify all frameworks; NestJS is backend scaffolding paired with a front-end, not a design renderer |

## Execution order

1. Finish safe bounded implementation and exact-head merge/security gates by evidence family.
2. Capture real target/source observations when reachable; retain input, version, identity, artifact hashes, screenshots/geometry and failures. Mark low-confidence or absent observations REVIEW/PENDING.
3. Review each phase's scope-specific exit separately. Implementation complete, internal target-ready, production accepted and marketplace approved are distinct.
4. Open P19 only after all four exits are actually satisfied. P12 #84, P13 #159, branch protection #287 and P27 #182 remain independent gates.

Package 13/14 temporary Figma asset URLs currently have no matching source bytes or permanent WordPress attachment mapping in the retained handoff. The older Adrian Voss media pack cannot be substituted. The draft import probe is not a browser visual comparison. Do not close P15 on this evidence.

This gate does not require another routine consent request before P19. It also does not authorize credentials, external account changes, production deployment, paid actions, destructive migration or invented manual evidence.
