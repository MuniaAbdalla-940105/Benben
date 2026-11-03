import { ToastProvider } from '@benben/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import LoginPage from './pages/LoginPage';
import { DEFAULT_PATH, routes } from './routes';
import { AppShell } from './shell/AppShell';

function Guard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const { t } = useI18n();
  if (loading) return <p className="p-6 text-ink-muted">{t('common.loading')}</p>;
  return session ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const elements = useMemo(
    () =>
      routes.map((r) => {
        const Page = lazy(r.load);
        const page = (
          <Suspense fallback={null}>
            <Page />
          </Suspense>
        );
        return { path: r.path, element: r.protected ? <Guard>{page}</Guard> : page };
      }),
    [],
  );
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        {elements.map((e) => (
          <Route key={e.path} path={e.path} element={e.element} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
    </Routes>
  );
}

export function App() {
  const client = useMemo(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } }), []);
  return (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
