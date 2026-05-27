"use client";
import { useState } from "react";
import { addToCart, type CartItem } from "@/lib/cart";

export function AddToCartButton({ item }: { item: Omit<CartItem, "quantity"> }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function onAdd() {
    addToCart(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center overflow-hidden rounded-md border border-gold-600/30">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-cream-200 hover:bg-gold-600/10"
          aria-label="Diminuir"
        >
          −
        </button>
        <span className="min-w-10 px-2 text-center font-medium text-cream-100">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="px-3 py-2 text-cream-200 hover:bg-gold-600/10"
          aria-label="Aumentar"
        >
          +
        </button>
      </div>
      <button onClick={onAdd} className="btn-gold">
        {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
