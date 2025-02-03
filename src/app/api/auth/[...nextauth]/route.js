import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getXataClient } from "@/xata";
import bcrypt from "bcryptjs";

const xata = getXataClient();

const handler = NextAuth({
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
          return null;
        }

        try {
          const user = await xata.db.users
            .filter({
              Username: credentials.username,
              Branch: credentials.branch
            })
            .getFirst();

          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.PasswordHash
          );

          if (!passwordMatch) {
            return null;
          }

          // Return user with xata_id as id
          return {
            id: user.xata_id, // Use xata_id here
            username: user.Username,
            role: user.Role,
            branch: user.Branch
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Will get xata_id from authorize
        token.role = user.role;
        token.branch = user.branch;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id; // Pass xata_id to session
        session.user.role = token.role;
        session.user.branch = token.branch;
        session.user.username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
