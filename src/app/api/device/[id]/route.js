import Device from "@/lib/models/Device";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const device = await Device.findByIdAndDelete(params.id);

    if (!device) {
      return NextResponse.json({ message: "Device not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Device deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting device:", error);
    return NextResponse.json({ message: "Error deleting device" }, { status: 500 });
  }
}
