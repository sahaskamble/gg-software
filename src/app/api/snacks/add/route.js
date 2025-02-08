import Snack from "@/lib/models/Snacks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { name, category, price, stock, description } = await req.json();

        if (!name || !category || price == null || stock == null) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        const newSnack = new Snack({ name, category, price, stock, description });

        await newSnack.save();
        return NextResponse.json({ message: "Snack added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error adding snack:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
