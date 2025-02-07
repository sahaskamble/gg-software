import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UserBranches from "@/lib/models/UserBranches";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Only allow users to fetch their own branches or admin users
  if (session.user.id !== params.userId && session.user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const userBranches = await UserBranches.findOne({ userId: params.userId });
    
    if (!userBranches) {
      return NextResponse.json({ branches: [] });
    }

    return NextResponse.json({ branches: userBranches.branches });
  } catch (error) {
    console.error("Error fetching user branches:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
