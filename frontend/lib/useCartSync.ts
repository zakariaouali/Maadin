"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { useCartStore, type CartChange } from "@/store/cartStore";

/**
 * Reconciles the saved cart with the live catalogue once when a cart-related
 * page opens: current prices, stock and availability. Returns what changed so
 * the page can tell the customer (instead of a surprise total or a failure at
 * the very last checkout step).
 */
export function useCartSync() {
  const items = useCartStore((s) => s.items);
  const applyServerData = useCartStore((s) => s.applyServerData);
  const [changes, setChanges] = useState<CartChange[]>([]);
  const done = useRef(false);

  useEffect(() => {
    if (done.current || items.length === 0) return;
    done.current = true;

    api
      .post("/cart/status", { product_ids: items.map((i) => i.product_id) })
      .then((res) => {
        const found = applyServerData(res.data.products ?? []);
        if (found.length) setChanges(found);
      })
      .catch(() => {
        // Offline or API error: keep the saved cart; the server re-checks everything at checkout
        done.current = false;
      });
  }, [items, applyServerData]);

  return { changes, dismiss: () => setChanges([]) };
}
