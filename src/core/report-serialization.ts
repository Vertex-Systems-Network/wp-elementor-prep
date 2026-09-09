import type { AuditReport } from './types';

export function serializeAuditReportJson(report: AuditReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function serializeAuditReportMarkdown(report: AuditReport): string {
  const lines = [
    '# Elementor Prep Audit',
    '',
    `Generated: ${report.generatedAt}`,
    `Root: ${report.root.name} · ${Math.round(report.root.width)} × ${Math.round(report.root.height)}`,
    `Score: ${report.score} · ${report.status}`,
    '',
    '## Summary',
    '',
    `- Nodes: ${report.stats.nodes}`,
    `- Containers: ${report.stats.containers}`,
    `- Auto Layout coverage: ${report.stats.autoLayoutCoveragePct}%`,
    `- Text nodes: ${report.stats.textNodes}`,
    `- Image-like nodes: ${report.stats.imageLikeNodes}`,
    `- Sections: ${report.sections.length}`,
    '',
    '## Findings',
    '',
    '| Severity | Code | Title | Detail |',
    '|---|---|---|---|',
    ...report.findings.map((finding) => `| ${finding.severity.toUpperCase()} | ${cell(finding.code)} | ${cell(finding.title)} | ${cell(finding.detail)} |`),
    '',
    '## Sections',
    '',
    '| Section | Score | Status | Pattern | Confidence | Recipe |',
    '|---|---:|---|---|---:|---|',
    ...report.sections.map((section) => `| ${cell(section.name)} | ${section.score} | ${section.status} | ${cell(section.detection?.pattern ?? '—')} | ${section.detection?.confidence ?? '—'} | ${cell(section.recommendedRecipe ?? '—')} |`),
    '',
  ];

  return `${lines.join('\n')}\n`;
}
