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

  it('exposes backlog view and both required exports in the plugin UI', () => {
    expect(ui).toContain('Actionable backlog');
    expect(ui).toContain('export-backlog-json');
    expect(ui).toContain('export-backlog-md');
    expect(ui).toContain("downloadText('backlog.json'");
    expect(ui).toContain("downloadText('backlog.md'");
    expect(ui).toContain('summary.byCategory.IMPROVEMENT');
    expect(ui).toContain('summary.byDelta.REGRESSED');
  });

  it('keeps P9 reporting non-mutating', () => {
    expect(ui).toContain('no design mutations');
    expect(pluginMain).not.toContain('appendChild(');
    expect(pluginMain).not.toContain('remove()');
    expect(pluginMain).not.toContain('resize(');
  });
});
