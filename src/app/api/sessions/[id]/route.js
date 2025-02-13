import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Session from '@/lib/models/Session';
import { checkBranch } from '@/middleware/auth';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const check = await checkBranch(request);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = params;
    const body = await request.json();
    
    const session = await Session.findOneAndUpdate(
      { _id: id, branchId: check.branchId },
      body,
      { new: true }
    );
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const check = await checkBranch(request);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { id } = params;
    const session = await Session.findOneAndDelete({ 
      _id: id, 
      branchId: check.branchId 
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
