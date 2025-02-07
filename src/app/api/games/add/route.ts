import Game from "@/lib/models/Games";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { title, numberOfPlayers, description, isAvailable } = await req.json();

    if (!title || numberOfPlayers == null) {
        return NextResponse.json({ message: "Title and number of players are required" }, { status: 400 });
    }

    const newGame = new Game({ title, numberOfPlayers, description, isAvailable });

    try {
        await newGame.save();
        return NextResponse.json({ message: "Game added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error adding game:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
