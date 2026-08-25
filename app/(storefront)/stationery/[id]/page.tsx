import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await db.product.findUnique({ where: { id: params.id, category: "stationery" } });
  if (!item) return { title: "Stationery not found — Kens.lk" };
  return {
    title: `${item.name} — Kens.lk`,
    description: `${item.name}${item.brand ? ` by ${item.brand}` : ""}. Available at Kens.lk.`,
  };
}

export default async function StationeryDetailPage({ params }: PageProps) {
  const item = await db.product.findUnique({ where: { id: params.id, category: "stationery" } });
  if (!item) notFound();
  const inStock = item.availability && item.stock_qty > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/stationery"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Stationery
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
          {item.photo ? (
            <Image
              src={item.photo}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 90vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl select-none">✏️</span>
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm px-4 py-1">
                Out of stock
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {item.type && (
            <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              {item.type}
            </span>
          )}
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-1">{item.name}</h1>
          {item.brand && <p className="text-muted-foreground mb-4">{item.brand}</p>}
          <div className="mb-6">
            <span className="text-3xl font-bold text-foreground">
              LKR {Number(item.price).toLocaleString()}
            </span>
          </div>
          <div className="mb-6">
            {inStock ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#27500A]" />
                <span className="text-sm text-[#27500A] font-medium">
                  In stock ({item.stock_qty} available)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span className="text-sm text-destructive font-medium">Out of stock</span>
              </div>
            )}
          </div>
          <button
            disabled={!inStock}
            className="flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            id={`add-to-cart-${item.id}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </button>
          <div className="mt-8 border-t border-border pt-6 space-y-3 text-sm">
            {[
              { label: "Product Code", value: item.product_code },
              { label: "Brand", value: item.brand },
              { label: "Type", value: item.type },
            ]
              .filter((r) => r.value)
              .map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium text-foreground">{r.value}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
