import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function GET() {
  try {
    // Get all active sessions with device details
    const activeSessions = await xata.db.sessions
      .filter({
        "Status": "Active"
      })
      .select([
        "*",
        "DeviceId.*"
      ])
      .getMany();

    console.log('Active Sessions:', JSON.stringify(activeSessions, null, 2));

    return NextResponse.json(activeSessions);
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active sessions' },
      { status: 500 }
    );
  }
}
