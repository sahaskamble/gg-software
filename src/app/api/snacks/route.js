import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Snack from '@/lib/models/Snack';
import { checkRole, checkBranch } from '@/middleware/auth';
import { UserRole } from '@/lib/models/Users';

export async function GET(request) {
  try {
    await connectDB();
    
    const check = await checkBranch(request);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const snacks = await Snack.find({ branchId: check.branchId });
    return NextResponse.json(snacks);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const check = await checkRole(request, [UserRole.SuperAdmin, UserRole.Admin, UserRole.StoreManager]);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const branchCheck = await checkBranch(request);
    if (branchCheck.error) {
      return NextResponse.json({ error: branchCheck.error }, { status: branchCheck.status });
    }

    const body = await request.json();
    const snack = await Snack.create({ ...body, branchId: branchCheck.branchId });
    return NextResponse.json(snack, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
