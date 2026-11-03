import { toLatinDigits } from './digits';

/**
 * Normalise what a user typed into the Egyptian mobile format used by Auth ("+20" + 10 digits).
 * Accepts 010…, 10…, 2010…, +2010… and Arabic-Indic digits. Returns null when it is not a valid mobile.
 */
export function normalizeEgyptPhone(input: string): string | null {
  const digits = toLatinDigits(input).replace(/[\s\-()+]/g, '');
  const local = digits.replace(/^0020/, '').replace(/^20/, '').replace(/^0/, '');
  return /^1[0125][0-9]{8}$/.test(local) ? `+20${local}` : null;
}
