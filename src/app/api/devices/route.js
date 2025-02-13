import { NextResponse } from 'next/server';
import Device from '../../../lib/models/Device';
import { checkRole, checkBranch } from '../../../middleware/auth';

export async function POST(req) {
  await checkRole(['SuperAdmin', 'Admin'])(req, res, async () => {
    await checkBranch(req, async () => {
      try {
        const device = new Device(req.body);
        await device.save();
        return NextResponse.json(
            { message: 'Device created successfully', output: device },
            { status: 201 }
        );
      } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    });
  });
}

export async function GET(req) {
  await checkRole(['SuperAdmin', 'Admin', 'StoreManager', 'Staff'])(req, res, async () => {
    await checkBranch(req, res, async () => {
      try {
        const devices = await Device.find({ branch: req.query.branch });
        return NextResponse.json(
            { message: "Devices fetched", output: devices }, 
            { status: 200 }
        );
      } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    });
  });
}
