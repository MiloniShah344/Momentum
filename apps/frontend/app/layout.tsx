import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Momentum — Workout Consistency Tracker',
  description: 'Track your workouts, build streaks, and stay consistent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
