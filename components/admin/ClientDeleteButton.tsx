"use client";

import { useRouter } from "next/navigation";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

interface ClientDeleteButtonProps {
  productId: string;
  productName: string;
  /** Override the delete URL for bundles: /api/admin/bundles/:id */
  deleteUrl?: string;
}

export function ClientDeleteButton({ productId, productName, deleteUrl }: ClientDeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const url = deleteUrl ?? `/api/admin/products/${productId}`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error ?? "Delete failed.");
    }
    router.refresh();
  };

  return <DeleteConfirmDialog itemName={productName} onDelete={handleDelete} />;
}
