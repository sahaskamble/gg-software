import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Pricing from '@/lib/models/Pricing';
import { checkRole, checkBranch } from '@/middleware/auth';
import { UserRole } from '@/lib/models/Users';

export async function PUT(request, { params }) {
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

    const { id } = params;
    const body = await request.json();
    
    const pricing = await Pricing.findOneAndUpdate(
      { _id: id, branchId: branchCheck.branchId },
      body,
      { new: true }
    );
    
    if (!pricing) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    }
    return NextResponse.json(pricing);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = params;
    const pricing = await Pricing.findOneAndDelete({ 
      _id: id, 
      branchId: branchCheck.branchId 
    });
    
    if (!pricing) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Pricing deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
