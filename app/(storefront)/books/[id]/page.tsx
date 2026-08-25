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
  const book = await db.product.findUnique({ where: { id: params.id, category: "book" } });
  if (!book) return { title: "Book not found — Kens.lk" };
  return {
    title: `${book.name} — Kens.lk`,
    description: `${book.name} by ${book.author ?? "unknown author"}. Grade: ${book.grade}. Subject: ${book.subject}. Available at Kens.lk.`,
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const book = await db.product.findUnique({ where: { id: params.id, category: "book" } });
  if (!book) notFound();

  const inStock = book.availability && book.stock_qty > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/books"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Books
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
          {book.photo ? (
            <Image
              src={book.photo}
              alt={book.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 90vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl select-none">📚</span>
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

        {/* Details */}
        <div className="flex flex-col">
          {book.grade && (
            <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              {book.grade}
            </span>
          )}
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">{book.name}</h1>
          {book.author && <p className="text-muted-foreground mb-1">By {book.author}</p>}
          {book.subject && (
            <p className="text-sm text-muted-foreground mb-4">Subject: {book.subject}</p>
          )}

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold text-foreground">
              LKR {Number(book.price).toLocaleString()}
            </span>
          </div>

          {/* Stock indicator */}
          <div className="mb-6">
            {inStock ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#27500A] inline-block" />
                <span className="text-sm text-[#27500A] font-medium">
                  In stock ({book.stock_qty} available)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive inline-block" />
                <span className="text-sm text-destructive font-medium">Out of stock</span>
              </div>
            )}
          </div>

          {/* Add to cart placeholder */}
          <button
            disabled={!inStock}
            className="flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            id={`add-to-cart-${book.id}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </button>

          {/* Meta table */}
          <div className="mt-8 border-t border-border pt-6 space-y-3 text-sm">
            {[
              { label: "Product Code", value: book.product_code },
              { label: "ISBN", value: book.isbn },
              { label: "Grade", value: book.grade },
              { label: "Subject", value: book.subject },
              { label: "Author", value: book.author },
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
