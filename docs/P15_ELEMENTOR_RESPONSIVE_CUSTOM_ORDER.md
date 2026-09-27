# P15 explicit responsive Flex Item custom order

Issue #825 tracks this bounded Elementor 4.2.4 resolver. The manifest binds to the exact neutral source fingerprint and base candidate identity. Each selected Container needs a complete tablet or mobile pair: `tabletOrderCustom: true` with `tabletOrderValue`, or the corresponding mobile pair. Omitted breakpoints remain absent. Desktop settings and the approved source are preserved.

The resolver writes `_flex_order_{tablet|mobile}: "custom"` and numeric `_flex_order_custom_{tablet|mobile}` to the bound generated Container. It accepts safe integers from -1000 through 1000 as a repository policy; Elementor's NUMBER control does not declare this range. Invalid, partial, duplicate, stale, unknown, or conflicting entries fail closed. This does not infer a design's intended visual order. Negative values may move a child ahead of other siblings.

Evidence: pinned Elementor 4.2.4 group source `includes/controls/groups/flex-item.php` at blob `dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a`; PR #826 observed the real runtime style-control registration; PR #827 retained target-saved and target-exported values `2/-2` and `1/0`; PR #828 measured computed CSS order and top positions at 1280, 768 and 375px. The QUnit Container fixture's numeric-only order controls diverge from the current PHP group and are not treated as saved custom-order authority.

These target vectors were script-authored and imported. The editor's own generated serialization remains unobserved. The candidate and summary keep inference, mutation, network, responsive closure, broad target compatibility, production and download flags false. A real design's tablet/mobile intent and wider import parity require separate review.
