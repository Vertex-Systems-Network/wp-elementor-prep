import { validP15LinkUrl } from './link-url';
import { elementorPxSlider } from './mapping-engine/codecs';

/**
 * Neutral text typography and its exact Elementor 4.2.4 text-editor encoding (recovery M2.1).
 *
 * Source evidence (Elementor 4.2.4, tag commit 0e292207b5b45f0e22603967ae41c0374211160d):
 * - `includes/widgets/text-editor.php` (blob 72ff868493a3c0f27c6305794ffcff9cf217c9ea): group control
 *   `typography`, colour `text_color`, responsive slider `paragraph_spacing` (`{{WRAPPER}} p` margin-block-end).
 * - `includes/controls/groups/typography.php` (blob eea951b6331bd84c80e24b7fb6ab249e5c4c41a1): fields
 *   font_family, font_size, font_weight, text_transform, font_style, text_decoration, line_height and
 *   letter_spacing, written as `typography_<field>` after the `typography_typography: 'custom'` starter
 *   (the same group encoding the Button typography families already use).
 *
 * Values are explicit and bounded; nothing is inferred. Mixed runs become inline `<span style>` whose CSS
 * is built only from these validated values, so no caller text reaches a style attribute.
 */
export const P15_TEXT_FONT_WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
export const P15_TEXT_TRANSFORMS = ['uppercase', 'lowercase', 'capitalize'] as const;
export const P15_TEXT_DECORATIONS = ['underline', 'line-through'] as const;
/**
 * Span-only resets (recovery M2.9c): a run that drops the node's italic or case sets `font-style: normal` /
 * `text-transform: none`, both inherited CSS properties. A dropped underline is not resettable: CSS text decorations
 * propagate to inline descendants, so `text-decoration: none` on a span cannot remove its parent's.
 */
export const P15_SPAN_RESETS = { fontStyle: 'normal', textTransform: 'none' } as const;
export const P15_TEXT_MAX_PARAGRAPHS = 1_000;
export const P15_TEXT_MAX_SPANS_PER_PARAGRAPH = 500;
export const P15_TEXT_LIMITS = Object.freeze({
  fontFamilyMaxLength: 128,
  fontSizePx: [1, 400] as const,
  lineHeightPx: [0, 1_000] as const,
  letterSpacingPx: [-100, 100] as const,
  paragraphSpacingPx: [0, 1_000] as const,
});

export interface P15NeutralTypography {
  fontFamily?: string;
  fontWeight?: typeof P15_TEXT_FONT_WEIGHTS[number];
  /** `normal` only inside a span, to reset an italic node (recovery M2.9c). */
  fontStyle?: 'italic' | 'normal';
  fontSizePx?: number;
  lineHeightPx?: number;
  letterSpacingPx?: number;
  /** `none` only inside a span, to reset the node's case (recovery M2.9c). */
  textTransform?: typeof P15_TEXT_TRANSFORMS[number] | 'none';
  textDecoration?: typeof P15_TEXT_DECORATIONS[number];
  colorHex?: string;
}

/** One run of text; `style` holds only the properties that differ from the node's typography. */
export interface P15NeutralTextSpan {
  text: string;
  style?: P15NeutralTypography;
  /** A link on this run only (recovery M2.2c). */
  href?: string;
}

export interface P15NeutralParagraph {
  spans: P15NeutralTextSpan[];
}

const TYPOGRAPHY_KEYS = ['fontFamily', 'fontWeight', 'fontStyle', 'fontSizePx', 'lineHeightPx', 'letterSpacingPx',
  'textTransform', 'textDecoration', 'colorHex'] as const;

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const inRange = (value: unknown, [min, max]: readonly [number, number]): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && Math.round(value * 100) === value * 100;

export interface TypographyProblem {
  path: string;
  message: string;
}

