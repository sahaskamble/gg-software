import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

// GET all games
export async function GET() {
  try {
    const games = await xata.db.Games.getAll();
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

// POST new game
export async function POST(req) {
  try {
    const { GameName, PlayersCount } = await req.json();

    if (!GameName || !PlayersCount) {
      return NextResponse.json(
        { error: 'Game name and players count are required' },
        { status: 400 }
      );
    }

    // Validate players count
    const playerCount = parseInt(PlayersCount);
    if (playerCount < 1) {
      return NextResponse.json(
        { error: 'Players count must be at least 1' },
        { status: 400 }
      );
    }

    // Check if game with same name exists
    const existingGame = await xata.db.Games.filter({ GameName }).getFirst();
    if (existingGame) {
      return NextResponse.json(
        { error: 'A game with this name already exists' },
        { status: 400 }
      );
    }

    const game = await xata.db.Games.create({
      GameName,
      PlayersCount: playerCount
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Game creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}

// DELETE game
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Check if game exists
    const game = await xata.db.Games.read(id);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if game is being used in any active sessions
    const activeSessions = await xata.db.sessions.filter({
      GameId: id
    }).getMany();

    if (activeSessions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete game that is being used in sessions' },
        { status: 400 }
      );
    }

    await xata.db.Games.delete(id);
    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Game deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}

// PUT update game
export async function PUT(req) {
  try {
    const { id, GameName, PlayersCount } = await req.json();

    if (!id || (!GameName && PlayersCount === undefined)) {
      return NextResponse.json(
        { error: 'Game ID and at least one field to update are required' },
        { status: 400 }
      );
    }

    // Check if game exists
    const existingGame = await xata.db.Games.read(id);
    if (!existingGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // If updating name, check for duplicates
    if (GameName && GameName !== existingGame.GameName) {
      const duplicateGame = await xata.db.Games.filter({ GameName }).getFirst();
      if (duplicateGame) {
        return NextResponse.json(
          { error: 'A game with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Validate players count if provided
    if (PlayersCount !== undefined) {
      const playerCount = parseInt(PlayersCount);
      if (playerCount < 1) {
        return NextResponse.json(
          { error: 'Players count must be at least 1' },
          { status: 400 }
        );
      }
    }

    const updateData = {};
    if (GameName) updateData.GameName = GameName;
    if (PlayersCount !== undefined) updateData.PlayersCount = parseInt(PlayersCount);

    const updatedGame = await xata.db.Games.update(id, updateData);
    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error('Game update error:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}
