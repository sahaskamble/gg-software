import Session from "@/lib/models/Sessions";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = params;
    const session = await Session.findById(id);
    if (!session) {
        return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(session);
}
