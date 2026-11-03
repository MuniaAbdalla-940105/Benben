import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { MESSAGES } from './i18n/messages';
import { routes } from './routes';

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  window.history.pushState({}, '', '/');
});

describe('login screen', () => {
  it('shows the BEN-BEN logo, a heading and the environment, in Arabic RTL by default', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByRole('img', { name: /BEN-BEN/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(MESSAGES.ar['login.title']);
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('shows the environment from VITE_APP_ENV', () => {
    vi.stubEnv('VITE_APP_ENV', 'staging');
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByTestId('env-badge').textContent).toContain('staging');
  });

  it('falls back to production when VITE_APP_ENV is missing (fails closed)', () => {
    vi.stubEnv('VITE_APP_ENV', '');
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByTestId('env-badge').textContent).toContain('production');
  });

  it('uses English and LTR when the stored language is English', () => {
    localStorage.setItem('bb.locale', 'en');
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(document.documentElement.dir).toBe('ltr');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(MESSAGES.en['login.title']);
  });
});

describe('app shell', () => {
  it('renders the five-tab bottom nav with Auctions in the centre', () => {
    window.history.pushState({}, '', '/auctions');
    render(<App />);
    const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/explore', '/rent', '/auctions', '/requests', '/profile']);
  });

  it('keeps the registry complete: every nav tab has a label in both languages', () => {
    for (const r of routes.filter((x) => x.nav)) {
      expect(MESSAGES.ar[r.labelKey]).toBeTruthy();
      expect(MESSAGES.en[r.labelKey]).toBeTruthy();
    }
  });
});
