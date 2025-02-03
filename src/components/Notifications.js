import { useNotification } from '@/context/NotificationContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Notifications = () => {
  const { notifications, removeNotification } = useNotification();

  const handleClose = (notification) => {
    if (notification.onClose) {
      notification.onClose();
    }
    removeNotification(notification.id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${notification.persistent ? 'animate-bounce' : ''}
            max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto
            ring-1 ring-black ring-opacity-5 overflow-hidden
          `}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => handleClose(notification)}
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
