import { describe, expect, it } from 'vitest';
import { formatEGP, normalizeEgyptPhone, parseEGPInput, toErrorCode, toLatinDigits } from './index';

describe('money', () => {
  it('formats piasters in English and Arabic', () => {
    expect(formatEGP(150000, 'en')).toBe('1,500 EGP');
    expect(formatEGP(150050, 'en')).toBe('1,500.50 EGP');
    expect(formatEGP(150000, 'ar')).toBe('١٬٥٠٠ ج.م');
    expect(formatEGP(0, 'en')).toBe('0 EGP');
  });
  it('rejects non-integer piasters', () => {
    expect(() => formatEGP(1.5)).toThrow(RangeError);
  });
  it('parses typed amounts, including Arabic-Indic digits', () => {
    expect(parseEGPInput('1,500')).toBe(150000);
    expect(parseEGPInput('١٬٥٠٠')).toBe(150000);
    expect(parseEGPInput('12.5')).toBe(1250);
    expect(parseEGPInput('١٢٫٥٠')).toBe(1250);
    expect(parseEGPInput('abc')).toBeNull();
    expect(parseEGPInput('-5')).toBeNull();
    expect(parseEGPInput('1.234')).toBeNull();
  });
  it('converts digits', () => {
    expect(toLatinDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
  });
});

describe('phone', () => {
  it('normalises Egyptian mobiles', () => {
    expect(normalizeEgyptPhone('01000000501')).toBe('+201000000501');
    expect(normalizeEgyptPhone('+20 100 000 0501')).toBe('+201000000501');
    expect(normalizeEgyptPhone('٠١٠٠٠٠٠٠٥٠١')).toBe('+201000000501');
    expect(normalizeEgyptPhone('0131234567')).toBeNull();
    expect(normalizeEgyptPhone('123')).toBeNull();
  });
});

describe('errors', () => {
  it('maps auth and database errors to stable codes', () => {
    expect(toErrorCode({ code: 'over_sms_send_rate_limit' })).toBe('OTP_RATE_LIMITED');
    expect(toErrorCode({ code: 'otp_expired' })).toBe('OTP_EXPIRED');
    expect(toErrorCode({ message: 'FILES_MISSING' })).toBe('FILES_MISSING');
    expect(toErrorCode({ code: '42501' })).toBe('FORBIDDEN');
    expect(toErrorCode(new Error('boom'))).toBe('INTERNAL_ERROR');
  });
});
