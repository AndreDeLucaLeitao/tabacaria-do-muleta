"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ageFrom, digitsOnly } from "@/lib/format";

type Initial = {
  full_name: string;
  phone: string;
  birth_date: string;
};

export function AccountForm({
  userId,
  email,
  initial,
  isAdmin,
  hasExistingProfile,
}: {
  userId: string;
  email: string;
  initial: Initial;
  isAdmin: boolean;
  hasExistingProfile: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.full_name);
  const [phone, setPhone] = useState(formatPhone(initial.phone));
  const [birthDate, setBirthDate] = useState(initial.birth_date);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!fullName.trim()) return setError("Informe seu nome completo.");
    const phoneDigits = digitsOnly(phone);
    if (phoneDigits.length < 10) return setError("Telefone inválido. Use DDD + número.");

    const age = ageFrom(birthDate);
    if (age < 0) return setError("Data de nascimento inválida.");
    if (age < 18) return setError("Você precisa ter pelo menos 18 anos.");

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim(),
      phone: phoneDigits,
      birth_date: birthDate,
    });

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
    <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
      <div>
        <label>E-mail</label>
        <input value={email} disabled className="opacity-70" />
        <p className="mt-1 text-xs text-cream-300">
          O e-mail é fixo. Para mudar, fala com a gente no WhatsApp.
        </p>
      </div>

      <div>
        <label>Nome completo</label>
        <input
          required
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div>
        <label>WhatsApp</label>
        <input
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 91234-5678"
        />
      </div>

      <div>
        <label>Data de nascimento</label>
        <input
          type="date"
          required
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>

      {isAdmin && (
        <div className="rounded-xl border border-gold-500/30 bg-gold-500/5 px-4 py-3 text-sm text-gold-500">
          Você é administrador da loja.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {ok && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Dados salvos com sucesso.
        </div>
      )}

      <button type="submit" className="btn-gold w-full" disabled={saving}>
        {saving ? "Salvando…" : hasExistingProfile ? "Salvar alterações" : "Salvar cadastro"}
      </button>
    </form>
  );
}

function formatPhone(raw: string) {
  const d = digitsOnly(raw);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}
