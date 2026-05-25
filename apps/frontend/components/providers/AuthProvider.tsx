'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api/client';
import { useAuthStore, UserProfile } from '@/store/auth.store';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    api
      .get<{ user: UserProfile }>('/auth/me', { skipAutoRefresh: true })
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setInitialized(true));
  }, [setUser, setInitialized]);

  return <>{children}</>;
}
