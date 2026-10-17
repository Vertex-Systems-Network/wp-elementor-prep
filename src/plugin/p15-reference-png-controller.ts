import { buildP15ReferencePngBundle, type P15ReferenceFrameRender } from '../core/reference-png-bundle';
import { confirmedP15BreakpointSet } from './p15-breakpoint-set-controller';

/**
 * Recovery M7.1: explicit request → 1× PNG render of each confirmed breakpoint frame (or the one selected Frame as
 * desktop) → deterministic reference bundle for the round-trip comparison. Read-only: nothing in the file changes.
 */
async function frameById(id: string): Promise<FrameNode | null> {
  const node = await figma.getNodeByIdAsync(id);
  return node?.type === 'FRAME' ? node : null;
}

async function render(frame: FrameNode, device: P15ReferenceFrameRender['device']): Promise<P15ReferenceFrameRender> {
  const png = await frame.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  return { device, frameId: frame.id, name: frame.name, widthPx: frame.width, heightPx: frame.height, png };
}

async function runReferencePngExport(): Promise<void> {
  try {
    const set = confirmedP15BreakpointSet();
    const renders: P15ReferenceFrameRender[] = [];
    if (set) {
      for (const member of set.members) {
        const frame = await frameById(member.frameId);
        if (!frame) throw new Error(`The ${member.device} frame of the confirmed set is no longer available.`);
        renders.push(await render(frame, member.device));
      }
    } else {
      const selection = figma.currentPage.selection;
      const selected = selection.length === 1 ? selection[0] : undefined;
      if (selected?.type !== 'FRAME') {
        figma.ui.postMessage({ type: 'p15-reference-png-unavailable', message: 'Confirm a breakpoint set, or select exactly one Frame, before exporting reference PNGs.' });
        return;
      }
      renders.push(await render(selected, 'desktop'));
    }
    const result = buildP15ReferencePngBundle(renders, set?.fingerprint ?? null);
    figma.ui.postMessage({ type: 'p15-reference-png-result', result });
    figma.notify(result.status === 'BUNDLE_READY'
      ? `Reference PNGs exported: ${result.receipt.frames.map((frame) => frame.device).join(', ')} at 1×.`
      : `Reference PNG export blocked: ${result.blockReason}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: 'p15-reference-png-unavailable', message: `Reference PNGs could not be exported safely: ${message}` });
  }
}

const previousOnMessage = figma.ui.onmessage;
figma.ui.onmessage = (message, props) => {
  if (typeof message === 'object' && message !== null && 'type' in message
    && (message as { type?: unknown }).type === 'p15-reference-png-request') {
    void runReferencePngExport();
    return;
  }
  previousOnMessage?.(message, props);
};
