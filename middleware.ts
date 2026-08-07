import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware uses the edge-compatible authConfig only (no DB, no pg, no bcrypt).
 * JWT is verified via the NEXTAUTH_SECRET — no database round-trip needed.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAdminLoginPage = nextUrl.pathname === "/admin/login";

  // Always allow access to the admin login page
  if (isAdminLoginPage) return;

  // Protect all other /admin/* routes
  if (isAdminRoute) {
    if (!session) {
      return Response.redirect(new URL("/admin/login", nextUrl));
    }
    if (!session.user?.isAdmin) {
      return Response.redirect(new URL("/admin/login", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
