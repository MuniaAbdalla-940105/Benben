/** Error codes B1 uses (DATA_MODEL §6). Later packages append theirs; keep the names stable. */
export const ERROR_CODES = [
  'INVALID_PHONE',
  'OTP_RATE_LIMITED',
  'OTP_EXPIRED',
  'OTP_INVALID',
  'NOT_AUTHENTICATED',
  'FORBIDDEN',
  'FILES_MISSING',
  'INVALID_PATH',
  'USER_NOT_ACTIVE',
  'NOT_ALLOWED_IN_ENV',
  'INTERNAL_ERROR',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

/** Map a Supabase/Postgres/Auth error to a stable code. Unknown errors become INTERNAL_ERROR. */
export function toErrorCode(err: unknown): ErrorCode {
  const e = (err ?? {}) as { message?: string; code?: string; status?: number };
  const text = `${e.message ?? ''} ${e.code ?? ''}`;
  for (const code of ERROR_CODES) if (text.includes(code)) return code;
  if (e.code === 'over_sms_send_rate_limit' || e.code === 'over_request_rate_limit') return 'OTP_RATE_LIMITED';
  if (e.code === 'otp_expired') return 'OTP_EXPIRED';
  if (/invalid/i.test(text) && /token|otp|code/i.test(text)) return 'OTP_INVALID';
  if (e.code === '42501') return 'FORBIDDEN';
  return 'INTERNAL_ERROR';
}
