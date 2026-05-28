"use client";
import { useRouter } from "next/navigation";
import { CATEGORY_LABEL } from "@/lib/types";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export function ProductRow({ product: p }: { product: Product }) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/admin/produtos/${p.id}`)}
      className="cursor-pointer border-b border-gold-600/5 transition-colors last:border-b-0 hover:bg-gold-600/5"
    >
      <td className="p-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded bg-ink-800">
            {p.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <span className="text-cream-100">{p.name}</span>
        </div>
      </td>
      <td className="p-3 text-cream-300/80">{CATEGORY_LABEL[p.category] ?? p.category}</td>
      <td className="p-3 text-gold-500">{formatBRL(p.price_cents)}</td>
      <td className="p-3">
        {p.active ? (
          <span className="text-emerald-300">Ativo</span>
        ) : (
          <span className="text-cream-300/60">Oculto</span>
        )}
      </td>
    </tr>
  );
}
