"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/types";
import type { Category, Product } from "@/lib/types";

type Props = { mode: "create" } | { mode: "edit"; product: Product };

export function ProductForm(props: Props) {
  const router = useRouter();
  const existing = props.mode === "edit" ? props.product : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [category, setCategory] = useState<Category>(
    (existing?.category as Category) ?? "tabaco",
  );
  const [priceStr, setPriceStr] = useState(
    existing ? (existing.price_cents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? "");
  const [active, setActive] = useState(existing?.active ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadIfNeeded(): Promise<string | null> {
    if (!file) return imageUrl || null;
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("products")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceCents = parsePriceToCents(priceStr);
    if (priceCents == null) {
      setError("Preço inválido.");
      return;
    }
    if (!name.trim()) {
      setError("Informe o nome.");
      return;
    }

    setSubmitting(true);
    try {
      const finalImageUrl = await uploadIfNeeded();
      const supabase = createClient();

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        category,
        price_cents: priceCents,
        image_url: finalImageUrl,
        active,
      };

      if (props.mode === "create") {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").update(payload).eq("id", existing!.id);
        if (error) throw error;
      }
      router.push("/admin/produtos");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (props.mode !== "edit") return;
    if (!confirm("Remover este produto?")) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", existing!.id);
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-5 p-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div>
          <label>Nome</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Descrição</label>
          <textarea
            rows={4}
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label>Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Preço (R$)</label>
            <input
              required
              inputMode="decimal"
              placeholder="0,00"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
            />
          </div>
        </div>
        <label className="flex items-center gap-3 normal-case tracking-normal text-cream-200">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="!w-auto"
          />
          Produto visível na loja
        </label>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-gold" disabled={submitting}>
            {submitting ? "Salvando…" : props.mode === "create" ? "Criar produto" : "Salvar alterações"}
          </button>
          {props.mode === "edit" && (
            <button
              type="button"
              onClick={onDelete}
              className="btn-danger"
              disabled={submitting}
            >
              Remover
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label>Foto</label>
        <div className="card flex aspect-square items-center justify-center overflow-hidden">
          {file ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-4xl text-cream-300/30">M</span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-cream-300/60">
          A foto vai pro bucket público <code>products</code> do Supabase.
        </p>
      </div>
    </form>
  );
}

function parsePriceToCents(value: string): number | null {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(parseFloat(normalized) * 100);
  return Number.isFinite(cents) && cents >= 0 ? cents : null;
}
