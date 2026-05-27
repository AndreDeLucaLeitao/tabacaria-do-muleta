import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-gold-500">404</p>
      <h1 className="mt-3 font-display text-4xl text-cream-100">Página não encontrada</h1>
      <p className="mt-3 text-cream-300/80">
        O link que você seguiu não existe ou foi removido.
      </p>
      <Link href="/" className="btn-gold mt-8 inline-flex">Voltar ao início</Link>
    </div>
  );
}
