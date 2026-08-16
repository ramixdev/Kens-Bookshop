import { db as prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookForm } from "@/components/admin/BookForm";
import type { BookInput } from "@/lib/schemas";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id, category: "book" } });
  if (!product) notFound();

  const defaultValues: Partial<BookInput> = {
    category: "book",
    name: product.name,
    photo: product.photo ?? "",
    price: Number(product.price),
    stock_qty: product.stock_qty,
    product_code: product.product_code,
    isbn: product.isbn ?? "",
    author: product.author ?? "",
    grade: product.grade ?? "",
    subject: product.subject ?? "",
    availability: product.availability,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Book</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{product.name}</p>
      </div>
      <BookForm defaultValues={defaultValues} productId={id} />
    </div>
  );
}
