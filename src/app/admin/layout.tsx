import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="card p-8">
          <h1 className="text-2xl text-cream-100">Acesso restrito</h1>
          <p className="mt-3 text-cream-300/80">
            Esta área é exclusiva do dono da loja. Se este é seu acesso, peça para
            promover sua conta no Supabase: <code className="text-gold-500">update profiles set role=&apos;admin&apos; where id = &apos;...&apos;</code>
          </p>
          <Link href="/" className="btn-ghost mt-6 inline-flex">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold-500">Painel admin</p>
          <h1 className="font-display text-3xl text-cream-100">Tabacaria do Muleta</h1>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/admin" className="btn-ghost">Pedidos</Link>
          <Link href="/admin/produtos" className="btn-ghost">Produtos</Link>
          <Link href="/admin/configuracoes" className="btn-ghost">Configurações</Link>
          <Link href="/" className="btn-ghost">Ver loja →</Link>
        </nav>
      </div>
      <div className="divider-gold mb-8" />
      {children}
    </div>
  );
}
