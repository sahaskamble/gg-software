import Device from "@/lib/models/Device";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req) {
    const { id, name, category, screenNumber, numberOfControllers, isAvailable } = await req.json();

    const updatedDevice = await Device.findByIdAndUpdate(id, { name, category, screenNumber, numberOfControllers, isAvailable }, { new: true });
    if (!updatedDevice) {
        return NextResponse.json({ message: "Device not found" }, { status: 404 });
    }

    return NextResponse.json(updatedDevice);
}
