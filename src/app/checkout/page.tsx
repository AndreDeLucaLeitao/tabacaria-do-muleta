import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./checkout-form";
import type { Settings, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="card p-8 text-cream-200">
          Seu perfil ainda não foi criado. Saia e faça login novamente.
        </p>
      </div>
    );
  }

  return (
    <CheckoutForm
      profile={profile as Profile}
      settings={settings as Settings}
    />
  );
}
