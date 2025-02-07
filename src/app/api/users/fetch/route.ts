import Users from "@/lib/models/Users";
import { NextResponse } from "next/server";

export async function GET(req) {
    const users = await Users.find({});
    return NextResponse.json(users);
}
