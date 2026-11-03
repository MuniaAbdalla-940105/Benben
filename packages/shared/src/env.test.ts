import { describe, expect, it } from 'vitest';
import { isNonProduction, parseAppEnv } from './env';

describe('parseAppEnv', () => {
  it('accepts the three known environments', () => {
    expect(parseAppEnv('local')).toBe('local');
    expect(parseAppEnv('staging')).toBe('staging');
    expect(parseAppEnv('production')).toBe('production');
  });

  it('fails closed to production for unknown or missing values', () => {
    expect(parseAppEnv(undefined)).toBe('production');
    expect(parseAppEnv(null)).toBe('production');
    expect(parseAppEnv('')).toBe('production');
    expect(parseAppEnv('Staging')).toBe('production');
  });
});

describe('isNonProduction', () => {
  it('is true only for local and staging', () => {
    expect(isNonProduction('local')).toBe(true);
    expect(isNonProduction('staging')).toBe(true);
    expect(isNonProduction('production')).toBe(false);
  });
});
