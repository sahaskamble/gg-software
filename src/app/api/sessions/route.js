import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Session from '@/lib/models/Session';
import { checkBranch } from '@/middleware/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    const check = await checkBranch(request);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query = { branchId: check.branchId };
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const sessions = await Session.find(query)
      .populate('pricingId')
      .populate('snacks.snackId')
      .sort({ startTime: -1 });

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const check = await checkBranch(request);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await request.json();
    const session = await Session.create({ ...body, branchId: check.branchId });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
