import DeviceCategory from "@/lib/models/DeviceCategory";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
    const { id } = await req.json();
    const category = await DeviceCategory.findById(id);
    if (!category) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(category);
}
