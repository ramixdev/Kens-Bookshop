import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bundleSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

function isAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return session?.user?.isAdmin === true;
}

// ── GET /api/admin/bundles ────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const skip = (page - 1) * limit;

  const [total, bundles] = await Promise.all([
    prisma.bundle.count(),
    prisma.bundle.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        bundle_items: {
          include: { product: { select: { id: true, name: true, price: true, photo: true } } },
        },
      },
    }),
  ]);

  return NextResponse.json({
    bundles,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// ── POST /api/admin/bundles ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bundleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { product_ids, ...bundleData } = parsed.data;

  // Verify all product_ids exist and are books
  const products = await prisma.product.findMany({
    where: { id: { in: product_ids }, category: "book" },
    select: { id: true },
  });

  if (products.length !== product_ids.length) {
    return NextResponse.json(
      { error: "One or more selected products not found or are not books." },
      { status: 422 }
    );
  }

  const bundle = await prisma.bundle.create({
    data: {
      ...bundleData,
      bundle_items: {
        create: product_ids.map((id) => ({ product_id: id })),
      },
    },
    include: {
      bundle_items: { include: { product: true } },
    },
  });

  return NextResponse.json(bundle, { status: 201 });
}
