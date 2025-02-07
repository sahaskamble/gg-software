import Game from "@/lib/models/Games";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        
        const { id } = params;
        
        if (!id) {
            return NextResponse.json(
                { error: "Game ID is required" },
                { status: 400 }
            );
        }

        const game = await Game.findByIdAndDelete(id);
        
        if (!game) {
            return NextResponse.json(
                { error: "Game not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Game deleted successfully", game },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting game:", error);
        return NextResponse.json(
            { error: "Failed to delete game" },
            { status: 500 }
        );
    }
}
