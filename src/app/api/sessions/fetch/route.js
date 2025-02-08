import Session from "@/lib/models/Sessions";
import { NextResponse } from "next/server";

export async function GET() {
    const sessions = await Session.find({});
    return NextResponse.json(sessions);
}
