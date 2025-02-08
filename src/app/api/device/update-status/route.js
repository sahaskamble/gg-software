import Device from "@/lib/models/Device";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req) {
    try {
        const { deviceId, status } = await req.json();

        if (!deviceId || !status) {
            return NextResponse.json(
                { message: "Device ID and status are required" },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ["Available", "Occupied", "Extended"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { message: "Invalid status. Must be one of: Available, Occupied, Extended" },
                { status: 400 }
            );
        }

        // Update device status and isAvailable
        const isAvailable = status === "Available";
        const updatedDevice = await Device.findByIdAndUpdate(
            deviceId,
            {
                deviceStatus: status,
                isAvailable: isAvailable
            },
            { new: true }
        );

        if (!updatedDevice) {
            return NextResponse.json(
                { message: "Device not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Device status updated successfully",
            device: updatedDevice
        });
    } catch (error) {
        console.error("Error updating device status:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
