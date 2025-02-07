import Users from "@/lib/models/Users";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = params;
    const user = await Users.findById(id);
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
}
