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
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-[#1a2234] p-6 rounded-lg transform hover:scale-105 transition-transform duration-200">
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
    <h3 className="text-white text-lg mb-4">Popular Games</h3>
    <div className="flex flex-wrap gap-2">
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
      <div className="relative">
        <select className="bg-blue-600 text-white pl-3 pr-8 py-1 rounded-lg text-sm appearance-none cursor-pointer">
          <option>Last 30 days</option>
        </select>
        <ArrowDownIcon className="w-4 h-4 text-white absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
    <div className="space-y-4">
      {methods.map((method, index) => (
        <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-[#2a3344] transition-colors">
          <div className="flex items-center gap-3">
            {method.type === 'Cash' ? (
              <CreditCardIcon className="w-6 h-6 text-blue-400" />
            ) : (
              <DevicePhoneMobileIcon className="w-6 h-6 text-blue-400" />
            )}
            <span className="text-white">{method.type}</span>
          </div>
          <span className="text-white font-medium">{method.percentage}%</span>
        </div>
      ))}
    </div>
  </div>
);

const PopularServices = ({ services }) => (
  <div className="bg-[#1a2234] p-6 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white text-lg">Popular Services</h3>
      <div className="relative">
        <select className="bg-blue-600 text-white pl-3 pr-8 py-1 rounded-lg text-sm appearance-none cursor-pointer">
          <option>Last 30 days</option>
        </select>
        <ArrowDownIcon className="w-4 h-4 text-white absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
    <div className="space-y-4">
      {services.map((service, index) => (
        <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-[#2a3344] transition-colors">
          <div className="flex items-center gap-3">
            {service.icon}
            <span className="text-white">{service.name}</span>
          </div>
          <span className="text-white font-medium">${service.amount.toLocaleString()}</span>
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
        <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#2a3344] transition-colors">
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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);

      const activitiesResponse = await fetch('/api/dashboard/activities');
      const activitiesData = await activitiesResponse.json();
      
      if (Array.isArray(activitiesData)) {
        setActivities(activitiesData);
      } else {
        console.error('Activities data is not an array:', activitiesData);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      setActivities([]);
    }
  };

  const popularGames = ['Mortal Kombat', 'FIFA 24', 'Call of Duty', 'GTA V'];

  const paymentMethods = [
    { type: 'Cash', percentage: 65 },
    { type: 'Mobile Payment', percentage: 35 },
  ];

  const services = [
    {
      name: 'Gaming Stations',
      amount: 12458,
      icon: <ComputerDesktopIcon className="w-6 h-6 text-blue-400" />,
    },
    {
      name: 'Food & Beverages',
      amount: 5234,
      icon: <CakeIcon className="w-6 h-6 text-blue-400" />,
    },
    {
      name: 'Accessories Rental',
      amount: 2897,
      icon: <PuzzlePieceIcon className="w-6 h-6 text-blue-400" />,
    },
  ];

  const recentActivities = Array.isArray(activities) ? activities.map(activity => ({
    ...activity,
    icon: <ComputerDesktopIcon className="w-6 h-6 text-white" />,
    iconBg: 'bg-blue-600',
  })) : [];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading dashboard data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Overview of Game Ground</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={UserGroupIcon}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.revenue || 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="bg-blue-600"
        />
        <StatCard
          title="Active Staff"
          value={stats?.activeStaff || 0}
          icon={UserGroupIcon}
          color="bg-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <GameplayChart data={popularGames} />
        <PaymentMethods methods={paymentMethods} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <PopularServices services={services} />
        <RecentActivities activities={recentActivities} />
      </div>
    </div>
  );
}
