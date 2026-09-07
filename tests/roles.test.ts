import { describe, expect, it } from 'vitest';
import { detectSpecialRoles } from '../src/core/roles';
import type { AuditNode } from '../src/core/types';

let counter = 0;
function node(overrides: Partial<AuditNode> = {}): AuditNode {
  counter += 1;
  return {
    id: `n:${counter}`,
    name: 'Frame',
    type: 'FRAME',
    geometry: { x: 0, y: 0, width: 1000, height: 600 },
    layoutMode: 'NONE',
    isAutoLayout: false,
    isContainer: true,
    isText: false,
    isImageLike: false,
    isGenericName: false,
    textLength: 0,
    textAutoResize: null,
    absolutePositioned: false,
    clipsContent: false,
    opacity: 1,
    visible: true,
    childIds: [],
    children: [],
    ...overrides,
  };
}

function withChildren(parent: AuditNode, children: AuditNode[]): AuditNode {
  return { ...parent, children, childIds: children.map((child) => child.id) };
}

describe('detectSpecialRoles', () => {
  it('detects a full-size background sibling conservatively', () => {
    const background = node({ name: 'Backdrop', geometry: { x: 0, y: 0, width: 1000, height: 600 } });
    const contentA = node({ geometry: { x: 50, y: 80, width: 400, height: 300 } });
    const contentB = node({ geometry: { x: 520, y: 80, width: 400, height: 300 } });
    const section = withChildren(node({ id: 'section' }), [background, contentA, contentB]);

    const roles = detectSpecialRoles(section);
    expect(roles.some((role) => role.targetNodeId === background.id && role.role === 'background-layer')).toBe(true);
  });

  it('does not classify a full-size Auto Layout content wrapper as a background', () => {
    const wrapper = node({
      name: 'Content wrapper',
      geometry: { x: 0, y: 0, width: 1000, height: 600 },
      layoutMode: 'VERTICAL',
      isAutoLayout: true,
    });
    const aside = node({ geometry: { x: 800, y: 50, width: 150, height: 100 } });
    const section = withChildren(node({ id: 'section' }), [wrapper, aside]);

    const roles = detectSpecialRoles(section);
    expect(roles.some((role) => role.targetNodeId === wrapper.id && role.role === 'background-layer')).toBe(false);
  });

  it('preserves explicit absolute children as overlays', () => {
    const content = node({ geometry: { x: 0, y: 0, width: 700, height: 500 } });
    const badge = node({
      name: 'Badge',
      geometry: { x: 650, y: 20, width: 120, height: 50 },
      absolutePositioned: true,
    });
    const section = withChildren(node({ id: 'section' }), [content, badge]);

    const roles = detectSpecialRoles(section);
    expect(roles.some((role) => role.targetNodeId === badge.id && role.role === 'absolute-overlay')).toBe(true);
  });

  it('detects low-opacity overlapping decoration but not ordinary content', () => {
    const content = node({ geometry: { x: 100, y: 100, width: 500, height: 300 } });
    const decoration = node({
      geometry: { x: 50, y: 50, width: 700, height: 400 },
      opacity: 0.2,
    });
    const section = withChildren(node({ id: 'section' }), [content, decoration]);

    const roles = detectSpecialRoles(section);
    expect(roles.some((role) => role.targetNodeId === decoration.id && role.role === 'decorative-overlay')).toBe(true);
    expect(roles.some((role) => role.targetNodeId === content.id)).toBe(false);
  });
});
