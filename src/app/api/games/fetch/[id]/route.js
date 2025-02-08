import Game from "@/lib/models/Games";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
    const id = await req.json();
    const game = await Game.findById(id);
    if (!game) {
        return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }
    return NextResponse.json(game);
}
