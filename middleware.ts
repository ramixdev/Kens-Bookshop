import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

/**
 * Middleware uses the edge-compatible authConfig only (no DB, no pg, no bcrypt).
 * JWT is verified via the NEXTAUTH_SECRET — no database round-trip needed.
 *
 * Route protection rules:
 *  - /admin/login  → always pass through, never protected (explicit NextResponse.next())
 *  - /admin/*      → must have a valid JWT session with isAdmin === true
 *
 * IMPORTANT: returning undefined/null from the auth() callback delegates back to
 * NextAuth's own default authorized check, which can cause redirect loops.
 * Always return an explicit NextResponse from this callback.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  // /admin/login must be completely exempt — return next() explicitly so
  // NextAuth does NOT apply its own default redirect logic to this path.
  if (nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // All other /admin/* routes require an authenticated admin session.
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!session || !session.user?.isAdmin) {
      const loginUrl = new URL("/admin/login", nextUrl);
      // Preserve the intended destination so the login page can redirect back.
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // All other routes (storefront etc.) — pass through.
  return NextResponse.next();
});

export const config = {
  // Match /admin and all sub-paths. Exclude Next.js internals and static files.
  matcher: ["/admin/:path*"],
};
