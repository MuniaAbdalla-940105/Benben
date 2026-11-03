import { localizeDigits, toLatinDigits, type Locale } from './digits';

/** Money is always integer piasters (bigint in the database; number here, safe up to 2^53 piasters). */
export type Piasters = number;

/** Format piasters as EGP. 150000 -> "1,500 EGP" / "١٬٥٠٠ ج.م". Whole pounds drop the decimals. */
export function formatEGP(piasters: Piasters, locale: Locale = 'ar'): string {
  if (!Number.isSafeInteger(piasters)) throw new RangeError('piasters must be a safe integer');
  const negative = piasters < 0;
  const abs = Math.abs(piasters);
  const pounds = Math.floor(abs / 100);
  const cents = abs % 100;
  const grouped = String(pounds).replace(/\B(?=(\d{3})+(?!\d))/g, locale === 'ar' ? '٬' : ',');
  let text = grouped;
  if (cents !== 0) text += `${locale === 'ar' ? '٫' : '.'}${String(cents).padStart(2, '0')}`;
  const body = localizeDigits(text, locale);
  const sign = negative ? '-' : '';
  return locale === 'ar' ? `${sign}${body} ج.م` : `${sign}${body} EGP`;
}

/**
 * Parse what a user typed into piasters. Accepts Arabic-Indic digits, grouping marks (, ٬ space) and a
 * decimal point (. ٫). Returns null for anything that is not a plain non-negative amount.
 */
export function parseEGPInput(input: string): Piasters | null {
  const cleaned = toLatinDigits(input).replace(/[\s,٬]/g, '').replace(/٫/g, '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [pounds = '0', frac = ''] = cleaned.split('.');
  const value = Number(pounds) * 100 + Number(frac.padEnd(2, '0'));
  return Number.isSafeInteger(value) ? value : null;
}
