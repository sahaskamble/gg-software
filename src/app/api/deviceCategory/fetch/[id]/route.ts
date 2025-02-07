import DeviceCategory from "@/lib/models/DeviceCategory";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = params;
    const category = await DeviceCategory.findById(id);
    if (!category) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(category);
}
