import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function GET() {
  try {
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    // Get all active sessions that end in the next 10 minutes
    const endingSessions = await xata.db.sessions
      .filter({
        "Status": "Active",
        "OutTime": {
          "$gt": now.toISOString(),
          "$lt": tenMinutesFromNow.toISOString()
        }
      })
      .select([
        "id", 
        "CustomerName", 
        "OutTime",
        "DeviceId"
      ])
      .getMany();

    // Get all devices
    const devices = await xata.db.Device.getMany();
    const deviceMap = new Map(devices.map(device => [device.xata_id, device]));

    // Format the response with device details
    const formattedSessions = endingSessions.map(session => {
      const device = deviceMap.get(session.DeviceId);
      return {
        sessionId: session.id,
        deviceName: device ? device.DeviceName : 'Unknown Device',
        customerName: session.CustomerName,
        outTime: session.OutTime
      };
    });

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Error checking session end times:', error);
    return NextResponse.json(
      { error: 'Failed to check sessions' }, 
      { status: 500 }
    );
  }
}
