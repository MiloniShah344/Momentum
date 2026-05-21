import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/navigation/AppShell';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  if (!cookieStore.has('access_token')) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
