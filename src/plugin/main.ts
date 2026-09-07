import { scanSceneNode } from '../core/scanner';
import { buildAuditReport } from '../core/scoring';

declare const __html__: string;

const PLUGIN_VERSION = '0.1.0-alpha.1';

figma.showUI(__html__, {
  width: 440,
  height: 680,
  themeColors: true,
});

function postError(message: string): void {
  figma.ui.postMessage({ type: 'audit-error', message });
}

function runAudit(): void {
  const selection = figma.currentPage.selection;

  if (selection.length !== 1) {
    postError('Select exactly one desktop frame to audit.');
    return;
  }

  const selected = selection[0];
  if (!selected || selected.type !== 'FRAME') {
    postError('Audit-Only MVP currently supports one selected Figma Frame.');
    return;
  }

  try {
    const root = scanSceneNode(selected);
    const report = buildAuditReport(root, PLUGIN_VERSION);
    figma.ui.postMessage({ type: 'audit-result', report });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Audit failed: ${message}`);
  }
}

figma.ui.onmessage = (message: unknown) => {
  if (typeof message === 'object' && message !== null && 'type' in message) {
    const type = (message as { type?: unknown }).type;
    if (type === 'audit-request') runAudit();
  }
};

figma.on('selectionchange', runAudit);
runAudit();
