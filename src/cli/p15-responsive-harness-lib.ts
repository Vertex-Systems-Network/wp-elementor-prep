import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { matchP15Breakpoint, type P15MatchNode } from '../core/breakpoint-matcher';
import { buildP15BreakpointSet } from '../core/breakpoint-set';
import { buildP15ElementorV1PreviewFromFigmaFrame } from '../plugin/p15-neutral-export-extractor';
import type { P15NeutralExportDocumentV1, P15NeutralExportNode } from '../targets/elementor/neutral-export-ir';
import { buildP15ResponsiveMerge } from '../targets/elementor/responsive-merge';
import type { ElementorElementV04 } from '../targets/elementor/template-v04';

/**
 * Real-target responsive harness helper (recovery M4.6), used by `p15-real-target-proof.yml`:
 * `fixture --out-dir <dir>` builds a controlled three-breakpoint design (desktop 1440, tablet 1024, mobile 390) as
 * Figma-shaped frames, runs the plugin path frame → IR (extractor) → breakpoint set (M4.1) → matcher (M4.2) →
 * responsive merge (M4.3), and writes the merged template plus `responsive-expectation.json`: the computed styles
 * and positions each viewport must show. Source values are authored by this harness; no compatibility claim follows.
 */
export function fail(message: string): never {
  process.stderr.write(`P15_RESPONSIVE_HARNESS_FAILED: ${message}\n`);
  process.exit(2);
}

type Node = Record<string, unknown>;
const solid = (r: number, g: number, b: number) => ({ type: 'SOLID', visible: true, opacity: 1, blendMode: 'NORMAL', color: { r, g, b } });

function text(id: string, name: string, characters: string, size: number, x: number, y: number): Node {
  const segment = {
    characters, fontName: { family: 'Arial', style: 'Regular' }, fontWeight: 400, fontStyle: 'REGULAR', fontSize: size,
    lineHeight: { unit: 'PIXELS', value: Math.round(size * 1.25) }, letterSpacing: { unit: 'PIXELS', value: 0 }, textCase: 'ORIGINAL',
    textDecoration: 'NONE', fills: [solid(0.06, 0.09, 0.16)], hyperlink: null,
  };
  return {
    id, name, type: 'TEXT', visible: true, characters, textAlignHorizontal: 'LEFT', layoutSizingHorizontal: 'HUG', layoutSizingVertical: 'HUG',
    x, y, width: Math.min(characters.length * size * 0.6, 900), height: Math.round(size * 1.25),
    fills: segment.fills, fontSize: size, fontName: segment.fontName, lineHeight: segment.lineHeight, letterSpacing: segment.letterSpacing,
    textCase: 'ORIGINAL', textDecoration: 'NONE', getStyledTextSegments: () => [segment],
  };
}

function frame(id: string, name: string, extra: Node): Node {
  return {
    id, name, type: 'FRAME', visible: true, layoutMode: 'VERTICAL', layoutWrap: 'NO_WRAP', layoutPositioning: 'AUTO', itemSpacing: 0,
    paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN',
    fills: [], strokes: [], effects: [], opacity: 1, blendMode: 'PASS_THROUGH', rotation: 0, clipsContent: false, x: 0, y: 0, ...extra,
  };
}

const TITLE = 'Responsive harness';
const COPY = 'Desktop, tablet and mobile from one merge.';
const NOTE = 'Desktop and tablet note';
const MENU = 'Mobile menu';

/** One breakpoint frame. Mobile: column hero, copy before title, no note, an extra menu text at the top. */
export function responsiveHarnessFrame(device: 'desktop' | 'tablet' | 'mobile'): Node {
  const p = device[0]!;
  const width = { desktop: 1440, tablet: 1024, mobile: 390 }[device];
  const titleSize = { desktop: 64, tablet: 48, mobile: 32 }[device];
  const title = text(`${p}-title`, 'Title', TITLE, titleSize, 24, 24);
  const copy = text(`${p}-copy`, 'Copy', COPY, 18, 24, 120);
  const note = text(`${p}-note`, 'Note', NOTE, 14, 24, 200);
  const hero = frame(`${p}-hero`, 'Hero', {
    layoutMode: device === 'mobile' ? 'VERTICAL' : 'HORIZONTAL', itemSpacing: { desktop: 48, tablet: 32, mobile: 16 }[device],
    paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40, layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'HUG',
    width, height: 400, children: device === 'mobile' ? [copy, title] : [title, copy, note],
  });
  const children = device === 'mobile' ? [text('m-menu', 'Menu', MENU, 16, 24, 0), hero] : [hero];
  return frame(`${p}-page`, `Page ${device}`, { width, height: 800, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG',
    fills: [solid(1, 1, 1)], children });
}

