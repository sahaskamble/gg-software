import DeviceCategory from "@/lib/models/DeviceCategory";
import { NextResponse } from "next/server";

export async function GET(req) {
    const categories = await DeviceCategory.find({});
    return NextResponse.json(categories);
}
