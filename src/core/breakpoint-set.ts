/**
 * Breakpoint set (recovery M4.1). The user selects 2–3 frames (or one Section containing them); each frame is
 * classified by width into desktop, tablet or mobile. Pure, deterministic and network-free.
 *
 * Default thresholds are Elementor's default active breakpoints, R0: Elementor 4.2.4 (tag commit `0e29220`)
 * `core/breakpoints/manager.php` (blob f30f5b4bb243d42cea73f1c05cad64136fc3ca43) `get_default_config()`:
 * `mobile` max 767 and `tablet` max 1024 (direction `max`), with `mobile_extra`, `tablet_extra`, `laptop` and
 * `widescreen` inactive by default. So a frame wider than 1024 px is desktop, 768–1024 px tablet, ≤ 767 px mobile.
 * A target profile may pass its own thresholds (configurable per profile).
 *
 * The classifier never guesses: two frames on the same device, a missing desktop base (the M4.3 merge needs it) or
 * an invalid width are reported, and only a set with distinct devices including desktop is `BREAKPOINT_SET`.
 */
export const P15_BREAKPOINT_SET_VERSION = 'p15-breakpoint-set-v1' as const;

export type P15Device = 'desktop' | 'tablet' | 'mobile';

export interface P15BreakpointThresholds {
  /** Largest width (px) classified as tablet. */
  tabletMaxPx: number;
  /** Largest width (px) classified as mobile. */
  mobileMaxPx: number;
}

export const ELEMENTOR_DEFAULT_BREAKPOINTS: Readonly<P15BreakpointThresholds> = Object.freeze({ tabletMaxPx: 1024, mobileMaxPx: 767 });

export interface P15BreakpointFrameInput {
  id: string;
  name: string;
  width: number;
}

export interface P15BreakpointMember {
  frameId: string;
  name: string;
  widthPx: number;
  device: P15Device;
}

export type P15BreakpointIssueCode =
  | 'BREAKPOINT_FRAME_COUNT'
  | 'BREAKPOINT_INVALID_WIDTH'
  | 'BREAKPOINT_INVALID_THRESHOLDS'
  | 'BREAKPOINT_DUPLICATE_DEVICE'
  | 'BREAKPOINT_DESKTOP_MISSING'
  | 'BREAKPOINT_DUPLICATE_FRAME';

export interface P15BreakpointIssue {
  code: P15BreakpointIssueCode;
  detail: string;
}

export interface P15BreakpointSetV1 {
  version: typeof P15_BREAKPOINT_SET_VERSION;
  /** BREAKPOINT_SET: ready for the user to confirm. REVIEW: classified but not usable as is. BLOCKED: invalid input. */
  status: 'BREAKPOINT_SET' | 'REVIEW' | 'BLOCKED';
  thresholds: P15BreakpointThresholds;
  /** Widest first (desktop, tablet, mobile). Empty when BLOCKED. */
  members: P15BreakpointMember[];
  issues: P15BreakpointIssue[];
  /** Identity of the classified input (frame ids, widths, thresholds); a confirmation must carry the same value. */
  fingerprint: string | null;
}

const DEVICE_ORDER: readonly P15Device[] = ['desktop', 'tablet', 'mobile'];

export function classifyP15Device(widthPx: number, thresholds: P15BreakpointThresholds = ELEMENTOR_DEFAULT_BREAKPOINTS): P15Device {
  if (widthPx <= thresholds.mobileMaxPx) return 'mobile';
  if (widthPx <= thresholds.tabletMaxPx) return 'tablet';
  return 'desktop';
}

export function validP15BreakpointThresholds(value: P15BreakpointThresholds): boolean {
  return Number.isSafeInteger(value.mobileMaxPx) && Number.isSafeInteger(value.tabletMaxPx)
    && value.mobileMaxPx > 0 && value.tabletMaxPx > value.mobileMaxPx;
}

function blocked(thresholds: P15BreakpointThresholds, issue: P15BreakpointIssue): P15BreakpointSetV1 {
  return { version: P15_BREAKPOINT_SET_VERSION, status: 'BLOCKED', thresholds, members: [], issues: [issue], fingerprint: null };
}

export function buildP15BreakpointSet(
  frames: readonly P15BreakpointFrameInput[],
  thresholds: P15BreakpointThresholds = ELEMENTOR_DEFAULT_BREAKPOINTS,
): P15BreakpointSetV1 {
  const limits = { tabletMaxPx: thresholds.tabletMaxPx, mobileMaxPx: thresholds.mobileMaxPx };
  if (!validP15BreakpointThresholds(limits)) {
    return blocked(limits, { code: 'BREAKPOINT_INVALID_THRESHOLDS', detail: 'Breakpoint thresholds must be positive integers with mobile max below tablet max.' });
  }
  if (frames.length < 2 || frames.length > 3) {
    return blocked(limits, { code: 'BREAKPOINT_FRAME_COUNT', detail: `Select 2 or 3 frames (desktop plus tablet and/or mobile), or one Section containing them; got ${frames.length}.` });
  }
  if (new Set(frames.map((frame) => frame.id)).size !== frames.length) {
    return blocked(limits, { code: 'BREAKPOINT_DUPLICATE_FRAME', detail: 'The same frame was listed more than once.' });
  }
  const invalid = frames.find((frame) => !Number.isFinite(frame.width) || frame.width <= 0);
  if (invalid) {
    return blocked(limits, { code: 'BREAKPOINT_INVALID_WIDTH', detail: `Frame "${invalid.name}" has no usable width.` });
  }
  const members = frames
    .map((frame) => ({ frameId: frame.id, name: frame.name, widthPx: frame.width, device: classifyP15Device(frame.width, limits) }))
    .sort((a, b) => b.widthPx - a.widthPx || (a.frameId < b.frameId ? -1 : a.frameId > b.frameId ? 1 : 0));
  const issues: P15BreakpointIssue[] = [];
  for (const device of DEVICE_ORDER) {
    const same = members.filter((member) => member.device === device);
    if (same.length > 1) {
      issues.push({ code: 'BREAKPOINT_DUPLICATE_DEVICE',
        detail: `${same.map((member) => `"${member.name}" (${member.widthPx}px)`).join(' and ')} are all ${device}; keep one frame per device.` });
    }
  }
  if (!members.some((member) => member.device === 'desktop')) {
    issues.push({ code: 'BREAKPOINT_DESKTOP_MISSING', detail: `No frame is wider than ${limits.tabletMaxPx}px; the desktop frame is the base of the responsive merge.` });
  }
  const fingerprint = [`t${limits.tabletMaxPx}`, `m${limits.mobileMaxPx}`, ...members.map((member) => `${member.frameId}@${member.widthPx}`)].join('|');
  return { version: P15_BREAKPOINT_SET_VERSION, status: issues.length === 0 ? 'BREAKPOINT_SET' : 'REVIEW', thresholds: limits, members, issues, fingerprint };
}
