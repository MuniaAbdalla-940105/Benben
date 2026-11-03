import { Icon, type IconName } from '@benben/ui';
import { NavLink, Outlet } from 'react-router';
import { useI18n } from '../i18n/I18nProvider';
import type { AppRoute } from '../routes';
import { routes } from '../routes';

const ICONS: Record<AppRoute['tab'], IconName> = {
  explore: 'compass',
  rent: 'key',
  auctions: 'auction',
  requests: 'list',
  profile: 'user',
};

/** Phone-first shell: content, then the 5-tab bottom nav with Auctions in the centre. */
export function AppShell() {
  const { t } = useI18n();
  const tabs = routes.filter((r) => r.nav);
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-bg">
      <main className="flex-1 pb-bottom-nav">
        <Outlet />
      </main>
      <nav
        aria-label={t('app.name')}
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-bottom-nav max-w-xl items-stretch border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        {tabs.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors motion-reduce:transition-none',
                isActive ? 'font-semibold text-accent-text' : 'text-ink-muted',
                r.tab === 'auctions' ? 'text-sm' : '',
              ].join(' ')
            }
          >
            <Icon name={ICONS[r.tab]} size={r.tab === 'auctions' ? 26 : 22} />
            <span>{t(r.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
