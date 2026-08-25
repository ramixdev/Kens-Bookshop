import { Suspense } from "react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { FilterBar } from "@/components/storefront/FilterBar";
import { Pagination } from "@/components/storefront/Pagination";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Past Papers — Kens.lk",
  description:
    "Past exam papers for O/L, A/L and scholarship exams — Grade 5 through Grade 13. Available at all Leeds International School branches.",
};

const GRADES = [
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
];
const LIMIT = 20;

interface PageProps {
  searchParams: { grade?: string; subject?: string; page?: string };
}

export default async function PastPapersPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const grade = searchParams.grade ?? undefined;
  const subject = searchParams.subject ?? undefined;

  const where = {
    category: "past_paper" as const,
    availability: true,
    ...(grade ? { grade } : {}),
    ...(subject ? { subject } : {}),
  };

  const skip = (page - 1) * LIMIT;

  const [papers, total] = await Promise.all([
    db.product.findMany({ where, orderBy: { name: "asc" }, skip, take: LIMIT }),
    db.product.count({ where }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Past Papers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} paper{total !== 1 ? "s" : ""} available
        </p>
      </div>

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
          ]}
        />
      </Suspense>

      {papers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">📄</p>
          <p className="font-medium">No past papers match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {papers.map((paper) => (
            <ProductCard
              key={paper.id}
              id={paper.id}
              name={paper.name}
              price={Number(paper.price)}
              photo={paper.photo}
              availability={paper.availability}
              stock_qty={paper.stock_qty}
              href={`/past-papers/${paper.id}`}
              badge={paper.grade ?? undefined}
              subtitle={paper.subject ?? undefined}
            />
          ))}
        </div>
      )}

      <Suspense>
        <Pagination page={page} total={total} limit={LIMIT} className="mt-8" />
      </Suspense>
    </div>
  );
}
