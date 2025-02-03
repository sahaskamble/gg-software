import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function GET() {
  try {
    // Get active users (users with active sessions)
    const activeSessions = await xata.db.sessions
      .filter({ Status: 'Active' })
      .getMany();

    // Get total revenue for all sessions
    const sessions = await xata.db.sessions.getMany();

    const revenue = sessions.reduce((total, session) => {
      const amount = parseFloat(session.TotalAmount) || 0;
      return total + amount;
    }, 0);
    console.log('Revenue:', revenue);

    // Get active staff count
    const activeStaff = await xata.db.users
      .filter({
        Role: 'staff',
      })
      .getMany();

    const stats = {
      activeUsers: activeSessions?.length || 0,
      revenue: Math.round(revenue) || 0,
      activeStaff: activeStaff?.length || 0
    };

    console.log('Returning stats:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        activeUsers: 0,
        revenue: 0,
        activeStaff: 0,
        error: 'Failed to fetch dashboard stats'
      },
      { status: 500 }
    );
  }
}
