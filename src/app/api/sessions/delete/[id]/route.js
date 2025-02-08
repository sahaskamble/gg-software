import Session from "@/lib/models/Sessions";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {

    const session = await Session.findByIdAndDelete(params.id);
    console.log(await req.json());

    if (!session) {
      return NextResponse.json({ essage: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Session deleted Successfully",
      output: session,
    }, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      message: "Internal server error",
      "error": error
    }, { status: 500 })
  }
}
