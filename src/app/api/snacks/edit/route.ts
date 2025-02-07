import Snack from "@/lib/models/Snacks";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    const { id } = params;
    const { name, category, price, stock, description } = await req.json();

    const updatedSnack = await Snack.findByIdAndUpdate(id, { name, category, price, stock, description }, { new: true });
    if (!updatedSnack) {
        return NextResponse.json({ message: "Snack not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSnack);
}
