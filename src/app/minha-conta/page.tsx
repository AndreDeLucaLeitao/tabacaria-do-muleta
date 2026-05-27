import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "./account-form";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MinhaContaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/minha-conta");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const p = (profile as Profile | null) ?? null;
  const metadataName =
    (user.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <span className="stamp stamp-outline mb-4">Conta</span>
      <h1 className="font-display text-4xl text-cream-100">Minha conta</h1>
      <p className="mt-2 text-cream-300">
        Atualize seus dados — eles vão junto no seu próximo pedido.
      </p>

      {!p && (
        <div className="card mt-6 border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
          Não encontramos seu perfil ainda. Preencha abaixo pra finalizar o cadastro.
          {error && <span className="block text-xs opacity-70">({error.message})</span>}
        </div>
      )}

      <AccountForm
        userId={user.id}
        email={user.email ?? ""}
        initial={{
          full_name: p?.full_name ?? metadataName ?? "",
          phone: p?.phone ?? "",
          birth_date: p?.birth_date ?? "",
        }}
        isAdmin={p?.role === "admin"}
        hasExistingProfile={!!p}
      />
    </div>
  );
}
