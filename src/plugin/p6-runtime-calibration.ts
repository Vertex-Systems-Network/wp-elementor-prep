import { runAdvancedCloneCalibration, type AdvancedCalibrationResult } from '../core/advanced-calibration';
import type { AdvancedRecipePlan } from '../core/advanced-recipe-types';
import { FigmaCandidateTransactionAdapter } from './figma-transaction-adapter';
import { FigmaAdvancedCalibrationAdapter, type AdvancedFullP3Validator } from './figma-advanced-calibration-adapter';
import { transformAdvancedCalibrationCandidate } from './advanced-recipe-transform';

const CALIBRATION_PREFIX = '__P6RuntimeCalibration__';
const PASS_ID = 'p6-runtime-page-flow-pass';
const REJECT_ID = 'p6-runtime-page-flow-reject';

interface GeometrySnapshot {
  width: number;
  height: number;
  children: Array<{ x: number; y: number; width: number; height: number }>;
}

export interface P6RuntimeCalibrationCase {
  status: string;
  validationPassed: boolean;
  pixelEvidenceReturned: boolean;
  changedPixelPct: number | null;
  candidateDiscarded: boolean;
  originalGeometryExact: boolean;
  originalPngExact: boolean;
  leftoverCandidateRisk: boolean;
  productionCommitAttempted: false;
}

export interface P6RuntimeCalibrationResult {
  schemaVersion: 1;
  passed: boolean;
  pass: P6RuntimeCalibrationCase;
  forcedReject: P6RuntimeCalibrationCase;
  pendingP4Checkpoint: boolean;
  leftovers: number;
}

function solid(r: number, g: number, b: number): SolidPaint[] {
  return [{ type: 'SOLID', color: { r, g, b } }];
}

function createRect(name: string, x: number, y: number, width: number, height: number, fill: SolidPaint[]): RectangleNode {
  const rect = figma.createRectangle();
  rect.name = name;
  rect.resize(width, height);
  rect.x = x;
  rect.y = y;
  rect.fills = fill;
  return rect;
}

function createFixture(suffix: string): { parent: FrameNode; original: FrameNode } {
  const parent = figma.createFrame();
  parent.name = `${CALIBRATION_PREFIX} Parent ${suffix}`;
  parent.resize(420, 300);
  parent.x = 140000;
  parent.y = 0;
  parent.fills = [];
  figma.currentPage.appendChild(parent);

  const original = figma.createFrame();
  original.name = `${CALIBRATION_PREFIX} Page ${suffix}`;
  original.resize(320, 220);
  original.x = 40;
  original.y = 40;
  original.fills = [];
  parent.appendChild(original);

  original.appendChild(createRect('Section A', 40, 30, 240, 60, solid(0.16, 0.16, 0.16)));
  original.appendChild(createRect('Section B', 40, 130, 240, 60, solid(0.72, 0.72, 0.72)));
  return { parent, original };
}

function pageFlowPlan(original: FrameNode): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision: 'CALIBRATE',
    recipe: 'page-vertical-flow',
    reasonCode: 'CANDIDATE_READY_FOR_CALIBRATION',
    reason: 'Disposable imported-plugin P6 runtime calibration fixture.',
    confidence: 100,
    minConfidence: 95,
    pattern: 'page-vertical-flow',
    targetNodeId: original.id,
    targetNodeName: original.name,
    targetPath: [],
    preserveNodeIds: [],
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: { runtimeCalibration: true },
  };
}

function geometrySnapshot(frame: FrameNode): GeometrySnapshot {
  return {
    width: frame.width,
    height: frame.height,
    children: frame.children.map((child) => ({
      x: child.x,
      y: child.y,
      width: child.width,
      height: child.height,
    })),
  };
}

function sameGeometry(before: GeometrySnapshot, after: GeometrySnapshot, tolerance = 0.01): boolean {
  if (Math.abs(before.width - after.width) > tolerance || Math.abs(before.height - after.height) > tolerance) return false;
  if (before.children.length !== after.children.length) return false;
  return before.children.every((item, index) => {
    const next = after.children[index];
    return Boolean(
      next
      && Math.abs(item.x - next.x) <= tolerance
      && Math.abs(item.y - next.y) <= tolerance
      && Math.abs(item.width - next.width) <= tolerance
      && Math.abs(item.height - next.height) <= tolerance
    );
  });
}

async function exportPng(frame: FrameNode): Promise<Uint8Array> {
  return frame.exportAsync({ format: 'PNG' });
}

function sameBytes(before: Uint8Array, after: Uint8Array): boolean {
  if (before.length !== after.length) return false;
  for (let index = 0; index < before.length; index += 1) {
    if (before[index] !== after[index]) return false;
  }
  return true;
}

async function candidateDiscarded(result: AdvancedCalibrationResult): Promise<boolean> {
  if (!result.candidateNodeId) return false;
  return (await figma.getNodeByIdAsync(result.candidateNodeId)) === null;
}

async function cleanupFixture(parent: FrameNode): Promise<void> {
  if (parent.parent) parent.remove();
}

function recoveryAdapter(): FigmaCandidateTransactionAdapter {
  return new FigmaCandidateTransactionAdapter({
    transform: () => undefined,
    validate: async () => {
      throw new Error('P6 runtime calibration recovery adapter does not validate.');
    },
  });
}

