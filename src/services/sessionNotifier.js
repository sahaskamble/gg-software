// Function to check for sessions ending soon via API
export const checkSessionEndTimes = async () => {
  try {
    const response = await fetch('/api/sessions/check-ending');
    if (!response.ok) {
      throw new Error('Failed to fetch ending sessions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking session end times:', error);
    return [];
  }
};

// Format the remaining time in a user-friendly way
export const formatTimeRemaining = (outTime) => {
  const now = new Date();
  const end = new Date(outTime);
  const diffInMinutes = Math.round((end - now) / (1000 * 60));
  
  if (diffInMinutes <= 1) {
    return 'less than a minute';
  }
  return `${diffInMinutes} minutes`;
};
