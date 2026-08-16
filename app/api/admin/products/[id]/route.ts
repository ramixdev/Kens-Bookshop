import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookSchema, pastPaperSchema, stationerySchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

function isAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return session?.user?.isAdmin === true;
}

const productUnionSchema = z.discriminatedUnion("category", [
  bookSchema,
  pastPaperSchema,
  stationerySchema,
]);

// ── GET /api/admin/products/[id] ─────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

// ── PATCH /api/admin/products/[id] ───────────────────────────────────────────

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

  const parsed = productUnionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json(product);
}

// ── DELETE /api/admin/products/[id] ──────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Check for existing order items before deleting
  const orderItemCount = await prisma.orderItem.count({ where: { product_id: id } });
  if (orderItemCount > 0) {
    return NextResponse.json(
      {
        error: "Cannot delete a product that has been ordered. Set availability to false instead.",
      },
      { status: 409 }
    );
  }

  // Remove from any bundles first
  await prisma.bundleItem.deleteMany({ where: { product_id: id } });
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
