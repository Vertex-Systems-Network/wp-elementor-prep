import type { P15NeutralExportDocumentV1, P15NeutralExportNode } from '../neutral-export-ir';
import type { ElementorElementV04, ElementorTemplateV04 } from '../template-v04';
import type { FamilyBoundTarget, FamilyTarget } from './property-family';
import { isRecord } from './shared-validation';
import { expectedWidgetType } from './widget-binding';

/**
 * Element target (recovery M4.3b): every generated Container and core widget, for families whose controls every
 * element has (`hide_<device>` from `element-base.php`, the `_flex` flex-item group on Containers and widgets).
 * Binds by walking the review-free neutral source and the generated tree in lockstep; any drift (tree shape, element
 * type, container direction, widget type) or a review node is a binding issue.
 */
function collectElements(document: P15NeutralExportDocumentV1): Map<string, P15NeutralExportNode> {
  const result = new Map<string, P15NeutralExportNode>();
  const visit = (nodes: readonly P15NeutralExportNode[]): void => {
    for (const node of nodes) {
      if (node.kind === 'review') continue;
      result.set(node.sourceNodeId, node);
      if (node.kind === 'container') visit(node.children);
    }
  };
  visit(document.nodes);
  return result;
}

function bindElements(source: P15NeutralExportDocumentV1, template: ElementorTemplateV04): {
  targets: Map<string, FamilyBoundTarget>;
  issues: Array<{ path: string; message: string }>;
} {
  const targets = new Map<string, FamilyBoundTarget>();
  const issues: Array<{ path: string; message: string }> = [];
  const visit = (nodes: readonly P15NeutralExportNode[], elements: readonly ElementorElementV04[], path: string): void => {
    if (nodes.length !== elements.length) {
      issues.push({ path, message: 'Generated Elementor tree length does not match the exact review-free neutral source tree.' });
      return;
    }
    nodes.forEach((node, index) => {
      const element = elements[index]!;
      const at = `${path}[${index}]`;
      if (node.kind === 'review') {
        issues.push({ path: at, message: 'Element families require a review-free neutral source.' });
        return;
      }
      if (node.kind === 'container') {
        if (element.elType !== 'container' || !isRecord(element.settings) || (node.grid === undefined && element.settings.flex_direction !== node.direction)) {
          issues.push({ path: at, message: 'Neutral container did not bind to its generated Elementor container.' });
          return;
        }
        targets.set(node.sourceNodeId, element);
        visit(node.children, element.elements, `${at}.elements`);
        return;
      }
      if (element.elType !== 'widget' || element.widgetType !== expectedWidgetType(node) || !isRecord(element.settings)) {
        issues.push({ path: at, message: 'Neutral widget did not bind to the expected generated Elementor core widget.' });
        return;
      }
      targets.set(node.sourceNodeId, element);
    });
  };
  visit(source.nodes, template.content, '$.content');
  return { targets, issues };
}

export const ELEMENT_TARGET: FamilyTarget = {
  entriesField: 'elements',
  sourceCountField: 'sourceElementCount',
  resolvedCountField: 'resolvedElementCount',
  notTargetSuffix: 'SOURCE_NOT_ELEMENT',
  notTargetMessage: (subject) => `${subject} sourceNodeId must identify an existing neutral container or widget node.`,
  collect: collectElements,
  bind: bindElements,
  bindingMissingMessage: (sourceNodeId) => `No generated Elementor element is bound to neutral source node ${sourceNodeId}.`,
};
