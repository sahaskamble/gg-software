import Session from "@/lib/models/Sessions";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req) {
    try {
        const {
            sessionId,
            duration,
            numberOfPlayers,
            sessionEnd,
            totalAmount,
            sessionStatus
        } = await req.json();

        if (!sessionId || !duration || !numberOfPlayers || !sessionEnd || !totalAmount) {
            return NextResponse.json({
                error: "Missing required fields",
                message: "All fields are required"
            }, { status: 400 });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return NextResponse.json({
                error: "Session not found",
                message: "Session not found"
            }, { status: 404 });
        }

        // Update session
        session.duration = duration;
        session.numberOfPlayers = numberOfPlayers;
        session.sessionEnd = sessionEnd;
        session.totalAmount = totalAmount;
        if (sessionStatus) {
            session.sessionStatus = sessionStatus;
        }

        await session.save();

        return NextResponse.json({
            message: "Session updated successfully",
            session
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: "Failed to update session",
            message: "Failed to update session"
        }, { status: 500 });
    }
}
