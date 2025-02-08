import Device from "@/lib/models/Device";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
    const id = await req.json();
    const device = await Device.findById(id);
    if (!device) {
        return NextResponse.json({ message: "Device not found" }, { status: 404 });
    }
    return NextResponse.json(device);
}
