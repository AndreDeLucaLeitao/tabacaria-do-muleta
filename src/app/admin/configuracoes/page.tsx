import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";
import type { Settings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();

  return (
    <div>
      <h2 className="mb-6 text-2xl text-cream-100">Configurações</h2>
      <SettingsForm settings={data as Settings} />
    </div>
  );
}
