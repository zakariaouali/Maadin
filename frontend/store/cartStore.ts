"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  product_id: number;
  name: string;
  slug: string;
  price: number;
  image_path: string | null;
  seller_id: number;
  seller_name: string;
  stock_quantity: number;
  quantity: number;
}

export interface ServerCartProduct {
  id: number;
  price: number;
  stock_quantity: number;
  available: boolean;
}

/** What changed when the cart was reconciled with the server, for the notice shown to the customer */
export type CartChange =
  | { type: "removed"; name: string }
  | { type: "price"; name: string; price: number }
  | { type: "stock"; name: string; count: number };

interface CartStore {
  items: CartItem[];
  /** Bring saved prices/stock/availability up to date; returns what changed. */
  applyServerData: (products: ServerCartProduct[]) => CartChange[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (product_id: number) => void;
  updateQuantity: (product_id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.product_id === item.product_id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock_quantity) }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity }] });
        }
      },

      removeItem: (product_id) => {
        set({ items: get().items.filter((i) => i.product_id !== product_id) });
      },

      updateQuantity: (product_id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(product_id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product_id === product_id ? { ...i, quantity: Math.min(quantity, i.stock_quantity) } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      applyServerData: (products) => {
        const byId = new Map(products.map((p) => [p.id, p]));
        const changes: CartChange[] = [];
        const next: CartItem[] = [];

        for (const item of get().items) {
          const fresh = byId.get(item.product_id);

          // Gone, hidden or no longer buyable: take it out rather than fail at checkout
          if (!fresh || !fresh.available || fresh.stock_quantity < 1) {
            changes.push({ type: "removed", name: item.name });
            continue;
          }

          let updated = item;
          if (fresh.price !== item.price) {
            updated = { ...updated, price: fresh.price };
            changes.push({ type: "price", name: item.name, price: fresh.price });
          }
          if (fresh.stock_quantity !== item.stock_quantity) {
            updated = { ...updated, stock_quantity: fresh.stock_quantity };
            if (updated.quantity > fresh.stock_quantity) {
              updated = { ...updated, quantity: fresh.stock_quantity };
              changes.push({ type: "stock", name: item.name, count: fresh.stock_quantity });
            }
          }
          next.push(updated);
        }

        set({ items: next });
        return changes;
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "maadin-cart",
    }
  )
);