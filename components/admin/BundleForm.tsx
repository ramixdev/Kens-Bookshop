"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { bundleSchema, type BundleInput } from "@/lib/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Loader2, Search } from "lucide-react";

const GRADES = [
  "KG1",
  "KG2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Grade 13",
];

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

type PickerTab = "book" | "stationery";

interface ItemOption {
  id: string;
  name: string;
  price: number;
  product_code: string;
  photo: string | null;
  /** Only set for book items */
  grade: string | null;
  /** Only set for stationery items */
  brand: string | null;
  /** Only set for stationery items */
  type: string | null;
  category: "book" | "stationery";
}

interface BundleFormProps {
  defaultValues?: Partial<BundleInput>;
  bundleId?: string;
  /** Pre-selected items for the edit flow */
  initialItems?: ItemOption[];
}

export function BundleForm({ defaultValues, bundleId, initialItems = [] }: BundleFormProps) {
  const router = useRouter();
  const isEdit = Boolean(bundleId);

  const [pickerTab, setPickerTab] = useState<PickerTab>("book");
  const [searchQuery, setSearchQuery] = useState("");
  const [stationeryTypeFilter, setStationeryTypeFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState(defaultValues?.grade ?? "");
  const [searchResults, setSearchResults] = useState<ItemOption[]>([]);
  const [selectedItems, setSelectedItems] = useState<ItemOption[]>(initialItems);
  const [searching, setSearching] = useState(false);

  const form = useForm({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      name: "",
      photo: "",
      price: 0,
      product_code: "",
      grade: "",
      availability: true,
      product_ids: initialItems.map((i) => i.id),
      ...defaultValues,
    },
  });

  // Keep product_ids in sync with selectedItems
  useEffect(() => {
    form.setValue(
      "product_ids",
      selectedItems.map((i) => i.id),
      { shouldValidate: true }
    );
  }, [selectedItems, form]);

  // Debounced search — re-runs whenever tab, query, or filters change
  const searchItems = useCallback(async () => {
    setSearching(true);
    try {
      const q = new URLSearchParams({
        category: pickerTab,
        ...(searchQuery && { search: searchQuery }),
        // Books: auto-filter by bundle grade
        ...(pickerTab === "book" && gradeFilter && { grade: gradeFilter }),
        // Stationery: filter by type if chosen
        ...(pickerTab === "stationery" && stationeryTypeFilter && { type: stationeryTypeFilter }),
        limit: "50",
      });
      const res = await fetch(`/api/admin/products?${q}`);
      if (!res.ok) return;
      const data = await res.json();
      // Map raw API rows to ItemOption shape
      setSearchResults(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.products as any[]).map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          product_code: p.product_code,
          photo: p.photo ?? null,
          grade: p.grade ?? null,
          brand: p.brand ?? null,
          type: p.type ?? null,
          category: p.category as "book" | "stationery",
        }))
      );
    } finally {
      setSearching(false);
    }
  }, [pickerTab, searchQuery, gradeFilter, stationeryTypeFilter]);

  useEffect(() => {
    const t = setTimeout(searchItems, 350);
    return () => clearTimeout(t);
  }, [searchItems]);

  // Reset search state when switching tabs
  const switchTab = (tab: PickerTab) => {
    setPickerTab(tab);
    setSearchQuery("");
    setStationeryTypeFilter("");
    setSearchResults([]);
  };

  const toggleItem = (item: ItemOption) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists ? prev.filter((i) => i.id !== item.id) : [...prev, item];
    });
  };

  const selectedIds = new Set(selectedItems.map((i) => i.id));
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.price, 0);
  const bundlePrice = Number(form.watch("price")) || 0;
  const savings = selectedTotal - bundlePrice;

  const onSubmit = async (values: BundleInput) => {
    try {
      const url = isEdit ? `/api/admin/bundles/${bundleId}` : "/api/admin/bundles";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.formErrors?.[0] ?? err?.error ?? "Save failed.");
      }

      toast.success(isEdit ? "Bundle updated." : "Bundle created.");
      router.push("/admin/offers");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        {/* Photo */}
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bundle Photo</FormLabel>
              <FormControl>
                <ImageUploader value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Bundle Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Grade 6 Booklist Bundle 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Grade */}
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <Select
                  onValueChange={(v) => {
                    field.onChange(v);
                    setGradeFilter(v);
                  }}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger id="bundle-grade-select">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Product Code */}
          <FormField
            control={form.control}
            name="product_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Code *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. BDL-G6-2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bundle Price (LKR) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Savings panel */}
        {selectedItems.length > 0 && (
          <div className="rounded-lg border border-[#854F0B]/30 bg-[#854F0B]/5 p-4 space-y-1">
            <p className="text-sm font-medium text-[#854F0B]">Bundle savings</p>
            <p className="text-sm text-muted-foreground">
              Sum of individual prices:{" "}
              <span className="font-medium text-foreground">
                LKR {selectedTotal.toLocaleString()}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Bundle price:{" "}
              <span className="font-medium text-foreground">
                LKR {bundlePrice.toLocaleString()}
              </span>
            </p>
            {savings > 0 && (
              <p className="text-sm font-semibold text-[#854F0B]">
                Customer saves: LKR {savings.toLocaleString()}
              </p>
            )}
            {savings <= 0 && bundlePrice > 0 && (
              <p className="text-xs text-destructive">
                Bundle price is higher than individual prices — no saving.
              </p>
            )}
          </div>
        )}

        {/* Item picker */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="product_ids"
            render={() => (
              <FormItem>
                <FormLabel>Select items for this bundle *</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selected items chips */}
          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                >
                  <span>{item.category === "book" ? "📗" : "🗂️"}</span>
                  {item.name}
                  <button
                    type="button"
                    onClick={() => toggleItem(item)}
                    className="hover:text-destructive ml-1"
                    aria-label={`Remove ${item.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Picker tabs */}
          <div className="flex gap-1 rounded-lg border border-border bg-muted p-1 w-fit">
            <button
              type="button"
              id="picker-tab-books"
              onClick={() => switchTab("book")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pickerTab === "book"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📗 Books
            </button>
            <button
              type="button"
              id="picker-tab-stationery"
              onClick={() => switchTab("stationery")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pickerTab === "stationery"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🗂️ Stationery
            </button>
          </div>

          {/* Search row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  pickerTab === "book"
                    ? "Search books by name or code…"
                    : "Search stationery by name or code…"
                }
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                id="bundle-item-search"
              />
            </div>
            {/* Stationery: type filter */}
            {pickerTab === "stationery" && (
              <select
                value={stationeryTypeFilter}
                onChange={(e) => setStationeryTypeFilter(e.target.value)}
                id="bundle-stationery-type-filter"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All types</option>
                {STATIONERY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Helper note: book tab grade auto-filter */}
          {pickerTab === "book" && gradeFilter && (
            <p className="text-xs text-muted-foreground">
              Showing books for <span className="font-medium">{gradeFilter}</span>. Change the
              bundle&apos;s grade above to browse a different grade.
            </p>
          )}
          {pickerTab === "stationery" && (
            <p className="text-xs text-muted-foreground">
              Stationery is not grade-specific — all items appear regardless of the bundle grade.
            </p>
          )}

          {/* Results */}
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
            {searching && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!searching && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                {searchQuery || (pickerTab === "book" ? gradeFilter : stationeryTypeFilter)
                  ? "No items match your search."
                  : `Start typing to search ${pickerTab === "book" ? "books" : "stationery"}.`}
              </p>
            )}
            {!searching &&
              searchResults.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => toggleItem(item)}
                    id={`item-check-${item.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product_code}
                      {item.category === "book" && item.grade && ` · ${item.grade}`}
                      {item.category === "stationery" && item.brand && ` · ${item.brand}`}
                      {item.category === "stationery" && item.type && ` · ${item.type}`}
                      {" · LKR "}
                      {Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </label>
              ))}
          </div>
        </div>

        {/* Availability */}
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <FormLabel className="text-base">Available for sale</FormLabel>
                <p className="text-sm text-muted-foreground">
                  When off, this bundle is hidden from the storefront.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="bundle-availability-switch"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting} id="bundle-form-submit">
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create bundle"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
