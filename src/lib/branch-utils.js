import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getBranchFromSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.branch;
}

export function withBranchScope(query, branch) {
  if (!branch) return query;
  return {
    ...query,
    branchId: branch.toLowerCase().replace(/\s+/g, '-')
  };
}

export function canAccessBranch(userBranches, targetBranch) {
  if (!userBranches || !targetBranch) return false;
  return userBranches.some(
    branch => branch.branchId === targetBranch && branch.canAccess
  );
}

export function getBranchId(branchName) {
  return branchName.toLowerCase().replace(/\s+/g, '-');
}

export async function validateBranchAccess(session, targetBranch) {
  if (!session?.user) return false;
  
  // Super admins can access all branches
  if (session.user.role === 'SuperAdmin') return true;
  
  const userBranch = session.user.branch;
  return userBranch === targetBranch;
}
