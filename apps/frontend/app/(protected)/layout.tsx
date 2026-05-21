import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has('access_token');

  if (!hasToken) {
    redirect('/login');
  }

  return <>{children}</>;
}
