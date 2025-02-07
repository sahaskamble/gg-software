import Users from "@/lib/models/Users";
import UserBranches from "@/lib/models/UserBranches";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("Request body:", body);
        const { username, password, role, branchName } = body;

        // Validate input fields
        if (!username || !password || !role || !branchName || !Array.isArray(branchName) || branchName.length === 0) {
            console.log("Validation failed:", { username, password, role, branchName });
            return NextResponse.json({ message: "All fields are required and branches must be a non-empty array" }, { status: 400 });
        }

        // Check if the username already exists
        const existingUser = await Users.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ message: "Username already exists" }, { status: 409 });
        }

        // Create a new user with plain password as passwordHash
        // The pre-save hook will hash it
        const newUser = new Users({
            username,
            passwordHash: password,
            role,
        });

        console.log("Creating user:", newUser);
        // Save the user
        const savedUser = await newUser.save();

        // Create user branches
        const userBranch = new UserBranches({
            userId: savedUser._id.toString(), 
            branches: branchName.map(branch => ({
                branchId: branch.toLowerCase().replace(/\s+/g, '-'),
                branchName: branch,
                canAccess: true
            }))
        });

        console.log("Creating branches:", userBranch);
        // Save the branches
        await userBranch.save();

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
