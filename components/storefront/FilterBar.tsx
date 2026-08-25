"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    key: string;
    label: string;
    options: FilterOption[];
    all?: string; // label for "All" option
  }[];
  sorts?: { label: string; value: string }[];
  sortKey?: string;
  className?: string;
}

export function FilterBar({ filters, sorts, sortKey = "sort", className }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page"); // reset to page 1 on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {filters.map((f) => {
        const current = searchParams.get(f.key) ?? "";
        return (
          <div key={f.key} className="flex items-center gap-1">
            <label
              htmlFor={`filter-${f.key}`}
              className="text-xs text-muted-foreground font-medium sr-only"
            >
              {f.label}
            </label>
            <select
              id={`filter-${f.key}`}
              value={current}
              onChange={(e) => setParam(f.key, e.target.value)}
              className="h-8 rounded-md border border-border bg-background text-sm px-2 pr-7 text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
              aria-label={f.label}
            >
              <option value="">{f.all ?? `All ${f.label}`}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}

      {sorts && sorts.length > 0 && (
        <div className="flex items-center gap-1 ml-auto">
          <select
            id={`sort-${sortKey}`}
            value={searchParams.get(sortKey) ?? ""}
            onChange={(e) => setParam(sortKey, e.target.value)}
            className="h-8 rounded-md border border-border bg-background text-sm px-2 pr-7 text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
            aria-label="Sort order"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
