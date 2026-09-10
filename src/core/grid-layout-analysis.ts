export interface GridLayoutItemGeometry {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  absolutePositioned: boolean;
}

export interface GridLayoutFrameGeometry {
  width: number;
  height: number;
  children: GridLayoutItemGeometry[];
}

export interface GridLayoutGeometryPlan {
  columns: number;
  rows: number;
  columnWidths: number[];
  rowHeights: number[];
  columnGap: number;
  rowGap: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
}

export type GridLayoutAnalysis =
  | { ok: true; plan: GridLayoutGeometryPlan }
  | { ok: false; reason: string };

interface Cluster {
  start: number;
  items: GridLayoutItemGeometry[];
}

function near(a: number, b: number, tolerance = 1): boolean {
  return Math.abs(a - b) <= tolerance;
}

function clusterByStart(items: GridLayoutItemGeometry[], axis: 'x' | 'y'): Cluster[] {
  const sorted = [...items].sort((a, b) => (axis === 'x' ? a.x - b.x : a.y - b.y));
  const clusters: Cluster[] = [];

  for (const item of sorted) {
    const value = axis === 'x' ? item.x : item.y;
    const match = clusters.find((cluster) => near(cluster.start, value));
    if (match) {
      match.items.push(item);
      match.start = match.items.reduce((sum, member) => sum + (axis === 'x' ? member.x : member.y), 0) / match.items.length;
    } else {
      clusters.push({ start: value, items: [item] });
    }
  }

  return clusters.sort((a, b) => a.start - b.start);
}

function consistentValue(values: number[], label: string): { ok: true; value: number } | { ok: false; reason: string } {
  const first = values[0];
  if (first === undefined || !Number.isFinite(first)) return { ok: false, reason: `${label} is unavailable.` };
  if (!values.every((value) => Number.isFinite(value) && value >= 0 && near(value, first))) {
    return { ok: false, reason: `${label} is not consistent within 1 px.` };
  }
  return { ok: true, value: first };
}

/**
 * Strict P5 preflight for a complete rectangular card grid.
 *
 * No synthesis, spanning, hidden children, reordering or fragmented cells are allowed. The current
 * manual geometry must already describe a full row-major grid that one Figma GRID Auto Layout can
 * reproduce with fixed tracks, one column gap, one row gap and frame padding.
 */
