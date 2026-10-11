import type { AuditNode } from '../../src/core/types';

/**
 * Golden 2–5 child sections for recovery M5 (classifier v2, recipes v2, golden acceptance). Plain AuditNode trees in
 * parent-relative coordinates, as the scanner produces them.
 */
type Kind = 'frame' | 'text' | 'image' | 'vector';
export function auditNode(id: string, kind: Kind, x: number, y: number, width: number, height: number, extra: Partial<AuditNode> = {}): AuditNode {
  return {
    id, name: id, type: kind === 'text' ? 'TEXT' : kind === 'vector' ? 'VECTOR' : kind === 'image' ? 'RECTANGLE' : 'FRAME',
    geometry: { x, y, width, height }, layoutMode: 'NONE', isAutoLayout: false, isContainer: kind === 'frame', isText: kind === 'text',
    isImageLike: kind === 'image', isGenericName: false, textLength: kind === 'text' ? 12 : 0, textAutoResize: kind === 'text' ? 'HEIGHT' : null,
    absolutePositioned: false, clipsContent: false, opacity: 1, visible: true, childIds: [], children: [], ...extra,
  };
}
export function frameOf(id: string, x: number, y: number, width: number, height: number, children: AuditNode[], extra: Partial<AuditNode> = {}): AuditNode {
  return { ...auditNode(id, 'frame', x, y, width, height, extra), children, childIds: children.map((child) => child.id) };
}

/** Each entry: a section and whether a correct recipe exists for it (true) or it must stay REVIEW (false). */
export function goldenStackSections(): Array<{ name: string; section: AuditNode; convertible: boolean }> {
  return [
    // 2 children: heading + paragraph, left aligned (v1 confidence 74: never eligible).
    { name: 'text-pair', convertible: true, section: frameOf('text-pair', 0, 0, 600, 200, [
      auditNode('tp-h', 'text', 40, 40, 300, 48), auditNode('tp-p', 'text', 40, 104, 420, 56)]) },
    // 3 children centred: icon, title, copy.
    { name: 'feature-centred', convertible: true, section: frameOf('feature-centred', 0, 0, 360, 260, [
      auditNode('fc-icon', 'vector', 156, 32, 48, 48), auditNode('fc-title', 'text', 80, 104, 200, 32), auditNode('fc-copy', 'text', 40, 160, 280, 64)]) },
    // 3 children right aligned (MAX).
    { name: 'price-right', convertible: true, section: frameOf('price-right', 0, 0, 300, 160, [
      auditNode('pr-a', 'text', 140, 20, 140, 24), auditNode('pr-b', 'text', 60, 60, 220, 40), auditNode('pr-c', 'text', 200, 116, 80, 24)]) },
    // Horizontal nav: logo | links | button, distributed (SPACE_BETWEEN).
    { name: 'nav', convertible: true, section: frameOf('nav', 0, 0, 1440, 96, [
      auditNode('nav-logo', 'image', 80, 32, 120, 32), frameOf('nav-links', 510, 36, 400, 24, []), frameOf('nav-cta', 1220, 24, 140, 48, [])]) },
    // 4 cards in a row, uniform gap, top aligned.
    { name: 'card-row', convertible: true, section: frameOf('card-row', 0, 0, 1280, 400, [0, 1, 2, 3].map((i) =>
      frameOf(`card-${i}`, 64 + i * 296, 48, 264, 304, []))) },
    // 5 rows, one full-width divider (FILL) among left-aligned narrower rows.
    { name: 'list-with-divider', convertible: true, section: frameOf('list-with-divider', 0, 0, 500, 300, [
      auditNode('l-1', 'text', 24, 24, 200, 24), auditNode('l-2', 'text', 24, 64, 260, 24), auditNode('l-div', 'frame', 24, 104, 452, 1),
      auditNode('l-3', 'text', 24, 121, 180, 24), auditNode('l-4', 'text', 24, 161, 240, 24)]) },
    // Non-uniform gaps forming two runs (title group, button group) separated by one outer gap → nested sub-stacks.
    { name: 'hero-runs', convertible: true, section: frameOf('hero-runs', 0, 0, 800, 400, [
      auditNode('h-eyebrow', 'text', 64, 64, 200, 20), auditNode('h-title', 'text', 64, 92, 560, 64), auditNode('h-copy', 'text', 64, 164, 480, 48),
      frameOf('h-btn-1', 64, 260, 160, 48, []), frameOf('h-btn-2', 64, 316, 160, 48, [])]) },
    // Overlapping children: no linear flow.
    { name: 'overlap', convertible: false, section: frameOf('overlap', 0, 0, 400, 300, [
      auditNode('o-bg', 'image', 0, 0, 400, 300), auditNode('o-title', 'text', 40, 40, 200, 40)]) },
    // Irregular gaps: the largest gap splits runs, but a run's own gaps differ (11 and 20).
    { name: 'irregular', convertible: false, section: frameOf('irregular', 0, 0, 400, 400, [
      auditNode('i-1', 'text', 20, 10, 100, 20), auditNode('i-2', 'text', 20, 37, 100, 20), auditNode('i-3', 'text', 20, 100, 100, 20),
      auditNode('i-4', 'text', 20, 131, 100, 20), auditNode('i-5', 'text', 20, 171, 100, 20)]) },
    // Mixed cross alignment.
    { name: 'mixed-align', convertible: false, section: frameOf('mixed-align', 0, 0, 400, 200, [
      auditNode('m-1', 'text', 20, 20, 100, 20), auditNode('m-2', 'text', 150, 60, 100, 20), auditNode('m-3', 'text', 280, 100, 100, 20)]) },
  ];
}
