import Game from "@/lib/models/Games";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = params;
    const game = await Game.findById(id);
    if (!game) {
        return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }
    return NextResponse.json(game);
}
