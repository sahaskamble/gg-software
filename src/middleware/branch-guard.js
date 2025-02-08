import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function branchGuard(request) {
  const token = await getToken({ req: request });

  if (!token?.branch) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Add branch to request headers for use in API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-branch", token.branch);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
