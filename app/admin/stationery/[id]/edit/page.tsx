import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StationeryForm } from "@/components/admin/StationeryForm";
import type { StationeryInput } from "@/lib/schemas";

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
type StationeryType = (typeof STATIONERY_TYPES)[number];

export default async function EditStationeryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id, category: "stationery" } });
  if (!product) notFound();

  const defaultValues: Partial<StationeryInput> = {
    category: "stationery",
    name: product.name,
    photo: product.photo ?? "",
    price: Number(product.price),
    stock_qty: product.stock_qty,
    product_code: product.product_code,
    brand: product.brand ?? "",
    type: STATIONERY_TYPES.includes(product.type as StationeryType)
      ? (product.type as StationeryType)
      : undefined,
    availability: product.availability,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Stationery Item</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{product.name}</p>
      </div>
      <StationeryForm defaultValues={defaultValues} productId={id} />
    </div>
  );
}
