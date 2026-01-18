'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import FloatingMessageWidget from '../FloatingMessageWidget';
import { FavoritesProvider } from '@/context/FavoritesContext';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Admin routes have their own layout, just render children
    return <>{children}</>;
  }

  return (
    <FavoritesProvider>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <FloatingMessageWidget />
    </FavoritesProvider>
  );
}
