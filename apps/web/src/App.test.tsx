import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('App placeholder', () => {
  it('shows the BEN-BEN logo', () => {
    render(<App />);
    expect(screen.getByRole('img', { name: /BEN-BEN/ })).toBeTruthy();
  });

  it('shows the environment from VITE_APP_ENV', () => {
    vi.stubEnv('VITE_APP_ENV', 'staging');
    render(<App />);
    expect(screen.getByTestId('env-badge').textContent).toContain('staging');
  });

  it('falls back to production when VITE_APP_ENV is missing (fails closed)', () => {
    vi.stubEnv('VITE_APP_ENV', '');
    render(<App />);
    expect(screen.getByTestId('env-badge').textContent).toContain('production');
  });
});
