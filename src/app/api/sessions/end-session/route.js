import Session from "@/lib/models/Sessions";
import { NextResponse } from "next/server";

export async function PUT(req) {
    try {
        const { sessionId, status } = await req.json();

        if (!sessionId || !status) {
            return NextResponse.json(
                { message: "Session ID and status are required" },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ["Active", "Completed", "Extended"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { message: "Invalid status. Must be one of: Active, Completed, Extended" },
                { status: 400 }
            );
        }

        // Update device status and isAvailable
        const updatedSession = await Session.findByIdAndUpdate(
            sessionId,
            {
                sessionStatus: status,
            },
            { new: true }
        );

        if (!updatedSession) {
            return NextResponse.json(
                { message: "Session not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Session status updated successfully",
            session: updatedSession
        });
    } catch (error) {
        console.error("Error updating session status:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

