import dbConnect from '@/lib/db';
import Session from '@/lib/models/Sessions';
import Users from '@/lib/models/Users';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextNextResponse } from 'next/server';

export async function GET(req, res) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextNextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const user = await Users.findById(session.user.id);

  if (!user || (user.role !== 'SuperAdmin' && user.role !== 'Admin')) {
    return NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const branchId = session.user.branch;

  try {
    const totalSessions = await Session.countDocuments({ branchId });
    const todaySessions = await Session.countDocuments({
      branchId,
      sessionStart: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999),
      },
    });
    const totalAmount = await Session.aggregate([
      { $match: { branchId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalCustomers = await Session.distinct('customer.contactNumber', { branchId });

    return NextResponse(JSON.stringify({
      totalSessions,
      todaySessions,
      totalAmount: totalAmount[0]?.total || 0,
      totalCustomers: totalCustomers.length,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse(JSON.stringify({ error: 'Error fetching dashboard data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
