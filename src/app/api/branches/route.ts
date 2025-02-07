import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UserBranches from "@/lib/models/UserBranches";
import Users from "@/lib/models/Users";

export async function GET(request: Request) {
  try {
    // Get username from query params
    const { searchParams } = new URL(request.url);
    console.log("uri", request.url)
    const username = searchParams.get("username");
    console.log("username", username)

    if (!username) {
      return NextResponse.json({ branches: [] });
    }

    // First find the user by username to get their _id
    const user = await Users.findOne({ username });
    
    if (!user) {
      console.log("User not found:", username);
      return NextResponse.json({ branches: [] });
    }

    // Find user's branches using the user's _id
    const userBranches = await UserBranches.findOne({ 
      userId: user._id.toString()
    });

    if (!userBranches) {
      return NextResponse.json({ branches: [] });
    }

    return NextResponse.json({
      branches: userBranches.branches.filter((b: { branchId: string; branchName: string; canAccess: boolean; }) => b.canAccess)
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
