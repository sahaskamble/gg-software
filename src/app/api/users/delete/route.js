import Users from "@/lib/models/Users";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req) {
    const { id } = await req.json();
    const user = await Users.findByIdAndDelete(id);
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "User deleted successfully" });
}
