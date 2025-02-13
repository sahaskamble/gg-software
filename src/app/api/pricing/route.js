import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Pricing from '@/lib/models/Pricing';
import { checkRole, checkBranch } from '@/middleware/auth';
import { UserRole } from '@/lib/models/Users';

export async function GET(request) {
  try {
    await connectDB();
    
    const check = await checkBranch(request);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    
    const pricing = await Pricing.find({ branchId: check.branchId }).sort({ duration: 1 });
    return NextResponse.json(pricing);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const check = await checkRole(request, [UserRole.SuperAdmin, UserRole.Admin]);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const branchCheck = await checkBranch(request);
    if (branchCheck.error) {
      return NextResponse.json({ error: branchCheck.error }, { status: branchCheck.status });
    }

    const body = await request.json();
    const pricing = await Pricing.create({ ...body, branchId: branchCheck.branchId });
    return NextResponse.json(pricing, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
