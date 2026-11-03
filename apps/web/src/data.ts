import { useQuery } from '@tanstack/react-query';
import { useAuth } from './auth/AuthProvider';
import { getSupabase } from './supabase';

/** The signed-in user's profile (RLS returns only their own row). */
export function useProfile() {
  const { session } = useAuth();
  const uid = session?.user.id;
  return useQuery({
    queryKey: ['profile', uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const supabase = getSupabase();
      if (!supabase || !uid) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** The latest ID check for the signed-in user, or null. */
export function useLatestKyc() {
  const { session } = useAuth();
  const uid = session?.user.id;
  return useQuery({
    queryKey: ['kyc', uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const supabase = getSupabase();
      if (!supabase || !uid) return null;
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select('*')
        .eq('user_id', uid)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
