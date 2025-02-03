import { useState } from 'react';
import { ClockIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';

export default function DeviceCard({ device, activeSession, onUpdate, onBook }) {
  const [loading, setLoading] = useState(false);

  const handleExtendSession = async () => {
    if (!activeSession) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${activeSession.xata_id}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: activeSession.xata_id,
          extensionMinutes: 30 // Default extension of 30 minutes
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extend session');
      }
      
      onUpdate();
    } catch (error) {
      console.error('Error extending session:', error);
      // You might want to show this error to the user
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${activeSession.xata_id}/end`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to end session');
      }
      
      onUpdate();
    } catch (error) {
      console.error('Error ending session:', error);
      // You might want to show this error to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a2234] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{device.DeviceName}</h3>
          <p className="text-sm text-gray-200">Screen : {device.ScreenNo}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-sm ${
          activeSession ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'
        }`}>
          {activeSession ? 'In Use' : 'Available'}
        </div>
      </div>

      {activeSession ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>Started: {new Date(activeSession.InTime).toLocaleString()}</span>
            </div>
            <div className="mt-1">
              <p>Customer: {activeSession.CustomerName}</p>
              <p>Game: {activeSession.GameId?.GameName}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExtendSession}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <PlayIcon className="h-4 w-4 inline mr-1" />
              Extend 30m
            </button>
            <button
              onClick={handleEndSession}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              <StopIcon className="h-4 w-4 inline mr-1" />
              End
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => onBook(device)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Book Now
        </button>
      )}
    </div>
  );
}
