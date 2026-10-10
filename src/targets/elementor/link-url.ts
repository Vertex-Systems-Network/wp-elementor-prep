/**
 * The one link-URL rule for neutral IR links (button URLs and text/heading hyperlinks): bounded, http(s),
 * mailto or tel absolute URLs, or root-relative / fragment links without control characters.
 */
export const P15_NEUTRAL_EXPORT_MAX_URL_LENGTH = 4_096;

export function validP15AbsoluteUrl(value: string, allowedProtocols: readonly string[]): boolean {
  if (value.length === 0 || value.length > P15_NEUTRAL_EXPORT_MAX_URL_LENGTH) return false;
  try {
    return allowedProtocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validP15LinkUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > P15_NEUTRAL_EXPORT_MAX_URL_LENGTH) return false;
  if (value.startsWith('/') || value.startsWith('#')) return !/[\u0000-\u001f\u007f]/.test(value);
  return validP15AbsoluteUrl(value, ['https:', 'http:', 'mailto:', 'tel:']);
}
