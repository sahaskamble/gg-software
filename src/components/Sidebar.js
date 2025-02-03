'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  HomeIcon,
  UsersIcon,
  DeviceTabletIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const userRole = session?.user?.role || '';

  // Function to get initials from username
  const getInitials = (username) => {
    if (!username) return 'U';
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to generate a consistent background color based on username
  const generateColor = (username) => {
    if (!username) return 'bg-blue-600';
    const colors = [
      'bg-blue-600',
      'bg-green-600',
      'bg-yellow-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-indigo-600',
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const menuItems = [
    {
      href: '/gaming/dashboard',
      title: 'Dashboard',
      icon: HomeIcon,
      allowedRoles: ['SuperAdmin', 'Admin', 'User', 'Staff']
    },
    {
      href: '/gaming/users',
      title: 'Users',
      icon: UsersIcon,
      allowedRoles: ['SuperAdmin', 'Admin']
    },
    {
      href: '/gaming/devices',
      title: 'Devices',
      icon: DeviceTabletIcon,
      allowedRoles: ['SuperAdmin', 'Admin']
    },
    {
      href: '/gaming/games',
      title: 'Games',
      icon: CubeIcon,
      allowedRoles: ['SuperAdmin', 'Admin']
    },
    {
      href: '/gaming/booking',
      title: 'Booking',
      icon: ClipboardDocumentListIcon,
      allowedRoles: ['SuperAdmin', 'Admin', 'Staff']
    }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.allowedRoles.includes(userRole)
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-2.5 left-4 z-50 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-[#01071f] text-white
        transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-80'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 w-full pr-6 text-xl font-bold text-center inline-flex items-center justify-center ">
            <Image src="/logo.png" alt="Logo" width={100} height={80} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-4">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center space-x-3 p-3 rounded-lg
                        transition-colors duration-200
                        ${isActive
                          ? 'bg-blue-700 text-white'
                          : 'hover:bg-blue-700'
                        }
                      `}
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile Section */}
          {status === 'authenticated' && session?.user && (
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                {/* User Avatar with Initials */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
                  ${generateColor(session.user.username)}
                `}>
                  {getInitials(session.user.username)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {session.user.username || 'User'}
                  </div>
                  <div className="text-sm text-blue-200 truncate">
                    {session.user.role} • {session.user.branch || 'Branch'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 text-sm hover:text-blue-200 transition-colors duration-200 w-full p-2 rounded-lg hover:bg-blue-900"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
