import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { q?: string };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const q = searchParams.q?.trim() ?? "";
  return {
    title: q ? `"${q}" — Search — Kens.lk` : "Search — Kens.lk",
    description: `Search results for "${q}" across books, past papers, and stationery at Kens.lk.`,
  };
}

async function SearchResults({ q }: { q: string }) {
  if (!q) return null;

  const contains = { contains: q, mode: "insensitive" as const };

  const [books, pastPapers, stationery] = await Promise.all([
    db.product.findMany({
      where: {
        category: "book",
        availability: true,
        OR: [{ name: contains }, { author: contains }, { subject: contains }, { grade: contains }],
      },
      take: 20,
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: {
        category: "past_paper",
        availability: true,
        OR: [{ name: contains }, { subject: contains }, { grade: contains }],
      },
      take: 20,
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: {
        category: "stationery",
        availability: true,
        OR: [{ name: contains }, { brand: contains }, { type: contains }],
      },
      take: 20,
      orderBy: { name: "asc" },
    }),
  ]);

  const total = books.length + pastPapers.length + stationery.length;

  if (total === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-4xl mb-4">🔍</p>
        <p className="font-medium">No results for &quot;{q}&quot;</p>
        <p className="text-sm mt-1">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted-foreground">
        {total} result{total !== 1 ? "s" : ""} for &quot;{q}&quot;
      </p>

      {books.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Books ({books.length})</h2>
            <Link href={`/books?sort=asc`} className="text-sm text-primary hover:underline">
              View all books
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((b) => (
              <ProductCard
                key={b.id}
                id={b.id}
                name={b.name}
                price={Number(b.price)}
                photo={b.photo}
                availability={b.availability}
                stock_qty={b.stock_qty}
                href={`/books/${b.id}`}
                badge={b.grade ?? undefined}
                subtitle={b.author ?? b.subject ?? undefined}
              />
            ))}
          </div>
        </section>
      )}

      {pastPapers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Past Papers ({pastPapers.length})
            </h2>
            <Link href="/past-papers" className="text-sm text-primary hover:underline">
              View all past papers
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pastPapers.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                photo={p.photo}
                availability={p.availability}
                stock_qty={p.stock_qty}
                href={`/past-papers/${p.id}`}
                badge={p.grade ?? undefined}
                subtitle={p.subject ?? undefined}
              />
            ))}
          </div>
        </section>
      )}

      {stationery.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Stationery ({stationery.length})
            </h2>
            <Link href="/stationery" className="text-sm text-primary hover:underline">
              View all stationery
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {stationery.map((s) => (
              <ProductCard
                key={s.id}
                id={s.id}
                name={s.name}
                price={Number(s.price)}
                photo={s.photo}
                availability={s.availability}
                stock_qty={s.stock_qty}
                href={`/stationery/${s.id}`}
                badge={s.type ?? undefined}
                subtitle={s.brand ?? undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage({ searchParams }: PageProps) {
  const q = searchParams.q?.trim() ?? "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">
            {q ? `Results for "${q}"` : "Search"}
          </h1>
        </div>
        {!q && (
          <p className="text-muted-foreground text-sm">
            Use the search bar above to find books, past papers, and stationery.
          </p>
        )}
      </div>

      <Suspense
        fallback={<div className="text-center py-20 text-muted-foreground">Searching…</div>}
      >
        <SearchResults q={q} />
      </Suspense>
    </div>
  );
}
