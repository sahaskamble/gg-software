import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

export async function GET() {
  try {
    // Get popular games
    const popularGames = await xata.db.sessions
      .select(['GameId.*'])
      .sort('CreatedAt', 'desc')
      .limit(50)
      .getMany();

    const gameStats = popularGames.reduce((acc, session) => {
      const gameName = session.GameId?.GameName;
      if (gameName) {
        acc[gameName] = (acc[gameName] || 0) + 1;
      }
      return acc;
    }, {});

    // Convert to array and sort by count
    const sortedGames = Object.entries(gameStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(game => game.name);

    // Get payment methods distribution
    const today = new Date();
    today.setDate(today.getDate() - 30); // Last 30 days

    const recentSessions = await xata.db.sessions
      .filter({
        CreatedAt: { $ge: today }
      })
      .getMany();

    const paymentStats = recentSessions.reduce((acc, session) => {
      const method = session.PaymentMethod || 'Cash';
      acc[method] = (acc[method] || 0) + (parseFloat(session.TotalAmount) || 0);
      return acc;
    }, {});

    const totalAmount = Object.values(paymentStats).reduce((a, b) => a + b, 0);
    const paymentMethods = Object.entries(paymentStats).map(([type, amount]) => ({
      type,
      percentage: totalAmount ? Math.round((amount / totalAmount) * 100) : 0
    }));

    // Get popular services
    const services = [
      {
        name: 'Gaming Stations',
        amount: recentSessions.reduce((total, session) => 
          total + (parseFloat(session.TotalAmount) || 0), 0)
      },
      {
        name: 'Food & Beverages',
        amount: recentSessions.reduce((total, session) => 
          total + (parseFloat(session.FoodAmount) || 0), 0)
      },
      {
        name: 'Accessories Rental',
        amount: recentSessions.reduce((total, session) => 
          total + (parseFloat(session.AccessoryAmount) || 0), 0)
      }
    ].sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      popularGames: sortedGames,
      paymentMethods,
      services
    });
  } catch (error) {
    console.error('Error fetching popular stats:', error);
    return NextResponse.json({
      popularGames: [],
      paymentMethods: [],
      services: []
    }, { status: 500 });
  }
}
