import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BundleForm } from "@/components/admin/BundleForm";
import type { BundleInput } from "@/lib/schemas";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await prisma.bundle.findUnique({
    where: { id },
    include: {
      bundle_items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              product_code: true,
              photo: true,
              grade: true,
            },
          },
        },
      },
    },
  });

  if (!bundle) notFound();

  const defaultValues: Partial<BundleInput> = {
    name: bundle.name,
    photo: bundle.photo ?? "",
    price: Number(bundle.price),
    product_code: bundle.product_code,
    grade: bundle.grade ?? "",
    availability: bundle.availability,
    product_ids: bundle.bundle_items.map((bi) => bi.product_id),
  };

  const initialBooks = bundle.bundle_items.map((bi) => ({
    id: bi.product.id,
    name: bi.product.name,
    price: Number(bi.product.price),
    product_code: bi.product.product_code,
    photo: bi.product.photo,
    grade: bi.product.grade,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Bundle</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{bundle.name}</p>
      </div>
      <BundleForm defaultValues={defaultValues} bundleId={id} initialBooks={initialBooks} />
    </div>
  );
}
