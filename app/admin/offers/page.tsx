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

const PAGE_SIZE = 20;
interface SearchParams {
  page?: string;
}

export default async function OffersAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [total, bundles] = await Promise.all([
    prisma.bundle.count(),
    prisma.bundle.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { bundle_items: { select: { id: true } } },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  function hrefFor(p: number) {
    return `/admin/offers?page=${p}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Offers &amp; Bundles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total</p>
        </div>
        <Button asChild id="offers-add-button">
          <Link href="/admin/offers/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Bundle
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundles.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  No bundles yet.
                </TableCell>
              </TableRow>
            )}
            {bundles.map((bundle) => (
              <TableRow key={bundle.id}>
                <TableCell>
                  <div className="relative w-10 h-12 rounded overflow-hidden bg-muted">
                    {bundle.photo ? (
                      <Image
                        src={bundle.photo}
                        alt={bundle.name}
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
                <TableCell className="font-medium max-w-[200px] truncate">{bundle.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {bundle.product_code}
                </TableCell>
                <TableCell className="text-sm">{bundle.grade ?? "—"}</TableCell>
                <TableCell className="text-right text-sm">
                  LKR {Number(bundle.price).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm">{bundle.bundle_items.length}</TableCell>
                <TableCell>
                  <Badge
                    variant={bundle.availability ? "default" : "secondary"}
                    className={
                      bundle.availability
                        ? "bg-[#854F0B]/10 text-[#854F0B] border-[#854F0B]/20 hover:bg-[#854F0B]/10"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {bundle.availability ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild aria-label={`Edit ${bundle.name}`}>
                      <Link href={`/admin/offers/${bundle.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <ClientDeleteButton
                      productId={bundle.id}
                      productName={bundle.name}
                      deleteUrl={`/api/admin/bundles/${bundle.id}`}
                    />
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