export function analyzeGridLayoutGeometry(frame: GridLayoutFrameGeometry): GridLayoutAnalysis {
  if (!Number.isFinite(frame.width) || !Number.isFinite(frame.height) || frame.width <= 0 || frame.height <= 0) {
    return { ok: false, reason: 'Candidate grid frame has invalid bounds.' };
  }

  if (frame.children.some((child) => !child.visible)) {
    return { ok: false, reason: 'Hidden direct children are not supported by the first grid recipe.' };
  }

  const children = [...frame.children];
  if (children.length < 4) return { ok: false, reason: 'At least four visible direct children are required for a card grid.' };

  if (children.some((child) => child.absolutePositioned)) {
    return { ok: false, reason: 'Visible absolute-positioned child blocks the simple grid recipe.' };
  }

  if (children.some((child) => ![child.x, child.y, child.width, child.height].every(Number.isFinite) || child.width <= 0 || child.height <= 0)) {
    return { ok: false, reason: 'Visible grid child has invalid geometry.' };
  }

  const xClusters = clusterByStart(children, 'x');
  const yClusters = clusterByStart(children, 'y');
  const columns = xClusters.length;
  const rows = yClusters.length;

  if (columns < 2 || rows < 2) return { ok: false, reason: 'Simple card grid requires at least two columns and two rows.' };
  if (columns * rows !== children.length) {
    return { ok: false, reason: 'Grid is incomplete or fragmented; every row/column cell must contain exactly one direct child.' };
  }

  const rowMajor = [...children].sort((a, b) => {
    if (!near(a.y, b.y)) return a.y - b.y;
    return a.x - b.x;
  });
  if (children.some((child, index) => child.id !== rowMajor[index]?.id)) {
    return { ok: false, reason: 'Layer order differs from row-major visual order; automatic reordering is refused.' };
  }

  const occupancy = new Set<string>();
  const columnWidths: number[] = [];
  const rowHeights: number[] = [];

  for (let column = 0; column < columns; column += 1) {
    const cluster = xClusters[column];
    if (!cluster) return { ok: false, reason: 'Column cluster is unavailable.' };
    const consistency = consistentValue(cluster.items.map((item) => item.width), `Column ${column + 1} widths`);
    if (!consistency.ok) return consistency;
    columnWidths.push(consistency.value);
  }

  for (let row = 0; row < rows; row += 1) {
    const cluster = yClusters[row];
    if (!cluster) return { ok: false, reason: 'Row cluster is unavailable.' };
    const consistency = consistentValue(cluster.items.map((item) => item.height), `Row ${row + 1} heights`);
    if (!consistency.ok) return consistency;
    rowHeights.push(consistency.value);
  }

  for (const child of children) {
    const column = xClusters.findIndex((cluster) => near(cluster.start, child.x));
    const row = yClusters.findIndex((cluster) => near(cluster.start, child.y));
    if (column < 0 || row < 0) return { ok: false, reason: 'A grid child does not resolve to a row/column track.' };
    const key = `${row}:${column}`;
    if (occupancy.has(key)) return { ok: false, reason: 'More than one direct child occupies the same inferred grid cell.' };
    occupancy.add(key);
  }

  const columnGaps: number[] = [];
  for (let column = 1; column < columns; column += 1) {
    const previous = xClusters[column - 1];
    const current = xClusters[column];
    const previousWidth = columnWidths[column - 1];
    if (!previous || !current || previousWidth === undefined) continue;
    const gap = current.start - (previous.start + previousWidth);
    if (gap < -0.5) return { ok: false, reason: 'Grid columns overlap.' };
    columnGaps.push(gap);
  }

  const rowGaps: number[] = [];
  for (let row = 1; row < rows; row += 1) {
    const previous = yClusters[row - 1];
    const current = yClusters[row];
    const previousHeight = rowHeights[row - 1];
    if (!previous || !current || previousHeight === undefined) continue;
    const gap = current.start - (previous.start + previousHeight);
    if (gap < -0.5) return { ok: false, reason: 'Grid rows overlap.' };
    rowGaps.push(gap);
  }

  const columnGap = consistentValue(columnGaps, 'Column gaps');
  if (!columnGap.ok) return columnGap;
  const rowGap = consistentValue(rowGaps, 'Row gaps');
  if (!rowGap.ok) return rowGap;

  const firstColumn = xClusters[0];
  const lastColumn = xClusters.at(-1);
  const firstRow = yClusters[0];
  const lastRow = yClusters.at(-1);
  const lastColumnWidth = columnWidths.at(-1);
  const lastRowHeight = rowHeights.at(-1);
  if (!firstColumn || !lastColumn || !firstRow || !lastRow || lastColumnWidth === undefined || lastRowHeight === undefined) {
    return { ok: false, reason: 'Grid edge geometry is unavailable.' };
  }

  const paddingLeft = firstColumn.start;
  const paddingRight = frame.width - (lastColumn.start + lastColumnWidth);
  const paddingTop = firstRow.start;
  const paddingBottom = frame.height - (lastRow.start + lastRowHeight);

  if ([paddingLeft, paddingRight, paddingTop, paddingBottom].some((value) => value < -0.5)) {
    return { ok: false, reason: 'Grid child geometry extends outside the candidate frame bounds.' };
  }

  return {
    ok: true,
    plan: {
      columns,
      rows,
      columnWidths,
      rowHeights,
      columnGap: Math.max(0, columnGap.value),
      rowGap: Math.max(0, rowGap.value),
      paddingLeft: Math.max(0, paddingLeft),
      paddingRight: Math.max(0, paddingRight),
      paddingTop: Math.max(0, paddingTop),
      paddingBottom: Math.max(0, paddingBottom),
    },
  };
}
