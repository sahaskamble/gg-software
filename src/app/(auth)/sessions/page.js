'use client';

import { useEffect, useState } from 'react';

export default function ViewSessions() {
  const [endedSessions, setEndedSessions] = useState([]);

  useEffect(() => {
    const fetchEndedSessions = async () => {
      const response = await fetch('/api/ended-sessions');
      const data = await response.json();
      setEndedSessions(data);
    };

    fetchEndedSessions();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Ended Sessions</h1>
      <div className="space-y-4">
        {endedSessions.map((session, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Session ID: {session.sessionId}</h2>
            <p>Customer: {session.customerInfo.name}</p>
            <p>Ended at: {new Date(session.endTime).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
