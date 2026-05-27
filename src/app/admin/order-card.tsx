"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatBRL, digitsOnly } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export function AdminOrderCard({ order, items }: { order: Order; items: OrderItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<null | "deliver" | "cancel">(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: "entregue" | "cancelado") {
    setLoading(status === "entregue" ? "deliver" : "cancel");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status, closed_at: new Date().toISOString() })
      .eq("id", order.id);
    if (error) {
      setError(error.message);
      setLoading(null);
      return;
    }
    router.refresh();
  }

  const phone = digitsOnly(order.customer_phone);
  const waLink = `https://wa.me/55${phone}`;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold-600/10 p-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-500">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-cream-300/70">
            {new Date(order.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {order.customer_confirmed && (
            <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-xs text-emerald-300">
              Cliente avisou que recebeu ✓
            </span>
          )}
          <span className="rounded-full border border-gold-600/40 px-3 py-1 text-xs text-gold-500">
            {order.payment_method === "pix" ? "Pix antecipado" : "Pagamento na entrega"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div>
          <h3 className="text-sm uppercase tracking-widest text-cream-300/70">Cliente</h3>
          <p className="mt-1 text-cream-100">{order.customer_name}</p>
          <p className="text-sm text-cream-200/80">
            <a href={waLink} target="_blank" className="hover:text-gold-500">
              {order.customer_phone} · abrir no WhatsApp
            </a>
          </p>
          <h3 className="mt-4 text-sm uppercase tracking-widest text-cream-300/70">Endereço</h3>
          <p className="mt-1 whitespace-pre-line text-cream-200/80">{order.address}</p>
          {order.notes && (
            <>
              <h3 className="mt-4 text-sm uppercase tracking-widest text-cream-300/70">
                Observações
              </h3>
              <p className="mt-1 whitespace-pre-line text-cream-200/80">{order.notes}</p>
            </>
          )}
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-widest text-cream-300/70">Itens</h3>
          <div className="mt-2 space-y-1 text-sm">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-cream-200/85">
                <span>
                  {it.quantity}× {it.product_name}
                </span>
                <span>{formatBRL(it.unit_price_cents * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="divider-gold my-3" />
          <div className="space-y-1 text-sm">
            <Row label="Subtotal" value={formatBRL(order.subtotal_cents)} />
            <Row
              label="Frete"
              value={order.shipping_cents === 0 ? "Grátis" : formatBRL(order.shipping_cents)}
            />
            <div className="flex justify-between pt-1 text-base">
              <span className="text-cream-100">Total</span>
              <span className="font-semibold text-gold-500">{formatBRL(order.total_cents)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold-600/10 bg-ink-800/40 p-5">
        {error && <p className="w-full text-sm text-red-300">{error}</p>}
        <button
          onClick={() => setStatus("cancelado")}
          className="btn-danger"
          disabled={!!loading}
        >
          {loading === "cancel" ? "Cancelando…" : "Cancelar pedido"}
        </button>
        <button
          onClick={() => setStatus("entregue")}
          className="btn-gold"
          disabled={!!loading}
        >
          {loading === "deliver" ? "Confirmando…" : "Confirmar entrega e encerrar"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-cream-200/80">
      <span className="text-cream-300/70">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
