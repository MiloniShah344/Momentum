'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

// Pages where bottom nav should NOT show
const HIDE_NAV_PATHS = ['/onboarding'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className={showNav ? 'pb-20' : ''}>
      {children}
      {showNav && <BottomNav />}
    </div>
  );
}
