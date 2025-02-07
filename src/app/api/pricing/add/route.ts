import Pricing from "@/lib/models/Pricing";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { singlePlayerPrice, multiPlayerPrice } = await req.json();

        if (singlePlayerPrice == null || multiPlayerPrice == null) {
            return NextResponse.json(
                { message: "Both single player and multi player prices are required" },
                { status: 400 }
            );
        }

        const newPricing = new Pricing({
            singlePlayerPrice,
            multiPlayerPrice
        });

        await newPricing.save();
        return NextResponse.json(
            { message: "Pricing added successfully", pricing: newPricing },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding pricing:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
