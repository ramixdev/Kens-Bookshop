import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const bundle = await db.bundle.findUnique({
    where: { id: params.id },
    include: {
      bundle_items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, photo: true, grade: true, subject: true },
          },
        },
      },
    },
  });
  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Compute RRP and savings
  const rrp = bundle.bundle_items.reduce((sum, item) => sum + Number(item.product.price), 0);
  return NextResponse.json({ ...bundle, rrp, savings: rrp - Number(bundle.price) });
}
