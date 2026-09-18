import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function read(path) {
  return readFileSync(path, 'utf8');
}

function filesUnder(root) {
  const files = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const info = statSync(path);
    if (info.isDirectory()) files.push(...filesUnder(path));
    else if (/\.(?:ts|tsx|js|mjs|cjs|html)$/i.test(entry)) files.push(path);
  }
  return files;
}

function manifest(path) {
  return JSON.parse(read(path));
}

const PROVIDER_RUNTIME_PATTERNS = [
  /from\s+['"]openai['"]/i,
  /require\(\s*['"]openai['"]\s*\)/i,
  /@anthropic-ai\/sdk/i,
  /@google\/generative-ai/i,
  /OPENAI_API_KEY/,
  /ANTHROPIC_API_KEY/,
  /GEMINI_API_KEY/,
  /GOOGLE_GENERATIVE_AI_API_KEY/,
  /MISTRAL_API_KEY/,
  /COHERE_API_KEY/,
];

describe('AI security boundary contract', () => {
  it('keeps the accepted Figma core network-free', () => {
    for (const path of ['manifest.template.json', 'manifest.release.template.json']) {
      expect(manifest(path).networkAccess?.allowedDomains, path).toEqual(['none']);
    }
  });

  it('does not silently add provider SDKs or provider credential hooks to production source', () => {
    const sourceFiles = filesUnder('src');
    for (const path of sourceFiles) {
      const source = read(path);
      for (const pattern of PROVIDER_RUNTIME_PATTERNS) {
        expect(source, `${path}: ${pattern}`).not.toMatch(pattern);
      }
    }

    const packageJson = JSON.parse(read('package.json'));
    const runtimeDependencies = Object.keys(packageJson.dependencies ?? {});
    for (const dependency of runtimeDependencies) {
      expect(dependency).not.toMatch(/^(?:openai|@anthropic-ai\/sdk|@google\/generative-ai|cohere-ai|@mistralai\/mistralai)$/i);
    }
  });

  it('locks prompt-injection, secret and authority boundaries in the P26 specification', () => {
    const spec = read('docs/P26_OPTIONAL_AI_ASSISTANCE_SPEC.md');
    for (const requiredBoundary of [
      'No AI response directly mutates project/source/target authority.',
      'do not treat untrusted content as system/tool instructions;',
      'no secret retrieval tools;',
      'First-slice AI does not autonomously call product mutation/export/deployment operations.',
      'arbitrary AI-generated production code insertion;',
    ]) {
      expect(spec).toContain(requiredBoundary);
    }
  });

  it('documents AI-specific vulnerability reporting classes', () => {
    const policy = read('SECURITY.md');
    for (const requiredText of [
      'AI-specific security reports',
      'prompt injection',
      'secret or credential exposure',
      'authority escalation',
      'unauthorized tool execution',
    ]) {
      expect(policy.toLowerCase()).toContain(requiredText.toLowerCase());
    }
  });
});
