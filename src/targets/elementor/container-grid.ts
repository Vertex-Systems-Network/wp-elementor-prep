/**
 * Strict Figma grids and their exact Elementor 4.2.4 Grid Container encoding (recovery M2.6b).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * - `includes/elements/container.php` (blob 3486766b9565af99536ae205ed1936bb155daed0): `container_type`
 *   (flex | grid, prefix class `e-`) and the Grid Container group registered as `grid`.
 * - `includes/controls/groups/grid-container.php` (blob bd00e17a1eedea79c159cb66d645ce40ea4a0f4d):
 *   `columns_grid` / `rows_grid` sliders whose `fr` unit writes `repeat({{SIZE}}, 1fr)` and whose `custom` unit
 *   writes `--e-con-grid-template-*: {{SIZE}}` verbatim; `gaps` GAPS (`--row-gap` / `--column-gap`); `auto_flow`
 *   (default row); `justify_items` / `align_items` (start | center | end | stretch).
 * - `assets/dev/scss/frontend/_container.scss` (blob d6c65cb86810634c55c8b9e65aef8e9b9ef439e8): `.e-grid` applies
 *   the template, `grid-auto-flow` and `justify-items: var(--justify-items)` / `align-items: var(--align-items)`.
 *   Those two variables are not reset per Container, so a nested grid would inherit its parent's values; the
 *   grid writes `stretch` explicitly. The default rows are `repeat(2, 1fr)`, so rows are always written.
 * - Figma (`@figma/plugin-typings` 1.140.0, `GridTrackSize`): FLEX tracks are CSS `fr`, FIXED tracks are px and
 *   HUG tracks are "equivalent to a CSS setting of `fit-content(100%)`"; children carry `gridRowAnchorIndex`,
 *   `gridColumnAnchorIndex`, `gridRowSpan`, `gridColumnSpan` and `gridChildHorizontalAlign/VerticalAlign`.
 *
 * Strict grid: every in-flow child occupies one cell, in row-major order with no skipped cell, so CSS auto
 * placement (`grid-auto-flow: row`) puts each child exactly where Figma does. Anything else is REVIEW. Children
 * that FILL their cell on both axes with AUTO alignment stretch exactly as in CSS; any other child sizing or
 * alignment is a style review on the grid.
 */
export const GRID_REVIEW = 'GRID_LAYOUT_REQUIRES_REVIEW';
export const GRID_CHILD_REVIEW = 'GRID_CHILD_PLACEMENT_REQUIRES_REVIEW';
export const P15_NEUTRAL_EXPORT_MAX_GRID_TRACKS = 64;
/** Same bounds as Auto Layout spacing and container sizes. */
const MAX_GAP_PX = 4_096;
const MAX_TRACK_PX = 16_384;
const MAX_FR = 1_000;

export type P15NeutralGridTrack =
  | { unit: 'fr'; value: number }
  | { unit: 'px'; value: number }
  | { unit: 'hug' };

export interface P15NeutralGrid {
  columns: P15NeutralGridTrack[];
  rows: P15NeutralGridTrack[];
  columnGapPx: number;
  rowGapPx: number;
}

export interface P15GridChildFacts {
  rowAnchor: unknown;
  columnAnchor: unknown;
  rowSpan: unknown;
  columnSpan: unknown;
  horizontalSizing: unknown;
  verticalSizing: unknown;
  horizontalAlign: unknown;
  verticalAlign: unknown;
}

export interface P15GridFacts {
  rowCount: unknown;
  columnCount: unknown;
  rowGap: unknown;
  columnGap: unknown;
  rowSizes: unknown;
  columnSizes: unknown;
  /** Visible in-flow children, in layer order. */
  children: readonly P15GridChildFacts[];
}

export interface P15GridDerivation {
  grid?: P15NeutralGrid;
  review?: { reasonCode: string; detail: string };
  childReview?: { reasonCode: string; detail: string };
}

const round = (value: number): number => Math.round(value * 100) / 100;
const twoDecimals = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && round(value) === value;
const validGap = (value: unknown): value is number => twoDecimals(value) && value >= 0 && value <= MAX_GAP_PX;
const validCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= P15_NEUTRAL_EXPORT_MAX_GRID_TRACKS;

function track(value: unknown): P15NeutralGridTrack | null {
  if (typeof value !== 'object' || value === null) return null;
  const { type, value: size } = value as { type?: unknown; value?: unknown };
  if (type === 'HUG') return { unit: 'hug' };
  const rounded = typeof size === 'number' ? round(size) : size;
  if (type === 'FLEX') {
    const fr = rounded === undefined ? 1 : rounded;
    return twoDecimals(fr) && fr > 0 && fr <= MAX_FR ? { unit: 'fr', value: fr } : null;
  }
  if (type === 'FIXED') return twoDecimals(rounded) && rounded > 0 && rounded <= MAX_TRACK_PX ? { unit: 'px', value: rounded } : null;
  return null;
}

function tracks(sizes: unknown, count: number): P15NeutralGridTrack[] | null {
  if (!Array.isArray(sizes) || sizes.length !== count) return null;
  const mapped = sizes.map(track);
  return mapped.every((entry) => entry !== null) ? mapped as P15NeutralGridTrack[] : null;
}

