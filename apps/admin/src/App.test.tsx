import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { hasAdminRole } from './roles';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('admin login', () => {
  it('shows the BEN-BEN logo and the environment', () => {
    vi.stubEnv('VITE_APP_ENV', 'staging');
    render(<App />);
    expect(screen.getByRole('img', { name: /BEN-BEN/ })).toBeTruthy();
    expect(screen.getByTestId('env-badge').textContent).toContain('staging');
  });

  it('falls back to production when VITE_APP_ENV is missing (fails closed)', () => {
    vi.stubEnv('VITE_APP_ENV', '');
    render(<App />);
    expect(screen.getByTestId('env-badge').textContent).toContain('production');
  });
});

describe('role gate', () => {
  it('lets only staff roles in', () => {
    expect(hasAdminRole(['user'])).toBe(false);
    expect(hasAdminRole(['user', 'seller'])).toBe(false);
    expect(hasAdminRole(['user', 'kyc_admin'])).toBe(true);
    expect(hasAdminRole(['super_admin'])).toBe(true);
  });
});
