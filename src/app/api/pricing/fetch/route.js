import Pricing from "@/lib/models/Pricing";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        // Get all pricing records
        const pricingList = await Pricing.find({})
            .sort({ createdAt: -1 }); // Get latest first

        return NextResponse.json(pricingList);
    } catch (error) {
        console.error("Error fetching pricing:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// Get a single pricing by ID
export async function POST(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { message: "Pricing ID is required" },
                { status: 400 }
            );
        }

        const pricing = await Pricing.findById(id);

        if (!pricing) {
            return NextResponse.json(
                { message: "Pricing not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(pricing);
    } catch (error) {
        console.error("Error fetching pricing:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
