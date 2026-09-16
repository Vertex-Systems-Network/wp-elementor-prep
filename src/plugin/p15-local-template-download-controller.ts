import { buildP15ElementorV1PreviewFromFigmaFrame } from './p15-neutral-export-extractor';
import { buildP15LocalTemplateDownloadResult } from './p15-local-template-download';

function selectedFrame(): FrameNode | null {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1) return null;
  const selected = selection[0];
  return selected?.type === 'FRAME' ? selected : null;
}

function runP15LocalTemplateDownload(): void {
  const frame = selectedFrame();
  if (!frame) {
    figma.ui.postMessage({
      type: 'p15-elementor-local-template-download-unavailable',
      message: 'Select exactly one Frame before downloading a locally validated Elementor Template JSON.',
    });
    return;
  }

  try {
    // Freshness is intentional: every explicit request re-reads the current selected Frame and rebuilds
    // extraction -> readiness -> generation before the separate download contract revalidates the template.
    const extraction = buildP15ElementorV1PreviewFromFigmaFrame(frame);
    const result = buildP15LocalTemplateDownloadResult({ id: frame.id }, extraction);
    figma.ui.postMessage({
      type: 'p15-elementor-local-template-download-result',
      result,
    });

    if (result.status === 'LOCAL_ARTIFACT_VALIDATED') {
      figma.notify('Elementor Template JSON locally validated. Target import is not verified.');
    } else {
      const reason = result.blockReasonCodes[0] ?? 'P15_DOWNLOAD_BLOCKED';
      figma.notify(`Elementor Template JSON download blocked: ${reason}.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({
      type: 'p15-elementor-local-template-download-unavailable',
      message: `P15 local Elementor Template JSON could not be built safely: ${message}`,
    });
  }
}

const previousOnMessage = figma.ui.onmessage;
figma.ui.onmessage = (message, props) => {
  if (typeof message === 'object'
    && message !== null
    && 'type' in message
    && (message as { type?: unknown }).type === 'p15-elementor-local-template-download-request') {
    runP15LocalTemplateDownload();
    return;
  }

  previousOnMessage?.(message, props);
};
