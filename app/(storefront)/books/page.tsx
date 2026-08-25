import { Suspense } from "react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { FilterBar } from "@/components/storefront/FilterBar";
import { Pagination } from "@/components/storefront/Pagination";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Books — Kens.lk",
  description:
    "Browse the full range of curriculum books for KG1 through Grade 13, available at all 13 Leeds International School branches.",
};

const GRADES = [
  "KG1",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Grade 13",
];
const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Sinhala",
  "Tamil",
  "History",
  "Geography",
  "ICT",
  "Commerce",
  "Accounting",
  "Economics",
  "Physics",
  "Chemistry",
  "Biology",
  "Other",
];
const LIMIT = 20;

interface PageProps {
  searchParams: {
    grade?: string;
    subject?: string;
    author?: string;
    sort?: string;
    page?: string;
  };
}

export default async function BooksPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const grade = searchParams.grade ?? undefined;
  const subject = searchParams.subject ?? undefined;
  const author = searchParams.author ?? undefined;
  const sort = searchParams.sort ?? "";

  const where = {
    category: "book" as const,
    availability: true,
    ...(grade ? { grade } : {}),
    ...(subject ? { subject } : {}),
    ...(author ? { author: { contains: author, mode: "insensitive" as const } } : {}),
  };

  let orderBy: Record<string, string> = { created_at: "desc" };
  if (sort === "asc") orderBy = { name: "asc" };
  else if (sort === "desc") orderBy = { name: "desc" };
  else if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };

  const skip = (page - 1) * LIMIT;

  const [books, total, authors] = await Promise.all([
    db.product.findMany({ where, orderBy, skip, take: LIMIT }),
    db.product.count({ where }),
    db.product.findMany({
      where: { category: "book", availability: true },
      select: { author: true },
      distinct: ["author"],
      orderBy: { author: "asc" },
    }),
  ]);

  const authorOptions = authors
    .filter((a) => a.author)
    .map((a) => ({ label: a.author!, value: a.author! }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Books</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} book{total !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Filters */}
      <Suspense>
        <FilterBar
          className="mb-6"
          filters={[
            {
              key: "grade",
              label: "Grade",
              options: GRADES.map((g) => ({ label: g, value: g })),
            },
            {
              key: "subject",
              label: "Subject",
              options: SUBJECTS.map((s) => ({ label: s, value: s })),
            },
            {
              key: "author",
              label: "Author",
              options: authorOptions,
              all: "All Authors",
            },
          ]}
          sorts={[
            { label: "Newest first", value: "" },
            { label: "A → Z", value: "asc" },
            { label: "Z → A", value: "desc" },
            { label: "Price: Low → High", value: "price_asc" },
            { label: "Price: High → Low", value: "price_desc" },
          ]}
        />
      </Suspense>

      {/* Grid */}
      {books.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">📚</p>
          <p className="font-medium">No books match your filters.</p>
          <p className="text-sm mt-1">Try adjusting the grade or subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <ProductCard
              key={book.id}
              id={book.id}
              name={book.name}
              price={Number(book.price)}
              photo={book.photo}
              availability={book.availability}
              stock_qty={book.stock_qty}
              href={`/books/${book.id}`}
              badge={book.grade ?? undefined}
              subtitle={book.author ?? book.subject ?? undefined}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Suspense>
        <Pagination page={page} total={total} limit={LIMIT} className="mt-8" />
      </Suspense>
    </div>
  );
}
