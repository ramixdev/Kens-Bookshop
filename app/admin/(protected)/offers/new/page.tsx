import { BundleForm } from "@/components/admin/BundleForm";

export default function NewOfferPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Bundle</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select books from the catalogue and set a discounted bundle price.
        </p>
      </div>
      <BundleForm />
    </div>
  );
}
