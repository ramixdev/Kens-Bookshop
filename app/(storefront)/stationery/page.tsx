import { Suspense } from "react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { FilterBar } from "@/components/storefront/FilterBar";
import { Pagination } from "@/components/storefront/Pagination";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stationery — Kens.lk",
  description:
    "School stationery — pens, pencils, calculators, rulers, folders and more. Available at all 13 Leeds International School branches.",
};

const TYPES = [
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
const LIMIT = 20;

interface PageProps {
  searchParams: { brand?: string; type?: string; sort?: string; page?: string };
}

export default async function StationeryPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const brand = searchParams.brand ?? undefined;
  const type = searchParams.type ?? undefined;
  const sort = searchParams.sort ?? "";

  const where = {
    category: "stationery" as const,
    availability: true,
    ...(brand ? { brand } : {}),
    ...(type ? { type } : {}),
  };

  let orderBy: Record<string, string> = { name: "asc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };

  const skip = (page - 1) * LIMIT;

  const [items, total, brands] = await Promise.all([
    db.product.findMany({ where, orderBy, skip, take: LIMIT }),
    db.product.count({ where }),
    db.product.findMany({
      where: { category: "stationery", availability: true },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  const brandOptions = brands
    .filter((b) => b.brand)
    .map((b) => ({ label: b.brand!, value: b.brand! }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Stationery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} item{total !== 1 ? "s" : ""} available
        </p>
      </div>

      <Suspense>
        <FilterBar
          className="mb-6"
          filters={[
            {
              key: "type",
              label: "Type",
              options: TYPES.map((t) => ({ label: t, value: t })),
              all: "All Types",
            },
            {
              key: "brand",
              label: "Brand",
              options: brandOptions,
              all: "All Brands",
            },
          ]}
          sorts={[
            { label: "A → Z", value: "" },
            { label: "Price: Low → High", value: "price_asc" },
            { label: "Price: High → Low", value: "price_desc" },
          ]}
        />
      </Suspense>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">✏️</p>
          <p className="font-medium">No stationery matches your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              price={Number(item.price)}
              photo={item.photo}
              availability={item.availability}
              stock_qty={item.stock_qty}
              href={`/stationery/${item.id}`}
              badge={item.type ?? undefined}
              subtitle={item.brand ?? undefined}
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
