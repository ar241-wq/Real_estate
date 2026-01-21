'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminMe, adminLogout } from '@/lib/api';
import { User } from '@/lib/types';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Spinner from '@/components/ui/Spinner';
import NotificationBell from '@/components/admin/NotificationBell';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getAdminMe();
        setUser(response.user);
      } catch {
        router.replace('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await adminLogout();
      router.replace('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-secondary-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-14 lg:pt-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-secondary-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-secondary-900">
              Dashboard
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationBell />
              <span className="text-xs sm:text-sm text-secondary-600 hidden sm:inline">
                Welcome, <span className="font-medium">{user.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm text-secondary-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
