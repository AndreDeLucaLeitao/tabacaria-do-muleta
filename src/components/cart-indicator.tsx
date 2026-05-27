"use client";
import Link from "next/link";
import { useCart, cartCount } from "@/lib/cart";

export function CartIndicator() {
  const items = useCart();
  const count = cartCount(items);
  return (
    <Link
      href="/carrinho"
      className="relative inline-flex items-center justify-center rounded-md border border-gold-600/30 px-3 py-2 text-sm text-cream-200 transition hover:border-gold-600/70"
      aria-label="Carrinho"
    >
      <span aria-hidden>🛒</span>
      <span className="ml-2 hidden sm:inline">Carrinho</span>
      {count > 0 && (
        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-600 px-1.5 text-[11px] font-bold text-ink-900">
          {count}
        </span>
      )}
    </Link>
  );
}
