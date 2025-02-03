import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function POST(req) {
  try {
    const { username, password, branch, role } = await req.json();

    if (!username || !password || !branch || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await xata.db.users
      .filter({ Username: username })
      .getFirst();

    if (existingUser) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await xata.db.users.create({
      Username: username,
      PasswordHash: hashedPassword,
      Branch: branch,
      Role: role
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}
