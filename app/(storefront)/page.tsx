import Link from "next/link";

import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BookOpen, FileText, Package, Gift, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kens.lk — Official Bookshop of Leeds International School",
  description:
    "Curriculum books, past papers, stationery and discounted booklist bundles for KG1 through Grade 13. 13 branches island-wide in Sri Lanka.",
};

export default async function HomePage() {
  // Fetch a handful of recent products for each section
  const [recentBooks, recentPapers, bundles] = await Promise.all([
    db.product.findMany({
      where: { category: "book", availability: true },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
    db.product.findMany({
      where: { category: "past_paper", availability: true },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
    db.bundle.findMany({
      where: { availability: true },
      orderBy: { grade: "asc" },
      take: 3,
      include: { bundle_items: { include: { product: { select: { price: true } } } } },
    }),
  ]);

  const categories = [
    { href: "/books", label: "Books", icon: BookOpen, desc: "Curriculum books for every grade" },
    {
      href: "/past-papers",
      label: "Past Papers",
      icon: FileText,
      desc: "O/L, A/L & scholarship papers",
    },
    {
      href: "/stationery",
      label: "Stationery",
      icon: Package,
      desc: "Pens, pencils, calculators & more",
    },
    { href: "/offers", label: "Offers", icon: Gift, desc: "Discounted booklist bundles" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#534AB7] via-[#3f38a0] to-[#185FA5] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-3">
              Leeds International School — 13 branches
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Everything your child needs, all in one place.
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Curriculum books, past papers, stationery, and discounted booklist bundles for KG1
              through Grade 13.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/books"
                className="h-11 px-6 rounded-lg bg-white text-[#534AB7] font-semibold text-sm hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                id="hero-shop-books"
              >
                <BookOpen className="h-4 w-4" /> Browse Books
              </Link>
              <Link
                href="/offers"
                className="h-11 px-6 rounded-lg bg-white/15 border border-white/30 text-white font-semibold text-sm hover:bg-white/25 transition-colors inline-flex items-center gap-2"
                id="hero-view-offers"
              >
                <Gift className="h-4 w-4" /> View Bundles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category quick-nav */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-xl font-bold text-foreground mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              id={`category-${label.toLowerCase().replace(" ", "-")}`}
              className="group flex flex-col items-center text-center gap-3 rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Books */}
      {recentBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Latest Books</h2>
            <Link
              href="/books"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentBooks.map((b) => (
              <ProductCard
                key={b.id}
                id={b.id}
                name={b.name}
                price={Number(b.price)}
                photo={b.photo}
                availability={b.availability}
                stock_qty={b.stock_qty}
                href={`/books/${b.id}`}
                badge={b.grade ?? undefined}
                subtitle={b.author ?? undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Bundles highlight */}
      {bundles.length > 0 && (
        <section className="bg-amber-50 border-y border-amber-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Booklist Bundles</h2>
                <p className="text-sm text-muted-foreground">Save up to 10% on the full booklist</p>
              </div>
              <Link
                href="/offers"
                className="text-sm text-[#854F0B] font-medium hover:underline inline-flex items-center gap-1"
              >
                All bundles <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bundles.map((bundle) => {
                const rrp = bundle.bundle_items.reduce((s, i) => s + Number(i.product.price), 0);
                const savingsPct =
                  rrp > 0 ? Math.round(((rrp - Number(bundle.price)) / rrp) * 100) : 0;
                return (
                  <Link
                    key={bundle.id}
                    href={`/offers/${bundle.id}`}
                    id={`home-bundle-${bundle.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-amber-200 bg-white p-4 hover:shadow-md transition-all"
                  >
                    <div className="h-14 w-14 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-2xl">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#854F0B] uppercase tracking-wide">
                        {bundle.grade}
                      </p>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {bundle.name}
                      </p>
                      <p className="text-sm font-bold mt-0.5">
                        LKR {Number(bundle.price).toLocaleString()}{" "}
                        {savingsPct > 0 && (
                          <span className="text-xs font-normal text-[#854F0B]">
                            — Save {savingsPct}%
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Past Papers */}
      {recentPapers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Past Papers</h2>
            <Link
              href="/past-papers"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentPapers.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                photo={p.photo}
                availability={p.availability}
                stock_qty={p.stock_qty}
                href={`/past-papers/${p.id}`}
                badge={p.grade ?? undefined}
                subtitle={p.subject ?? undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Branch count footer banner */}
      <section className="bg-[#534AB7] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-2xl font-bold mb-2">13 Branches Island-wide</p>
          <p className="text-white/80 text-sm">
            Collect in-branch or order online for delivery across Sri Lanka.
          </p>
          <Link
            href="/books"
            className="mt-6 inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-white text-[#534AB7] text-sm font-semibold hover:bg-white/90 transition-colors"
            id="footer-banner-shop"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
