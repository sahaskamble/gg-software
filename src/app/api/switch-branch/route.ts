import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UserBranches from "@/lib/models/UserBranches";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { branchId } = await request.json();

    // Verify user has access to this branch
    const userBranches = await UserBranches.findOne({ 
      userId: session.user.id,
      "branches.branchId": branchId,
      "branches.canAccess": true
    });

    if (!userBranches) {
      return new NextResponse("Branch access denied", { status: 403 });
    }

    // Return success - the session update will be handled by the client
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error switching branch:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
