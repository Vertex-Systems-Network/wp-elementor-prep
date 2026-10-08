/**
 * Debounces selection-change audits: rapid clicks/drags collapse into one audit of the final
 * selection instead of a full scan + classification + storage write per intermediate selection.
 */
export const SELECTION_AUDIT_DEBOUNCE_MS = 250;

export interface SelectionAuditSchedulerDeps {
  delayMs?: number;
  setTimer: (callback: () => void, delayMs: number) => unknown;
  clearTimer: (handle: unknown) => void;
  run: () => void;
}

export interface SelectionAuditScheduler {
  schedule(): void;
  cancel(): void;
  readonly pending: boolean;
}

export function createSelectionAuditScheduler(deps: SelectionAuditSchedulerDeps): SelectionAuditScheduler {
  const delayMs = deps.delayMs ?? SELECTION_AUDIT_DEBOUNCE_MS;
  let handle: unknown = null;
  return {
    schedule() {
      if (handle !== null) deps.clearTimer(handle);
      handle = deps.setTimer(() => {
        handle = null;
        deps.run();
      }, delayMs);
    },
    cancel() {
      if (handle !== null) deps.clearTimer(handle);
      handle = null;
    },
    get pending() {
      return handle !== null;
    },
  };
}
