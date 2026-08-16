import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import {
  BookOpen,
  FileText,
  Package,
  Gift,
  ShoppingCart,
  Users,
  Info,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/books", label: "Books", icon: BookOpen },
  { href: "/admin/past-papers", label: "Past Papers", icon: FileText },
  { href: "/admin/stationery", label: "Stationery", icon: Package },
  { href: "/admin/offers", label: "Offers", icon: Gift },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/about", label: "About Us", icon: Info },
];

/**
 * Protected admin layout — wraps all pages under app/admin/(protected)/.
 * The auth guard here is a server-side double-check; the middleware already
 * redirects unauthenticated users before the page renders.
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-[#F8F8F8]">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <span className="text-lg font-bold tracking-tight text-[#0F6E56]">Kens.lk</span>
          <p className="text-xs text-muted-foreground mt-0.5">Admin Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <AdminNavLink
              key={href}
              href={href}
              label={label}
              icon={<Icon className="h-4 w-4" />}
            />
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-border">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}

// ── Active-link helper ────────────────────────────────────────────────────────

function AdminNavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-[#0F6E56]/10 hover:text-[#0F6E56] transition-colors aria-[current=page]:bg-[#0F6E56]/15 aria-[current=page]:text-[#0F6E56] aria-[current=page]:font-medium"
    >
      {icon}
      {label}
    </Link>
  );
}
