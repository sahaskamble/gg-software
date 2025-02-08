import Session from "@/lib/models/Sessions";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req) {
    const { id } = await req.json();
    const { customer, game, device, sessionStart, sessionEnd, duration, numberOfPlayers, snacks } = await req.json();

    const updatedSession = await Session.findByIdAndUpdate(id, { customer, game, device, sessionStart, sessionEnd, duration, numberOfPlayers, snacks }, { new: true });
    if (!updatedSession) {
        return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSession);
}
