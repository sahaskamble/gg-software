import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function POST(request) {
  try {
    const { deviceId } = await request.json();

    // First check if device exists
    const device = await xata.db.devices.read(deviceId);
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Get active sessions for this device
    const activeSessions = await xata.db.sessions
      .filter({
        "DeviceId": deviceId,
        "Status": "Active"
      })
      .getMany();

    // Update device status to Active
    await xata.db.devices.update(deviceId, {
      Status: "Active"
    });

    // If there are active sessions, mark them as completed
    if (activeSessions.length > 0) {
      for (const session of activeSessions) {
        await xata.db.sessions.update(session.id, {
          Status: "Completed",
          OutTime: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Device status reset successfully',
      device: await xata.db.devices.read(deviceId)
    });
  } catch (error) {
    console.error('Error resetting device status:', error);
    return NextResponse.json(
      { error: 'Failed to reset device status: ' + error.message },
      { status: 500 }
    );
  }
}
