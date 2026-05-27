import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABEL } from "@/lib/types";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/format";

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
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-600/10 text-left text-cream-300/70">
                <th className="p-3 font-normal">Produto</th>
                <th className="p-3 font-normal">Categoria</th>
                <th className="p-3 font-normal">Preço</th>
                <th className="p-3 font-normal">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gold-600/5 last:border-b-0">
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
                  <td className="p-3 text-cream-300/80">
                    {CATEGORY_LABEL[p.category] ?? p.category}
                  </td>
                  <td className="p-3 text-gold-500">{formatBRL(p.price_cents)}</td>
                  <td className="p-3">
                    {p.active ? (
                      <span className="text-emerald-300">Ativo</span>
                    ) : (
                      <span className="text-cream-300/60">Oculto</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/produtos/${p.id}`} className="text-gold-500 hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
