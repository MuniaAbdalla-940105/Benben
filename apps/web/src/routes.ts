import type { MessageKey } from './i18n/messages';

/**
 * Route registry. Each package adds its routes here and never edits the shell.
 * `tab` places a route under a bottom-nav tab; `element` is a lazy import so later packages cost nothing until visited.
 * B2 (wallet) -> profile tab, B3 (auctions) -> auctions tab, B4 (listings) -> explore/rent, B5 -> requests.
 */
export type AppRoute = {
  path: string;
  tab: 'explore' | 'rent' | 'auctions' | 'requests' | 'profile';
  labelKey: MessageKey;
  /** Shown in the bottom nav (one entry per tab). Other routes are sub-pages. */
  nav?: boolean;
  /** Requires a signed-in user. */
  protected?: boolean;
  load: () => Promise<{ default: React.ComponentType }>;
};

const soon = () => import('./pages/ComingSoon');

export const routes: AppRoute[] = [
  { path: '/explore', tab: 'explore', labelKey: 'nav.explore', nav: true, load: soon },
  { path: '/rent', tab: 'rent', labelKey: 'nav.rent', nav: true, load: soon },
  { path: '/auctions', tab: 'auctions', labelKey: 'nav.auctions', nav: true, load: soon },
  { path: '/requests', tab: 'requests', labelKey: 'nav.requests', nav: true, protected: true, load: soon },
  { path: '/profile', tab: 'profile', labelKey: 'nav.profile', nav: true, protected: true, load: () => import('./pages/ProfilePage') },
  { path: '/profile/kyc', tab: 'profile', labelKey: 'kyc.title', protected: true, load: () => import('./pages/KycPage') },
];

export const DEFAULT_PATH = '/auctions';
