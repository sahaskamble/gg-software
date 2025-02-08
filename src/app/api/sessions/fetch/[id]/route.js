import Session from "@/lib/models/Sessions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
    const { id } = await req.json();
    const session = await Session.findById(id);
    if (!session) {
        return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(session);
}
