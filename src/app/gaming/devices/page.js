'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';
import { 
  ComputerDesktopIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export default function DevicesPage() {
  const { data: session } = useSession();
  const [devices, setDevices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    DeviceName: '',
    ScreenNo: '',
    ControllerCount: '',
    CategoryId: '',
    newCategory: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDevices();
    fetchCategories();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let categoryId = formData.CategoryId;

      // If new category is provided, create it first
      if (formData.newCategory && !formData.CategoryId) {
        const categoryResponse = await fetch('/api/device-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: formData.newCategory }),
        });

        if (!categoryResponse.ok) {
          throw new Error('Failed to create category');
        }

        const newCategory = await categoryResponse.json();
        categoryId = newCategory.xata_id;
        console.log("New Category", newCategory)
        setCategories([...categories, newCategory]);
      }

      // Create device with category
      const deviceResponse = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          DeviceName: formData.DeviceName,
          ScreenNo: formData.ScreenNo,
          ControllerCount: parseInt(formData.ControllerCount) || 0,
          CategopryId: categoryId,
        }),
      });

      console.log("Device Response", await deviceResponse)
      if (!deviceResponse.ok) {
        throw new Error('Failed to create device');
      }

      const newDevice = await deviceResponse.json();
      setDevices([...devices, newDevice]);
      setIsAddModalOpen(false);
      setFormData({
        DeviceName: '',
        ScreenNo: '',
        ControllerCount: '',
        CategoryId: '',
        newCategory: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete device');
      }

      setDevices(devices.filter(device => device.id !== deviceId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Devices</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Device</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {devices.map((device, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <ComputerDesktopIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold">{device.DeviceName}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDelete(device.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Screen No:</span>
                <span className="font-medium">{device.ScreenNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Controllers:</span>
                <span className="font-medium">{device.ControllerCount || 0}</span>
              </div>
              {/* <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{getCategoryName(device.CategoryId)}</span>
              </div> */}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Device"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          <div>
            <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700">
              Device Name
            </label>
            <input
              type="text"
              id="deviceName"
              value={formData.DeviceName}
              onChange={(e) => setFormData({ ...formData, DeviceName: e.target.value })}
              className="mt-1 p-2 text-lg block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="screenNo" className="block text-sm font-medium text-gray-700">
              Screen No
            </label>
            <input
              type="text"
              id="screenNo"
              value={formData.ScreenNo}
              onChange={(e) => setFormData({ ...formData, ScreenNo: parseInt(e.target.value) })}
              className="mt-1 p-2 text-lg block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="controllerCount" className="block text-sm font-medium text-gray-700">
              Controller Count
            </label>
            <input
              type="number"
              id="controllerCount"
              value={formData.ControllerCount}
              onChange={(e) => setFormData({ ...formData, ControllerCount: parseInt(e.target.value) })}
              className="mt-1 p-2 text-lg block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={formData.CategoryId}
              onChange={(e) => setFormData({ ...formData, CategoryId: e.target.value })}
              className="mt-1 p-2 text-lg block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category.xata_id}>
                  {category.CategoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700">
              Or Add New Category
            </label>
            <input
              type="text"
              id="newCategory"
              value={formData.newCategory}
              onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
              className="mt-1 p-2 text-lg block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter new category name"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? 'Adding...' : 'Add Device'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
