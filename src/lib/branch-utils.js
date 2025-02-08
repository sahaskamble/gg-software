import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getBranchFromSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.branch;
}

export function withBranchScope(query, branch) {
  return {
    ...query,
    branch: branch
  };
}

// Helper to check if user has access to specific branch data
export function canAccessBranch(userBranch, targetBranch) {
  // Add your branch access logic here
  // For example, you might have super-admin branches that can access all branches
  return userBranch === targetBranch;
}
