"use client";
import { useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  quantity: number;
};

const STORAGE_KEY = "tabacaria.cart.v1";
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => []);
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const items = [...read()];
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
  } else {
    items.push({ ...item, quantity });
  }
  write(items);
}

export function setQuantity(id: string, quantity: number) {
  const items = read()
    .map((i) => (i.id === id ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  write(items);
}

export function removeFromCart(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function clearCart() {
  write([]);
}

export function cartSubtotalCents(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
