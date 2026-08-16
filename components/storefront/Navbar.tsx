"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, BookOpen, FileText, Package, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/past-papers", label: "Past Papers", icon: FileText },
  { href: "/stationery", label: "Stationery", icon: Package },
  { href: "/offers", label: "Offers", icon: Gift },
];

export function StorefrontNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setSearch("");
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[#534AB7] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-white text-xl font-bold tracking-tight">Kens.lk</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname?.startsWith(href)
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Global search */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md ml-auto hidden sm:flex items-center"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, past papers, stationery…"
                className="h-9 w-full rounded-full bg-white/15 border border-white/20 pl-9 pr-4 text-sm text-white placeholder:text-white/60 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
                aria-label="Global search"
                id="global-search-input"
              />
            </div>
          </form>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden ml-auto text-white p-1"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#3f38a0] border-t border-white/10 px-4 py-3 space-y-1">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="h-9 w-full rounded-full bg-white/15 border border-white/20 pl-9 pr-4 text-sm text-white placeholder:text-white/60 focus:outline-none"
                id="mobile-search-input"
              />
            </div>
          </form>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                pathname?.startsWith(href)
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
