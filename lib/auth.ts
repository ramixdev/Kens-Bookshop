import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

// ─── Augment next-auth types ──────────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    isAdmin?: boolean;
  }
}

// ─── Full auth config (Node.js runtime only — API routes, Server Components) ──
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    // ── Customer credentials ──────────────────────────────────────────────────
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.is_active) return null;

        const passwordMatch = await bcrypt.compare(credentials.password as string, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: false,
        };
      },
    }),

    // ── Admin credentials ─────────────────────────────────────────────────────
    Credentials({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await db.admin.findUnique({
          where: { email: credentials.email as string },
        });

        if (!admin) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          admin.password_hash
        );
        if (!passwordMatch) return null;

        return {
          id: String(admin.id),
          name: "Admin",
          email: admin.email,
          isAdmin: true,
        };
      },
    }),
  ],
});
