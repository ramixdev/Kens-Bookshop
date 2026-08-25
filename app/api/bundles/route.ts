import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const grade = searchParams.get("grade") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit") ?? "12")));
  const skip = (page - 1) * limit;

  const where = {
    ...(grade ? { grade } : {}),
    availability: true,
  };

  const [bundles, total] = await Promise.all([
    db.bundle.findMany({
      where,
      orderBy: { grade: "asc" },
      skip,
      take: limit,
      include: {
        bundle_items: {
          include: { product: { select: { id: true, name: true, price: true } } },
        },
      },
    }),
    db.bundle.count({ where }),
  ]);

  return NextResponse.json({ bundles, total, page, limit });
}
