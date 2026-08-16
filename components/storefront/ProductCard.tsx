import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  photo?: string | null;
  availability: boolean;
  stock_qty: number;
  href: string;
  badge?: string;
  /** Optional second line below name */
  subtitle?: string;
}

export function ProductCard({
  id,
  name,
  price,
  photo,
  availability,
  stock_qty,
  href,
  badge,
  subtitle,
}: ProductCardProps) {
  const inStock = availability && stock_qty > 0;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden",
        !inStock && "opacity-70"
      )}
      id={`product-card-${id}`}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <span className="text-4xl select-none">📚</span>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge variant="secondary" className="bg-background/80 text-muted-foreground">
              Out of stock
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {badge && (
          <span className="text-[10px] font-medium text-primary uppercase tracking-wide">
            {badge}
          </span>
        )}
        <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        {subtitle && <p className="text-xs text-muted-foreground line-clamp-1">{subtitle}</p>}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-sm font-semibold text-foreground">
            LKR {price.toLocaleString()}
          </span>
          {inStock && (
            <span className="text-[10px] text-[#27500A] font-medium">{stock_qty} left</span>
          )}
        </div>
      </div>
    </Link>
  );
}
