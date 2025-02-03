import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function POST(request) {
  try {
    const sessionData = await request.json();

    // Start a transaction
    const transaction = await xata.transaction();

    // 1. Create the session
    const session = await transaction.db.sessions.create({
      ...sessionData,
      Status: "Active"
    });

    // 2. Update device status to Occupied
    await transaction.db.devices.update(sessionData.DeviceId, {
      Status: "Occupied"
    });

    // Commit the transaction
    await transaction.commit();

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
