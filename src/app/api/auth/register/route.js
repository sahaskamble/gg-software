import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Users, { UserRole } from '@/lib/models/Users';
import Branch from '@/lib/models/Branch';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { username, password, role, branches } = body;

    // Validate input
    if (!username || !password || !role || !branches || !Array.isArray(branches)) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await Users.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Create user with properly initialized branches array
    const user = new Users({
      username,
      passwordHash: password,
      role,
      branches: [], // Mongoose will handle the type conversion when we update later
    });

    await user.save();

    // Create branches and associate them with the user
    const branchPromises = branches.map(async (branchName) => {
      const branch = new Branch({
        name: branchName,
        createdBy: user._id, // This is already an ObjectId
      });
      const savedBranch = await branch.save();
      return savedBranch._id; // This returns a MongoDB ObjectId
    });

    // branchIds will be an array of ObjectIds, exactly what Mongoose expects
    const branchIds = await Promise.all(branchPromises);

    // Update user with branch IDs
    user.branches = branchIds;
    await user.save();

    // Return success response without sensitive data
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        branches: branchIds,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
