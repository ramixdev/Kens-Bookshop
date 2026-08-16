import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { bookSchema, pastPaperSchema, stationerySchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Session } from "next-auth";

// ── Helpers ─────────────────────────────────────────────────────────────────

function isAdmin(session: Session | null) {
  return session?.user?.isAdmin === true;
}

const ALLOWED_CATEGORIES = ["book", "past_paper", "stationery"] as const;
type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

function parseCategory(val: string | null): AllowedCategory | null {
  if (!val) return null;
  return ALLOWED_CATEGORIES.includes(val as AllowedCategory) ? (val as AllowedCategory) : null;
}

const STATIONERY_TYPES = [
  "Pens",
  "Pencils",
  "Erasers",
  "Rulers",
  "Highlighters",
  "Markers",
  "Calculators",
  "Folders",
  "Other",
] as const;

// ── GET /api/admin/products ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = parseCategory(searchParams.get("category"));
  const search = searchParams.get("search") ?? "";
  const grade = searchParams.get("grade") ?? "";
  const subject = searchParams.get("subject") ?? "";
  const author = searchParams.get("author") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const type = searchParams.get("type") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (grade) where.grade = grade;
  if (subject) where.subject = subject;
  if (author) where.author = { contains: author, mode: "insensitive" };
  if (brand) where.brand = { contains: brand, mode: "insensitive" };
  if (type && STATIONERY_TYPES.includes(type as (typeof STATIONERY_TYPES)[number]))
    where.type = type;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { product_code: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// ── POST /api/admin/products ─────────────────────────────────────────────────

const productUnionSchema = z.discriminatedUnion("category", [
  bookSchema,
  pastPaperSchema,
  stationerySchema,
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = productUnionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}
