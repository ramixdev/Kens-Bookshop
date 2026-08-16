import { db as prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PastPaperForm } from "@/components/admin/PastPaperForm";
import type { PastPaperInput } from "@/lib/schemas";

export default async function EditPastPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id, category: "past_paper" } });
  if (!product) notFound();

  const defaultValues: Partial<PastPaperInput> = {
    category: "past_paper",
    name: product.name,
    photo: product.photo ?? "",
    price: Number(product.price),
    stock_qty: product.stock_qty,
    product_code: product.product_code,
    grade: product.grade ?? "",
    subject: product.subject ?? "",
    availability: product.availability,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Past Paper</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{product.name}</p>
      </div>
      <PastPaperForm defaultValues={defaultValues} productId={id} />
    </div>
  );
}
