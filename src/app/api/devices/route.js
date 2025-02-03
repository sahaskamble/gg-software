import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

// GET all devices
export async function GET() {
  try {
    const devices = await xata.db.Device.getAll();
    return NextResponse.json(devices);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST new device
export async function POST(req) {
  try {
    const { DeviceName, ScreenNo, ControllerCount, CategopryId } = await req.json();

    if (!DeviceName) {
      return NextResponse.json(
        { error: 'Device name is required' },
        { status: 400 }
      );
    }
    const device = await xata.db.Device.create({
      DeviceName,
      ScreenNo,
      ControllerCount,
      CategopryId
    });


    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { 
        message: 'Failed to create device',
        error: error,
      },
      { status: 500 }
    );
  }
}
