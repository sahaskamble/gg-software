import Session from "@/lib/models/Sessions";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { 
            customer, 
            game, 
            device, 
            sessionStart, 
            sessionEnd, 
            duration, 
            numberOfPlayers, 
            snacks,
            totalAmount,
            discount,
            rewardPointsUsed,
            sessionStatus
        } = await req.json();

        // Validate required fields
        if (!customer || !game || !device || !sessionStart || !sessionEnd || 
            duration == null || numberOfPlayers == null || totalAmount == null) {
            return NextResponse.json({ 
                error: "Missing required fields",
                message: "All fields are required" 
            }, { status: 400 });
        }

        const newSession = new Session({ 
            customer, 
            game, 
            device, 
            sessionStart, 
            sessionEnd, 
            duration, 
            numberOfPlayers, 
            snacks: snacks || [],
            totalAmount,
            discount: discount || 0,
            rewardPointsUsed: rewardPointsUsed || 0,
            sessionStatus: sessionStatus || "Active"
        });

        await newSession.save();
        return NextResponse.json({ 
            message: "Session added successfully",
            session: newSession 
        }, { status: 201 });
    } catch (error) {
        console.error("Error adding session:", error);
        return NextResponse.json({ 
            error: error.message || "Failed to create session",
            message: "Failed to create session" 
        }, { status: 500 });
    }
}
