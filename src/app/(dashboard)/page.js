'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ComputerDesktopIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ShoppingBagIcon,
  CakeIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-[#1a2234] p-6 rounded-lg">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
        <p className="text-white text-2xl font-semibold">{value}</p>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const GameplayChart = ({ data }) => (
  <div className="bg-[#1a2234] p-6 rounded-lg">
    <h3 className="text-white text-lg mb-4">Mostly Gameplay</h3>
    <div className="flex gap-2">
      {data.map((game, index) => (
        <span
          key={index}
          className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
        >
          {game}
        </span>
      ))}
    </div>
  </div>
);

const PaymentMethods = ({ methods }) => (
  <div className="bg-[#1a2234] p-6 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white text-lg">Payment Methods</h3>
      <select className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
        <option>Last 30 days</option>
      </select>
    </div>
    <div className="space-y-4">
      {methods.map((method, index) => (
        <div key={index} className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {method.type === 'Cash' ? (
              <CreditCardIcon className="w-6 h-6 text-cyan-400" />
            ) : (
              <DevicePhoneMobileIcon className="w-6 h-6 text-cyan-400" />
            )}
            <span className="text-white">{method.type}</span>
          </div>
          <span className="text-white">{method.percentage}%</span>
        </div>
      ))}
    </div>
  </div>
);

const PopularServices = ({ services }) => (
  <div className="bg-[#1a2234] p-6 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white text-lg">Popular Services</h3>
      <select className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
        <option>Last 30 days</option>
      </select>
    </div>
    <div className="space-y-4">
      {services.map((service, index) => (
        <div key={index} className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {service.icon}
            <span className="text-white">{service.name}</span>
          </div>
          <span className="text-white">${service.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </div>
);

const RecentActivities = ({ activities }) => (
  <div className="bg-[#1a2234] p-6 rounded-lg">
    <h3 className="text-white text-lg mb-4">Recent Activities</h3>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${activity.iconBg}`}>
            {activity.icon}
          </div>
          <div>
            <p className="text-white">{activity.description}</p>
            <p className="text-gray-400 text-sm">{activity.timeAgo}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    activeUsers: 0,
    revenue: 0,
    activeStaff: 0,
  });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);

      const activitiesResponse = await fetch('/api/dashboard/activities');
      const activitiesData = await activitiesResponse.json();
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const popularGames = ['Mortal Kombat'];

  const paymentMethods = [
    { type: 'Cash', percentage: 35 },
    { type: 'Mobile Payment', percentage: 20 },
  ];

  const services = [
    {
      name: 'Gaming Stations',
      amount: 12458,
      icon: <ComputerDesktopIcon className="w-6 h-6 text-cyan-400" />,
    },
    {
      name: 'Food & Beverages',
      amount: 5234,
      icon: <CakeIcon className="w-6 h-6 text-cyan-400" />,
    },
    {
      name: 'Accessories Rental',
      amount: 2897,
      icon: <PuzzlePieceIcon className="w-6 h-6 text-cyan-400" />,
    },
  ];

  const recentActivities = activities.map(activity => ({
    ...activity,
    icon: <ComputerDesktopIcon className="w-6 h-6 text-white" />,
    iconBg: 'bg-blue-600',
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Overview of Game Ground</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Active User"
          value={stats.activeUsers}
          icon={UserGroupIcon}
          color="bg-blue-600"
        />
        <StatCard
          title="Revenue"
          value={`${stats.revenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="bg-blue-600"
        />
        <StatCard
          title="Active Staff"
          value={stats.activeStaff}
          icon={UserGroupIcon}
          color="bg-blue-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <GameplayChart data={popularGames} />
        <div className="bg-[#1a2234] p-6 rounded-lg">
          {/* Placeholder for game stats chart */}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <PaymentMethods methods={paymentMethods} />
        <PopularServices services={services} />
      </div>

      <RecentActivities activities={recentActivities} />
    </div>
  );
}
