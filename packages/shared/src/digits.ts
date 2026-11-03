/** Arabic-Indic digits in Arabic, Latin in English, automatically (no user toggle in v1). */
const AR = '٠١٢٣٤٥٦٧٨٩';

export type Locale = 'ar' | 'en';

export function toArabicIndic(value: string): string {
  return value.replace(/[0-9]/g, (d) => AR.charAt(Number(d)));
}

/** Any Arabic-Indic or Persian digits to Latin, so numbers can be parsed. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export function localizeDigits(value: string, locale: Locale): string {
  return locale === 'ar' ? toArabicIndic(value) : value;
}
