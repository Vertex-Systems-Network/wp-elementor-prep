import { detectPatterns } from '../core/classification';
import { detectSpecialRoles } from '../core/roles';
import { planSafeRecipes } from '../core/safe-recipe-planner';
import { scanSceneNode } from '../core/scanner';
import { buildAuditReport } from '../core/scoring';
import { FullFrameValidator } from './full-frame-validator';
import type { PixelDiffMetrics } from '../core/validation-types';

declare const __html__: string;

const PLUGIN_VERSION = '0.1.0-alpha.1';

figma.showUI(__html__, {
  width: 440,
  height: 680,
  themeColors: true,
});

const fullFrameValidator = new FullFrameValidator((message) => {
  figma.ui.postMessage(message);
});

function postError(message: string, type: 'audit-error' | 'validation-error' = 'audit-error'): void {
  figma.ui.postMessage({ type, message });
}

function selectedFrame(): FrameNode | null {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1) return null;
  const selected = selection[0];
  return selected?.type === 'FRAME' ? selected : null;
}

function runAudit(): void {
  const selected = selectedFrame();
  if (!selected) {
    postError('Select exactly one desktop Frame to audit.');
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

function runSafePlanPreview(): void {
  const selected = selectedFrame();
  if (!selected) {
    postError('Select exactly one Frame to preview Safe Fix eligibility.');
    return;
  }

  try {
    const root = scanSceneNode(selected);
    // P5 planning must consume the P2 semantic/ranked classifier pipeline, not raw geometry-only
    // detections, otherwise facts-list/footer-columns/repeated-cards can never reach their gates.
    const detections = detectPatterns(root);
    const roles = detectSpecialRoles(root);
    const plans = planSafeRecipes(root, detections, roles);
    figma.ui.postMessage({
      type: 'safe-plan-result',
      root: { id: root.id, name: root.name, width: root.geometry.width, height: root.geometry.height },
      plans,
      roles,
      mutationEnabled: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Safe Fix preview failed: ${message}`);
  }
}

async function runValidation(): Promise<void> {
  const selection = figma.currentPage.selection;
  if (selection.length !== 2) {
    postError('Select exactly two section Frames: original first, candidate second.', 'validation-error');
    return;
  }

  const before = selection[0];
  const after = selection[1];
  if (!before || !after || before.type !== 'FRAME' || after.type !== 'FRAME') {
    postError('Validation currently requires exactly two selected Figma Frames.', 'validation-error');
    return;
  }

  try {
    const result = await fullFrameValidator.validate(before, after);
    figma.ui.postMessage({
      type: 'validation-result',
      report: result.report,
      labels: result.labels,
      renderScale: result.renderScale,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    postError(`Validation failed: ${message}`, 'validation-error');
  }
}

figma.ui.onmessage = async (message: unknown) => {
  if (typeof message !== 'object' || message === null || !('type' in message)) return;
  const type = (message as { type?: unknown }).type;

  if (type === 'audit-request') {
    runAudit();
    return;
  }

  if (type === 'safe-plan-request') {
    runSafePlanPreview();
    return;
  }

  if (type === 'validation-request') {
    await runValidation();
    return;
  }

  if (type === 'validation-pixel-result') {
    const payload = message as {
      validationId?: unknown;
      pixelMetrics?: unknown;
    };
    if (typeof payload.validationId !== 'number' || typeof payload.pixelMetrics !== 'object' || payload.pixelMetrics === null) {
      postError('Pixel validator returned an invalid payload.', 'validation-error');
      return;
    }
    if (!fullFrameValidator.finish(payload.validationId, payload.pixelMetrics as PixelDiffMetrics)) {
      postError('Validation result expired or is no longer pending.', 'validation-error');
    }
    return;
  }

  if (type === 'validation-pixel-error') {
    const payload = message as { validationId?: unknown; message?: unknown };
    if (typeof payload.validationId !== 'number' || typeof payload.message !== 'string') {
      postError('Pixel validator returned an invalid error payload.', 'validation-error');
      return;
    }
    if (!fullFrameValidator.fail(payload.validationId, payload.message)) {
      postError('Validation result expired or is no longer pending.', 'validation-error');
    }
  }
};

figma.on('selectionchange', () => {
  if (figma.currentPage.selection.length === 1) runAudit();
});

if (figma.currentPage.selection.length === 1) runAudit();