export function deriveP15Grid(facts: P15GridFacts): P15GridDerivation {
  const fail = (detail: string): P15GridDerivation => ({ review: { reasonCode: GRID_REVIEW, detail } });
  if (!validCount(facts.rowCount) || !validCount(facts.columnCount)) return fail(`A grid needs 1-${P15_NEUTRAL_EXPORT_MAX_GRID_TRACKS} rows and columns.`);
  const rowGap = typeof facts.rowGap === 'number' ? round(facts.rowGap) : facts.rowGap;
  const columnGap = typeof facts.columnGap === 'number' ? round(facts.columnGap) : facts.columnGap;
  if (!validGap(rowGap) || !validGap(columnGap)) return fail(`Grid gaps must be 0-${MAX_GAP_PX}px.`);
  const rows = tracks(facts.rowSizes, facts.rowCount);
  const columns = tracks(facts.columnSizes, facts.columnCount);
  if (rows === null || columns === null) return fail('Every grid track must be FLEX, FIXED or HUG with a bounded size.');
  if (facts.children.length > facts.rowCount * facts.columnCount) return fail('The grid has more children than cells.');
  for (const [index, child] of facts.children.entries()) {
    if (child.rowSpan !== 1 || child.columnSpan !== 1) return fail('Spanning grid children need explicit placement, which is not mapped.');
    if (child.rowAnchor !== Math.floor(index / facts.columnCount) || child.columnAnchor !== index % facts.columnCount) {
      return fail('Grid children must fill the cells in row-major layer order for CSS auto placement to match.');
    }
  }
  const stretches = (child: P15GridChildFacts) => child.horizontalSizing === 'FILL' && child.verticalSizing === 'FILL'
    && (child.horizontalAlign === undefined || child.horizontalAlign === 'AUTO') && (child.verticalAlign === undefined || child.verticalAlign === 'AUTO');
  return {
    grid: { columns, rows, columnGapPx: columnGap, rowGapPx: rowGap },
    ...(facts.children.every(stretches) ? {} : { childReview: { reasonCode: GRID_CHILD_REVIEW,
      detail: 'Only grid children that fill their cell with AUTO alignment are mapped exactly; other sizing or alignment needs review.' } }),
  };
}

function trackValid(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  if (entry.unit === 'hug') return Object.keys(entry).length === 1;
  if (Object.keys(entry).length !== 2 || !twoDecimals(entry.value) || entry.value <= 0) return false;
  return (entry.unit === 'fr' && entry.value <= MAX_FR) || (entry.unit === 'px' && entry.value <= MAX_TRACK_PX);
}

export function gridProblems(value: unknown, path: string): { path: string; message: string }[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [{ path, message: 'Grid must be an object.' }];
  const entry = value as Record<string, unknown>;
  const problems: { path: string; message: string }[] = [];
  if (Object.keys(entry).some((key) => !['columns', 'rows', 'columnGapPx', 'rowGapPx'].includes(key))) {
    problems.push({ path, message: 'Grid holds only columns, rows, columnGapPx and rowGapPx.' });
  }
  for (const key of ['columns', 'rows'] as const) {
    const list = entry[key];
    if (!Array.isArray(list) || list.length < 1 || list.length > P15_NEUTRAL_EXPORT_MAX_GRID_TRACKS || !list.every(trackValid)) {
      problems.push({ path: `${path}.${key}`, message: `1-${P15_NEUTRAL_EXPORT_MAX_GRID_TRACKS} tracks of { unit: fr | px, value } or { unit: hug }.` });
    }
  }
  for (const key of ['columnGapPx', 'rowGapPx'] as const) {
    if (!validGap(entry[key])) problems.push({ path: `${path}.${key}`, message: `Grid gaps must be 0-${MAX_GAP_PX}px with at most two decimals.` });
  }
  return problems;
}

const canonicalTrack = (entry: P15NeutralGridTrack): Record<string, unknown> => (entry.unit === 'hug' ? { unit: 'hug' } : { unit: entry.unit, value: entry.value });

export function canonicalGrid(grid: P15NeutralGrid): Record<string, unknown> {
  return { columns: grid.columns.map(canonicalTrack), rows: grid.rows.map(canonicalTrack), columnGapPx: grid.columnGapPx, rowGapPx: grid.rowGapPx };
}

/** Equal 1fr tracks use the native `fr` count; anything else is a `custom` template built only from validated numbers. */
function templateSlider(list: readonly P15NeutralGridTrack[]): Record<string, unknown> {
  if (list.every((entry) => entry.unit === 'fr' && entry.value === 1)) return { unit: 'fr', size: list.length, sizes: [] };
  const template = list.map((entry) => (entry.unit === 'hug' ? 'fit-content(100%)' : `${entry.value}${entry.unit}`)).join(' ');
  return { unit: 'custom', size: template, sizes: [] };
}

export function gridSettings(grid: P15NeutralGrid | undefined): Record<string, unknown> {
  if (grid === undefined) return {};
  return {
    container_type: 'grid',
    grid_columns_grid: templateSlider(grid.columns),
    grid_rows_grid: templateSlider(grid.rows),
    grid_gaps: { column: String(grid.columnGapPx), row: String(grid.rowGapPx), isLinked: grid.columnGapPx === grid.rowGapPx, unit: 'px' },
    grid_justify_items: 'stretch',
    grid_align_items: 'stretch',
  };
}
