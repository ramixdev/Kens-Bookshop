import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — NO Node.js-only imports (no pg, no bcrypt, no Prisma).
 * Used by middleware.ts which runs in the Next.js Edge Runtime.
 *
 * The actual Credentials providers (which need DB access) are added in lib/auth.ts,
 * which only runs in the Node.js runtime (API routes, Server Components).
 */
export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
  },
  // Providers intentionally empty here — added in lib/auth.ts
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.isAdmin = (user as any).isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
