import Game from "@/lib/models/Games";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const { _id, title, numberOfPlayers, description, isAvailable } = await req.json();
        const updatedGame = await Game.findByIdAndUpdate(_id, { title, numberOfPlayers, description, isAvailable }, { new: true });
        if (!updatedGame) {
            return NextResponse.json({ message: "Game not found" }, { status: 404 });
        }
        return NextResponse.json(updatedGame);
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
