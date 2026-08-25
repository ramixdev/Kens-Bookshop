import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ books: [], pastPapers: [], stationery: [] });

  const contains = { contains: q, mode: "insensitive" as const };

  const [books, pastPapers, stationery] = await Promise.all([
    db.product.findMany({
      where: {
        category: "book",
        availability: true,
        OR: [{ name: contains }, { author: contains }, { subject: contains }, { grade: contains }],
      },
      take: 20,
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: {
        category: "past_paper",
        availability: true,
        OR: [{ name: contains }, { subject: contains }, { grade: contains }],
      },
      take: 20,
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: {
        category: "stationery",
        availability: true,
        OR: [{ name: contains }, { brand: contains }, { type: contains }],
      },
      take: 20,
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({
    query: q,
    books,
    pastPapers,
    stationery,
    total: books.length + pastPapers.length + stationery.length,
  });
}
