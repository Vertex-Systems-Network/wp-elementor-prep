import {
  ELEMENTOR_4_2_4_EARLY_ACCESS_FONTS,
  ELEMENTOR_4_2_4_FONT_REGISTRY_DIGEST,
  ELEMENTOR_4_2_4_GOOGLE_FONTS,
  ELEMENTOR_4_2_4_SYSTEM_FONTS,
} from './elementor-font-registry';
import type { P15NeutralExportDocumentV1, P15NeutralExportNode, P15NeutralTypography } from './neutral-export-ir';

/**
 * Font manifest (recovery M2.8): every family and weight a document uses, and whether Elementor 4.2.4 can load it.
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * - `includes/fonts.php` (blob 1ddfd95f447138ee0d25f59d553d5d9e0d8c45fc): the native registry of system, Google and
 *   Google early-access families (copied offline in `elementor-font-registry.ts`), and the `elementor_google_font`
 *   option that gates the Google families (default on).
 * - Elementor enqueues a Google family for a page only when a typography control on that page names it, so a family
 *   used only inside an inline `<span style>` is never loaded.
 *
 * Reviews: a family outside the registry → `FONT_UPLOAD_REQUIRED` with an upload instruction; a Google family used
 * only in spans → `FONT_NOT_LOADED_FOR_SPAN`. System fonts and families named by a control need nothing.
 */
export const P15_FONT_MANIFEST_VERSION = 'p15-font-manifest-v1' as const;
export const FONT_UPLOAD_REVIEW = 'FONT_UPLOAD_REQUIRED';
export const FONT_SPAN_REVIEW = 'FONT_NOT_LOADED_FOR_SPAN';

export type P15FontSource = 'system' | 'google' | 'google-early-access' | 'upload-required';

export interface P15FontManifestEntry {
  family: string;
  source: P15FontSource;
  /** Weights used, as `400`, `700italic` …, sorted. */
  weights: string[];
  /** Named by a typography control (and so loaded by Elementor), or only by inline spans. */
  usage: 'control' | 'span-only';
  firstSourceNodeId: string;
}

export interface P15FontManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_FONT_MANIFEST_VERSION;
  registry: 'elementor-4.2.4-native-fonts';
  registryDigest: typeof ELEMENTOR_4_2_4_FONT_REGISTRY_DIGEST;
  /** True when any family is a Google family: the site must keep Elementor's Google Fonts option on. */
  requiresGoogleFontsOption: boolean;
  families: P15FontManifestEntry[];
}

export interface P15FontReview {
  sourceNodeId: string;
  reasonCode: string;
  detail: string;
}

const SYSTEM = new Set(ELEMENTOR_4_2_4_SYSTEM_FONTS);
const GOOGLE = new Set(ELEMENTOR_4_2_4_GOOGLE_FONTS);
const EARLY_ACCESS = new Set(ELEMENTOR_4_2_4_EARLY_ACCESS_FONTS);

export function classifyP15FontFamily(family: string): P15FontSource {
  if (SYSTEM.has(family)) return 'system';
  if (GOOGLE.has(family)) return 'google';
  if (EARLY_ACCESS.has(family)) return 'google-early-access';
  return 'upload-required';
}

interface Use {
  weights: Set<string>;
  control: boolean;
  firstSourceNodeId: string;
}

const weightKey = (typography: P15NeutralTypography | undefined, base?: P15NeutralTypography): string =>
  `${typography?.fontWeight ?? base?.fontWeight ?? '400'}${(typography?.fontStyle ?? base?.fontStyle) === 'italic' ? 'italic' : ''}`;

function collect(nodes: readonly P15NeutralExportNode[], uses: Map<string, Use>): void {
  const note = (family: string | undefined, weight: string, control: boolean, sourceNodeId: string) => {
    if (family === undefined) return;
    const use = uses.get(family) ?? { weights: new Set<string>(), control: false, firstSourceNodeId: sourceNodeId };
    use.weights.add(weight);
    use.control ||= control;
    uses.set(family, use);
  };
  for (const node of nodes) {
    if (node.kind === 'container') {
      collect(node.children, uses);
      continue;
    }
    if (node.kind !== 'text' && node.kind !== 'heading' && node.kind !== 'button') continue;
    const base = node.typography;
    note(base?.fontFamily, weightKey(base), true, node.sourceNodeId);
    if (node.kind !== 'text') continue;
    for (const paragraph of node.paragraphs ?? []) {
      for (const span of paragraph.spans) {
        if (span.style === undefined) continue;
        // A span inherits the node family unless it names its own.
        const family = span.style.fontFamily ?? base?.fontFamily;
        note(family, weightKey(span.style, base), family === base?.fontFamily, node.sourceNodeId);
      }
    }
  }
}

/** Build the font manifest of a validated neutral document and the reviews it implies. */
export function buildP15FontManifest(document: P15NeutralExportDocumentV1): { manifest: P15FontManifestV1; reviews: P15FontReview[] } {
  const uses = new Map<string, Use>();
  collect(document.nodes, uses);
  const families = [...uses.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([family, use]): P15FontManifestEntry => ({
    family,
    source: classifyP15FontFamily(family),
    weights: [...use.weights].sort(),
    usage: use.control ? 'control' : 'span-only',
    firstSourceNodeId: use.firstSourceNodeId,
  }));
  const reviews: P15FontReview[] = [];
  for (const entry of families) {
    const used = `"${entry.family}" (${entry.weights.join(', ')})`;
    if (entry.source === 'upload-required') {
      reviews.push({ sourceNodeId: entry.firstSourceNodeId, reasonCode: FONT_UPLOAD_REVIEW,
        detail: `${used} is not an Elementor 4.2.4 system or Google font. Upload it as a custom font on the site (for example Elementor Custom Fonts or the theme) with these weights before import; until then the browser falls back to another font.` });
    } else if (entry.usage === 'span-only' && entry.source !== 'system') {
      reviews.push({ sourceNodeId: entry.firstSourceNodeId, reasonCode: FONT_SPAN_REVIEW,
        detail: `${used} is used only inside styled text runs. Elementor loads a Google font only when a typography control names it, so these runs would fall back.` });
    }
  }
  return {
    manifest: {
      schemaVersion: 1,
      manifestVersion: P15_FONT_MANIFEST_VERSION,
      registry: 'elementor-4.2.4-native-fonts',
      registryDigest: ELEMENTOR_4_2_4_FONT_REGISTRY_DIGEST,
      requiresGoogleFontsOption: families.some((entry) => entry.source === 'google' || entry.source === 'google-early-access'),
      families,
    },
    reviews,
  };
}
