"use client";
import Link from "next/link";
import { useCart, cartSubtotalCents, setQuantity, removeFromCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";

export default function CarrinhoPage() {
  const items = useCart();
  const subtotal = cartSubtotalCents(items);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-3xl text-cream-100">Carrinho</h1>

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-cream-200/80">Seu carrinho está vazio.</p>
          <Link href="/produtos" className="btn-gold mt-6 inline-flex">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="card divide-y divide-gold-600/10">
            {items.map((it) => (
              <div key={it.id} className="flex gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-ink-800">
                  {it.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-cream-100">{it.name}</p>
                  <p className="text-sm text-gold-500">{formatBRL(it.price_cents)}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center overflow-hidden rounded-md border border-gold-600/30 text-sm">
                      <button
                        onClick={() => setQuantity(it.id, it.quantity - 1)}
                        className="px-3 py-1 text-cream-200 hover:bg-gold-600/10"
                      >
                        −
                      </button>
                      <span className="min-w-8 px-2 text-center text-cream-100">{it.quantity}</span>
                      <button
                        onClick={() => setQuantity(it.id, it.quantity + 1)}
                        className="px-3 py-1 text-cream-200 hover:bg-gold-600/10"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(it.id)}
                      className="text-xs text-cream-300/60 hover:text-red-300"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div className="text-right text-cream-100">
                  {formatBRL(it.price_cents * it.quantity)}
                </div>
              </div>
            ))}
          </div>

          <aside className="card h-fit p-5">
            <h2 className="mb-4 text-lg text-cream-100">Resumo</h2>
            <div className="flex justify-between text-sm text-cream-200/80">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-cream-300/60">
              Frete calculado no checkout.
            </p>
            <Link href="/checkout" className="btn-gold mt-6 w-full">
              Finalizar pedido
            </Link>
            <Link href="/produtos" className="mt-2 block text-center text-sm text-cream-300/70 hover:text-gold-500">
              Continuar comprando
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
