import Device from "@/lib/models/Device";
import { NextResponse } from "next/server";

export async function GET(req) {
    const devices = await Device.find({});
    return NextResponse.json(devices);
}
