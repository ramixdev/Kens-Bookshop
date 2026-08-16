"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);

      try {
        // 1. Get signed upload params from our API
        const sigRes = await fetch("/api/upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "products" }),
        });

        if (!sigRes.ok) throw new Error("Failed to get upload signature.");
        const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

        // 2. POST directly to Cloudinary (card data never touches our server)
        const form = new FormData();
        form.append("file", file);
        form.append("signature", signature);
        form.append("timestamp", String(timestamp));
        form.append("api_key", apiKey);
        form.append("folder", folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: form,
        });

        if (!uploadRes.ok) throw new Error("Upload to Cloudinary failed.");
        const data = await uploadRes.json();
        onChange(data.secure_url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) upload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const clear = () => onChange("");

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group">
          <Image src={value} alt="Product photo" fill className="object-cover" sizes="128px" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            "border-border hover:border-primary/50 hover:bg-primary/5",
            uploading && "opacity-50 pointer-events-none"
          )}
          onClick={() => document.getElementById("image-upload-input")?.click()}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground text-center">
                Drop image here or <span className="text-primary font-medium">click to upload</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG, WEBP up to 5 MB</p>
            </>
          )}
        </div>
      )}

      <input
        id="image-upload-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
