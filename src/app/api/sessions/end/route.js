import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    // Get the current session
    const session = await xata.db.sessions.read(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Start a transaction
    const transaction = await xata.transaction();

    // 1. Update the session status to Completed
    const updatedSession = await transaction.db.sessions.update(sessionId, {
      Status: "Completed",
      OutTime: new Date().toISOString()
    });

    // 2. Update device status back to Active
    await transaction.db.devices.update(session.DeviceId, {
      Status: "Active"
    });

    // Commit the transaction
    await transaction.commit();

    return NextResponse.json({
      success: true,
      session: updatedSession
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
