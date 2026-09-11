from pathlib import Path

source = Path('src/core/responsive-risk.ts')
text = source.read_text()

old = """  RR_HORIZONTAL_DENSITY: {\n    id: 'RR_HORIZONTAL_DENSITY',\n    version: 1,"""
new = """  RR_HORIZONTAL_DENSITY: {\n    id: 'RR_HORIZONTAL_DENSITY',\n    version: 2,"""
assert text.count(old) == 1
text = text.replace(old, new, 1)

old = """  RR_OVERLAP_COLLISION: {\n    id: 'RR_OVERLAP_COLLISION',\n    version: 2,"""
new = """  RR_OVERLAP_COLLISION: {\n    id: 'RR_OVERLAP_COLLISION',\n    version: 3,"""
assert text.count(old) == 1
text = text.replace(old, new, 1)

old = """    if (currentRatio < 0.92 && triggered.length === 0) continue;\n\n    const severity: BuildReadySeverity = currentRatio > 1.02 ? 'HIGH' : 'MEDIUM';"""
new = """    // A tight row is not responsive-risk evidence by itself when no configured reference-width\n    // probe applies. Preserve direct current-width overflow (> 1.02) as HIGH evidence.\n    if (currentRatio <= 1.02 && triggered.length === 0) continue;\n\n    const severity: BuildReadySeverity = currentRatio > 1.02 ? 'HIGH' : 'MEDIUM';"""
assert text.count(old) == 1
text = text.replace(old, new, 1)

old = """        const severity: BuildReadySeverity = !manualLayerParent && overlapRatio >= 0.35 ? 'HIGH' : 'MEDIUM';\n        const confidence = manualLayerParent ? 68 : severity === 'HIGH' ? 88 : 74;\n        const detail = manualLayerParent\n          ? 'Sibling geometry overlaps inside a manual/layered parent. The overlap may be intentional composition, so this is capped at review-level evidence.'\n          : 'Sibling geometry overlaps inside a retained flow parent without a special-overlay role. The current source should be reviewed before treating this as normal responsive flow.';\n        results.push(finding('RR_OVERLAP_COLLISION', [parent.id, a.id, b.id], {\n          severity,\n          confidence,\n          title: manualLayerParent ? 'Manual-layer siblings overlap' : 'Flow siblings materially overlap',\n          detail,\n          evidence: {\n            overlapRatio: round(overlapRatio),\n            overlapArea: round(intersection),\n            parentWidth: round(parent.geometry.width),\n            parentLayoutMode: parent.layoutMode,\n          },\n          penalty: manualLayerParent ? 2 : severity === 'HIGH' ? 6 : 3,\n        }));"""
new = """        const severity: BuildReadySeverity = manualLayerParent\n          ? 'LOW'\n          : overlapRatio >= 0.35 ? 'HIGH' : 'MEDIUM';\n        const confidence = manualLayerParent ? 60 : severity === 'HIGH' ? 88 : 74;\n        const detail = manualLayerParent\n          ? 'Sibling geometry overlaps inside a manual/layered parent. Geometry alone cannot distinguish intended composition from collision, so this is an advisory only; manual-flow structural debt is scored separately.'\n          : 'Sibling geometry overlaps inside a retained flow parent without a special-overlay role. The current source should be reviewed before treating this as normal responsive flow.';\n        results.push(finding('RR_OVERLAP_COLLISION', [parent.id, a.id, b.id], {\n          severity,\n          confidence,\n          title: manualLayerParent ? 'Manual-layer overlap is advisory' : 'Flow siblings materially overlap',\n          detail,\n          evidence: {\n            overlapRatio: round(overlapRatio),\n            overlapArea: round(intersection),\n            parentWidth: round(parent.geometry.width),\n            parentLayoutMode: parent.layoutMode,\n          },\n          penalty: manualLayerParent ? 0 : severity === 'HIGH' ? 6 : 3,\n        }));"""
assert text.count(old) == 1
text = text.replace(old, new, 1)
source.write_text(text)

tests = Path('tests/p13-responsive-risk.test.ts')
t = tests.read_text()
old = """  it('caps strong sibling overlap inside a manual layered parent at MEDIUM', () => {"""
new = """  it('keeps strong sibling overlap inside a manual layered parent as a zero-penalty advisory', () => {"""
assert t.count(old) == 1
t = t.replace(old, new, 1)
old = """    expect(finding?.severity).toBe('MEDIUM');\n    expect(finding?.evidence.parentLayoutMode).toBe('NONE');"""
new = """    expect(finding?.severity).toBe('LOW');\n    expect(finding?.penalty).toBe(0);\n    expect(finding?.evidence.parentLayoutMode).toBe('NONE');"""
assert t.count(old) == 1
t = t.replace(old, new, 1)

assert t.endswith('});\n')
insertion = r'''

  it('does not report a tight small row when no reference-width probe applies', () => {
    const children = [0, 1].map((index) => node({
      id: `small:${index}`,
      isContainer: false,
      layoutMode: 'NONE',
      isAutoLayout: false,
      geometry: { x: index * 70, y: 0, width: 70, height: 30 },
      children: [],
    }));
    const row = node({
      id: 'small-row',
      layoutMode: 'HORIZONTAL',
      geometry: { x: 0, y: 0, width: 140, height: 40 },
      children,
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [row] }), {}, '2026-09-11T00:00:00.000Z');
    expect(report.findings.some((item) =>
      item.ruleId === 'RR_HORIZONTAL_DENSITY' && item.nodeIds.includes('small-row'))).toBe(false);
  });

  it('retains direct current-width overflow as HIGH even when no reference-width probe applies', () => {
    const children = [0, 1].map((index) => node({
      id: `overfull:${index}`,
      isContainer: false,
      layoutMode: 'NONE',
      isAutoLayout: false,
      geometry: { x: index * 90, y: 0, width: 90, height: 30 },
      children: [],
    }));
    const row = node({
      id: 'overfull-row',
      layoutMode: 'HORIZONTAL',
      geometry: { x: 0, y: 0, width: 140, height: 40 },
      children,
    });
    const report = buildBuildReadyReport(node({ id: 'root', children: [row] }), {}, '2026-09-11T00:00:00.000Z');
    const finding = report.findings.find((item) =>
      item.ruleId === 'RR_HORIZONTAL_DENSITY' && item.nodeIds.includes('overfull-row'));
    expect(finding?.severity).toBe('HIGH');
  });
'''
tests.write_text(t[:-4] + insertion + '\n});\n')
