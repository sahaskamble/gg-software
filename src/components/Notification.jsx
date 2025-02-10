import { useEffect, useState } from 'react';

export default function Notification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('/api/check-sessions');
      const data = await response.json();
      if (data.length > 0) {
        setNotifications(data);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded shadow-lg">
      <h4 className="font-bold">Upcoming Session End</h4>
      {notifications.map((notification, index) => (
        <div key={index}>
          <p>Session ID: {notification.sessionId}</p>
          <p>Customer: {notification.customerInfo.name}</p>
          <p>Ends at: {new Date(notification.endTime).toLocaleTimeString()}</p>
        </div>
      ))}
    </div>
  );
}
