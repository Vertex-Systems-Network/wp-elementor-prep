import type { ElementorTemplateCandidateArtifactV1 } from './candidate-artifact';
import type {
  P15NeutralContainerNode,
  P15NeutralExportDocumentV1,
  P15NeutralExportNode,
} from './neutral-export-ir';
import type {
  ElementorContainerV04,
  ElementorElementV04,
  ElementorTemplateV04,
} from './template-v04';

export interface P15ResponsiveContainerBindingIssueV1 {
  path: string;
  message: string;
}

export interface P15ResponsiveContainerBindingResultV1 {
  containers: Map<string, ElementorContainerV04>;
  issues: P15ResponsiveContainerBindingIssueV1[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectedWidgetType(node: Exclude<P15NeutralExportNode, P15NeutralContainerNode>): string | null {
  if (node.kind === 'heading') return 'heading';
  if (node.kind === 'text') return 'text-editor';
  if (node.kind === 'button') return 'button';
  if (node.kind === 'image') return 'image';
  return null;
}

export function collectP15NeutralContainerNodes(
  document: P15NeutralExportDocumentV1,
): Map<string, P15NeutralContainerNode> {
  const result = new Map<string, P15NeutralContainerNode>();

  function visit(nodes: readonly P15NeutralExportNode[]): void {
    for (const node of nodes) {
      if (node.kind !== 'container') continue;
      result.set(node.sourceNodeId, node);
      visit(node.children);
    }
  }

  visit(document.nodes);
  return result;
}

function pushBindingIssue(
  issues: P15ResponsiveContainerBindingIssueV1[],
  path: string,
  message: string,
): void {
  issues.push({ path, message });
}

function bindNodes(
  sourceNodes: readonly P15NeutralExportNode[],
  targetElements: readonly ElementorElementV04[],
  containers: Map<string, ElementorContainerV04>,
  issues: P15ResponsiveContainerBindingIssueV1[],
  targetPath: string,
): void {
  if (sourceNodes.length !== targetElements.length) {
    pushBindingIssue(
      issues,
      targetPath,
      'Generated Elementor tree length does not match the exact review-free neutral source tree.',
    );
    return;
  }

  for (let index = 0; index < sourceNodes.length; index += 1) {
    const source = sourceNodes[index];
    const target = targetElements[index];
    const path = `${targetPath}[${index}]`;

    if (!source || !target) {
      pushBindingIssue(issues, path, 'Generated source/target element pair is missing.');
      continue;
    }
    if (source.kind === 'review') {
      pushBindingIssue(issues, path, 'Review nodes cannot participate in responsive candidate binding.');
      continue;
    }

    if (source.kind === 'container') {
      if (target.elType !== 'container') {
        pushBindingIssue(issues, path, 'Neutral container did not bind to a generated Elementor container.');
        continue;
      }
      if (!isRecord(target.settings) || target.settings.flex_direction !== source.direction) {
        pushBindingIssue(
          issues,
          `${path}.settings.flex_direction`,
          'Generated container base direction drifted from the neutral source.',
        );
        continue;
      }
      containers.set(source.sourceNodeId, target);
      bindNodes(source.children, target.elements, containers, issues, `${path}.elements`);
      continue;
    }

    const widgetType = expectedWidgetType(source);
    if (target.elType !== 'widget' || target.widgetType !== widgetType) {
      pushBindingIssue(
        issues,
        path,
        'Neutral widget did not bind to the expected generated Elementor core widget.',
      );
    }
  }
}

/**
 * Bind one review-free neutral source tree to the exact deterministic generated Elementor tree.
 *
 * This helper is structural integrity only. It does not grant responsive, target-compatibility,
 * production, import or transfer authority.
 */
export function bindP15NeutralSourceToGeneratedContainers(
  document: P15NeutralExportDocumentV1,
  template: ElementorTemplateV04,
): P15ResponsiveContainerBindingResultV1 {
  const containers = new Map<string, ElementorContainerV04>();
  const issues: P15ResponsiveContainerBindingIssueV1[] = [];
  bindNodes(document.nodes, template.content, containers, issues, '$.content');
  return { containers, issues };
}

/**
 * Clone the exact template JSON embedded in one canonical ready candidate.
 */
export function cloneP15ReadyElementorTemplate(
  candidate: ElementorTemplateCandidateArtifactV1,
): ElementorTemplateV04 {
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || typeof candidate.templateJson !== 'string') {
    throw new Error('Responsive container binding requires a canonical ready base candidate.');
  }
  return JSON.parse(candidate.templateJson) as ElementorTemplateV04;
}
