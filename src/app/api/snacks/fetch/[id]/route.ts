import Snack from "@/lib/models/Snacks";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = params;
    const snack = await Snack.findById(id);
    if (!snack) {
        return NextResponse.json({ message: "Snack not found" }, { status: 404 });
    }
    return NextResponse.json(snack);
}
