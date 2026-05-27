import Link from "next/link";
import type { Product } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/produtos/${product.id}`}
      className="card group flex flex-col overflow-hidden transition hover:border-gold-600/50"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-ink-800">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-cream-300/30">
            <span className="font-display text-4xl">M</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[10px] uppercase tracking-widest text-gold-500/80">
          {CATEGORY_LABEL[product.category] ?? product.category}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-cream-100">{product.name}</p>
        <p className="mt-auto pt-2 text-lg font-semibold text-gold-500">
          {formatBRL(product.price_cents)}
        </p>
      </div>
    </Link>
  );
}
