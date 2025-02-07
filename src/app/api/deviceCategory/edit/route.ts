import DeviceCategory from "@/lib/models/DeviceCategory";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    const { id } = params;
    const { name } = await req.json();

    if (!name) {
        return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    const updatedCategory = await DeviceCategory.findByIdAndUpdate(id, { name }, { new: true });
    if (!updatedCategory) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
}
