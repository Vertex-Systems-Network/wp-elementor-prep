import type { CommitEvidence, CandidateHandle, CandidateTransactionAdapter } from '../core/transaction-types';
import type { ValidationReport } from '../core/validation-types';

const STAGING_X = 100000;
const UNDO_STORAGE_KEY = 'pella-elementor-prep:last-transaction-undo';

interface CandidateMetadata {
  transactionId: string;
  originalNodeId: string;
  candidateNodeId: string;
  parentNodeId: string;
  siblingIndex: number;
  originalX: number;
  originalY: number;
  originalName: string;
  originalLocked: boolean;
  candidateStageName: string;
}

interface UndoMetadata {
  originalNodeId: string;
  committedNodeId: string;
  parentNodeId: string;
  siblingIndex: number;
  originalX: number;
  originalY: number;
  backupFrameId: string;
}

export interface FigmaTransactionAdapterOptions {
  transform: (candidate: FrameNode) => Promise<void> | void;
  /** Must run the full P3 validation policy required by the caller, including pixel evidence when commit is possible. */
  validate: (original: FrameNode, candidate: FrameNode) => Promise<ValidationReport>;
}

function childrenParent(node: BaseNode | null): (BaseNode & ChildrenMixin) | null {
  if (!node || !('children' in node) || !('insertChild' in node)) return null;
  return node as BaseNode & ChildrenMixin;
}

async function frameById(nodeId: string): Promise<FrameNode> {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.type !== 'FRAME') throw new Error(`Expected Frame ${nodeId}, but it is unavailable.`);
  return node;
}

function copyRootChildLayout(original: FrameNode, candidate: FrameNode): void {
  if ('layoutAlign' in original && 'layoutAlign' in candidate) candidate.layoutAlign = original.layoutAlign;
  if ('layoutGrow' in original && 'layoutGrow' in candidate) candidate.layoutGrow = original.layoutGrow;
  if ('layoutPositioning' in original && 'layoutPositioning' in candidate) candidate.layoutPositioning = original.layoutPositioning;
}

function encodeUndo(metadata: UndoMetadata): string {
  return [
    'p4v1',
    metadata.originalNodeId,
    metadata.committedNodeId,
    metadata.parentNodeId,
    String(metadata.siblingIndex),
    String(metadata.originalX),
    String(metadata.originalY),
    metadata.backupFrameId,
  ].join('|');
}

function decodeUndo(token: string): UndoMetadata {
  const [version, originalNodeId, committedNodeId, parentNodeId, index, x, y, backupFrameId] = token.split('|');
  if (version !== 'p4v1' || !originalNodeId || !committedNodeId || !parentNodeId || !backupFrameId) {
    throw new Error('Undo token is invalid or unsupported.');
  }
  const siblingIndex = Number(index);
  const originalX = Number(x);
  const originalY = Number(y);
  if (![siblingIndex, originalX, originalY].every(Number.isFinite)) throw new Error('Undo token contains invalid geometry.');
  return { originalNodeId, committedNodeId, parentNodeId, siblingIndex, originalX, originalY, backupFrameId };
}

function createBackupFrame(transactionId: string): FrameNode {
  const backup = figma.createFrame();
  backup.name = `__PellaBackup__ ${transactionId}`;
  backup.visible = false;
  backup.resize(1, 1);
  backup.x = STAGING_X;
  backup.y = STAGING_X;
  figma.currentPage.appendChild(backup);
  return backup;
}

/**
 * Concrete Figma root-transaction adapter.
 *
 * Candidates are staged as top-level Frames outside normal page composition so transforming them cannot
 * mutate the approved original's parent layout. Commit swaps only the validated root boundary.
 */
export class FigmaCandidateTransactionAdapter implements CandidateTransactionAdapter {
  private readonly metadata = new Map<string, CandidateMetadata>();

  constructor(private readonly options: FigmaTransactionAdapterOptions) {}

  async cloneOriginal(originalNodeId: string, transactionId: string): Promise<CandidateHandle> {
    const original = await frameById(originalNodeId);
    const parent = childrenParent(original.parent);
    if (!parent) throw new Error('Original Frame parent does not support ordered child replacement.');
    if (original.parent?.type === 'INSTANCE') throw new Error('Section roots inside component instances are not supported by P4 root swap.');

    const siblingIndex = parent.children.findIndex((child) => child.id === original.id);
    if (siblingIndex < 0) throw new Error('Could not resolve original sibling index.');

    const candidate = original.clone();
    const candidateStageName = `__PellaCandidate__ ${transactionId}`;
    figma.currentPage.appendChild(candidate);
    candidate.name = candidateStageName;
    candidate.x = STAGING_X + this.metadata.size * 2000;
    candidate.y = 0;
    candidate.locked = true;

    this.metadata.set(candidate.id, {
      transactionId,
      originalNodeId: original.id,
      candidateNodeId: candidate.id,
      parentNodeId: original.parent.id,
      siblingIndex,
      originalX: original.x,
      originalY: original.y,
      originalName: original.name,
      originalLocked: original.locked,
      candidateStageName,
    });

    return { originalNodeId: original.id, candidateNodeId: candidate.id };
  }

