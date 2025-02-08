import Pricing from "@/lib/models/Pricing";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req) {
    try {
        const { _id, singlePlayerPrice, multiPlayerPrice } = await req.json();

        if (!_id) {
            return NextResponse.json(
                { message: "Pricing ID is required" },
                { status: 400 }
            );
        }

        if (singlePlayerPrice == null || multiPlayerPrice == null) {
            return NextResponse.json(
                { message: "Both single player and multi player prices are required" },
                { status: 400 }
            );
        }

        const updatedPricing = await Pricing.findByIdAndUpdate(
            _id,
            {
                singlePlayerPrice,
                multiPlayerPrice
            },
            { new: true }
        );

        if (!updatedPricing) {
            return NextResponse.json(
                { message: "Pricing not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Pricing updated successfully", pricing: updatedPricing }
        );
    } catch (error) {
        console.error("Error updating pricing:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
