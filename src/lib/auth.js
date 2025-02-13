import Users from "@/lib/models/Users";
import CredentialsProvider from "next-auth/providers/credentials";
import Branch from "./models/Branch";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        branch: { label: "Branch", type: "text" } // Re-added branch field
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password || !credentials?.branch) {
          logger.warn('Login attempt with missing credentials', { username: credentials?.username });
          return null;
        }

        try {
          const user = await Users.findOne({ username: credentials.username });
          if (!user) {
            conole.warn('User not found', { username: credentials.username });
            return null;
          }

          const isValid = await user.comparePassword(credentials.password);
          if (!isValid) {
            console.warn('Invalid password', { username: credentials.username });
            return null;
          }

          // Find the branch by name (assuming credentials.branch contains branch name)
          const branch = await Branch.findOne({
            _id: credentials.branch
          });

          if (!branch) {
            console.warn('Branch not found', { branch: credentials.branch });
            return null;
          }

          // Check if user has access to this branch (either created by user or assigned to user)
          const hasAccess = branch.createdBy.equals(user._id) || branch.branches.some(b => b.branchId === credentials.branch.toLowerCase().replace(/\s+/g, '-') && b.canAccess);

          if (!hasAccess) {
            console.warn('Branch access denied', {
              username: credentials.username,
              branch: credentials.branch
            });
            return null;
          }

          // Return the user object without sensitive information
          return {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            branch: credentials.branch,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
        } catch (error) {
          console.error('Error during authentication', { error });
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.branch = user.branch;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.branch = token.branch;
        session.user.createdAt = token.createdAt;
        session.user.updatedAt = token.updatedAt;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: '/auth/error'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
