import DeviceCategory from "@/lib/models/DeviceCategory";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    const { id } = params;
    const category = await DeviceCategory.findByIdAndDelete(id);
    if (!category) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Category deleted successfully" });
}