export interface P15ResponsiveCheck {
  width: number;
  kind: 'style' | 'before';
  /** style: one element and a computed property; before: element `first` precedes `second` along `axis`. */
  dataId?: string;
  text?: string;
  property?: 'display' | 'flexDirection' | 'fontSize';
  expected?: string;
  /** `not`: the computed value must differ from `expected` (e.g. display not none). */
  negate?: boolean;
  first?: string;
  second?: string;
  axis?: 'x' | 'y';
}

function elementIds(nodes: readonly P15NeutralExportNode[], elements: readonly ElementorElementV04[], out = new Map<string, string>()): Map<string, string> {
  nodes.forEach((node, index) => {
    const element = elements[index];
    if (!element) return;
    out.set(node.sourceNodeId, element.id);
    if (node.kind === 'container') elementIds(node.children, element.elements, out);
  });
  return out;
}

export async function buildP15ResponsiveHarnessFixture(outDir: string): Promise<void> {
  const frames = { desktop: responsiveHarnessFrame('desktop'), tablet: responsiveHarnessFrame('tablet'), mobile: responsiveHarnessFrame('mobile') };
  const set = buildP15BreakpointSet(Object.values(frames).map((node) => ({ id: node.id as string, name: node.name as string, width: node.width as number })));
  if (set.status !== 'BREAKPOINT_SET') fail(`breakpoint set: ${set.issues.map((issue) => issue.code).join(', ')}`);
  const documents: Record<string, P15NeutralExportDocumentV1> = {};
  for (const [device, node] of Object.entries(frames)) {
    const preview = buildP15ElementorV1PreviewFromFigmaFrame(node as unknown as FrameNode);
    if (preview.generation.status !== 'GENERATED_LOCAL_CANDIDATE') {
      fail(`${device} extraction is not review-free: ${preview.generation.reviewEntries.map((entry) => entry.reasonCode).join(', ')}`);
    }
    documents[device] = preview.document;
  }
  const merge = buildP15ResponsiveMerge(documents.desktop!, (['tablet', 'mobile'] as const).map((device) => ({
    device, document: documents[device]!, match: matchP15Breakpoint(frames.desktop as unknown as P15MatchNode, frames[device] as unknown as P15MatchNode, device),
  })));
  if (merge.status !== 'MERGED' || !merge.composition?.template || !merge.document) {
    fail(`merge ${merge.status}: ${merge.blockReason ?? merge.reviews.map((review) => `${review.sourceNodeId}:${review.reasonCode}`).join(', ')}`);
  }
  const ids = elementIds(merge.document.nodes, merge.composition.template.content);
  const id = (sourceNodeId: string): string => ids.get(sourceNodeId) ?? fail(`no element for ${sourceNodeId}`);
  const checks: P15ResponsiveCheck[] = [];
  for (const [width, device] of [[1440, 'desktop'], [1024, 'tablet'], [390, 'mobile']] as const) {
    checks.push({ width, kind: 'style', dataId: id('d-hero'), property: 'flexDirection', expected: device === 'mobile' ? 'column' : 'row' });
    checks.push({ width, kind: 'style', text: TITLE, property: 'fontSize', expected: `${{ desktop: 64, tablet: 48, mobile: 32 }[device]}px` });
    checks.push({ width, kind: 'style', dataId: id('d-note'), property: 'display', expected: 'none', negate: device !== 'mobile' });
    checks.push({ width, kind: 'style', dataId: id('m-menu'), property: 'display', expected: 'none', negate: device === 'mobile' });
    checks.push(device === 'mobile'
      ? { width, kind: 'before', first: id('d-copy'), second: id('d-title'), axis: 'y' }
      : { width, kind: 'before', first: id('d-title'), second: id('d-copy'), axis: 'x' });
  }
  const root = resolve(outDir);
  await mkdir(root, { recursive: true });
  await writeFile(join(root, 'responsive-template.json'), `${JSON.stringify(merge.composition.template, null, 2)}\n`);
  await writeFile(join(root, 'responsive-expectation.json'), `${JSON.stringify({ schema: 'p15-responsive-harness-expectation-v1',
    entries: merge.entries, checks, sourceValuesAuthoredByHarness: true }, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ outDir: root, families: Object.keys(merge.entries), checks: checks.length })}\n`);
}
