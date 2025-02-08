import Snack from "@/lib/models/Snacks";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
    const { id } = await req.json();
    const snack = await Snack.findById(id);
    if (!snack) {
        return NextResponse.json({ message: "Snack not found" }, { status: 404 });
    }
    return NextResponse.json(snack);
}
