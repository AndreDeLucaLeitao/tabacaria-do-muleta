import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OpenOrderCard } from "./open-order-card";
import { HistoryOrderCard } from "./history-order-card";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MeusPedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/meu-pedido");

  const { data: rawOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const orders = (rawOrders ?? []) as Order[];
  const openOrders = orders.filter((o) => o.status === "em_aberto");
  const historyOrders = orders.filter((o) => o.status !== "em_aberto");

  // Itens de todos os pedidos numa só consulta
  let itemsByOrder: Record<string, OrderItem[]> = {};
  if (orders.length > 0) {
    const ids = orders.map((o) => o.id);
    const { data: items } = await supabase.from("order_items").select("*").in("order_id", ids);
    (items as OrderItem[] | null)?.forEach((it) => {
      (itemsByOrder[it.order_id] ??= []).push(it);
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <span className="stamp stamp-outline mb-4">Pedidos</span>
      <h1 className="font-display text-4xl text-cream-100">Meus pedidos</h1>
      <p className="mt-2 text-cream-300">
        Tudo que você já pediu por aqui — em andamento e fechados.
      </p>

      {/* Seção: Em andamento */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg uppercase tracking-widest text-cream-300">Em andamento</h2>
        {openOrders.length === 0 ? (
          <div className="card p-8 text-center text-cream-300">
            Nenhum pedido em aberto agora.
            <div className="mt-4">
              <Link href="/produtos" className="btn-gold inline-flex">Ver produtos</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {openOrders.map((o) => (
              <OpenOrderCard key={o.id} order={o} items={itemsByOrder[o.id] ?? []} />
            ))}
          </div>
        )}
      </section>

      {/* Seção: Histórico */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg uppercase tracking-widest text-cream-300">Histórico</h2>
        {historyOrders.length === 0 ? (
          <p className="text-sm text-cream-300">Você ainda não tem pedidos fechados.</p>
        ) : (
          <div className="space-y-3">
            {historyOrders.map((o) => (
              <HistoryOrderCard key={o.id} order={o} items={itemsByOrder[o.id] ?? []} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
