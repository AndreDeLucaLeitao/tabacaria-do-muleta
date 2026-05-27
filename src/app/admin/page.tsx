import { createClient } from "@/lib/supabase/server";
import { AdminOrderCard } from "./order-card";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "em_aberto")
    .order("created_at", { ascending: false });

  const list = (orders ?? []) as Order[];

  let itemsByOrder: Record<string, OrderItem[]> = {};
  if (list.length > 0) {
    const ids = list.map((o) => o.id);
    const { data: items } = await supabase.from("order_items").select("*").in("order_id", ids);
    (items as OrderItem[] | null)?.forEach((it) => {
      (itemsByOrder[it.order_id] ??= []).push(it);
    });
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl text-cream-100">Pedidos em aberto</h2>

      {list.length === 0 ? (
        <div className="card p-10 text-center text-cream-300/70">
          Nenhum pedido em aberto. Quando um cliente fechar pedido, ele aparece aqui.
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((o) => (
            <AdminOrderCard key={o.id} order={o} items={itemsByOrder[o.id] ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}