/** Validate one typography object; an empty object is invalid (omit it instead). */
export function typographyProblems(value: unknown, path: string, span = false): TypographyProblem[] {
  if (!record(value) || Object.keys(value).length === 0 || Object.keys(value).some((key) => !(TYPOGRAPHY_KEYS as readonly string[]).includes(key))) {
    return [{ path, message: `Typography must be a non-empty object with only ${TYPOGRAPHY_KEYS.join(', ')}.` }];
  }
  const problems: TypographyProblem[] = [];
  const bad = (key: string, message: string) => problems.push({ path: `${path}.${key}`, message });
  if (value.fontFamily !== undefined && (typeof value.fontFamily !== 'string' || value.fontFamily.length > P15_TEXT_LIMITS.fontFamilyMaxLength
    || !/^[A-Za-z0-9](?:[A-Za-z0-9 ._-]*[A-Za-z0-9])?$/.test(value.fontFamily))) {
    bad('fontFamily', 'Font family must be a single bounded family name of letters, digits, spaces, dots, underscores or hyphens.');
  }
  if (value.fontWeight !== undefined && !(P15_TEXT_FONT_WEIGHTS as readonly unknown[]).includes(value.fontWeight)) bad('fontWeight', 'Font weight must be 100..900 in steps of 100.');
  if (value.fontStyle !== undefined && value.fontStyle !== 'italic' && !(span && value.fontStyle === P15_SPAN_RESETS.fontStyle)) {
    bad('fontStyle', span ? 'Span font style must be italic or normal.' : 'Font style must be italic when provided.');
  }
  if (value.fontSizePx !== undefined && !inRange(value.fontSizePx, P15_TEXT_LIMITS.fontSizePx)) bad('fontSizePx', 'Font size must be 1..400 px with at most two decimals.');
  if (value.lineHeightPx !== undefined && !inRange(value.lineHeightPx, P15_TEXT_LIMITS.lineHeightPx)) bad('lineHeightPx', 'Line height must be 0..1000 px with at most two decimals.');
  if (value.letterSpacingPx !== undefined && !inRange(value.letterSpacingPx, P15_TEXT_LIMITS.letterSpacingPx)) bad('letterSpacingPx', 'Letter spacing must be -100..100 px with at most two decimals.');
  if (value.textTransform !== undefined && !(P15_TEXT_TRANSFORMS as readonly unknown[]).includes(value.textTransform)
    && !(span && value.textTransform === P15_SPAN_RESETS.textTransform)) {
    bad('textTransform', span ? 'Span text transform must be uppercase, lowercase, capitalize or none.' : 'Text transform must be uppercase, lowercase or capitalize.');
  }
  if (value.textDecoration !== undefined && !(P15_TEXT_DECORATIONS as readonly unknown[]).includes(value.textDecoration)) bad('textDecoration', 'Text decoration must be underline or line-through.');
  if (value.colorHex !== undefined && (typeof value.colorHex !== 'string' || !/^#[0-9a-f]{6}$/.test(value.colorHex))) bad('colorHex', 'Text colour must be lowercase #rrggbb.');
  return problems;
}

/** Validate paragraphs: bounded, non-empty spans without hard newlines, joining back to exactly `text`. */
export function paragraphProblems(value: unknown, text: unknown, path: string): TypographyProblem[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > P15_TEXT_MAX_PARAGRAPHS) {
    return [{ path, message: `Paragraphs must be a non-empty array of at most ${P15_TEXT_MAX_PARAGRAPHS} entries.` }];
  }
  const problems: TypographyProblem[] = [];
  value.forEach((paragraph, index) => {
    const at = `${path}[${index}]`;
    if (!record(paragraph) || Object.keys(paragraph).some((key) => key !== 'spans') || !Array.isArray(paragraph.spans)
      || paragraph.spans.length > P15_TEXT_MAX_SPANS_PER_PARAGRAPH) {
      problems.push({ path: at, message: `Each paragraph must carry at most ${P15_TEXT_MAX_SPANS_PER_PARAGRAPH} spans (none for an empty line).` });
      return;
    }
    paragraph.spans.forEach((span: unknown, spanIndex: number) => {
      const spanAt = `${at}.spans[${spanIndex}]`;
      if (!record(span) || Object.keys(span).some((key) => key !== 'text' && key !== 'style' && key !== 'href')
        || typeof span.text !== 'string' || span.text.length === 0 || /[\r\n]/.test(span.text)) {
        problems.push({ path: spanAt, message: 'Each span must be { text, style? } with non-empty text and no hard line breaks.' });
        return;
      }
      if (span.style !== undefined) problems.push(...typographyProblems(span.style, `${spanAt}.style`, true));
      if (span.href !== undefined && !validP15LinkUrl(span.href)) problems.push({ path: `${spanAt}.href`, message: 'Span link must be a bounded safe http(s), mailto, tel, root-relative or fragment URL.' });
    });
  });
  if (problems.length === 0 && typeof text === 'string' && paragraphText(value as P15NeutralParagraph[]) !== text.replace(/\r\n?/g, '\n')) {
    problems.push({ path, message: 'Paragraph spans must join (paragraphs separated by a newline) to exactly the node text.' });
  }
  return problems;
}

export function paragraphText(paragraphs: readonly P15NeutralParagraph[]): string {
  return paragraphs.map((paragraph) => paragraph.spans.map((span) => span.text).join('')).join('\n');
}

export function paragraphSpacingValid(value: unknown): value is number {
  return inRange(value, P15_TEXT_LIMITS.paragraphSpacingPx);
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

/** Inline CSS for a span's differing properties, built only from validated values. */
export function spanCss(style: P15NeutralTypography): string {
  const declarations: string[] = [];
  if (style.fontFamily !== undefined) declarations.push(`font-family: '${style.fontFamily}'`);
  if (style.fontWeight !== undefined) declarations.push(`font-weight: ${style.fontWeight}`);
  if (style.fontStyle !== undefined) declarations.push(`font-style: ${style.fontStyle}`);
  if (style.fontSizePx !== undefined) declarations.push(`font-size: ${style.fontSizePx}px`);
  if (style.lineHeightPx !== undefined) declarations.push(`line-height: ${style.lineHeightPx}px`);
  if (style.letterSpacingPx !== undefined) declarations.push(`letter-spacing: ${style.letterSpacingPx}px`);
  if (style.textTransform !== undefined) declarations.push(`text-transform: ${style.textTransform}`);
  if (style.textDecoration !== undefined) declarations.push(`text-decoration: ${style.textDecoration}`);
  if (style.colorHex !== undefined) declarations.push(`color: ${style.colorHex}`);
  return declarations.join('; ');
}

/**
 * Text-editor HTML. Without paragraphs this is the original single `<p>` with `<br>` line breaks; with
 * paragraphs each one is its own `<p>`, and only styled spans are wrapped in `<span style>`.
 */
export function textEditorHtml(text: string, paragraphs?: readonly P15NeutralParagraph[], href?: string): string {
  const link = (content: string, url: string | undefined): string =>
    (url === undefined || content === '' ? content : `<a href="${escapeHtml(url)}">${content}</a>`);
  if (paragraphs === undefined) {
    return `<p>${link(escapeHtml(text.replace(/\r\n?/g, '\n')).replaceAll('\n', '<br>'), href)}</p>`;
  }
  return paragraphs.map((paragraph) => `<p>${link(paragraph.spans.map((span) => {
    const content = escapeHtml(span.text).replaceAll('\u2028', '<br>');
    return link(span.style === undefined ? content : `<span style="${spanCss(span.style)}">${content}</span>`, span.href);
  }).join(''), href)}</p>`).join('');
}

/** The text-editor settings a node's typography and paragraph spacing write. */
export function textEditorTypographySettings(typography: P15NeutralTypography | undefined, paragraphSpacingPx: number | undefined): Record<string, unknown> {
  const settings = typographyGroupSettings(typography, 'text_color');
  if (paragraphSpacingPx !== undefined) settings.paragraph_spacing = elementorPxSlider(paragraphSpacingPx);
  return settings;
}

/**
 * The `typography` group (with the `custom` starter) plus the widget's colour control: `text_color` for the
 * text editor, `title_color` for the heading (heading.php blob 5b193f958ba34d8d4a24d165a9114f9bc3ef2561),
 * `button_text_color` for the button (the Button colour families' evidence).
 */
export function typographyGroupSettings(typography: P15NeutralTypography | undefined,
  colorSettingKey: 'text_color' | 'title_color' | 'button_text_color'): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  if (typography !== undefined) {
    const group: Array<[string, unknown]> = [
      ['font_family', typography.fontFamily],
      ['font_size', typography.fontSizePx === undefined ? undefined : elementorPxSlider(typography.fontSizePx)],
      ['font_weight', typography.fontWeight],
      ['text_transform', typography.textTransform],
      ['font_style', typography.fontStyle],
      ['text_decoration', typography.textDecoration],
      ['line_height', typography.lineHeightPx === undefined ? undefined : elementorPxSlider(typography.lineHeightPx)],
      ['letter_spacing', typography.letterSpacingPx === undefined ? undefined : elementorPxSlider(typography.letterSpacingPx)],
    ];
    const written = group.filter(([, value]) => value !== undefined);
    if (written.length > 0) {
      settings.typography_typography = 'custom';
      for (const [field, value] of written) settings[`typography_${field}`] = value;
    }
    if (typography.colorHex !== undefined) settings[colorSettingKey] = typography.colorHex;
  }
  return settings;
}
