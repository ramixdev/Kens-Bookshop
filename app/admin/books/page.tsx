import { prisma } from "@/lib/prisma";
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

const GRADES = [
  "KG1",
  "KG2",
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
  "Art",
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
  author?: string;
  page?: string;
}

export default async function BooksAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const grade = params.grade ?? "";
  const subject = params.subject ?? "";
  const author = params.author ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    category: "book" as const,
    ...(grade && { grade }),
    ...(subject && { subject }),
    ...(author && { author: { contains: author, mode: "insensitive" as const } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { product_code: { contains: search, mode: "insensitive" as const } },
        { author: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [total, books] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy: { created_at: "desc" }, skip, take: PAGE_SIZE }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function hrefFor(p: number) {
    const q = new URLSearchParams({
      ...(search && { search }),
      ...(grade && { grade }),
      ...(subject && { subject }),
      ...(author && { author }),
      page: String(p),
    });
    return `/admin/books?${q}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Books</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total</p>
        </div>
        <Button asChild id="books-add-button">
          <Link href="/admin/books/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search name, code, author…"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-ring"
          id="books-search-input"
        />
        <select
          name="grade"
          defaultValue={grade}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          id="books-grade-filter"
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
          id="books-subject-filter"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm" id="books-filter-button">
          Filter
        </Button>
        {(search || grade || subject || author) && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/books">Clear</Link>
          </Button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-12">
                  No books found.
                </TableCell>
              </TableRow>
            )}
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <div className="relative w-10 h-12 rounded overflow-hidden bg-muted">
                    {book.photo ? (
                      <Image
                        src={book.photo}
                        alt={book.name}
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
                <TableCell className="font-medium max-w-[180px] truncate">{book.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {book.product_code}
                </TableCell>
                <TableCell className="text-sm">{book.grade ?? "—"}</TableCell>
                <TableCell className="text-sm">{book.subject ?? "—"}</TableCell>
                <TableCell className="text-sm">{book.author ?? "—"}</TableCell>
                <TableCell className="text-right text-sm">
                  LKR {Number(book.price).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm">{book.stock_qty}</TableCell>
                <TableCell>
                  <Badge
                    variant={book.availability ? "default" : "secondary"}
                    className={
                      book.availability
                        ? "bg-[#27500A]/10 text-[#27500A] border-[#27500A]/20 hover:bg-[#27500A]/10"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {book.availability ? "In stock" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild aria-label={`Edit ${book.name}`}>
                      <Link href={`/admin/books/${book.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <ClientDeleteButton productId={book.id} productName={book.name} />
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
