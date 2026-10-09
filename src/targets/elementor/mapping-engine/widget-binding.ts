import type {
  P15NeutralButtonNode,
  P15NeutralExportDocumentV1,
  P15NeutralExportNode,
  P15NeutralHeadingNode,
  P15NeutralTextNode,
} from '../neutral-export-ir';
import type { ElementorElementV04, ElementorTemplateV04, ElementorWidgetV04 } from '../template-v04';
import type { FamilyTarget } from './property-family';
import { hasOwn, isRecord } from './shared-validation';

/**
 * Widget targets for property families (recovery M1.4): bind exact generated Elementor core widgets to
 * their neutral source nodes. The binder walks the review-free source and generated trees in lockstep,
 * refuses any drift (tree shape, container direction, widget type, the widget's base settings) and
 * returns the bound widgets of the requested kinds. It reproduces the per-resolver binders exactly.
 */
export type WidgetNodeKind = 'heading' | 'text' | 'button' | 'image';
type WidgetNode = Exclude<P15NeutralExportNode, { kind: 'container' | 'review' }>;

export interface WidgetTargetSpec {
  kinds: readonly WidgetNodeKind[];
  entriesField: string;
  sourceCountField: string;
  resolvedCountField: string;
  notTargetSuffix: string;
  notTargetMessage: (subject: string) => string;
  bindingMissingMessage: (sourceNodeId: string) => string;
  /** Binding issue for a review node anywhere in the tree. */
  reviewMessage: string;
  /** The bound widget's generated base settings must still match its neutral source. */
  matches: (node: WidgetNode, settings: Record<string, unknown>) => boolean;
  /** Appended to the element path of a drift issue, e.g. `.settings` or `.settings.align`. */
  driftPathSuffix: string;
  driftMessage: string;
}

export function expectedWidgetType(node: WidgetNode): string {
  if (node.kind === 'heading') return 'heading';
  if (node.kind === 'text') return 'text-editor';
  if (node.kind === 'button') return 'button';
  return 'image';
}

function collectWidgets(document: P15NeutralExportDocumentV1, kinds: readonly WidgetNodeKind[]): Map<string, WidgetNode> {
  const result = new Map<string, WidgetNode>();
  function visit(nodes: readonly P15NeutralExportNode[]): void {
    for (const node of nodes) {
      if (node.kind === 'container') visit(node.children);
      else if (node.kind !== 'review' && kinds.includes(node.kind)) result.set(node.sourceNodeId, node);
    }
  }
  visit(document.nodes);
  return result;
}

function bindWidgets(
  spec: WidgetTargetSpec,
  source: P15NeutralExportDocumentV1,
  template: ElementorTemplateV04,
): { targets: Map<string, ElementorWidgetV04>; issues: Array<{ path: string; message: string }> } {
  const targets = new Map<string, ElementorWidgetV04>();
  const issues: Array<{ path: string; message: string }> = [];
  const push = (path: string, message: string): void => {
    issues.push({ path, message });
  };

  function visit(sourceNodes: readonly P15NeutralExportNode[], targetElements: readonly ElementorElementV04[], targetPath: string): void {
    if (sourceNodes.length !== targetElements.length) {
      push(targetPath, 'Generated Elementor tree length does not match the exact review-free neutral source tree.');
      return;
    }
    for (let index = 0; index < sourceNodes.length; index += 1) {
      const sourceNode = sourceNodes[index];
      const target = targetElements[index];
      const path = `${targetPath}[${index}]`;
      if (!sourceNode || !target) {
        push(path, 'Generated source/target element pair is missing.');
        continue;
      }
      if (sourceNode.kind === 'review') {
        push(path, spec.reviewMessage);
        continue;
      }
      if (sourceNode.kind === 'container') {
        if (target.elType !== 'container') {
          push(path, 'Neutral container did not bind to a generated Elementor container.');
          continue;
        }
        if (!isRecord(target.settings) || target.settings.flex_direction !== sourceNode.direction) {
          push(`${path}.settings.flex_direction`, 'Generated container base direction drifted from the neutral source.');
          continue;
        }
        visit(sourceNode.children, target.elements, `${path}.elements`);
        continue;
      }
      if (target.elType !== 'widget' || target.widgetType !== expectedWidgetType(sourceNode)) {
        push(path, 'Neutral widget did not bind to the expected generated Elementor core widget.');
        continue;
      }
      if (spec.kinds.includes(sourceNode.kind)) {
        if (!isRecord(target.settings) || !spec.matches(sourceNode, target.settings)) {
          push(`${path}${spec.driftPathSuffix}`, spec.driftMessage);
          continue;
        }
        targets.set(sourceNode.sourceNodeId, target);
      }
    }
  }

  visit(source.nodes, template.content, '$.content');
  return { targets, issues };
}

export function widgetTarget(spec: WidgetTargetSpec): FamilyTarget {
  return {
    entriesField: spec.entriesField,
    sourceCountField: spec.sourceCountField,
    resolvedCountField: spec.resolvedCountField,
    notTargetSuffix: spec.notTargetSuffix,
    notTargetMessage: spec.notTargetMessage,
    collect: (source) => collectWidgets(source, spec.kinds),
    bind: (source, template) => bindWidgets(spec, source, template),
    bindingMissingMessage: spec.bindingMissingMessage,
  };
}

/** Desktop `align` must be exactly the neutral alignment, or absent when the source has none. */
export function desktopAlignMatches(expected: string | undefined, settings: Record<string, unknown>): boolean {
  const hasAlign = hasOwn(settings, 'align');
  return expected === undefined ? !hasAlign : hasAlign && settings.align === expected;
}

export function headingBaseSettingsMatch(node: P15NeutralHeadingNode, settings: Record<string, unknown>): boolean {
  if (settings.title !== node.text || settings.header_size !== node.level) return false;
  return desktopAlignMatches(node.align, settings);
}

function escapeTextEditorHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/** The Text Editor `editor` HTML the v3 generator emits for a neutral text node. */
export function expectedTextEditorHtml(value: string): string {
  const normalized = value.replace(/\r\n?/g, '\n');
  return `<p>${escapeTextEditorHtml(normalized).replaceAll('\n', '<br>')}</p>`;
}

export function textEditorBaseSettingsMatch(node: P15NeutralTextNode, settings: Record<string, unknown>): boolean {
  if (settings.editor !== expectedTextEditorHtml(node.text)) return false;
  return desktopAlignMatches(node.align, settings);
}

/** Button desktop alignment in Elementor's normalized vocabulary (start/end become left/right). */
export function expectedDesktopButtonAlignment(value: P15NeutralButtonNode['align']): 'left' | 'center' | 'right' | undefined {
  if (value === 'start') return 'left';
  if (value === 'end') return 'right';
  return value;
}
