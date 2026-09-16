import { describe, expect, it } from 'vitest';
import { P15_CANDIDATE_JSON_INPUT_MAX_DEPTH } from '../src/cli/p15-operator-json-io';
import { validateP15CandidateTemplateJsonDepthLexically } from '../src/cli/p15-template-json-depth-scan';

function fail(message: string): never {
  throw new Error(message);
}

describe('P15 lexical templateJson depth preflight', () => {
  it('rejects over-depth array nesting without parsing the embedded template', () => {
    const templateJson = `${'['.repeat(P15_CANDIDATE_JSON_INPUT_MAX_DEPTH + 1)}0${']'.repeat(P15_CANDIDATE_JSON_INPUT_MAX_DEPTH + 1)}`;

    expect(() => validateP15CandidateTemplateJsonDepthLexically({ templateJson }, fail))
      .toThrow(`candidate templateJson input exceeds ${P15_CANDIDATE_JSON_INPUT_MAX_DEPTH}-level nesting limit.`);
  });

  it('rejects over-depth object nesting without parsing the embedded template', () => {
    const templateJson = `${'{"v":'.repeat(P15_CANDIDATE_JSON_INPUT_MAX_DEPTH + 1)}0${'}'.repeat(P15_CANDIDATE_JSON_INPUT_MAX_DEPTH + 1)}`;

    expect(() => validateP15CandidateTemplateJsonDepthLexically({ templateJson }, fail))
      .toThrow(`candidate templateJson input exceeds ${P15_CANDIDATE_JSON_INPUT_MAX_DEPTH}-level nesting limit.`);
  });

  it('ignores braces and brackets inside JSON strings', () => {
    const templateJson = JSON.stringify({
      title: 'literal delimiters [[[ {{{ ]]] }}} do not add structural depth',
    });

    expect(() => validateP15CandidateTemplateJsonDepthLexically({ templateJson }, fail)).not.toThrow();
  });

  it('tracks escaped quotes and backslashes without leaving string state early', () => {
    const templateJson = JSON.stringify({
      title: 'backslash \\ then quote " then delimiters [{]} stay inside this string',
    });

    expect(() => validateP15CandidateTemplateJsonDepthLexically({ templateJson }, fail)).not.toThrow();
  });

  it('does not reclassify malformed shallow templateJson as a lexical depth failure', () => {
    const templateJson = '{"title":"unterminated shallow string';

    expect(() => validateP15CandidateTemplateJsonDepthLexically({ templateJson }, fail)).not.toThrow();
  });
});
