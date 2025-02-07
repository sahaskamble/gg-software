import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/db";
import Users from "@/lib/models/Users";
import { createApiResponse, handleApiError, validateRequestBody } from "@/lib/api-helpers";
import { validatePassword } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  branch: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const validation = await validateRequestBody<CreateUserRequest>(req, [
      "username",
      "password",
      "role",
      "branch",
    ]);

    if (!validation.isValid) {
      return createApiResponse(false, undefined, validation.error);
    }

    const { username, password, role, branch } = validation.body!;

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return createApiResponse(
        false,
        undefined,
        passwordValidation.errors.join(", ")
      );
    }

    // Check if username already exists
    const existingUser = await Users.findOne({ username });
    if (existingUser) {
      return createApiResponse(false, undefined, "Username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await Users.create({
      username,
      password: hashedPassword,
      role,
      branch,
    });

    logger.info("User created successfully", { userId: user._id });

    return createApiResponse(true, { user }, undefined, "User created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
