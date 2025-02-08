import Game from "@/lib/models/Games";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {

        // const id = await req.json();
        //
        // if (!id) {
        //     return NextResponse.json(
        //         { error: "Game ID is required" },
        //         { status: 400 }
        //     );
        // }

        const game = await Game.findByIdAndDelete(params.id);
        console.log(await req);

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

