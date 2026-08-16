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

interface BookOption {
  id: string;
  name: string;
  price: number;
  product_code: string;
  photo: string | null;
  grade: string | null;
}

interface BundleFormProps {
  defaultValues?: Partial<BundleInput>;
  bundleId?: string;
  /** Pre-selected books for the edit flow */
  initialBooks?: BookOption[];
}

export function BundleForm({ defaultValues, bundleId, initialBooks = [] }: BundleFormProps) {
  const router = useRouter();
  const isEdit = Boolean(bundleId);

  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState(defaultValues?.grade ?? "");
  const [searchResults, setSearchResults] = useState<BookOption[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<BookOption[]>(initialBooks);
  const [searching, setSearching] = useState(false);

  const form = useForm<BundleInput>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      name: "",
      photo: "",
      price: 0,
      product_code: "",
      grade: "",
      availability: true,
      product_ids: initialBooks.map((b) => b.id),
      ...defaultValues,
    },
  });

  // Keep product_ids in sync with selectedBooks
  useEffect(() => {
    form.setValue(
      "product_ids",
      selectedBooks.map((b) => b.id),
      { shouldValidate: true }
    );
  }, [selectedBooks, form]);

  // Debounced book search
  const searchBooks = useCallback(async () => {
    setSearching(true);
    try {
      const q = new URLSearchParams({
        category: "book",
        ...(searchQuery && { search: searchQuery }),
        ...(gradeFilter && { grade: gradeFilter }),
        limit: "50",
      });
      const res = await fetch(`/api/admin/products?${q}`);
      if (!res.ok) return;
      const data = await res.json();
      setSearchResults(data.products as BookOption[]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, gradeFilter]);

  useEffect(() => {
    const t = setTimeout(searchBooks, 350);
    return () => clearTimeout(t);
  }, [searchBooks]);

  const toggleBook = (book: BookOption) => {
    setSelectedBooks((prev) => {
      const exists = prev.find((b) => b.id === book.id);
      return exists ? prev.filter((b) => b.id !== book.id) : [...prev, book];
    });
  };

  const selectedIds = new Set(selectedBooks.map((b) => b.id));
  const selectedTotal = selectedBooks.reduce((sum, b) => sum + b.price, 0);
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
        throw new Error(err?.error?.formErrors?.[0] ?? "Save failed.");
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
                  <Input type="number" min={0} step={1} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Savings panel */}
        {selectedBooks.length > 0 && (
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

        {/* Book picker */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="product_ids"
            render={() => (
              <FormItem>
                <FormLabel>Select Books *</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selected books chips */}
          {selectedBooks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedBooks.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                >
                  {b.name}
                  <button
                    type="button"
                    onClick={() => toggleBook(b)}
                    className="hover:text-destructive ml-1"
                    aria-label={`Remove ${b.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books by name or code…"
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                id="bundle-book-search"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
            {searching && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!searching && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                {searchQuery || gradeFilter
                  ? "No books match your search."
                  : "Start typing to search books."}
              </p>
            )}
            {!searching &&
              searchResults.map((book) => (
                <label
                  key={book.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.has(book.id)}
                    onCheckedChange={() => toggleBook(book)}
                    id={`book-check-${book.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{book.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {book.product_code} · {book.grade ?? "—"} · LKR{" "}
                      {Number(book.price).toLocaleString()}
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
