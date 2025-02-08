import Users from "@/lib/models/Users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
    const { id } = await req.json();
    const user = await Users.findById(id);
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
}
