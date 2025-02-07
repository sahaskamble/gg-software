import Session from "@/lib/models/Sessions";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    const { id } = params;
    const { customer, game, device, sessionStart, sessionEnd, duration, numberOfPlayers, snacks } = await req.json();

    const updatedSession = await Session.findByIdAndUpdate(id, { customer, game, device, sessionStart, sessionEnd, duration, numberOfPlayers, snacks }, { new: true });
    if (!updatedSession) {
        return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSession);
}
