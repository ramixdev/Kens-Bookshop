import { BookForm } from "@/components/admin/BookForm";

export default function NewBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add Book</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Fill in all required fields then click Create.
        </p>
      </div>
      <BookForm />
    </div>
  );
}
