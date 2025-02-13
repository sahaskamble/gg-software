import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Users from '@/lib/models/Users';

export async function checkAuth(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: 'Unauthorized', status: 401 };
  }
  return session;
}

export async function checkRole(request, allowedRoles) {
  const session = await checkAuth(request);
  if (session.error) return session;

  if (!allowedRoles.includes(session.user.role)) {
    return { error: 'Access denied', status: 403 };
  }
  return session;
}

export async function checkBranch(request) {
  const session = await checkAuth(request);
  if (session.error) return session;

  const user = await Users.findById(session.user.id).select('branches');
  if (!user) {
    return { error: 'User not found', status: 404 };
  }

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');

  if (!branchId) {
    return { error: 'Branch ID is required', status: 400 };
  }

  if (!user.branches.includes(branchId)) {
    return { error: 'Access to this branch denied', status: 403 };
  }

  return { session, branchId };
}