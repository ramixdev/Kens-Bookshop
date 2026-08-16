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

const STATIONERY_TYPES = [
  "Pens",
  "Pencils",
  "Erasers",
  "Rulers",
  "Highlighters",
  "Markers",
  "Calculators",
  "Folders",
  "Other",
];
const PAGE_SIZE = 20;

interface SearchParams {
  search?: string;
  brand?: string;
  type?: string;
  page?: string;
}

export default async function StationeryAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params.search ?? "",
    brand = params.brand ?? "",
    type = params.type ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    category: "stationery" as const,
    ...(brand && { brand: { contains: brand, mode: "insensitive" as const } }),
    ...(type && { type }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { product_code: { contains: search, mode: "insensitive" as const } },
        { brand: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy: { created_at: "desc" }, skip, take: PAGE_SIZE }),
  ]);

  // Get distinct brands for filter dropdown
  const brandRows = await prisma.product.findMany({
    where: { category: "stationery", brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  const brands = brandRows.map((r) => r.brand).filter(Boolean) as string[];

  const totalPages = Math.ceil(total / PAGE_SIZE);
  function hrefFor(p: number) {
    const q = new URLSearchParams({
      ...(search && { search }),
      ...(brand && { brand }),
      ...(type && { type }),
      page: String(p),
    });
    return `/admin/stationery?${q}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stationery</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total</p>
        </div>
        <Button asChild id="stationery-add-button">
          <Link href="/admin/stationery/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Link>
        </Button>
      </div>

      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search name, code, brand…"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-ring"
          id="stationery-search-input"
        />
        <select
          name="brand"
          defaultValue={brand}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          id="stationery-brand-filter"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={type}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          id="stationery-type-filter"
        >
          <option value="">All Types</option>
          {STATIONERY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm" id="stationery-filter-button">
          Filter
        </Button>
        {(search || brand || type) && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/stationery">Clear</Link>
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
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                  No stationery items found.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="relative w-10 h-10 rounded overflow-hidden bg-muted">
                    {item.photo ? (
                      <Image
                        src={item.photo}
                        alt={item.name}
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
                <TableCell className="font-medium max-w-[200px] truncate">{item.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {item.product_code}
                </TableCell>
                <TableCell className="text-sm">{item.brand ?? "—"}</TableCell>
                <TableCell className="text-sm">{item.type ?? "—"}</TableCell>
                <TableCell className="text-right text-sm">
                  LKR {Number(item.price).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm">{item.stock_qty}</TableCell>
                <TableCell>
                  <Badge
                    variant={item.availability ? "default" : "secondary"}
                    className={
                      item.availability
                        ? "bg-[#27500A]/10 text-[#27500A] border-[#27500A]/20 hover:bg-[#27500A]/10"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {item.availability ? "In stock" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild aria-label={`Edit ${item.name}`}>
                      <Link href={`/admin/stationery/${item.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <ClientDeleteButton productId={item.id} productName={item.name} />
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
