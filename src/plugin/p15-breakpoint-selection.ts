import type { P15BreakpointFrameInput } from '../core/breakpoint-set';

/**
 * Recovery M4.1: the frames of a breakpoint set from the current selection. Either 2–3 selected frames, or one
 * selected Section whose visible direct child frames are the set. Anything else is refused with a reason.
 */
interface SelectedNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  width?: number;
  children?: readonly SelectedNode[];
}

export type P15BreakpointSelection =
  | { ok: true; source: 'frames' | 'section'; frames: P15BreakpointFrameInput[] }
  | { ok: false; message: string };

const frameInput = (node: SelectedNode): P15BreakpointFrameInput => ({ id: node.id, name: node.name, width: node.width ?? Number.NaN });

export function breakpointFramesFromSelection(selection: readonly SelectedNode[]): P15BreakpointSelection {
  if (selection.length === 1 && selection[0]!.type === 'SECTION') {
    const frames = (selection[0]!.children ?? []).filter((child) => child.type === 'FRAME' && child.visible !== false);
    return { ok: true, source: 'section', frames: frames.map(frameInput) };
  }
  if (selection.length === 0 || selection.some((node) => node.type !== 'FRAME')) {
    return { ok: false, message: 'Select 2 or 3 Frames (desktop plus tablet and/or mobile), or one Section containing them.' };
  }
  return { ok: true, source: 'frames', frames: selection.map(frameInput) };
}
