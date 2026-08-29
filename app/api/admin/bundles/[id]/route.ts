import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { bundleSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return session?.user?.isAdmin === true;
}

// ── GET /api/admin/bundles/[id] ──────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const bundle = await prisma.bundle.findUnique({
    where: { id },
    include: {
      bundle_items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, photo: true, product_code: true },
          },
        },
      },
    },
  });

  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bundle);
}

// ── PATCH /api/admin/bundles/[id] ────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

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

  // Verify all product_ids are books or stationery (past_paper excluded)
  const products = await prisma.product.findMany({
    where: { id: { in: product_ids }, category: { in: ["book", "stationery"] } },
    select: { id: true },
  });

  if (products.length !== product_ids.length) {
    return NextResponse.json(
      {
        error:
          "One or more selected products not found or not eligible for bundles. Only Books and Stationery may be added.",
      },
      { status: 422 }
    );
  }

  // Delete existing items, then recreate — cleanest update strategy for a join table
  await prisma.bundleItem.deleteMany({ where: { bundle_id: id } });

  const bundle = await prisma.bundle.update({
    where: { id },
    data: {
      ...bundleData,
      bundle_items: {
        create: product_ids.map((pid) => ({ product_id: pid })),
      },
    },
    include: {
      bundle_items: { include: { product: true } },
    },
  });

  return NextResponse.json(bundle);
}

// ── DELETE /api/admin/bundles/[id] ───────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.bundleItem.deleteMany({ where: { bundle_id: id } });
  await prisma.bundle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
