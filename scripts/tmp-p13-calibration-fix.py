from pathlib import Path
import re

source = Path('src/core/responsive-risk.ts')
text = source.read_text()

old = "import { flatten } from './scanner';\nimport { detectSpecialRoles } from './roles';"
new = "import { flatten } from './scanner';\nimport { detectPatterns } from './classification';\nimport { detectSpecialRoles } from './roles';"
assert text.count(old) == 1
text = text.replace(old, new, 1)

text, n = re.subn(r"(RR_OVERFLOW_CLIP_DEPENDENCY: \{\n    id: 'RR_OVERFLOW_CLIP_DEPENDENCY',\n    version: )1,", r"\g<1>2,", text, count=1)
assert n == 1
text, n = re.subn(r"(RR_OVERLAP_COLLISION: \{\n    id: 'RR_OVERLAP_COLLISION',\n    version: )1,", r"\g<1>2,", text, count=1)
assert n == 1

overflow = r'''function overflowFindings(context: BuildReadyAnalysisContext): BuildReadyFinding[] {
  const results: BuildReadyFinding[] = [];
  const roles = new Map(detectSpecialRoles(context.root, 6, 200).map((role) => [role.targetNodeId, role]));
  for (const parent of flatten(context.root)) {
    if (!parent.visible || !parent.clipsContent || parent.geometry.width <= 0 || parent.geometry.height < 0) continue;

    // Clipped horizontal overflow is the defining geometry of a retained carousel viewport.
    // Do not duplicate that known semantic as a generic HIGH overflow defect.
    const knownCarousel = detectPatterns(parent, 1, 12).some(
      (detection) => detection.targetNodeId === parent.id && detection.pattern === 'carousel-track',
    );
    if (knownCarousel) continue;

    for (const child of parent.children) {
      if (!child.visible || child.geometry.width < 0 || child.geometry.height < 0) continue;
      const overflowLeft = Math.max(0, -child.geometry.x);
      const overflowTop = Math.max(0, -child.geometry.y);
      const overflowRight = Math.max(0, child.geometry.x + child.geometry.width - parent.geometry.width);
      const overflowBottom = Math.max(0, child.geometry.y + child.geometry.height - parent.geometry.height);
      const overflow = Math.max(overflowLeft, overflowTop, overflowRight, overflowBottom);
      if (overflow <= 1) continue;

      const horizontalRatio = Math.max(overflowLeft, overflowRight) / Math.max(1, parent.geometry.width);
      const verticalRatio = Math.max(overflowTop, overflowBottom) / Math.max(1, parent.geometry.height);
      const overflowRatio = Math.max(horizontalRatio, verticalRatio);
      const role = roles.get(child.id);
      const intentionalMediaComposition = child.isImageLike && (
        child.absolutePositioned
        || role?.role === 'background-layer'
        || role?.role === 'decorative-overlay'
      );
      const smallControlledOverflow = overflowRatio <= 0.08;
      const severity: BuildReadySeverity = intentionalMediaComposition || smallControlledOverflow ? 'MEDIUM' : 'HIGH';
      const confidence = intentionalMediaComposition ? 68 : smallControlledOverflow ? 76 : 94;
      const detail = intentionalMediaComposition
        ? 'Image-like geometry extends beyond a clipping parent as part of an absolute/decorative composition. Preserve the composition and review its responsive behavior; this is not a high-confidence defect.'
        : smallControlledOverflow
          ? 'A child extends slightly beyond a clipping parent. The proportional overflow is small, so this remains a review signal rather than a high-confidence responsive defect.'
          : 'A child materially extends beyond a clipping parent without retained semantics that explain the overflow. Width changes can expose or hide content differently, so this requires review rather than an invented responsive fix.';

      results.push(finding('RR_OVERFLOW_CLIP_DEPENDENCY', [parent.id, child.id], {
        severity,
        confidence,
        title: severity === 'HIGH' ? 'Visible geometry depends on unexplained clipping' : 'Clipped geometry needs responsive review',
        detail,
        evidence: {
          parentWidth: round(parent.geometry.width),
          parentHeight: round(parent.geometry.height),
          overflowPx: round(overflow),
          overflowRatio: round(overflowRatio, 3),
          childX: round(child.geometry.x),
          childY: round(child.geometry.y),
          childWidth: round(child.geometry.width),
          childHeight: round(child.geometry.height),
          childAbsolutePositioned: child.absolutePositioned,
          childImageLike: child.isImageLike,
          retainedRole: role?.role ?? 'none',
        },
        penalty: severity === 'HIGH' ? 8 : 2,
      }));
    }
  }
  return results;
}
'''
pattern = r"function overflowFindings\(context: BuildReadyAnalysisContext\): BuildReadyFinding\[\] \{.*?\n\}\n\n(?=function overlapFindings)"
text, n = re.subn(pattern, overflow + '\n', text, count=1, flags=re.S)
assert n == 1

