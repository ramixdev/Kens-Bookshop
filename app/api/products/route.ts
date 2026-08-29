import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ProductCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const category = searchParams.get("category") as ProductCategory | null;
  const grade = searchParams.get("grade") ?? undefined;
  const subject = searchParams.get("subject") ?? undefined;
  const author = searchParams.get("author") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined; // "asc" | "desc" | "price_asc" | "price_desc"
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const skip = (page - 1) * limit;

  const where = {
    ...(category ? { category } : {}),
    ...(grade ? { grade } : {}),
    ...(subject ? { subject } : {}),
    ...(author ? { author } : {}),
    ...(brand ? { brand } : {}),
    ...(type ? { type } : {}),
    availability: true,
  };

  let orderBy: Record<string, string> = { created_at: "desc" };
  if (sort === "asc") orderBy = { name: "asc" };
  else if (sort === "desc") orderBy = { name: "desc" };
  else if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };

  const [products, total] = await Promise.all([
    db.product.findMany({ where, orderBy, skip, take: limit }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, limit });
}
