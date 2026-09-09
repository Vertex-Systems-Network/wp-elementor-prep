import { readFile, writeFile } from 'node:fs/promises';

const path = 'tests/p9-plugin-backlog-contract.test.mjs';
const text = await readFile(path, 'utf8');
const oldBlock = `  it('keeps P9 reporting non-mutating', () => {\n    expect(ui).toContain('no design mutations');\n    expect(pluginMain).not.toContain('appendChild(');\n    expect(pluginMain).not.toContain('remove()');\n    expect(pluginMain).not.toContain('resize(');\n  });`;
const newBlock = `  it('keeps the P9 audit/backlog path non-mutating after P5 integration', () => {\n    const auditStart = pluginMain.indexOf('async function runAudit(sequence: number)');\n    const safeFixStart = pluginMain.indexOf('async function currentSafePlans');\n    expect(auditStart).toBeGreaterThanOrEqual(0);\n    expect(safeFixStart).toBeGreaterThan(auditStart);\n    const auditPath = pluginMain.slice(auditStart, safeFixStart);\n    expect(auditPath).toContain('generateBacklog(report');\n    expect(auditPath).not.toContain('runSafeFixTransaction');\n    expect(auditPath).not.toContain('appendChild(');\n    expect(auditPath).not.toContain('remove()');\n    expect(auditPath).not.toContain('resize(');\n  });`;

if (!text.includes(oldBlock)) throw new Error('Expected pre-P5 P9 non-mutation assertion was not found.');
await writeFile(path, text.replace(oldBlock, newBlock), 'utf8');
console.log('P9 non-mutation test scoped to the audit/backlog path for P5 integration rehearsal.');
