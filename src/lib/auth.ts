import Users from "@/lib/models/Users";
import CredentialsProvider from "next-auth/providers/credentials";
import { logger } from "@/lib/logger";
import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { IUser } from "./models/Users";
import UserBranches from "./models/UserBranches";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: string;
    branch: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      branch: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    branch: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        branch: { label: "Branch", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password || !credentials?.branch) {
          logger.warn('Login attempt with missing credentials', { username: credentials?.username });
          return null;
        }

        try {
          const user = await Users.findOne({ username: credentials.username });
          if (!user) {
            logger.warn('User not found', { username: credentials.username });
            return null;
          }

          const isValid = await user.comparePassword(credentials.password);
          if (!isValid) {
            logger.warn('Invalid password', { username: credentials.username });
            return null;
          }

          // Verify branch access
          const userBranches = await UserBranches.findOne({ 
            userId: user._id.toString()
          });

          if (!userBranches) {
            logger.warn('No branches found for user', { 
              username: credentials.username
            });
            return null;
          }

          // Check if user has access to the selected branch
          const hasBranchAccess = userBranches.branches.some(
            (b: { branchId: string; canAccess: boolean }) => b.branchId === credentials.branch.toLowerCase().replace(/\s+/g, '-') && b.canAccess
          );

          if (!hasBranchAccess) {
            logger.warn('Branch access denied', { 
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
          logger.error('Error during authentication', { error });
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
  debug: process.env.NODE_ENV === 'development'
};
