import Users from "@/lib/models/Users";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
    const { id } = params;
    const user = await Users.findByIdAndDelete(id);
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "User deleted successfully" });
}
