import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

function getTimeAgo(date) {
  if (!date) return 'just now';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

export async function GET() {
  try {
    // Get recent sessions and their related data
    const recentSessions = await xata.db.sessions
      .sort('CreatedAt', 'desc')
      .select(['*', 'DeviceId.*'])
      .limit(5)
      .getMany();

    if (!Array.isArray(recentSessions)) {
      console.error('Recent sessions is not an array:', recentSessions);
      return NextResponse.json([]);
    }

    const activities = recentSessions.map(session => {
      if (!session) return null;

      let description = '';
      let type = '';

      if (session.Status === 'Active') {
        description = `New booking for ${session.DeviceId?.DeviceName || 'Unknown Device'}`;
        type = 'new_booking';
      } else if (session.Status === 'Completed') {
        description = `${session.DeviceId?.DeviceName || 'Unknown Device'} session completed`;
        type = 'completed';
      } else if (session.Status === 'Extended') {
        description = `Session extended for ${session.DeviceId?.DeviceName || 'Unknown Device'}`;
        type = 'extended';
      }

      return {
        type,
        description,
        timeAgo: getTimeAgo(session.CreatedAt),
      };
    }).filter(Boolean); // Remove any null entries

    console.log('Returning activities:', activities);
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json([], { status: 500 });
  }
}
