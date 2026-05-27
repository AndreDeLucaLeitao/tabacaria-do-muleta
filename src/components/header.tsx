import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CartIndicator } from "./cart-indicator";
import { UserMenu } from "./user-menu";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let displayName = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
    displayName = profile?.full_name?.split(" ")[0] ?? "";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gold-600/15 bg-ink-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="font-display text-2xl tracking-wide text-cream-100">
            Tabacaria <span className="text-gold-600">do</span> Muleta
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-cream-200 md:flex">
          <Link href="/" className="hover:text-gold-500 transition">Início</Link>
          <Link href="/produtos" className="hover:text-gold-500 transition">Produtos</Link>
          <Link href="/meu-pedido" className="hover:text-gold-500 transition">Pedidos</Link>
        </nav>

        <div className="flex items-center gap-3">
          <CartIndicator />
          <UserMenu
            loggedIn={!!user}
            displayName={displayName}
            isAdmin={isAdmin}
            email={user?.email ?? ""}
          />
        </div>
      </div>
    </header>
  );
}
