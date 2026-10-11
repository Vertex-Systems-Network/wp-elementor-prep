import { matchP15Breakpoint, type P15BreakpointMatchV1, type P15MatchNode } from './breakpoint-matcher';
import type { P15BreakpointSetV1 } from './breakpoint-set';

/**
 * Responsive report (recovery M4.5): per section of the desktop frame (its direct visible children), how each
 * breakpoint matched it — status, the matched layer, confidence, and how many layers inside stay unmatched or
 * ambiguous. Pure; built from the M4.2 match results, so it reports exactly what the merge will use.
 */
export const P15_RESPONSIVE_REPORT_VERSION = 'p15-responsive-report-v1' as const;

export interface P15ResponsiveSectionDevice {
  device: P15BreakpointMatchV1['device'];
  status: 'MATCHED' | 'UNMATCHED' | 'AMBIGUOUS';
  variantId: string | null;
  confidence: number | null;
  /** Layers inside the section (desktop side) that this breakpoint did not match. */
  unmatchedInside: number;
  /** Layers inside the section involved in an ambiguous match on this breakpoint. */
  ambiguousInside: number;
}

export interface P15ResponsiveSection {
  desktopId: string;
  name: string;
  devices: P15ResponsiveSectionDevice[];
}

export interface P15ResponsiveReportV1 {
  version: typeof P15_RESPONSIVE_REPORT_VERSION;
  sections: P15ResponsiveSection[];
  /** Variant layers with no desktop counterpart, per breakpoint (top-level count only). */
  variantOnly: Array<{ device: P15BreakpointMatchV1['device']; count: number }>;
}

function descendants(node: P15MatchNode, out = new Set<string>()): Set<string> {
  for (const child of node.children ?? []) {
    if (child.visible === false) continue;
    out.add(child.id);
    descendants(child, out);
  }
  return out;
}

export function buildP15ResponsiveReport(desktop: P15MatchNode, matches: readonly P15BreakpointMatchV1[]): P15ResponsiveReportV1 {
  const sections = (desktop.children ?? []).filter((child) => child.visible !== false).map((section): P15ResponsiveSection => {
    const inside = descendants(section);
    return {
      desktopId: section.id,
      name: section.name,
      devices: matches.map((match): P15ResponsiveSectionDevice => {
        const matched = match.matches.find((entry) => entry.desktopId === section.id);
        const ambiguous = match.ambiguous.some((entry) => entry.desktopId === section.id);
        return {
          device: match.device,
          status: matched ? 'MATCHED' : ambiguous ? 'AMBIGUOUS' : 'UNMATCHED',
          variantId: matched?.variantId ?? null,
          confidence: matched?.confidence ?? null,
          unmatchedInside: match.unmatchedDesktop.filter((id) => inside.has(id)).length,
          ambiguousInside: match.ambiguous.filter((entry) => inside.has(entry.desktopId)).length,
        };
      }),
    };
  });
  const variantOnly = matches.map((match) => ({ device: match.device, count: match.unmatchedVariant.length }));
  return { version: P15_RESPONSIVE_REPORT_VERSION, sections, variantOnly };
}

/** Match each breakpoint frame of a confirmed set against its desktop frame (M4.2) and summarise per section. */
export function responsiveReportFor(set: P15BreakpointSetV1, frames: ReadonlyMap<string, P15MatchNode>): P15ResponsiveReportV1 | null {
  const desktop = set.members.find((member) => member.device === 'desktop');
  const desktopFrame = desktop ? frames.get(desktop.frameId) : undefined;
  if (!desktopFrame) return null;
  const matches = set.members.filter((member) => member.device !== 'desktop').flatMap((member) => {
    const frame = frames.get(member.frameId);
    return frame ? [matchP15Breakpoint(desktopFrame, frame, member.device as 'tablet' | 'mobile')] : [];
  });
  return buildP15ResponsiveReport(desktopFrame, matches);
}
