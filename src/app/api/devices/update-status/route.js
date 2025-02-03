import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function POST(request) {
  try {
    const { deviceId, status } = await request.json();

    // Update device status
    const updatedDevice = await xata.db.devices.update(deviceId, {
      Status: status
    });

    if (!updatedDevice) {
      return NextResponse.json(
        { error: 'Failed to update device status' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      device: updatedDevice
    });
  } catch (error) {
    console.error('Error updating device status:', error);
    return NextResponse.json(
      { error: 'Failed to update device status: ' + error.message },
      { status: 500 }
    );
  }
}
