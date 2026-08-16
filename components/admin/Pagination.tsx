import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Function that returns the URL for a given page number */
  hrefFor: (page: number) => string;
  className?: string;
}

export function Pagination({ page, totalPages, hrefFor, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Show at most 5 page numbers around the current page
  const pages: (number | "…")[] = [];
  const delta = 2;
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  pages.push(1);
  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("…");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <Button variant="ghost" size="icon" asChild disabled={page <= 1}>
        <Link
          href={page <= 1 ? "#" : hrefFor(page - 1)}
          aria-label="Previous page"
          aria-disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground select-none">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "ghost"}
            size="icon"
            asChild
            className={cn(p === page && "pointer-events-none")}
          >
            <Link href={hrefFor(p)} aria-current={p === page ? "page" : undefined}>
              {p}
            </Link>
          </Button>
        )
      )}

      <Button variant="ghost" size="icon" asChild disabled={page >= totalPages}>
        <Link
          href={page >= totalPages ? "#" : hrefFor(page + 1)}
          aria-label="Next page"
          aria-disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
