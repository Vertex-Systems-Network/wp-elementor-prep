import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const pluginMain = readFileSync(fileURLToPath(new URL('../src/plugin/main.ts', import.meta.url)), 'utf8');
const ui = readFileSync(fileURLToPath(new URL('../src/ui/ui.html', import.meta.url)), 'utf8');

describe('P9 plugin backlog contract', () => {
  it('generates and persists backlog alongside audit results', () => {
    expect(pluginMain).toContain("generateBacklog(report");
    expect(pluginMain).toContain('figma.clientStorage.getAsync');
    expect(pluginMain).toContain('figma.clientStorage.setAsync');
    expect(pluginMain).toContain("type: 'audit-result'");
    expect(pluginMain).toContain('backlogJson: serializeBacklogJson(backlog)');
    expect(pluginMain).toContain('backlogMarkdown: serializeBacklogMarkdown(backlog)');
  });

  it('invalidates stale async audits before they can overwrite the UI', () => {
    expect(pluginMain).toContain('let auditSequence = 0');
    expect(pluginMain).toContain('const sequence = ++auditSequence');
    expect(pluginMain).toContain('if (sequence !== auditSequence) return');
    expect(pluginMain).toContain("figma.on('selectionchange'");
    expect(pluginMain).toContain('auditSequence += 1');
  });

  it('exposes backlog view and both required exports in the plugin UI', () => {
    expect(ui).toContain('Actionable backlog');
    expect(ui).toContain('export-backlog-json');
    expect(ui).toContain('export-backlog-md');
    expect(ui).toContain("downloadText('backlog.json'");
    expect(ui).toContain("downloadText('backlog.md'");
    expect(ui).toContain('summary.byCategory.IMPROVEMENT');
    expect(ui).toContain('summary.byDelta.REGRESSED');
  });

  it('keeps the P9 audit/backlog path non-mutating after P5 integration', () => {
    const auditStart = pluginMain.indexOf('async function runAudit(sequence: number)');
    const safeFixStart = pluginMain.indexOf('async function currentSafePlans');
    expect(auditStart).toBeGreaterThanOrEqual(0);
    expect(safeFixStart).toBeGreaterThan(auditStart);
    const auditPath = pluginMain.slice(auditStart, safeFixStart);
    expect(auditPath).toContain('generateBacklog(report');
    expect(auditPath).not.toContain('runSafeFixTransaction');
    expect(auditPath).not.toContain('appendChild(');
    expect(auditPath).not.toContain('remove()');
    expect(auditPath).not.toContain('resize(');
  });
});
