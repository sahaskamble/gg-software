import { NextResponse } from "next/server";
import Branch from "@/models/Branch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only SuperAdmin can create branches
    if (session.user.role !== "SuperAdmin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { name } = await req.json();

    // Check required field
    if (!name) {
      return NextResponse.json({ error: "Branch name is required" }, { status: 400 });
    }

    // Check if branch name already exists
    const existingBranch = await Branch.findOne({ name });
    if (existingBranch) {
      return NextResponse.json({ error: "Branch already exists" }, { status: 400 });
    }

    // Create branch
    const newBranch = await Branch.create({
      name,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      { message: "Branch created successfully", branch: newBranch },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const branches = await Branch.find();
    return NextResponse.json({ message: "Branches fetched", branches }, { status: 200 });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
