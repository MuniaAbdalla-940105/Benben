import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSupabase } from '../supabase';

type AuthState = { session: Session | null; loading: boolean; configured: boolean };
const AuthContext = createContext<AuthState>({ session: null, loading: true, configured: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  const [state, setState] = useState<AuthState>({ session: null, loading: Boolean(supabase), configured: Boolean(supabase) });

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, loading: false, configured: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false, configured: true });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  return useContext(AuthContext);
}