overlap = r'''function overlapFindings(context: BuildReadyAnalysisContext): BuildReadyFinding[] {
  const results: BuildReadyFinding[] = [];
  const roleTargets = new Set(detectSpecialRoles(context.root, 6, 200).map((role) => role.targetNodeId));

  for (const parent of flatten(context.root)) {
    if (!parent.visible || !parent.isContainer) continue;
    const manualLayerParent = parent.layoutMode === 'NONE';
    const candidates = parent.children
      .filter((child) =>
        child.visible
        && !child.absolutePositioned
        && !roleTargets.has(child.id)
        && child.geometry.width > 0
        && child.geometry.height > 0,
      )
      .slice(0, context.config.maxCollisionChildren);

    for (let i = 0; i < candidates.length; i += 1) {
      const a = candidates[i];
      if (!a) continue;
      for (let j = i + 1; j < candidates.length; j += 1) {
        const b = candidates[j];
        if (!b) continue;
        const intersection = intersectionArea(a, b);
        if (intersection <= 0) continue;
        const minArea = Math.max(1, Math.min(
          a.geometry.width * a.geometry.height,
          b.geometry.width * b.geometry.height,
        ));
        const overlapRatio = intersection / minArea;
        if (overlapRatio < 0.12) continue;

        // In a manual/layered parent, overlap can be intentional composition. Geometry alone cannot
        // justify a HIGH collision claim. Flow parents retain the stronger collision signal.
        const severity: BuildReadySeverity = !manualLayerParent && overlapRatio >= 0.35 ? 'HIGH' : 'MEDIUM';
        const confidence = manualLayerParent ? 68 : severity === 'HIGH' ? 88 : 74;
        const detail = manualLayerParent
          ? 'Sibling geometry overlaps inside a manual/layered parent. The overlap may be intentional composition, so this is capped at review-level evidence.'
          : 'Sibling geometry overlaps inside a retained flow parent without a special-overlay role. The current source should be reviewed before treating this as normal responsive flow.';
        results.push(finding('RR_OVERLAP_COLLISION', [parent.id, a.id, b.id], {
          severity,
          confidence,
          title: manualLayerParent ? 'Manual-layer siblings overlap' : 'Flow siblings materially overlap',
          detail,
          evidence: {
            overlapRatio: round(overlapRatio),
            overlapArea: round(intersection),
            parentWidth: round(parent.geometry.width),
            parentLayoutMode: parent.layoutMode,
          },
          penalty: manualLayerParent ? 2 : severity === 'HIGH' ? 6 : 3,
        }));
      }
    }
  }
  return results;
}
'''
pattern = r"function overlapFindings\(context: BuildReadyAnalysisContext\): BuildReadyFinding\[\] \{.*?\n\}\n\n(?=function absoluteFlowFindings)"
text, n = re.subn(pattern, overlap + '\n', text, count=1, flags=re.S)
assert n == 1
source.write_text(text)

