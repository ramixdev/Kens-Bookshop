import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Offers & Booklist Bundles — Kens.lk",
  description:
    "Discounted booklist bundles for each grade — save up to 10% when you buy the full booklist. Available at all Leeds International School branches.",
};

export default async function OffersPage() {
  const bundles = await db.bundle.findMany({
    where: { availability: true },
    orderBy: { grade: "asc" },
    include: {
      bundle_items: {
        include: { product: { select: { id: true, name: true, price: true } } },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Offers & Booklist Bundles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pre-built booklists at a discounted bundle price — save when you buy the set.
        </p>
      </div>

      {bundles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">🎁</p>
          <p className="font-medium">No bundles available right now.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => {
            const rrp = bundle.bundle_items.reduce((s, i) => s + Number(i.product.price), 0);
            const savings = rrp - Number(bundle.price);
            const savingsPct = rrp > 0 ? Math.round((savings / rrp) * 100) : 0;

            return (
              <Link
                key={bundle.id}
                href={`/offers/${bundle.id}`}
                id={`bundle-card-${bundle.id}`}
                className="group flex flex-col rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Image / placeholder */}
                <div className="relative aspect-video bg-amber-50 overflow-hidden">
                  {bundle.photo ? (
                    <Image
                      src={bundle.photo}
                      alt={bundle.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl select-none">📦</span>
                    </div>
                  )}
                  {savingsPct > 0 && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-[#854F0B] text-white border-0 text-xs font-bold">
                        Save {savingsPct}%
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-4 gap-2">
                  {bundle.grade && (
                    <span className="text-[10px] font-semibold text-[#854F0B] uppercase tracking-wide">
                      {bundle.grade}
                    </span>
                  )}
                  <h2 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {bundle.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {bundle.bundle_items.length} books included
                  </p>

                  <div className="mt-auto pt-3 flex items-end gap-3">
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        LKR {Number(bundle.price).toLocaleString()}
                      </div>
                      {savings > 0 && (
                        <div className="text-xs text-muted-foreground line-through">
                          LKR {rrp.toLocaleString()} RRP
                        </div>
                      )}
                    </div>
                    {savings > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[#854F0B] border-[#854F0B] text-xs ml-auto"
                      >
                        Save LKR {savings.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
