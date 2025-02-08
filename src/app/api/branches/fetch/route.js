import { UserBranch } from "@/lib/models/UserBranches";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const branch = await UserBranch.find();

    if (!branch) {
      return NextResponse.json({
        message: "Branches Not found",
        output: branch,
      }, { status: 404 });
    }

    return NextResponse.json({
      message: "Branch fetched",
      output: branch,
    }, { status: 200 })

  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: "Internal Server error",
      "error": error
    }, { status: 500 })
  }
}
