import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { ProductRow } from "./product-row";

export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl text-cream-100">Produtos</h2>
        <Link href="/admin/produtos/novo" className="btn-gold">
          + Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card p-10 text-center text-cream-300/70">
          Nenhum produto cadastrado ainda.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gold-600/10 text-left text-cream-300/70">
                <th className="p-3 font-normal">Produto</th>
                <th className="p-3 font-normal">Categoria</th>
                <th className="p-3 font-normal">Preço</th>
                <th className="p-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
