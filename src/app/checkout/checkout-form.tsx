"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, cartSubtotalCents, clearCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { formatBRL, digitsOnly } from "@/lib/format";
import { buildWhatsAppLink, buildOrderMessage } from "@/lib/whatsapp";
import type { PaymentMethod, Profile, Settings } from "@/lib/types";

export function CheckoutForm({
  profile,
  settings,
}: {
  profile: Profile;
  settings: Settings;
}) {
  const router = useRouter();
  const items = useCart();
  const subtotal = cartSubtotalCents(items);

  const shipping = useMemo(() => {
    if (!settings) return 0;
    if (subtotal >= settings.free_shipping_threshold_cents) return 0;
    return settings.shipping_fee_cents;
  }, [settings, subtotal]);

  const total = subtotal + shipping;

  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("entrega");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="card p-8 text-cream-200">Seu carrinho está vazio.</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!address.trim()) {
      setError("Informe o endereço de entrega.");
      return;
    }
    if (!settings?.whatsapp_number) {
      setError("A loja ainda não configurou o WhatsApp. Avise o atendente.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sua sessão expirou. Faça login novamente.");
      setSubmitting(false);
      return;
    }

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: user.id,
        customer_name: profile.full_name,
        customer_phone: profile.phone,
        address: address.trim(),
        payment_method: payment,
        shipping_cents: shipping,
        subtotal_cents: subtotal,
        total_cents: total,
        notes: notes.trim() || null,
      })
      .select("*")
      .single();

    if (orderError || !orderRow) {
      setError(orderError?.message ?? "Não foi possível criar o pedido.");
      setSubmitting(false);
      return;
    }

    const itemsPayload = items.map((it) => ({
      order_id: orderRow.id,
      product_id: it.id,
      product_name: it.name,
      unit_price_cents: it.price_cents,
      quantity: it.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);
    if (itemsError) {
      setError(itemsError.message);
      setSubmitting(false);
      return;
    }

    const message = buildOrderMessage({
      shopName: settings.shop_name,
      customerName: profile.full_name,
      customerPhone: profile.phone,
      address: address.trim(),
      items: items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        unit_price_cents: it.price_cents,
      })),
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: total,
      payment_method: payment,
      pix_key: settings.pix_key,
      pix_holder: settings.pix_holder,
      notes: notes.trim() || undefined,
      orderShortId: orderRow.id.slice(0, 8).toUpperCase(),
    });

    const link = buildWhatsAppLink(settings.whatsapp_number, message);
    clearCart();
    if (typeof window !== "undefined") window.open(link, "_blank");
    router.push("/meu-pedido");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl text-cream-100">Finalizar pedido</h1>

      <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 text-lg text-cream-100">Seus dados</h2>
            <p className="text-sm text-cream-200/80">{profile.full_name}</p>
            <p className="text-sm text-cream-300/70">{formatPhone(profile.phone)}</p>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-lg text-cream-100">Endereço de entrega</h2>
            <textarea
              required
              rows={3}
              placeholder="Rua, número, complemento, bairro, ponto de referência"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-lg text-cream-100">Pagamento</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                value="entrega"
                current={payment}
                onChange={setPayment}
                title="Na entrega"
                subtitle="Dinheiro, Pix ou cartão na hora"
              />
              <PaymentOption
                value="pix"
                current={payment}
                onChange={setPayment}
                title="Pix antecipado"
                subtitle={
                  settings.pix_key
                    ? "Você recebe a chave após confirmar"
                    : "Chave Pix será passada no WhatsApp"
                }
              />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-2 text-lg text-cream-100">Observações</h2>
            <p className="mb-3 text-xs text-cream-300/60">
              Algum detalhe que o atendente precise saber? (opcional)
            </p>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: trocar a essência X pela Y se faltar"
            />
          </div>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-lg text-cream-100">Resumo</h2>

          <div className="space-y-2 text-sm">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-cream-200/80">
                <span>
                  {it.quantity}× {it.name}
                </span>
                <span>{formatBRL(it.price_cents * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="divider-gold my-4" />

          <div className="flex justify-between text-sm text-cream-200/80">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-cream-200/80">
            <span>Frete</span>
            <span>{shipping === 0 ? "Grátis" : formatBRL(shipping)}</span>
          </div>
          {shipping === 0 && subtotal > 0 && (
            <p className="mt-1 text-xs text-gold-500">
              Frete grátis acima de {formatBRL(settings.free_shipping_threshold_cents)}
            </p>
          )}

          <div className="divider-gold my-4" />

          <div className="flex justify-between text-lg">
            <span className="text-cream-100">Total</span>
            <span className="font-semibold text-gold-500">{formatBRL(total)}</span>
          </div>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          <button type="submit" className="btn-gold mt-6 w-full" disabled={submitting}>
            {submitting ? "Enviando…" : "Enviar pedido pelo WhatsApp"}
          </button>
          <p className="mt-2 text-center text-xs text-cream-300/60">
            Vamos abrir o WhatsApp da loja com seu pedido pré-preenchido.
          </p>
        </aside>
      </form>
    </div>
  );
}

function PaymentOption({
  value,
  current,
  onChange,
  title,
  subtitle,
}: {
  value: PaymentMethod;
  current: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
  title: string;
  subtitle: string;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`rounded-lg border p-3 text-left transition ${
        active
          ? "border-gold-500 bg-gold-600/10"
          : "border-gold-600/20 hover:border-gold-600/50"
      }`}
    >
      <p className="text-cream-100">{title}</p>
      <p className="text-xs text-cream-300/70">{subtitle}</p>
    </button>
  );
}

function formatPhone(raw: string) {
  const d = digitsOnly(raw);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}