  async transformCandidate(handle: CandidateHandle): Promise<void> {
    const candidate = await frameById(handle.candidateNodeId);
    candidate.locked = false;
    try {
      await this.options.transform(candidate);
    } finally {
      if (candidate.parent) candidate.locked = true;
    }
  }

  async validateCandidate(handle: CandidateHandle): Promise<ValidationReport> {
    const original = await frameById(handle.originalNodeId);
    const candidate = await frameById(handle.candidateNodeId);
    return this.options.validate(original, candidate);
  }

  async discardCandidate(handle: CandidateHandle): Promise<void> {
    const node = await figma.getNodeByIdAsync(handle.candidateNodeId);
    if (node && node.type === 'FRAME') node.remove();
    this.metadata.delete(handle.candidateNodeId);
  }

  async commitCandidate(handle: CandidateHandle, transactionId: string): Promise<CommitEvidence> {
    const metadata = this.metadata.get(handle.candidateNodeId);
    if (!metadata) throw new Error('Candidate metadata is missing; refusing commit.');
    if (metadata.transactionId !== transactionId) throw new Error('Candidate belongs to a different transaction.');

    const original = await frameById(handle.originalNodeId);
    const candidate = await frameById(handle.candidateNodeId);
    const parentNode = await figma.getNodeByIdAsync(metadata.parentNodeId);
    const parent = childrenParent(parentNode);
    if (!parent) throw new Error('Original parent is unavailable or no longer supports insertion.');
    if (original.parent?.id !== metadata.parentNodeId) throw new Error('Original moved after cloning; refusing stale commit.');

    const backup = createBackupFrame(transactionId);
    let candidateInserted = false;
    let originalBackedUp = false;

    try {
      candidate.locked = false;
      candidate.name = metadata.originalName;
      copyRootChildLayout(original, candidate);
      parent.insertChild(metadata.siblingIndex, candidate);
      candidateInserted = true;

      if (!('layoutMode' in parentNode) || String((parentNode as SceneNode & { layoutMode?: unknown }).layoutMode) === 'NONE') {
        candidate.x = metadata.originalX;
        candidate.y = metadata.originalY;
      }

      backup.appendChild(original);
      originalBackedUp = true;
      original.x = 0;
      original.y = 0;

      candidate.locked = metadata.originalLocked;

      const undoToken = encodeUndo({
        originalNodeId: original.id,
        committedNodeId: candidate.id,
        parentNodeId: metadata.parentNodeId,
        siblingIndex: metadata.siblingIndex,
        originalX: metadata.originalX,
        originalY: metadata.originalY,
        backupFrameId: backup.id,
      });
      await figma.clientStorage.setAsync(UNDO_STORAGE_KEY, undoToken);
      this.metadata.delete(handle.candidateNodeId);

      return {
        transactionId,
        originalNodeId: original.id,
        committedNodeId: candidate.id,
        parentNodeId: metadata.parentNodeId,
        siblingIndex: metadata.siblingIndex,
        undoToken,
      };
    } catch (error) {
      let rollbackError: unknown = null;
      try {
        if (originalBackedUp || original.parent?.id !== metadata.parentNodeId) {
          parent.insertChild(metadata.siblingIndex, original);
          original.x = metadata.originalX;
          original.y = metadata.originalY;
        }
        if (candidateInserted && candidate.parent?.id === metadata.parentNodeId) {
          figma.currentPage.appendChild(candidate);
          candidate.name = metadata.candidateStageName;
          candidate.x = STAGING_X;
          candidate.y = 0;
          candidate.locked = true;
        }
        if (backup.parent && backup.children.length === 0) backup.remove();
      } catch (rollback) {
        rollbackError = rollback;
      }

      if (rollbackError) {
        throw new Error(`Commit failed (${String(error)}); rollback also failed (${String(rollbackError)}).`);
      }
      throw error;
    }
  }

  async restoreLastCommit(undoToken?: string): Promise<CommitEvidence | null> {
    const token = undoToken ?? await figma.clientStorage.getAsync(UNDO_STORAGE_KEY);
    if (typeof token !== 'string' || token.length === 0) return null;
    const undo = decodeUndo(token);

    const original = await frameById(undo.originalNodeId);
    const committed = await frameById(undo.committedNodeId);
    const parentNode = await figma.getNodeByIdAsync(undo.parentNodeId);
    const backupNode = await figma.getNodeByIdAsync(undo.backupFrameId);
    const parent = childrenParent(parentNode);
    if (!parent) throw new Error('Undo parent is unavailable.');
    if (!backupNode || backupNode.type !== 'FRAME') throw new Error('Undo backup Frame is unavailable.');
    if (original.parent?.id !== backupNode.id) throw new Error('Undo original is no longer in its backup Frame.');
    if (committed.parent?.id !== undo.parentNodeId) throw new Error('Committed candidate moved after commit; refusing unsafe undo.');

    parent.insertChild(undo.siblingIndex, original);
    original.x = undo.originalX;
    original.y = undo.originalY;
    committed.remove();
    if (backupNode.children.length === 0) backupNode.remove();
    await figma.clientStorage.deleteAsync(UNDO_STORAGE_KEY);

    return {
      transactionId: 'restore',
      originalNodeId: committed.id,
      committedNodeId: original.id,
      parentNodeId: undo.parentNodeId,
      siblingIndex: undo.siblingIndex,
    };
  }
}
