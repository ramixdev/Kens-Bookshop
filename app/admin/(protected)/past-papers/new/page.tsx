import { PastPaperForm } from "@/components/admin/PastPaperForm";

export default function NewPastPaperPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Past Paper</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Fill in all required fields then click Create.
        </p>
      </div>
      <PastPaperForm />
    </div>
  );
}
