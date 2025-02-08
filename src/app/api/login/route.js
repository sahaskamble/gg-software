import Users from "@/lib/models/Users";
import UserBranches from "@/lib/models/UserBranches";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";

export async function POST(req) {
  try {
    // Connect to database first
    await dbConnect();

    // Safely parse the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json({
        message: "Invalid request format. Please send valid JSON data",
        details: "Request body must be a JSON object with username, password, and branch"
      }, { status: 400 });
    }

    const { username, password, branch } = requestData;

    console.log('Request data:', { username, branch }); // Don't log passwords

    if (!username || !password || !branch) {
      return NextResponse.json({
        message: "All fields are required",
        details: "Please provide username, password, and branch"
      }, { status: 400 });
    }

    const user = await Users.findOne({ username });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Use the model's comparePassword method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Check if user has access to the specified branch
    const userBranches = await UserBranches.findOne({ userId: user._id });

    if (!userBranches) {
      return NextResponse.json({ message: "No branch access found for user" }, { status: 403 });
    }

    const branchId = branch.toLowerCase().replace(/\s+/g, '-');
    const hasBranchAccess = userBranches.branches.some(
      (b) => b.branchId === branchId && b.canAccess
    );

    if (!hasBranchAccess) {
      return NextResponse.json({ message: "Access denied for this branch" }, { status: 403 });
    }

    // If all checks pass, return success with user data
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        branch
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      message: "An error occurred during login",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
