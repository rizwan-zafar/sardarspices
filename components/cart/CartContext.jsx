"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cheapestInStockVariant } from "@/lib/product";

const CartContext = createContext(null);
const STORAGE_KEY = "spicer_cart_v2";

function cartKey(item) {
  return item.variantId;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (product, quantity = 1, variant) => {
    const selected = variant || cheapestInStockVariant(product);
    if (!selected?.id) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === selected.id);
      const maxQty = Number(selected.stock);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxQty);
        return prev.map((i) =>
          i.variantId === selected.id ? { ...i, quantity: nextQty, stock: maxQty, price: Number(selected.price) } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: selected.id,
          name: product.name,
          variantName: selected.name,
          slug: product.slug,
          price: Number(selected.price),
          image: Array.isArray(product.images) ? product.images[0] : null,
          stock: maxQty,
          quantity: Math.min(quantity, maxQty),
        },
      ];
    });
  };

  const updateQuantity = (variantId, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        cartKey(i) === variantId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
          : i
      )
    );
  };

  const removeItem = (variantId) => {
    setItems((prev) => prev.filter((i) => cartKey(i) !== variantId));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const value = {
    items,
    hydrated,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
