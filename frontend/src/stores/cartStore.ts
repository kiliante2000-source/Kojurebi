import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, PrintEdition, PrintSize, Product } from '../types/shop';
import { shippingCentsFor } from '../utils/money';
import {
  cartKey,
  defaultPrintEdition,
  defaultPrintSize,
  printLineTitle,
  productEditions,
  productSizes,
} from '../utils/print';

type CartState = {
  items: CartItem[];
  add: (product: Product, quantity?: number, size?: PrintSize, edition?: PrintEdition) => void;
  setQty: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, quantity = 1, size, edition) => {
        const items = [...get().items];
        const chosenSize = size ?? defaultPrintSize(productSizes(product));
        const chosenEdition = edition ?? defaultPrintEdition(productEditions(product));
        const selectedSize = chosenSize?.label;
        const selectedEdition = chosenEdition?.label;
        const priceCents = chosenSize?.priceCents ?? product.priceCents;
        const imageUrl = chosenEdition?.url ?? product.images[0]?.url;
        const key = cartKey({ productId: product.id, size: selectedSize, edition: selectedEdition });
        const index = items.findIndex((item) => cartKey(item) === key);
        if (index >= 0) {
          const next = Math.min(product.stock, items[index].quantity + quantity);
          items[index] = { ...items[index], quantity: next, stock: product.stock, priceCents, imageUrl };
        } else {
          items.push({
            productId: product.id,
            title: printLineTitle(product.title, selectedEdition, selectedSize),
            slug: product.slug,
            priceCents,
            imageUrl,
            quantity: Math.min(product.stock, quantity),
            stock: product.stock,
            size: selectedSize,
            edition: selectedEdition,
          });
        }
        set({ items });
      },
      setQty: (key, quantity) => {
        set({
          items: get()
            .items.map((item) =>
              cartKey(item) === key ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) } : item,
            )
            .filter((item) => item.quantity > 0),
        });
      },
      remove: (key) => set({ items: get().items.filter((item) => cartKey(item) !== key) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'kojurebi-cart' },
  ),
);

export function cartTotals(items: CartItem[]) {
  const subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const shippingCents = shippingCentsFor(subtotalCents);
  return {
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}
