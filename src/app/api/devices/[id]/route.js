import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

// GET single device
export async function GET(req, { params }) {
  try {
    const device = await xata.db.Device.read(params.id);
    
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(device);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch device' },
      { status: 500 }
    );
  }
}

// PUT update device
export async function PUT(req, { params }) {
  try {
    const { DeviceName, ScreenId, CounterCount } = await req.json();
    
    const device = await xata.db.Device.read(params.id);
    
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const updatedDevice = await xata.db.Device.update(params.id, {
      DeviceName,
      ScreenId,
      CounterCount
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update device' },
      { status: 500 }
    );
  }
}

// DELETE device
export async function DELETE(req, { params }) {
  try {
    const device = await xata.db.Device.read(params.id);
    
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    await xata.db.Device.delete(params.id);
    
    return NextResponse.json(
      { message: 'Device deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete device' },
      { status: 500 }
    );
  }
}
