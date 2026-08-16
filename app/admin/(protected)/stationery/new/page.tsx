import { StationeryForm } from "@/components/admin/StationeryForm";

export default function NewStationeryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Stationery Item</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Fill in all required fields then click Create.
        </p>
      </div>
      <StationeryForm />
    </div>
  );
}
