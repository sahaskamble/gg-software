import Users from "@/lib/models/Users";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req) {
    const { id, username, password, role, branch } = await req.json();
    const updatedData = { username, role, branch };
    if (password) {
        updatedData.passwordHash = await bcrypt.hash(password, 10);
    }
    const user = await Users.findByIdAndUpdate(id, updatedData, { new: true });
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
}
