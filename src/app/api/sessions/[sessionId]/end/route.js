import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function POST(request, { params }) {
  try {
    const sessionId = params.sessionId;

    // Get the current session
    const session = await xata.db.sessions.read(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update the session with end time
    const endTime = new Date().toISOString();
    const [updatedSession, updatedDevice] = await Promise.all([
      xata.db.sessions.update(sessionId, {
        OutTime: endTime,
        Status: 'Completed'
      }),
      xata.db.Device.update(session.DeviceId.id, {
        Status: 'Available'
      })
    ]);

    return NextResponse.json({
      success: true,
      session: updatedSession,
      device: updatedDevice
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
