import Game from "@/lib/models/Games";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req) {
    try {

        const { _id, title, numberOfPlayers, description, isAvailable } = await req.json();

        const updatedGame = await Game.findByIdAndUpdate(_id, { title, numberOfPlayers, description, isAvailable }, { new: true });

        if (!updatedGame) {
            return NextResponse.json({ message: "Game not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Game Updated Successfully",
            output: updatedGame
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            message: "Internal server error",
            "error": error
        }, { status: 500 });
    }
}
