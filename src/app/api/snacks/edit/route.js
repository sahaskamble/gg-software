import Snack from "@/lib/models/Snacks";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";

export async function PUT(req) {
  try {

    const { _id, data } = await req.json();
    const { name, category, price, stock, lowStockThreshold, description } = data;

    await dbConnect();

    const updatedSnack = await Snack.findByIdAndUpdate(_id, { name, category, price, stock, lowStockThreshold, description }, { new: true });
    console.log(updatedSnack)

    if (!updatedSnack) {
      return NextResponse.json({ message: "Snack not edited" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Snack Updated Successfully",
      output: updatedSnack
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "Internal server error",
      "error": error
    }, { status: 500 })
  }
}
