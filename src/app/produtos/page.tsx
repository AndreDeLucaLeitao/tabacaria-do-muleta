import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES } from "@/lib/types";
import type { Category, Product } from "@/lib/types";
import { SortSelect } from "./sort-select";
import { parseSortField, parseSortDir } from "./sort";

export const revalidate = 30;

function buildHref(params: { cat?: string; sort?: string; dir?: string }) {
  const qs = new URLSearchParams();
  if (params.cat) qs.set("cat", params.cat);
  if (params.sort) qs.set("sort", params.sort);
  if (params.dir) qs.set("dir", params.dir);
  const s = qs.toString();
  return s ? `/produtos?${s}` : "/produtos";
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; sort?: string; dir?: string }>;
}) {
  const { cat, q, sort, dir } = await searchParams;
  const sortField = parseSortField(sort);
  const sortDir = parseSortDir(dir);
  const ascending = sortDir === "asc";

  const supabase = await createClient();
  let query = supabase.from("products").select("*").eq("active", true);

  const validCat = CATEGORIES.find((c) => c.value === cat)?.value as Category | undefined;
  if (validCat) query = query.eq("category", validCat);
  if (q && q.trim()) query = query.ilike("name", `%${q.trim()}%`);

  query = query.order(sortField, { ascending });
  // Desempate estável: quando ordena por preço, dentro do mesmo preço usa nome A→Z
  if (sortField === "price_cents") query = query.order("name", { ascending: true });

  const { data } = await query;
  const products = (data ?? []) as Product[];

  const sharedHref = { sort: sortField, dir: sortDir };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 font-display text-4xl text-cream-100">Produtos</h1>
      <p className="mb-8 text-sm text-cream-300">
        {validCat
          ? `Categoria: ${CATEGORIES.find((c) => c.value === validCat)?.label}`
          : "Todo o catálogo da loja."}
      </p>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref(sharedHref)}
            className={`btn-ghost text-sm ${!validCat ? "border-gold-500 text-gold-500" : ""}`}
          >
            Tudo
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={buildHref({ ...sharedHref, cat: c.value })}
              className={`btn-ghost text-sm ${validCat === c.value ? "border-gold-500 text-gold-500" : ""}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <SortSelect currentField={sortField} currentDir={sortDir} />
      </div>

      {products.length === 0 ? (
        <div className="card p-8 text-center text-cream-300">
          Nenhum produto encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
