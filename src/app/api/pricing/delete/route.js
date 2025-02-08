import Pricing from "@/lib/models/Pricing";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { message: "Pricing ID is required" },
                { status: 400 }
            );
        }

        const deletedPricing = await Pricing.findByIdAndDelete(id);

        if (!deletedPricing) {
            return NextResponse.json(
                { message: "Pricing not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Pricing deleted successfully" }
        );
    } catch (error) {
        console.error("Error deleting pricing:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
