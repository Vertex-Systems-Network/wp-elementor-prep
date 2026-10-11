/**
 * Linear-time id/slug fragment: every run of characters outside [A-Za-z0-9] becomes one `-`, without leading or
 * trailing dashes, cut to `maxLength`. Written as a single loop rather than a trimming regular expression, so
 * design-controlled names (layer names, frame titles) can never trigger polynomial backtracking.
 */
export function slugFragment(value: string, options: { lowercase?: boolean; maxLength?: number } = {}): string {
  const source = options.lowercase ? value.toLowerCase() : value;
  const max = options.maxLength ?? Number.POSITIVE_INFINITY;
  let out = '';
  let pendingDash = false;
  for (const char of source) {
    if (out.length >= max) break;
    const code = char.charCodeAt(0);
    const alnum = char.length === 1 && ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122));
    if (!alnum) {
      pendingDash = out.length > 0;
      continue;
    }
    if (pendingDash) {
      // A separator plus the next character must both fit, or the fragment ends here (never glue two words).
      if (out.length + 2 > max) break;
      out += '-';
    }
    pendingDash = false;
    out += char;
  }
  return out;
}
