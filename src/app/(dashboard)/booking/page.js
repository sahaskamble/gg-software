'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';
import DeviceCard from '@/components/DeviceCard';
import { FunnelIcon } from '@heroicons/react/24/outline';

export default function BookingPage() {
  const { data: session } = useSession();
  const [devices, setDevices] = useState([]);
  const [activeSessions, setActiveSessions] = useState({});
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    CustomerName: '',
    CustomerNumber: '',
    InTime: '',
    OutTime: '',
    GameId: '',
    DeviceId: '',
    DeviceCategory: '',
    UserId: '',
    DiscountRate: '0',
    DiscountAmount: '0',
    TotalAmount: '0',
    NoOfPlayers: '1',
    Status: 'Active'
  });

  useEffect(() => {
    fetchDevices();
    fetchCategories();
    fetchGames();
    fetchActiveSessions();

    // Refresh active sessions every 30 seconds
    const interval = setInterval(fetchActiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('/api/sessions/active');
      if (!response.ok) throw new Error('Failed to fetch active sessions');
      const data = await response.json();
      
      const sessionMap = {};
      data.forEach(session => {
        if (session && session.DeviceId) {
          sessionMap[session.DeviceId.id || session.DeviceId] = session;
        }
      });
      
      setActiveSessions(sessionMap);
    } catch (err) {
      console.error('Failed to fetch active sessions:', err);
      setError('Failed to fetch active sessions');
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      if (!response.ok) throw new Error('Failed to fetch devices');
      const data = await response.json();
      setDevices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/device-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setGames(data);
    } catch (err) {
      setError('Failed to load games: ' + err.message);
    }
  };

  const handleBookDevice = (device) => {
    setSelectedDevice(device);
    setBookingForm({
      CustomerName: '',
      CustomerNumber: '',
      InTime: '',
      OutTime: '',
      GameId: '',
      DeviceId: device.xata_id,
      DeviceCategory: device.CategoryId,
      UserId: session?.user?.id || '',
      DiscountRate: '0',
      DiscountAmount: '0',
      TotalAmount: '0',
      NoOfPlayers: '1',
      Status: 'Active'
    });
    setIsBookingModalOpen(true);
  };

  const calculateTotal = (inTime, outTime, pricePerHour, discountRate = 0) => {
    if (!inTime || !outTime || !pricePerHour) return { total: 0, discount: 0 };
    const start = new Date(inTime);
    const end = new Date(outTime);
    const hours = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
    const subtotal = Math.round(hours * pricePerHour);
    const discount = Math.round((subtotal * discountRate) / 100);
    return { total: subtotal - discount, discount };
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!session?.user) {
        setError('User not authenticated');
        return;
      }

      const formData = {
        ...bookingForm,
        NoOfPlayers: parseInt(bookingForm.NoOfPlayers) || 1,
        UserId: session.user.id
      };

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setIsBookingModalOpen(false);
      fetchActiveSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSessionUpdate = () => {
    fetchActiveSessions();
  };

  const filteredDevices = selectedCategory
    ? devices.filter(device => device.CategoryId === selectedCategory)
    : devices;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-white">Gaming Devices</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select pl-10 pr-4 py-2 w-full bg-[#1a2234] text-white rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.xata_id} value={category.xata_id}>
                  {category.CategoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDevices.map((device) => (
          <DeviceCard
            key={device.xata_id}
            device={device}
            activeSession={activeSessions[device.xata_id.toString()]}
            onUpdate={handleSessionUpdate}
            onBook={() => handleBookDevice(device)}
          />
        ))}
      </div>

      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setError(null);
        }}
        title="Book Device"
        className="bg-[#1a2234]"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-6 bg-[#1a2234]">
          <div className=" rounded-lg p-4 border border-gray-700">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-white">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={bookingForm.CustomerName}
                  onChange={(e) => setBookingForm({ ...bookingForm, CustomerName: e.target.value })}
                  className="form-input p-2 text-lg mt-1 block w-full rounded-md bg-[#111827] border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="customerNumber" className="block text-sm font-medium text-white">
                  Customer Number *
                </label>
                <input
                  type="tel"
                  id="customerNumber"
                  value={bookingForm.CustomerNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setBookingForm({ ...bookingForm, CustomerNumber: value });
                  }}
                  pattern="[0-9]{10}"
                  placeholder="10 digit mobile number"
                  className="form-input p-2 text-lg mt-1 block w-full rounded-md bg-[#111827] border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="gameSelect" className="block text-sm font-medium text-white">
                  Select Game *
                </label>
                <select
                  id="gameSelect"
                  value={bookingForm.GameId}
                  onChange={(e) => {
                    const selectedGame = games.find(game => game.xata_id === e.target.value);
                    setBookingForm({ 
                      ...bookingForm, 
                      GameId: e.target.value,
                      NoOfPlayers: selectedGame ? selectedGame.PlayersCount.toString() : '1'
                    });
                  }}
                  className="form-select p-2 text-lg mt-1 block w-full rounded-md bg-[#111827] border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a game</option>
                  {games.map((game) => (
                    <option key={game.xata_id} value={game.xata_id}>
                      {game.GameName} ({game.PlayersCount} players)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="noOfPlayers" className="block text-sm font-medium text-white">
                  Number of Players *
                </label>
                <input
                  type="number"
                  id="noOfPlayers"
                  min="1"
                  max={games.find(game => game.xata_id === bookingForm.GameId)?.PlayersCount || 1}
                  value={bookingForm.NoOfPlayers}
                  onChange={(e) => setBookingForm({ ...bookingForm, NoOfPlayers: e.target.value })}
                  className="form-input p-2 text-lg mt-1 block w-full rounded-md bg-[#111827] border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="inTime" className="block text-sm font-medium text-white">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="inTime"
                  value={bookingForm.InTime}
                  onChange={(e) => {
                    const inTime = e.target.value;
                    setBookingForm(prev => {
                      const newForm = { ...prev, InTime: inTime };
                      if (prev.OutTime) {
                        const { total, discount } = calculateTotal(
                          inTime, 
                          prev.OutTime, 
                          selectedDevice?.PricePerHour,
                          parseFloat(prev.DiscountRate)
                        );
                        newForm.TotalAmount = total.toString();
                        newForm.DiscountAmount = discount.toString();
                      }
                      return newForm;
                    });
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  className="form-input p-2 text-lg mt-1 block w-full rounded-md bg-[#111827] border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="outTime" className="block text-sm font-medium text-white">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  id="outTime"
                  value={bookingForm.OutTime}
                  onChange={(e) => {
                    const outTime = e.target.value;
                    setBookingForm(prev => {
                      const newForm = { ...prev, OutTime: outTime };
                      if (prev.InTime) {
                        const { total, discount } = calculateTotal(
                          prev.InTime, 
                          outTime, 
                          selectedDevice?.PricePerHour,
                          parseFloat(prev.DiscountRate)
                        );
                        newForm.TotalAmount = total.toString();
                        newForm.DiscountAmount = discount.toString();
                      }
                      return newForm;
                    });
                  }}
                  min={bookingForm.InTime}
                  className="form-input p-2 text-lg mt-1 block w-full rounded-md bg-[#111827] border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="discountRate" className="block text-sm font-medium text-white">
                  Discount Rate (%)
                </label>
                <input
                  type="number"
                  id="discountRate"
                  min="0"
                  max="100"
                  value={bookingForm.DiscountRate}
                  onChange={(e) => {
                    const rate = e.target.value;
                    setBookingForm(prev => {
                      const newForm = { ...prev, DiscountRate: rate };
                      if (prev.InTime && prev.OutTime) {
                        const { total, discount } = calculateTotal(
                          prev.InTime, 
                          prev.OutTime, 
                          selectedDevice?.PricePerHour,
                          parseFloat(rate)
                        );
                        newForm.TotalAmount = total.toString();
                        newForm.DiscountAmount = discount.toString();
                      }
                      return newForm;
                    });
                  }}
                  className="form-input p-2 text-lg mt-1 block w-full rounded-md bg-[#111827] border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="discountAmount" className="block text-sm font-medium text-white">
                  Discount Amount (₹)
                </label>
                <input
                  type="text"
                  id="discountAmount"
                  value={`₹${parseFloat(bookingForm.DiscountAmount).toLocaleString()}`}
                  className="form-input p-2 text-lg mt-1 block w-full rounded-md bg-[#111827] border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled
                />
              </div>

              <div>
                <label htmlFor="totalAmount" className="block text-sm font-medium text-white">
                  Total Amount (₹)
                </label>
                <input
                  type="text"
                  id="totalAmount"
                  value={`₹${parseFloat(bookingForm.TotalAmount).toLocaleString()}`}
                  className="form-input p-2 text-lg mt-1 block w-full rounded-md bg-[#111827] border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a2234] focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a2234] focus:ring-blue-500"
            >
              Book Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}