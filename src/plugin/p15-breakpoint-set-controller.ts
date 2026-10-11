import type { P15MatchNode } from '../core/breakpoint-matcher';
import { responsiveReportFor } from '../core/breakpoint-report';
import { buildP15BreakpointSet, type P15BreakpointSetV1 } from '../core/breakpoint-set';
import { breakpointFramesFromSelection } from './p15-breakpoint-selection';
import { alignP15BreakpointDuplicate } from './p15-structure-alignment';

/**
 * Recovery M4.1: classify the selected frames into a breakpoint set, show it, and record it only when the user
 * confirms the exact set they saw. A confirmation is re-checked against the current selection (same fingerprint);
 * any selection change clears the confirmed set. Recovery M4.5: a confirmed set comes with its responsive report
 * (per desktop section: match status and confidence on each breakpoint).
 */
let confirmedSet: P15BreakpointSetV1 | null = null;

/** The breakpoint set the user confirmed for the current selection, if any (consumed by the M4 responsive export). */
export function confirmedP15BreakpointSet(): P15BreakpointSetV1 | null {
  return confirmedSet;
}

function currentSet(): P15BreakpointSetV1 | string {
  const selection = breakpointFramesFromSelection(figma.currentPage.selection as unknown as Parameters<typeof breakpointFramesFromSelection>[0]);
  return selection.ok ? buildP15BreakpointSet(selection.frames) : selection.message;
}

/** The selected frames (or the selected Section's frames) by id, as matcher nodes. */
function selectedFramesById(): Map<string, P15MatchNode> {
  const selection = figma.currentPage.selection;
  const frames = selection.length === 1 && selection[0]!.type === 'SECTION' ? selection[0]!.children : selection;
  return new Map(frames.map((node) => [node.id, node as unknown as P15MatchNode]));
}

function runBreakpointSet(): void {
  confirmedSet = null;
  const set = currentSet();
  if (typeof set === 'string') {
    figma.ui.postMessage({ type: 'p15-breakpoint-set-unavailable', message: set });
    return;
  }
  figma.ui.postMessage({ type: 'p15-breakpoint-set-result', set });
}

function confirmBreakpointSet(fingerprint: unknown): void {
  const set = currentSet();
  if (typeof set === 'string' || set.status !== 'BREAKPOINT_SET' || typeof fingerprint !== 'string' || set.fingerprint !== fingerprint) {
    confirmedSet = null;
    figma.ui.postMessage({ type: 'p15-breakpoint-set-unavailable',
      message: 'The selection changed or the set is not confirmable. Detect breakpoints again before confirming.' });
    return;
  }
  confirmedSet = set;
  figma.ui.postMessage({ type: 'p15-breakpoint-set-confirmed', set, report: responsiveReportFor(set, selectedFramesById()) });
  figma.notify(`Breakpoint set confirmed: ${set.members.map((member) => member.device).join(', ')}.`);
}

/** Recovery M5.5: align the confirmed tablet/mobile frames with the desktop hierarchy, each on a validated duplicate. */
async function runStructureAlignment(): Promise<void> {
  const set = confirmedSet;
  const frames = selectedFramesById();
  const desktop = set?.members.find((member) => member.device === 'desktop');
  const desktopFrame = desktop ? frames.get(desktop.frameId) : undefined;
  if (!set || !desktopFrame) {
    figma.ui.postMessage({ type: 'p15-structure-alignment-unavailable', message: 'Confirm a breakpoint set for the current selection first.' });
    return;
  }
  const results = [];
  for (const member of set.members.filter((entry) => entry.device !== 'desktop')) {
    const frame = frames.get(member.frameId);
    if (frame) results.push(await alignP15BreakpointDuplicate(desktopFrame as unknown as FrameNode, frame as unknown as FrameNode, member.device as 'tablet' | 'mobile'));
  }
  figma.ui.postMessage({ type: 'p15-structure-alignment-result', results });
  figma.notify(`Structure alignment: ${results.map((result) => `${result.device} ${result.status.toLowerCase()}`).join(', ') || 'nothing to align'}.`);
}

figma.on('selectionchange', () => {
  confirmedSet = null;
});

const previousOnMessage = figma.ui.onmessage;
figma.ui.onmessage = (message, props) => {
  const type = typeof message === 'object' && message !== null && 'type' in message ? (message as { type?: unknown }).type : undefined;
  if (type === 'p15-breakpoint-set-request') {
    runBreakpointSet();
    return;
  }
  if (type === 'p15-structure-alignment-request') {
    void runStructureAlignment();
    return;
  }
  if (type === 'p15-breakpoint-set-confirm') {
    confirmBreakpointSet((message as { fingerprint?: unknown }).fingerprint);
    return;
  }
  previousOnMessage?.(message, props);
};
