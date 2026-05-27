import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CATEGORY_LABEL } from "@/lib/types";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export const revalidate = 30;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) notFound();
  const product = data as Product;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/produtos" className="text-sm text-gold-500 hover:underline">
        ← Voltar
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="card aspect-square overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-cream-300/30">
              <span className="font-display text-6xl">M</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold-500">
            {CATEGORY_LABEL[product.category] ?? product.category}
          </p>
          <h1 className="mt-2 text-3xl text-cream-100">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-gold-500">
            {formatBRL(product.price_cents)}
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-cream-200/85">{product.description}</p>
          )}

          <div className="mt-8">
            <AddToCartButton
              item={{
                id: product.id,
                name: product.name,
                price_cents: product.price_cents,
                image_url: product.image_url,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
