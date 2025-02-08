import Snack from "@/lib/models/Snacks";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    try {

        const snack = await Snack.findByIdAndDelete(params.id);
        console.log(await req.json());
        console.log(params.id)

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
            { message: "Error deleting snack", error: error.message },
            { status: 500 }
        );
    }
}

