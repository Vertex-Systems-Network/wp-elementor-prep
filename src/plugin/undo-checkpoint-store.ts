/**
 * Storage for the single P4/P5 Safe Fix undo checkpoint.
 *
 * The checkpoint references node IDs that only exist in one Figma document, so it is stored in that
 * document's plugin data. The previous global `clientStorage` key made a checkpoint from file A block
 * (or misfire) in every other file. A legacy global token is adopted only when its backup Frame and
 * retained original resolve in the current document; otherwise it is ignored for this document.
 */

export const DOCUMENT_UNDO_PLUGIN_DATA_KEY = 'wpep:p4-undo-checkpoint';
export const LEGACY_GLOBAL_UNDO_STORAGE_KEY = 'pella-elementor-prep:last-transaction-undo';
export const UNDO_BACKUP_FRAME_NAME_PREFIX = '__WPBuildersPrepareBackup__';

export interface UndoCheckpointNodeRef {
  id: string;
  type: string;
  name: string;
  parentId: string | null;
}

export interface UndoCheckpointStoreDeps {
  readDocument(): string;
  writeDocument(value: string): void;
  readLegacy(): Promise<unknown>;
  deleteLegacy(): Promise<void>;
  resolveNode(nodeId: string): Promise<UndoCheckpointNodeRef | null>;
}

export interface UndoCheckpointIds {
  originalNodeId: string;
  committedNodeId: string;
  parentNodeId: string;
  backupFrameId: string;
}

export type UndoCheckpointState = 'NONE' | 'VALID' | 'STALE';

export class UndoCheckpointStore {
  constructor(
    private readonly deps: UndoCheckpointStoreDeps,
    private readonly decodeIds: (token: string) => UndoCheckpointIds,
  ) {}

  /** The current document's checkpoint token, adopting a legacy global token only when it belongs here. */
  async get(): Promise<string | null> {
    const documentToken = this.deps.readDocument();
    if (documentToken.length > 0) return documentToken;

    const legacy = await this.deps.readLegacy();
    if (typeof legacy !== 'string' || legacy.length === 0) return null;
    if (!(await this.backupBelongsToDocument(legacy))) return null;

    this.deps.writeDocument(legacy);
    await this.deps.deleteLegacy();
    return legacy;
  }

  async set(token: string): Promise<void> {
    if (token.length === 0) throw new Error('Refusing to store an empty undo checkpoint.');
    this.deps.writeDocument(token);
  }

  async clear(): Promise<void> {
    this.deps.writeDocument('');
  }

  /** VALID only when the backup Frame, the retained original inside it and the committed node all still resolve. */
  async assess(): Promise<UndoCheckpointState> {
    const token = await this.get();
    if (token === null) return 'NONE';
    let ids: UndoCheckpointIds;
    try {
      ids = this.decodeIds(token);
    } catch {
      return 'STALE';
    }
    const [backup, original, committed] = await Promise.all([
      this.deps.resolveNode(ids.backupFrameId),
      this.deps.resolveNode(ids.originalNodeId),
      this.deps.resolveNode(ids.committedNodeId),
    ]);
    const valid = isBackupFrame(backup)
      && original !== null && original.parentId === ids.backupFrameId
      && committed !== null && committed.parentId === ids.parentNodeId;
    return valid ? 'VALID' : 'STALE';
  }

  /**
   * Remove a checkpoint whose nodes no longer resolve. A VALID checkpoint is never cleared here:
   * the user must restore or finalize it so the retained original is never orphaned silently.
   */
  async clearStale(): Promise<boolean> {
    const state = await this.assess();
    if (state === 'NONE') return false;
    if (state === 'VALID') {
      throw new Error('The Safe Fix checkpoint is still valid; restore or finalize it instead of clearing it.');
    }
    await this.clear();
    return true;
  }

  private async backupBelongsToDocument(token: string): Promise<boolean> {
    let ids: UndoCheckpointIds;
    try {
      ids = this.decodeIds(token);
    } catch {
      return false;
    }
    const [backup, original] = await Promise.all([
      this.deps.resolveNode(ids.backupFrameId),
      this.deps.resolveNode(ids.originalNodeId),
    ]);
    return isBackupFrame(backup) && original !== null && original.parentId === ids.backupFrameId;
  }
}

function isBackupFrame(node: UndoCheckpointNodeRef | null): boolean {
  return node !== null && node.type === 'FRAME' && node.name.startsWith(UNDO_BACKUP_FRAME_NAME_PREFIX);
}

export function figmaUndoCheckpointStore(decodeIds: (token: string) => UndoCheckpointIds): UndoCheckpointStore {
  return new UndoCheckpointStore({
    readDocument: () => figma.root.getPluginData(DOCUMENT_UNDO_PLUGIN_DATA_KEY),
    writeDocument: (value) => figma.root.setPluginData(DOCUMENT_UNDO_PLUGIN_DATA_KEY, value),
    readLegacy: () => figma.clientStorage.getAsync(LEGACY_GLOBAL_UNDO_STORAGE_KEY),
    deleteLegacy: () => figma.clientStorage.deleteAsync(LEGACY_GLOBAL_UNDO_STORAGE_KEY),
    resolveNode: async (nodeId) => {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) return null;
      return { id: node.id, type: node.type, name: node.name, parentId: node.parent?.id ?? null };
    },
  }, decodeIds);
}
