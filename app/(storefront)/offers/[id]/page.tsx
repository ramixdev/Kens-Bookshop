import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const bundle = await db.bundle.findUnique({ where: { id: params.id } });
  if (!bundle) return { title: "Bundle not found — Kens.lk" };
  return {
    title: `${bundle.name} — Kens.lk`,
    description: `${bundle.name}. A discounted bundle${bundle.grade ? ` for ${bundle.grade}` : ""}. Shop books, stationery and more at Kens.lk.`,
  };
}

export default async function BundleDetailPage({ params }: PageProps) {
  const bundle = await db.bundle.findUnique({
    where: { id: params.id },
    include: {
      bundle_items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              photo: true,
              category: true,
              // Book fields
              author: true,
              subject: true,
              grade: true,
              // Stationery fields
              brand: true,
              type: true,
            },
          },
        },
      },
    },
  });
  if (!bundle) notFound();

  const rrp = bundle.bundle_items.reduce((s, i) => s + Number(i.product.price), 0);
  const savings = rrp - Number(bundle.price);
  const savingsPct = rrp > 0 ? Math.round((savings / rrp) * 100) : 0;
  const inStock = bundle.availability;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/offers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Offers
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-video md:aspect-square rounded-xl overflow-hidden bg-amber-50">
          {bundle.photo ? (
            <Image
              src={bundle.photo}
              alt={bundle.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 90vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl select-none">📦</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {bundle.grade && (
            <span className="text-xs font-semibold text-[#854F0B] uppercase tracking-wide mb-2">
              {bundle.grade}
            </span>
          )}
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">{bundle.name}</h1>

          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-bold text-foreground">
              LKR {Number(bundle.price).toLocaleString()}
            </span>
            {savingsPct > 0 && (
              <Badge className="bg-[#854F0B] text-white border-0">Save {savingsPct}%</Badge>
            )}
          </div>
          {savings > 0 && (
            <p className="text-sm text-muted-foreground mb-6">
              RRP: <span className="line-through">LKR {rrp.toLocaleString()}</span> — you save LKR{" "}
              {savings.toLocaleString()}
            </p>
          )}

          <button
            disabled={!inStock}
            className="flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            id={`add-bundle-${bundle.id}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {inStock ? "Add Bundle to Cart" : "Unavailable"}
          </button>

          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Includes {bundle.bundle_items.length} item
              {bundle.bundle_items.length !== 1 ? "s" : ""}
            </h2>
            <ul className="space-y-3">
              {bundle.bundle_items.map((item) => {
                const p = item.product;
                const isBook = p.category === "book";

                return (
                  <li key={p.id} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground shrink-0 mt-0.5">
                      {isBook ? "📗" : "🗂️"}
                    </span>
                    <div className="flex-1 min-w-0">
                      {isBook ? (
                        <Link
                          href={`/books/${p.id}`}
                          className="hover:text-primary transition-colors font-medium line-clamp-1"
                        >
                          {p.name}
                        </Link>
                      ) : (
                        <span className="font-medium line-clamp-1">{p.name}</span>
                      )}

                      {/* Category-specific pills */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {isBook && p.grade && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                            {p.grade}
                          </span>
                        )}
                        {isBook && p.subject && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                            {p.subject}
                          </span>
                        )}
                        {!isBook && p.brand && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                            {p.brand}
                          </span>
                        )}
                        {!isBook && p.type && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                            {p.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-muted-foreground">
                      LKR {Number(p.price).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
