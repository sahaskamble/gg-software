import { NextRequest, NextResponse } from "next/server";
import Pricing from "@/lib/models/Pricing";

export async function PUT(request) {
  try {

    const { singlePlayerPrice, multiPlayerPrice, overThreePlayersPrice } = await request.json();

    console.log(singlePlayerPrice)
    console.log(multiPlayerPrice)
    console.log(overThreePlayersPrice)

    // Validate input
    if (typeof singlePlayerPrice !== 'number' || typeof multiPlayerPrice !== 'number' || typeof overThreePlayersPrice !== 'number') {
      return NextResponse.json(
        { error: "Invalid input: prices must be numbers" },
        { status: 400 }
      );
    }

    if (singlePlayerPrice < 0 || multiPlayerPrice < 0 || overThreePlayersPrice < 0) {
      return NextResponse.json(
        { error: "Invalid input: prices cannot be negative" },
        { status: 400 }
      );
    }

    // Find the first pricing document or create one if it doesn't exist
    const pricing = await Pricing.findOne();

    if (pricing) {
      // Update existing pricing
      pricing.singlePlayerPrice = singlePlayerPrice;
      pricing.multiPlayerPrice = multiPlayerPrice;
      pricing.overThreePlayersPrice = overThreePlayersPrice;
      await pricing.save();
    } else {
      // Create new pricing
      await Pricing.create({
        singlePlayerPrice,
        multiPlayerPrice,
        overThreePlayersPrice,
      });
    }

    return NextResponse.json({ message: "Pricing updated successfully" });
  } catch (error) {
    console.error("Error updating pricing:", error);
    return NextResponse.json(
      { error: "Failed to update pricing" },
      { status: 500 }
    );
  }
}
