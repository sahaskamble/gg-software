import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Snack from '@/lib/models/Snack';
import { checkRole, checkBranch } from '@/middleware/auth';
import { UserRole } from '@/lib/models/Users';

export async function PUT(request, { params }) {
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

    const { id } = params;
    const body = await request.json();
    
    const snack = await Snack.findOneAndUpdate(
      { _id: id, branchId: branchCheck.branchId },
      body,
      { new: true }
    );
    
    if (!snack) {
      return NextResponse.json({ error: 'Snack not found' }, { status: 404 });
    }
    return NextResponse.json(snack);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = params;
    const snack = await Snack.findOneAndDelete({ 
      _id: id, 
      branchId: branchCheck.branchId 
    });
    
    if (!snack) {
      return NextResponse.json({ error: 'Snack not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Snack deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