tests = Path('tests/p13-responsive-risk.test.ts')
t = tests.read_text()
assert t.endswith('});\n')
insertion = r'''

  it('caps strong sibling overlap inside a manual layered parent at MEDIUM', () => {
    const a = node({ id: 'manual-a', geometry: { x: 0, y: 0, width: 500, height: 200 }, children: [] });
    const b = node({ id: 'manual-b', geometry: { x: 0, y: 0, width: 500, height: 200 }, children: [] });
    const parent = node({
      id: 'manual-parent',
      layoutMode: 'NONE',
      isAutoLayout: false,
      geometry: { x: 0, y: 0, width: 600, height: 220 },
      children: [a, b],
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [parent] }), {}, '2026-09-11T00:00:00.000Z');
    const finding = report.findings.find((item) => item.ruleId === 'RR_OVERLAP_COLLISION');
    expect(finding?.severity).toBe('MEDIUM');
    expect(finding?.evidence.parentLayoutMode).toBe('NONE');
  });

  it('retains HIGH collision evidence for strong overlap inside a flow parent', () => {
    const a = node({ id: 'flow-a', geometry: { x: 0, y: 0, width: 500, height: 200 }, children: [] });
    const b = node({ id: 'flow-b', geometry: { x: 0, y: 0, width: 500, height: 200 }, children: [] });
    const parent = node({
      id: 'flow-parent',
      layoutMode: 'HORIZONTAL',
      isAutoLayout: true,
      geometry: { x: 0, y: 0, width: 600, height: 220 },
      children: [a, b],
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [parent] }), {}, '2026-09-11T00:00:00.000Z');
    const finding = report.findings.find((item) => item.ruleId === 'RR_OVERLAP_COLLISION');
    expect(finding?.severity).toBe('HIGH');
  });

  it('does not duplicate a known clipped carousel viewport as generic HIGH overflow', () => {
    const cards = [0, 1, 2, 3].map((index) => node({
      id: `card:${index}`,
      geometry: { x: index * 320, y: 0, width: 300, height: 100 },
      children: [],
    }));
    const carousel = node({
      id: 'carousel',
      layoutMode: 'NONE',
      isAutoLayout: false,
      clipsContent: true,
      geometry: { x: 0, y: 0, width: 800, height: 120 },
      children: cards,
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [carousel] }), {}, '2026-09-11T00:00:00.000Z');
    expect(report.findings.some((item) =>
      item.ruleId === 'RR_OVERFLOW_CLIP_DEPENDENCY' && item.nodeIds.includes('carousel'))).toBe(false);
  });

  it('downgrades clipped absolute image composition and small controlled overflow to MEDIUM', () => {
    const portrait = node({
      id: 'portrait',
      isImageLike: true,
      absolutePositioned: true,
      geometry: { x: -30, y: 0, width: 620, height: 200 },
      children: [],
    });
    const media = node({
      id: 'media',
      clipsContent: true,
      geometry: { x: 0, y: 0, width: 600, height: 200 },
      children: [portrait],
    });
    const slight = node({
      id: 'slight',
      isContainer: false,
      layoutMode: 'NONE',
      isAutoLayout: false,
      geometry: { x: 0, y: 0, width: 1025, height: 50 },
      children: [],
    });
    const smallClip = node({
      id: 'small-clip',
      clipsContent: true,
      geometry: { x: 0, y: 0, width: 1000, height: 60 },
      children: [slight],
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [media, smallClip] }), {}, '2026-09-11T00:00:00.000Z');
    const overflow = report.findings.filter((item) => item.ruleId === 'RR_OVERFLOW_CLIP_DEPENDENCY');
    expect(overflow.find((item) => item.nodeIds.includes('portrait'))?.severity).toBe('MEDIUM');
    expect(overflow.find((item) => item.nodeIds.includes('slight'))?.severity).toBe('MEDIUM');
  });
'''
tests.write_text(t[:-4] + insertion + '\n});\n')
