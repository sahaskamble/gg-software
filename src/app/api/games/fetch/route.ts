import Game from "@/lib/models/Games";
import { NextResponse } from "next/server";

export async function GET(req) {
    const games = await Game.find({});
    return NextResponse.json(games);
}
