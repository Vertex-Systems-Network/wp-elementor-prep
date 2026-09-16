import { P15_CANDIDATE_JSON_INPUT_MAX_DEPTH } from './p15-operator-json-io';

type Fail = (message: string) => never;

/**
 * Bound embedded templateJson nesting without allocating a second parsed template tree.
 *
 * This is intentionally not a JSON validator. It only tracks structural delimiters that
 * appear outside JSON strings and leaves syntax/semantic validity to the authoritative
 * Elementor candidate validator that runs afterward.
 */
export function validateP15CandidateTemplateJsonDepthLexically(
  candidate: unknown,
  fail: Fail,
): void {
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) return;
  const templateJson = (candidate as Record<string, unknown>).templateJson;
  if (typeof templateJson !== 'string') return;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < templateJson.length; index += 1) {
    const character = templateJson[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === '\\') {
        escaped = true;
        continue;
      }
      if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{' || character === '[') {
      depth += 1;
      if (depth > P15_CANDIDATE_JSON_INPUT_MAX_DEPTH) {
        fail(
          `candidate templateJson input exceeds ${P15_CANDIDATE_JSON_INPUT_MAX_DEPTH}-level nesting limit.`,
        );
      }
      continue;
    }

    if ((character === '}' || character === ']') && depth > 0) depth -= 1;
  }
}
