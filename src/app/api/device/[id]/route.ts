import Device from "@/lib/models/Device";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const device = await Device.findByIdAndDelete(id);
        
        if (!device) {
            return NextResponse.json(
                { message: "Device not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Device deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting device:", error);
        return NextResponse.json(
            { message: "Error deleting device", error: (error as Error).message },
            { status: 500 }
        );
    }
}
