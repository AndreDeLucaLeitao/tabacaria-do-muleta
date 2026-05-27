import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES } from "@/lib/types";
import type { Product } from "@/lib/types";

export const revalidate = 30;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: featured } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const products = (featured ?? []) as Product[];

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(900px 500px at 10% 0%, rgba(198,255,61,0.18), transparent 60%), radial-gradient(700px 500px at 95% 100%, rgba(167,139,250,0.18), transparent 65%)",
          }}
        />
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-wood-700/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="stamp">⚡ Drop diário</span>
            <span className="stamp stamp-outline">Entrega rápida</span>
          </div>
          <h1 className="font-display max-w-4xl text-6xl leading-[0.95] tracking-tight text-cream-100 md:text-8xl">
            Cola na <span className="text-gold-500">Tabacaria</span>
            <br />
            <span className="text-cream-100">do Muleta.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-200/80">
            Tabaco, seda, isqueiro, cuia, piteira e tudo mais que rola.
            Pede pelo site e a gente leva. Sem complicação.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/produtos" className="btn-gold">Ver o catálogo →</Link>
            <Link href="/meu-pedido" className="btn-ghost">Acompanhar pedido</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl text-cream-100">Categorias</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-7">
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/produtos?cat=${c.value}`}
              className="card flex h-20 items-center justify-center px-3 text-center text-sm text-cream-200 transition hover:border-gold-600/60 hover:text-gold-500"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl text-cream-100">Novidades</h2>
          <Link href="/produtos" className="text-sm text-gold-500 hover:underline">
            Ver tudo →
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="card p-8 text-center text-cream-300/70">
            Nenhum produto cadastrado ainda. O dono ainda está abastecendo o catálogo.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
