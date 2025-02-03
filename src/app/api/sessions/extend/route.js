import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function POST(request) {
  try {
    const { sessionId, extensionMinutes } = await request.json();

    // Get the current session
    const session = await xata.db.sessions.read(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Calculate new out time
    const currentOutTime = new Date(session.OutTime);
    const newOutTime = new Date(currentOutTime.getTime() + extensionMinutes * 60000);

    // Update the session with new out time
    // Note: No need to update device status as it should already be "Occupied"
    const updatedSession = await xata.db.sessions.update(sessionId, {
      OutTime: newOutTime.toISOString()
    });

    return NextResponse.json({
      success: true,
      session: updatedSession
    });
  } catch (error) {
    console.error('Error extending session:', error);
    return NextResponse.json(
      { error: 'Failed to extend session' },
      { status: 500 }
    );
  }
}
