"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { digitsOnly } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings | null }) {
  const router = useRouter();
  const [shopName, setShopName] = useState(settings?.shop_name ?? "Tabacaria do Muleta");
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp_number ?? "");
  const [pixKey, setPixKey] = useState(settings?.pix_key ?? "");
  const [pixHolder, setPixHolder] = useState(settings?.pix_holder ?? "");
  const [shippingStr, setShippingStr] = useState(
    settings ? (settings.shipping_fee_cents / 100).toFixed(2).replace(".", ",") : "10,00",
  );
  const [thresholdStr, setThresholdStr] = useState(
    settings ? (settings.free_shipping_threshold_cents / 100).toFixed(2).replace(".", ",") : "100,00",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    const shipping = parseToCents(shippingStr);
    const threshold = parseToCents(thresholdStr);
    if (shipping == null || threshold == null) {
      setError("Valores de frete inválidos.");
      return;
    }
    const wa = digitsOnly(whatsapp);
    if (wa.length < 10) {
      setError("Número de WhatsApp inválido. Inclua DDD (e o código do país se quiser).");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("settings")
      .update({
        shop_name: shopName.trim(),
        whatsapp_number: wa,
        pix_key: pixKey.trim(),
        pix_holder: pixHolder.trim(),
        shipping_fee_cents: shipping,
        free_shipping_threshold_cents: threshold,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setOk(true);
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-5 p-6">
      <div>
        <label>Nome da loja</label>
        <input required value={shopName} onChange={(e) => setShopName(e.target.value)} />
      </div>

      <div>
        <label>WhatsApp do dono</label>
        <input
          required
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="5511912345678"
        />
        <p className="mt-1 text-xs text-cream-300/60">
          Pode ser com ou sem o 55 do Brasil. Só números, DDD obrigatório.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label>Frete (R$)</label>
          <input
            required
            inputMode="decimal"
            value={shippingStr}
            onChange={(e) => setShippingStr(e.target.value)}
          />
        </div>
        <div>
          <label>Frete grátis a partir de (R$)</label>
          <input
            required
            inputMode="decimal"
            value={thresholdStr}
            onChange={(e) => setThresholdStr(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label>Chave Pix</label>
          <input value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
        </div>
        <div>
          <label>Nome do titular</label>
          <input value={pixHolder} onChange={(e) => setPixHolder(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {ok && <p className="text-sm text-emerald-300">Configurações salvas.</p>}

      <button type="submit" className="btn-gold" disabled={saving}>
        {saving ? "Salvando…" : "Salvar configurações"}
      </button>
    </form>
  );
}

function parseToCents(value: string): number | null {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(parseFloat(normalized) * 100);
  return Number.isFinite(cents) && cents >= 0 ? cents : null;
}
