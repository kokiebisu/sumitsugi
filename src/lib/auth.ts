import NextAuth, { type DefaultSession } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";

// Extend NextAuth types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isSeller: boolean;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isSeller: boolean;
    isAdmin: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("メールアドレスとパスワードを入力してください");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
          throw new Error("メールアドレスまたはパスワードが正しくありません");
        }

        // Verify password
        const isValid = await compare(password, user.passwordHash);

        if (!isValid) {
          throw new Error("メールアドレスまたはパスワードが正しくありません");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          isSeller: user.isSeller,
          isAdmin: user.isAdmin || false,
        };
      },
    }),

    // Google OAuth provider (optional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: "/", // Redirect to home page for sign in
    error: "/", // Error page
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // Fetch latest user data to get isSeller and isAdmin
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id),
          columns: {
            isSeller: true,
            isAdmin: true,
          },
        });

        session.user.isSeller = dbUser?.isSeller || false;
        session.user.isAdmin = dbUser?.isAdmin || false;
      }
      return session;
    },

    async signIn({ user, account }) {
      // For OAuth providers, update user info if needed
      if (account?.provider === "google" && user.email) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (existingUser) {
          // Update user's OAuth account if not already linked
          return true;
        }
      }
      return true;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut() {
      console.log("User signed out");
    },
  },

  debug: process.env.NODE_ENV === "development",
});
