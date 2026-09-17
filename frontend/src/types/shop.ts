export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
};

export type PrintSize = {
  label: string;
  priceCents: number;
};

export type PrintEdition = {
  label: string;
  url: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  stock: number;
  featured: boolean;
  published: boolean;
  format: string;
  sizes: PrintSize[];
  editions: PrintEdition[];
  frame: 'portrait' | 'landscape' | string;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
};

export type CartItem = {
  productId: string;
  title: string;
  slug: string;
  priceCents: number;
  imageUrl?: string;
  quantity: number;
  stock: number;
  size?: string;
  edition?: string;
};

export type OrderItem = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  unitCents: number;
  quantity: number;
};

export type Order = {
  id: string;
  number: string;
  receiptToken: string;
  status: string;
  email: string;
  customerName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  province: string | null;
  country: string;
  notes: string | null;
  paymentMethod: string;
  paymentLast4: string | null;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  paidAt: string;
  createdAt: string;
  items: OrderItem[];
};

export type ShopStats = {
  productCount: number;
  orderCount: number;
  revenueCents: number;
  toFulfill: number;
};

export const CATEGORIES: { id: string; label: string }[] = [
  { id: 'print', label: 'Prints' },
  { id: 'sticker', label: 'Stickers' },
  { id: 'pack', label: 'Packs' },
  { id: 'original', label: 'Originales' },
];

export function isPaperEdition(category: string) {
  return category === 'print' || category === 'original';
}

export const ORDER_STATUS: Record<string, string> = {
  paid: 'Pagado',
  packing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};
