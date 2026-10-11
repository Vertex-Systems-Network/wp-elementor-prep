import { buildP15BreakpointSet, type P15BreakpointSetV1 } from '../core/breakpoint-set';
import { breakpointFramesFromSelection } from './p15-breakpoint-selection';

/**
 * Recovery M4.1: classify the selected frames into a breakpoint set, show it, and record it only when the user
 * confirms the exact set they saw. A confirmation is re-checked against the current selection (same fingerprint);
 * any selection change clears the confirmed set.
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
  figma.ui.postMessage({ type: 'p15-breakpoint-set-confirmed', set });
  figma.notify(`Breakpoint set confirmed: ${set.members.map((member) => member.device).join(', ')}.`);
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
  if (type === 'p15-breakpoint-set-confirm') {
    confirmBreakpointSet((message as { fingerprint?: unknown }).fingerprint);
    return;
  }
  previousOnMessage?.(message, props);
};
