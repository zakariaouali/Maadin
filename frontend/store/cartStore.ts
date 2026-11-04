"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** "Sur commande" products have no stock count; the cart still needs some cap per line */
export const MADE_TO_ORDER_MAX = 99;

export interface CartItem {
  product_id: number;
  name: string;
  slug: string;
  price: number;
  image_path: string | null;
  seller_id: number;
  seller_name: string;
  /** Cap for this line: real stock, or MADE_TO_ORDER_MAX for made-to-order products */
  stock_quantity: number;
  made_to_order?: boolean;
  quantity: number;
}

export interface ServerCartProduct {
  id: number;
  price: number;
  stock_quantity: number;
  is_made_to_order?: boolean;
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
          const freshCap = fresh?.is_made_to_order ? MADE_TO_ORDER_MAX : (fresh?.stock_quantity ?? 0);

          // Gone, hidden or no longer buyable: take it out rather than fail at checkout
          if (!fresh || !fresh.available || freshCap < 1) {
            changes.push({ type: "removed", name: item.name });
            continue;
          }

          let updated = item;
          if (fresh.price !== item.price) {
            updated = { ...updated, price: fresh.price };
            changes.push({ type: "price", name: item.name, price: fresh.price });
          }
          if (!!fresh.is_made_to_order !== !!item.made_to_order) {
            updated = { ...updated, made_to_order: !!fresh.is_made_to_order };
          }
          if (freshCap !== item.stock_quantity) {
            updated = { ...updated, stock_quantity: freshCap };
            if (updated.quantity > freshCap) {
              updated = { ...updated, quantity: freshCap };
              changes.push({ type: "stock", name: item.name, count: freshCap });
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