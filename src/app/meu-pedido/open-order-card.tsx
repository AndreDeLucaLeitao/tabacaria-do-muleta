"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export function OpenOrderCard({ order, items }: { order: Order; items: OrderItem[] }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(order.customer_confirmed);
  const [error, setError] = useState<string | null>(null);

  async function confirmReceipt() {
    setConfirming(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ customer_confirmed: true })
      .eq("id", order.id);
    if (error) {
      setError(error.message);
      setConfirming(false);
      return;
    }
    setConfirmed(true);
    setConfirming(false);
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-gold-600/10 p-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-500">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-cream-300/70">
            Feito em {new Date(order.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
        <span className="rounded-full border border-gold-600/40 px-3 py-1 text-xs text-gold-500">
          Em aberto
        </span>
      </div>

      <div className="space-y-2 p-5 text-sm">
        {items.map((it) => (
          <div key={it.id} className="flex justify-between text-cream-200/85">
            <span>
              {it.quantity}× {it.product_name}
            </span>
            <span>{formatBRL(it.unit_price_cents * it.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gold-600/10 p-5 text-sm">
        <Row label="Subtotal" value={formatBRL(order.subtotal_cents)} />
        <Row
          label="Frete"
          value={order.shipping_cents === 0 ? "Grátis" : formatBRL(order.shipping_cents)}
        />
        <Row
          label="Pagamento"
          value={order.payment_method === "pix" ? "Pix antecipado" : "Na entrega"}
        />
        <Row label="Endereço" value={order.address} />
        <div className="divider-gold my-3" />
        <div className="flex justify-between">
          <span className="text-cream-100">Total</span>
          <span className="font-semibold text-gold-500">{formatBRL(order.total_cents)}</span>
        </div>
      </div>

      <div className="border-t border-gold-600/10 bg-ink-800/40 p-5">
        {confirmed ? (
          <p className="text-sm text-cream-200">
            ✓ Você avisou que recebeu. Assim que o atendente confirmar, o pedido será encerrado.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-cream-300/80">
              Já recebeu o pedido? Clique no botão abaixo para avisar o atendente. Quem encerra o pedido é a loja.
            </p>
            <button onClick={confirmReceipt} className="btn-gold" disabled={confirming}>
              {confirming ? "Enviando…" : "Confirmar que recebi"}
            </button>
            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-cream-200/80">
      <span className="text-cream-300/70">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
