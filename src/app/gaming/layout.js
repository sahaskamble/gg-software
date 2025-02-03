'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Notifications from '@/components/Notifications';
import { NotificationProvider, useNotification } from '@/context/NotificationContext';
import { checkSessionEndTimes, formatTimeRemaining } from '@/services/sessionNotifier';

function DashboardContent({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });
  const { addNotification } = useNotification();
  const notifiedSessionsRef = useRef(new Set());

  // Function to get page title from pathname
  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/booking':
        return 'Booking';
      case '/users':
        return 'Users';
      case '/devices':
        return 'Devices';
      case '/games':
        return 'Games';
      default:
        return 'GameGround';
    }
  };

  // Memoize the check sessions function
  const checkSessions = useCallback(async () => {
    try {
      const endingSessions = await checkSessionEndTimes();
      
      if (Array.isArray(endingSessions)) {
        endingSessions.forEach(session => {
          // Only notify if we haven't notified about this session before
          if (!notifiedSessionsRef.current.has(session.sessionId)) {
            const timeRemaining = formatTimeRemaining(session.outTime);
            const endTime = new Date(session.outTime);
            const now = new Date();
            
            // Only notify if the session hasn't ended yet
            if (endTime > now) {
              addNotification({
                id: session.sessionId, // Use sessionId as notification id
                title: 'Session Ending Soon',
                message: `${session.deviceName} (${session.customerName}) session ends in ${timeRemaining}.`,
                persistent: true,
                onClose: () => {
                  notifiedSessionsRef.current.delete(session.sessionId);
                }
              });
              notifiedSessionsRef.current.add(session.sessionId);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to check sessions:', error);
    }
  }, [addNotification]);

  // Check for ending sessions every minute
  useEffect(() => {
    // Initial check
    checkSessions();

    // Set up interval for subsequent checks
    const interval = setInterval(checkSessions, 60000);

    return () => clearInterval(interval);
  }, [checkSessions]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-black">
      <Sidebar />
      <div className="lg:ml-80 min-h-screen">
        {/* Header for mobile */}
        <header className="lg:hidden bg-white shadow-sm px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center h-8">
            <div className="text-lg font-semibold ml-14">
              {getPageTitle(pathname)}
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
      <Notifications />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <NotificationProvider>
      <DashboardContent>{children}</DashboardContent>
    </NotificationProvider>
  );
}
