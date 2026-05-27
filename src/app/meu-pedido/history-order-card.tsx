"use client";
import { useState } from "react";
import { formatBRL } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export function HistoryOrderCard({ order, items }: { order: Order; items: OrderItem[] }) {
  const [open, setOpen] = useState(false);
  const delivered = order.status === "entregue";
  const closedAt = order.closed_at ? new Date(order.closed_at) : new Date(order.created_at);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-white/5"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span
            className={`stamp ${delivered ? "" : "stamp-oxblood"}`}
            aria-label={`Status: ${delivered ? "Entregue" : "Cancelado"}`}
          >
            {delivered ? "Entregue" : "Cancelado"}
          </span>
          <div className="text-sm">
            <p className="text-cream-100">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-cream-300">
              {closedAt.toLocaleDateString("pt-BR")} ·{" "}
              {items.length} {items.length === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-lg text-gold-500">
            {formatBRL(order.total_cents)}
          </span>
          <span aria-hidden className={`text-cream-300 transition ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/5 p-4 text-sm">
          <div className="space-y-1.5">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-cream-200">
                <span>
                  {it.quantity}× {it.product_name}
                </span>
                <span>{formatBRL(it.unit_price_cents * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="divider-gold my-3" />

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
          {order.notes && <Row label="Observações" value={order.notes} />}
          <Row
            label="Feito em"
            value={new Date(order.created_at).toLocaleString("pt-BR")}
          />
          {order.closed_at && (
            <Row
              label={delivered ? "Entregue em" : "Cancelado em"}
              value={new Date(order.closed_at).toLocaleString("pt-BR")}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-cream-200">
      <span className="text-cream-300">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
