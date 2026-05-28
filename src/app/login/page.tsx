"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(traduzir(error.message));
      setLoading(false);
      return;
    }
    // Hard reload garante que o servidor (Header / middleware) reconheça a nova sessão.
    window.location.href = next;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <span className="stamp stamp-outline mb-4">Entrar</span>
      <h1 className="font-display text-4xl text-cream-100">Bem-vindo de volta.</h1>
      <p className="mt-2 text-cream-300">Entra com sua conta pra finalizar o pedido.</p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6">
        <div>
          <label>E-mail</label>
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
          />
        </div>
        <div>
          <label>Senha</label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <button type="submit" className="btn-gold w-full" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-widest text-cream-300/70">
        <div className="h-px flex-1 bg-white/10" />
        <span>Novo por aqui?</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Link
        href={`/cadastro?next=${encodeURIComponent(next)}`}
        className="btn-ghost w-full"
      >
        Criar uma conta
      </Link>
    </div>
  );
}

function traduzir(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "E-mail ou senha inválidos.";
  if (/email not confirmed/i.test(msg)) return "E-mail ainda não confirmado.";
  if (/rate limit/i.test(msg)) return "Muitas tentativas. Espera um pouco e tenta de novo.";
  return msg;
}
