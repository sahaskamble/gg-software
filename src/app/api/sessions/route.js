import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

// GET all sessions
export async function GET() {
  try {
    const sessions = await xata.db.sessions.getAll();
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST new session
export async function POST(req) {
  try {
    const { 
      CustomerName,
      CustomerNumber,
      InTime,
      OutTime,
      GameId,
      DeviceId,
      DeviceCategory,
      UserId,
      DiscountRate,
      DiscountAmount,
      TotalAmount,
      NoOfPlayers,
      Status
    } = await req.json();

    if (!CustomerName || !CustomerNumber || !InTime || !OutTime || !DeviceId || !NoOfPlayers) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Validate number of players
    const playerCount = parseInt(NoOfPlayers);
    if (isNaN(playerCount) || playerCount < 1) {
      return NextResponse.json(
        { error: 'Number of players must be at least 1' },
        { status: 400 }
      );
    }

    // Check if device exists
    const device = await xata.db.Device.read(DeviceId);
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Check if device is already booked
    const existingSession = await xata.db.sessions.filter({
      DeviceId,
      Status: "Active"
    }).getFirst();

    if (existingSession) {
      return NextResponse.json(
        { error: 'Device is already booked' },
        { status: 400 }
      );
    }

    // Parse numeric values
    const startTime = new Date(InTime);
    const endTime = new Date(OutTime);
    const discountRate = parseFloat(DiscountRate) || 0;
    const discountAmount = parseFloat(DiscountAmount) || 0;
    const totalAmount = parseFloat(TotalAmount) || 0;

    // Create session and update device status
    const session = await xata.db.sessions.create({
      CustomerName,
      CustomerNumber,
      InTime: startTime,
      OutTime: endTime,
      GameId,
      DeviceId,
      DeviceCategory: DeviceCategory || device.CategoryId,
      UserId,
      DiscountRate: discountRate.toString(),
      DiscountAmount: discountAmount,
      TotalAmount: totalAmount,
      NoOfPlayers: playerCount,
      Status: Status || "Active"
    });

    // Update device status to "Occupied"
    await xata.db.Device.update(DeviceId, {
      Status: "Occupied"
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
