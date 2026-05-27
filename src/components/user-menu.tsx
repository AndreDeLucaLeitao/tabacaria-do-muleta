"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({
  loggedIn,
  displayName,
  isAdmin,
  email,
}: {
  loggedIn: boolean;
  displayName: string;
  isAdmin: boolean;
  email: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    setOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignora — o que importa é o servidor revogar a sessão abaixo
    }
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (!loggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="btn-ghost text-sm">
          Entrar
        </Link>
        <Link href="/cadastro" className="btn-gold text-sm">
          Cadastrar
        </Link>
      </div>
    );
  }

  const initial = (displayName || email || "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu da conta"
        className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-gold-500 to-gold-600 font-display text-base font-bold text-ink-900 transition hover:shadow-gold"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="card absolute right-0 mt-2 w-64 overflow-hidden p-2 text-sm shadow-2xl"
        >
          <div className="border-b border-white/5 px-3 py-2">
            <p className="truncate font-medium text-cream-100">{displayName || "Conta"}</p>
            <p className="truncate text-xs text-cream-300">{email}</p>
          </div>

          <MenuItem href="/minha-conta" onSelect={() => setOpen(false)} icon="👤">
            Minha conta
          </MenuItem>
          <MenuItem href="/meu-pedido" onSelect={() => setOpen(false)} icon="🧾">
            Pedidos
          </MenuItem>
          {isAdmin && (
            <MenuItem href="/admin" onSelect={() => setOpen(false)} icon="⚙️" accent>
              Painel admin
            </MenuItem>
          )}

          <div className="my-1 h-px bg-white/5" />

          <button
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-cream-100 transition hover:bg-rose-500/10 hover:text-rose-200 disabled:opacity-50"
          >
            <span aria-hidden>↩</span>
            <span>{loggingOut ? "Saindo…" : "Sair"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  onSelect,
  icon,
  children,
  accent,
}: {
  href: string;
  onSelect: () => void;
  icon: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      role="menuitem"
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/5 ${
        accent ? "text-gold-500 hover:text-gold-400" : "text-cream-100"
      }`}
    >
      <span aria-hidden>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
