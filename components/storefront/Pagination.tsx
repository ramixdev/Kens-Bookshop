"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  className?: string;
}

export function Pagination({ page, total, limit, className }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const getHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  // Build page window: always show first, last, current ±1
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <Link
        href={getHref(page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          "h-8 w-8 flex items-center justify-center rounded-md border border-border text-sm transition-colors",
          page <= 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground text-sm"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={getHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md border text-sm font-medium transition-colors",
              p === page
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
            )}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={getHref(page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          "h-8 w-8 flex items-center justify-center rounded-md border border-border text-sm transition-colors",
          page >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
