"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/password-input";
import { ageFrom, digitsOnly } from "@/lib/format";

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <CadastroForm />
    </Suspense>
  );
}

function CadastroForm() {
  const search = useSearchParams();
  const next = search.get("next") ?? "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Informe seu nome completo.");
    const phoneDigits = digitsOnly(phone);
    if (phoneDigits.length < 10) return setError("Telefone inválido. Use DDD + número.");
    if (password.length < 6) return setError("A senha precisa ter ao menos 6 caracteres.");

    const age = ageFrom(birthDate);
    if (age < 0) return setError("Data de nascimento inválida.");
    if (age < 18) return setError("Você precisa ter pelo menos 18 anos para se cadastrar.");

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (signUpError) {
      setError(traduzir(signUpError.message));
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("Não foi possível concluir o cadastro. Tente novamente.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName.trim(),
      phone: phoneDigits,
      birth_date: birthDate,
    });

    if (profileError) {
      setError(`Conta criada mas houve um erro ao salvar seu perfil: ${profileError.message}`);
      setLoading(false);
      return;
    }

    // Hard reload garante que o servidor (Header / middleware) reconheça a nova sessão.
    window.location.href = next;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <span className="stamp stamp-outline mb-4">Cadastro</span>
      <h1 className="font-display text-4xl text-cream-100">Cria sua conta.</h1>
      <p className="mt-2 text-cream-300">É rápido. Só pra gente saber quem tá pedindo.</p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6">
        <div>
          <label>Nome completo</label>
          <input
            required
            autoFocus
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label>E-mail</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
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
          <p className="mt-1 text-xs text-cream-300">
            Venda exclusiva para maiores de 18 anos.
          </p>
        </div>
        <div>
          <label>Senha</label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <button type="submit" className="btn-gold w-full" disabled={loading}>
          {loading ? "Criando conta…" : "Criar conta"}
        </button>
      </form>

      <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-widest text-cream-300/70">
        <div className="h-px flex-1 bg-white/10" />
        <span>Já tem conta?</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn-ghost w-full">
        Fazer login
      </Link>
    </div>
  );
}

function traduzir(msg: string) {
  if (/user already registered/i.test(msg)) return "Este e-mail já está cadastrado.";
  if (/password.*at least/i.test(msg)) return "Senha muito curta.";
  if (/invalid email/i.test(msg)) return "E-mail inválido.";
  if (/rate limit/i.test(msg)) return "Muitas tentativas. Espera um pouco e tenta de novo.";
  return msg;
}
