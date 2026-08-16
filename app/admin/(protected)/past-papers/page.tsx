import { db as prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/admin/Pagination";
import { ClientDeleteButton } from "@/components/admin/ClientDeleteButton";

const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
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
const PAGE_SIZE = 20;

interface SearchParams {
  search?: string;
  grade?: string;
  subject?: string;
  page?: string;
}

export default async function PastPapersAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params.search ?? "",
    grade = params.grade ?? "",
    subject = params.subject ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    category: "past_paper" as const,
    ...(grade && { grade }),
    ...(subject && { subject }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { product_code: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [total, papers] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy: { created_at: "desc" }, skip, take: PAGE_SIZE }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  function hrefFor(p: number) {
    const q = new URLSearchParams({
      ...(search && { search }),
      ...(grade && { grade }),
      ...(subject && { subject }),
      page: String(p),
    });
    return `/admin/past-papers?${q}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Past Papers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total</p>
        </div>
        <Button asChild id="past-papers-add-button">
          <Link href="/admin/past-papers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Past Paper
          </Link>
        </Button>
      </div>

      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search name or code…"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-ring"
          id="pp-search-input"
        />
        <select
          name="grade"
          defaultValue={grade}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          id="pp-grade-filter"
        >
          <option value="">All Grades</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          name="subject"
          defaultValue={subject}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          id="pp-subject-filter"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm" id="pp-filter-button">
          Filter
        </Button>
        {(search || grade || subject) && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/past-papers">Clear</Link>
          </Button>
        )}
      </form>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {papers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                  No past papers found.
                </TableCell>
              </TableRow>
            )}
            {papers.map((pp) => (
              <TableRow key={pp.id}>
                <TableCell>
                  <div className="relative w-10 h-12 rounded overflow-hidden bg-muted">
                    {pp.photo ? (
                      <Image
                        src={pp.photo}
                        alt={pp.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        —
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-[220px] truncate">{pp.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {pp.product_code}
                </TableCell>
                <TableCell className="text-sm">{pp.grade ?? "—"}</TableCell>
                <TableCell className="text-sm">{pp.subject ?? "—"}</TableCell>
                <TableCell className="text-right text-sm">
                  LKR {Number(pp.price).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm">{pp.stock_qty}</TableCell>
                <TableCell>
                  <Badge
                    variant={pp.availability ? "default" : "secondary"}
                    className={
                      pp.availability
                        ? "bg-[#27500A]/10 text-[#27500A] border-[#27500A]/20 hover:bg-[#27500A]/10"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {pp.availability ? "In stock" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild aria-label={`Edit ${pp.name}`}>
                      <Link href={`/admin/past-papers/${pp.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <ClientDeleteButton productId={pp.id} productName={pp.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </div>
  );
}
