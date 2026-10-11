import { buildP15ElementorPackFromFigmaFrame } from './p15-elementor-pack-builder';
import { buildP15AssetPackDownloadResult } from './p15-asset-pack-download';

/** Recovery M3.7: explicit request → fresh selected-frame asset pack → labelled ZIP download envelope. */
function selectedFrame(): FrameNode | null {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1) return null;
  const selected = selection[0];
  return selected?.type === 'FRAME' ? selected : null;
}

async function runP15AssetPackDownload(): Promise<void> {
  const frame = selectedFrame();
  if (!frame) {
    figma.ui.postMessage({
      type: 'p15-elementor-asset-pack-unavailable',
      message: 'Select exactly one Frame before downloading an Elementor asset pack.',
    });
    return;
  }
  try {
    // Every request re-reads the current selection; nothing is reused from an earlier preview.
    const result = buildP15AssetPackDownloadResult(await buildP15ElementorPackFromFigmaFrame(frame, figma));
    figma.ui.postMessage({ type: 'p15-elementor-asset-pack-result', result });
    figma.notify(result.status === 'PACK_READY'
      ? `Elementor asset pack built: ${result.label}. Upload the assets before import (see IMPORT.md).`
      : `Elementor asset pack blocked: ${result.blockReason}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({
      type: 'p15-elementor-asset-pack-unavailable',
      message: `Elementor asset pack could not be built safely: ${message}`,
    });
  }
}

const previousOnMessage = figma.ui.onmessage;
figma.ui.onmessage = (message, props) => {
  if (typeof message === 'object'
    && message !== null
    && 'type' in message
    && (message as { type?: unknown }).type === 'p15-elementor-asset-pack-request') {
    void runP15AssetPackDownload();
    return;
  }

  previousOnMessage?.(message, props);
};
