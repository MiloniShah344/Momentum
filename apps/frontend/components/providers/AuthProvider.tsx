'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth.store';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setSession, setInitialized } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setInitialized(true);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setInitialized]);

  return <>{children}</>;
}
