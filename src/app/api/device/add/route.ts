import Device from "@/lib/models/Device";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { name, category, screenNumber, numberOfControllers, isAvailable } = await req.json();

    if (!name || !category || screenNumber == null || numberOfControllers == null) {
        return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const newDevice = new Device({ name, category, screenNumber, numberOfControllers, isAvailable });

    try {
        await newDevice.save();
        return NextResponse.json({ message: "Device added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error adding device:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
