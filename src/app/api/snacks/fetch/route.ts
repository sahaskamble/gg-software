import Snack from "@/lib/models/Snacks";
import { NextResponse } from "next/server";

export async function GET(req) {
    const snacks = await Snack.find({});
    return NextResponse.json(snacks);
}
