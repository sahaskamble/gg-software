import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DeviceCard = ({ device, activeSession, onUpdate, onBook }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleExtendSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Extending session:', activeSession);
      
      const response = await fetch('/api/sessions/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: activeSession?.xata_id,
          extensionMinutes: 30
        }),
      });

      const result = await response.json();
      console.log('Extend session response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extend session');
      }

      if (onUpdate) {
        onUpdate();
      }
      router.refresh();
    } catch (err) {
      console.error('Error extending session:', err);
      setError(err.message || 'Failed to extend session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this session?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Ending session:', activeSession);
      
      const response = await fetch('/api/sessions/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: activeSession?.xata_id
        }),
      });

      const result = await response.json();
      console.log('End session response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to end session');
      }

      if (onUpdate) {
        onUpdate();
      }
      router.refresh();
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err.message || 'Failed to end session');
    } finally {
      setIsLoading(false);
    }
  };

  const formatOutTime = (outTime) => {
    if (!outTime) return 'N/A';
    try {
      const date = new Date(outTime);
      return date.toLocaleString();
    } catch (err) {
      console.error('Error formatting time:', err);
      return outTime;
    }
  };

  const getStatusBadge = () => {
    const statusColor = device.Status === 'Active' 
      ? 'bg-green-100 text-green-800'
      : device.Status === 'Occupied'
        ? 'bg-red-100 text-red-800'
        : 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded text-sm ${statusColor}`}>
        {device.Status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{device.DeviceName}</h3>
          <p className="text-sm text-gray-500">Screen ID: {device.ScreenId}</p>
          <p className="text-sm text-gray-500">Controllers: {device.ControllerCount}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {getStatusBadge()}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div className="mt-4">
        {device.Status === 'Occupied' && activeSession ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p>Customer: {activeSession?.CustomerName || 'N/A'}</p>
              <p>Out Time: {formatOutTime(activeSession?.OutTime)}</p>
              <p className="text-xs text-gray-400">Session ID: {activeSession?.xata_id || 'N/A'}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExtendSession}
                disabled={isLoading || !activeSession}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Extending...' : 'Extend 30m'}
              </button>
              <button
                onClick={handleEndSession}
                disabled={isLoading || !activeSession}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Ending...' : 'End Session'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onBook}
            disabled={device.Status !== 'Active'}
            className={`w-full px-4 py-2 rounded text-sm font-medium ${
              device.Status === 'Active'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Book Device
          </button>
        )}
      </div>
    </div>
  );
};

export default DeviceCard;
