import DeviceCategory from "@/lib/models/DeviceCategory";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { name } = await req.json();

    if (!name) {
        return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    const existingCategory = await DeviceCategory.findOne({ name });
    if (existingCategory) {
        return NextResponse.json({ message: "Category already exists" }, { status: 409 });
    }

    const newCategory = new DeviceCategory({ name });

    try {
        await newCategory.save();
        return NextResponse.json({ message: "Category added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error adding category:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