function candidateLeftovers(): number {
  return figma.currentPage.children.filter((node) => (
    node.name.includes(PASS_ID) || node.name.includes(REJECT_ID) || node.name.startsWith(CALIBRATION_PREFIX)
  )).length;
}

async function runPassCase(validateFullP3: AdvancedFullP3Validator): Promise<P6RuntimeCalibrationCase> {
  const fixture = createFixture('pass');
  const plan = pageFlowPlan(fixture.original);
  const geometryBefore = geometrySnapshot(fixture.original);
  const pngBefore = await exportPng(fixture.original);

  let result: AdvancedCalibrationResult | null = null;
  try {
    const adapter = new FigmaAdvancedCalibrationAdapter(plan, {
      transform: transformAdvancedCalibrationCandidate,
      validate: validateFullP3,
    });
    result = await runAdvancedCloneCalibration(fixture.original.id, plan, adapter, PASS_ID);
    const pngAfter = await exportPng(fixture.original);
    const pixel = result.validation?.metrics.pixel;

    return {
      status: result.status,
      validationPassed: result.validation?.passed === true,
      pixelEvidenceReturned: Boolean(pixel),
      changedPixelPct: pixel?.changedPixelPct ?? null,
      candidateDiscarded: await candidateDiscarded(result),
      originalGeometryExact: sameGeometry(geometryBefore, geometrySnapshot(fixture.original)),
      originalPngExact: sameBytes(pngBefore, pngAfter),
      leftoverCandidateRisk: result.leftoverCandidateRisk,
      productionCommitAttempted: result.productionCommitAttempted,
    };
  } finally {
    if (result?.candidateNodeId) {
      const candidate = await figma.getNodeByIdAsync(result.candidateNodeId);
      if (candidate?.parent) candidate.remove();
    }
    await cleanupFixture(fixture.parent);
  }
}

async function runForcedRejectCase(validateFullP3: AdvancedFullP3Validator): Promise<P6RuntimeCalibrationCase> {
  const fixture = createFixture('forced-reject');
  const plan = pageFlowPlan(fixture.original);
  const geometryBefore = geometrySnapshot(fixture.original);
  const pngBefore = await exportPng(fixture.original);

  let result: AdvancedCalibrationResult | null = null;
  try {
    const adapter = new FigmaAdvancedCalibrationAdapter(plan, {
      transform: (candidate, currentPlan) => {
        transformAdvancedCalibrationCandidate(candidate, currentPlan);
        // Intentional rendered drift after the real P6 transform. The fixture contains only shapes,
        // so rejection depends on the real Full P3 UI Canvas pixel broker rather than text/image anchors.
        candidate.itemSpacing += 8;
      },
      validate: validateFullP3,
    });
    result = await runAdvancedCloneCalibration(fixture.original.id, plan, adapter, REJECT_ID);
    const pngAfter = await exportPng(fixture.original);
    const pixel = result.validation?.metrics.pixel;

    return {
      status: result.status,
      validationPassed: result.validation?.passed === true,
      pixelEvidenceReturned: Boolean(pixel),
      changedPixelPct: pixel?.changedPixelPct ?? null,
      candidateDiscarded: await candidateDiscarded(result),
      originalGeometryExact: sameGeometry(geometryBefore, geometrySnapshot(fixture.original)),
      originalPngExact: sameBytes(pngBefore, pngAfter),
      leftoverCandidateRisk: result.leftoverCandidateRisk,
      productionCommitAttempted: result.productionCommitAttempted,
    };
  } finally {
    if (result?.candidateNodeId) {
      const candidate = await figma.getNodeByIdAsync(result.candidateNodeId);
      if (candidate?.parent) candidate.remove();
    }
    await cleanupFixture(fixture.parent);
  }
}

/**
 * Disposable imported-Figma runtime calibration for the first P6 transformer.
 *
 * It exercises the real clone -> P6 transform -> Full P3/UI pixel broker -> discard path twice:
 * one exact PASS and one intentionally drifted rejection. It never exposes or calls a commit seam.
 */
export async function runP6RuntimeCalibration(validateFullP3: AdvancedFullP3Validator): Promise<P6RuntimeCalibrationResult> {
  const guard = recoveryAdapter();
  if (await guard.hasPendingUndo()) {
    throw new Error('A real P4 checkpoint is pending. Resolve it before running P6 clone-only runtime calibration.');
  }

  const pass = await runPassCase(validateFullP3);
  const forcedReject = await runForcedRejectCase(validateFullP3);
  const pendingP4Checkpoint = await guard.hasPendingUndo();
  const leftovers = candidateLeftovers();

  const passed =
    pass.status === 'PASSED'
    && pass.validationPassed
    && pass.pixelEvidenceReturned
    && pass.candidateDiscarded
    && pass.originalGeometryExact
    && pass.originalPngExact
    && !pass.leftoverCandidateRisk
    && pass.productionCommitAttempted === false
    && forcedReject.status === 'REJECTED'
    && !forcedReject.validationPassed
    && forcedReject.pixelEvidenceReturned
    && forcedReject.candidateDiscarded
    && forcedReject.originalGeometryExact
    && forcedReject.originalPngExact
    && !forcedReject.leftoverCandidateRisk
    && forcedReject.productionCommitAttempted === false
    && !pendingP4Checkpoint
    && leftovers === 0;

  return {
    schemaVersion: 1,
    passed,
    pass,
    forcedReject,
    pendingP4Checkpoint,
    leftovers,
  };
}
