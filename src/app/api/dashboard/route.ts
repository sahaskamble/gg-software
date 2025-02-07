import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sessions from '@/lib/models/Sessions';
import Users from '@/lib/models/Users';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log(session)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Optional: Restrict to admin/staff roles if needed
    if (!['SuperAdmin', 'Admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get current date boundaries for today's stats
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Get total users count
    const totalUsers = await Users.countDocuments();

    // Get total sales amount (all time)
    const totalSalesResult = await Sessions.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalSales = totalSalesResult[0]?.totalAmount || 0;

    // Get today's sales
    const todaySalesResult = await Sessions.aggregate([
      {
        $match: {
          sessionStart: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);
    const todaySales = todaySalesResult[0]?.totalAmount || 0;

    // Get total sessions count
    const totalSessions = await Sessions.countDocuments();

    // Get today's sessions count
    const todaySessions = await Sessions.countDocuments({
      sessionStart: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Get recent sessions (last 5)
    const recentSessions = await Sessions.find()
      .sort({ sessionStart: -1 })
      .limit(5)
      .populate('game')
      .populate('device');

    // Get unique customers count (based on contact numbers)
    const uniqueCustomersResult = await Sessions.aggregate([
      {
        $group: {
          _id: '$customer.contactNumber',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 }
        }
      }
    ]);
    const totalUniqueCustomers = uniqueCustomersResult[0]?.total || 0;

    // Get active sessions count
    const activeSessions = await Sessions.countDocuments({
      sessionEnd: { $exists: false }
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSales,
        todaySales,
        totalSessions,
        todaySessions,
        totalUniqueCustomers,
        activeSessions
      },
      recentSessions: recentSessions.map(session => ({
        id: session._id,
        customer: session.customer,
        game: session.game,
        device: session.device,
        totalAmount: session.totalAmount,
        sessionStart: session.sessionStart,
        sessionEnd: session.sessionEnd
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Dashboard Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}