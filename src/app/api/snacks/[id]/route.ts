import Snack from "@/lib/models/Snacks";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const snack = await Snack.findByIdAndDelete(id);
        
        if (!snack) {
            return NextResponse.json(
                { message: "Snack not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Snack deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting snack:", error);
        return NextResponse.json(
            { message: "Error deleting snack", error: (error as Error).message },
            { status: 500 }
        );
    }
}
