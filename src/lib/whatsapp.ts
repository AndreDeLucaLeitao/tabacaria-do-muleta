import { formatBRL, digitsOnly } from "./format";
import type { PaymentMethod } from "./types";

export function buildWhatsAppLink(phoneRaw: string, message: string) {
  const phone = digitsOnly(phoneRaw);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildOrderMessage(o: {
  shopName: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: { name: string; quantity: number; unit_price_cents: number }[];
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  payment_method: PaymentMethod;
  pix_key?: string;
  pix_holder?: string;
  notes?: string;
  orderShortId: string;
}) {
  const lines: string[] = [];
  lines.push(`🛒 *Novo pedido — ${o.shopName}*`);
  lines.push(`Código: #${o.orderShortId}`);
  lines.push("");
  lines.push(`*Cliente:* ${o.customerName}`);
  lines.push(`*Telefone:* ${o.customerPhone}`);
  lines.push(`*Endereço:* ${o.address}`);
  lines.push("");
  lines.push("*Itens:*");
  o.items.forEach((it) => {
    lines.push(
      `• ${it.quantity}× ${it.name} — ${formatBRL(it.unit_price_cents * it.quantity)}`,
    );
  });
  lines.push("");
  lines.push(`Subtotal: ${formatBRL(o.subtotal_cents)}`);
  lines.push(`Frete: ${o.shipping_cents === 0 ? "Grátis" : formatBRL(o.shipping_cents)}`);
  lines.push(`*Total: ${formatBRL(o.total_cents)}*`);
  lines.push("");
  if (o.payment_method === "pix") {
    lines.push("*Pagamento:* Pix antecipado");
    if (o.pix_key) {
      lines.push(`Chave Pix: ${o.pix_key}${o.pix_holder ? ` (${o.pix_holder})` : ""}`);
    }
  } else {
    lines.push("*Pagamento:* Na entrega");
  }
  if (o.notes) {
    lines.push("");
    lines.push(`*Observações:* ${o.notes}`);
  }
  return lines.join("\n");
}
