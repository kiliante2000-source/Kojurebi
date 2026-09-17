import type { PrintEdition, PrintSize, Product } from '../types/shop';

export function parsePrintSizes(raw: unknown): PrintSize[] {
  try {
    const list = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (item): item is PrintSize =>
        Boolean(item) && typeof item.label === 'string' && Number.isInteger(item.priceCents),
    );
  } catch {
    return [];
  }
}

export function productSizes(product: Product): PrintSize[] {
  return parsePrintSizes(product.sizes);
}

export function parsePrintEditions(raw: unknown): PrintEdition[] {
  try {
    const list = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (item): item is PrintEdition =>
        Boolean(item) && typeof item.label === 'string' && typeof item.url === 'string',
    );
  } catch {
    return [];
  }
}

export function productEditions(product: Product): PrintEdition[] {
  return parsePrintEditions(product.editions);
}

export type ShopShot = { id: string; url: string; alt: string };

export function shopDisplayImages(product: Product): ShopShot[] {
  const editions = productEditions(product);
  if (editions.length > 1) {
    return editions.map((edition) => ({
      id: edition.label,
      url: edition.url,
      alt: edition.label,
    }));
  }
  return product.images.map((image, index) => ({
    id: image.id || `${image.url}-${index}`,
    url: image.url,
    alt: image.alt,
  }));
}

export function defaultPrintEdition(editions: PrintEdition[]) {
  return editions[0];
}

export function minPrintPrice(product: Product) {
  const sizes = productSizes(product);
  if (!sizes.length) return product.priceCents;
  return Math.min(...sizes.map((size) => size.priceCents));
}

export function defaultPrintSize(sizes: PrintSize[]) {
  return sizes.find((size) => size.label === 'A4') ?? sizes[0];
}

export function paperAspect(frame?: string) {
  if (frame === 'square') return 'aspect-square';
  return frame === 'landscape' ? 'aspect-[2360/1640]' : 'aspect-[1640/2360]';
}

export function shopFrameAspect(category: string, frame?: string) {
  if (frame === 'square') return 'aspect-square';
  if (category === 'print' || category === 'original') return paperAspect(frame);
  return 'aspect-[4/5]';
}

export function shopFrameFit(category: string, frame?: string): 'cover' | 'contain' {
  if (frame === 'square' || category === 'print' || category === 'original') return 'contain';
  return 'cover';
}

export type PieceShape = 'landscape' | 'portrait' | 'square';

export const HOME_MOSAIC_PLAN: { slug: string; shape: PieceShape }[] = [
  { slug: 'howl', shape: 'landscape' },
  { slug: 'lilimon', shape: 'landscape' },
  { slug: 'opalo', shape: 'portrait' },
  { slug: 'chica-sol', shape: 'portrait' },
  { slug: 'diamante-blanco', shape: 'portrait' },
  { slug: 'celebi', shape: 'square' },
  { slug: 'manaphy', shape: 'square' },
  { slug: 'jirachi', shape: 'square' },
];

export function pieceShape(product: Pick<Product, 'category' | 'frame'>): PieceShape {
  if (product.frame === 'square' || product.category === 'sticker') return 'square';
  if (product.frame === 'landscape') return 'landscape';
  return 'portrait';
}

export function mosaicSpan(shape: PieceShape) {
  return shape === 'landscape' ? 'col-span-2 md:col-span-3' : 'col-span-1 md:col-span-2';
}

export function mosaicSpanInList(product: Pick<Product, 'id' | 'category' | 'frame'>, siblings: Pick<Product, 'id' | 'category' | 'frame'>[]) {
  const shape = pieceShape(product);
  if (shape === 'landscape') return mosaicSpan(shape);
  const group = siblings.filter((item) => pieceShape(item) === shape);
  const index = group.findIndex((item) => item.id === product.id);
  const oddTail = index === group.length - 1 && group.length % 2 === 1;
  return oddTail ? 'col-span-2 md:col-span-2' : mosaicSpan(shape);
}

export function packShopPieces(products: Product[]): Product[] {
  const order: PieceShape[] = ['landscape', 'portrait', 'square'];
  return order.flatMap((shape) => products.filter((product) => pieceShape(product) === shape));
}

export function shopMosaicSpan(product: Product, siblings: Product[]) {
  const shape = pieceShape(product);
  if (shape === 'landscape') return 'md:col-span-3';
  const count = siblings.filter((item) => pieceShape(item) === shape).length;
  return count % 3 === 0 ? 'md:col-span-2' : 'md:col-span-3';
}

export const MOSAIC_GRID =
  'grid grid-cols-2 items-start gap-3 sm:gap-8 md:grid-cols-6 md:grid-flow-dense';

export function selectHomePieces(products: Product[]): Product[] {
  const used = new Set<string>();
  const picked: Product[] = [];

  for (const slot of HOME_MOSAIC_PLAN) {
    const exact = products.find((product) => product.slug === slot.slug && !used.has(product.id));
    const match =
      exact && pieceShape(exact) === slot.shape
        ? exact
        : products.find((product) => !used.has(product.id) && pieceShape(product) === slot.shape);
    if (!match) continue;
    picked.push(match);
    used.add(match.id);
  }

  return picked;
}

export function isStudioPrint(product: Product) {
  return product.images.some((image) => image.url.includes('/shop/prints/'));
}

export function cartKey(item: { productId: string; size?: string; edition?: string }) {
  return [item.productId, item.edition, item.size].filter(Boolean).join('::');
}

export function printLineTitle(title: string, editionLabel?: string | null, sizeLabel?: string | null) {
  return [title, editionLabel, sizeLabel].filter(Boolean).join(' · ');
}

export function editionHint(label: string) {
  if (label === 'Noche oscura') return 'más sombra y contraste';
  if (label === 'Estrellas fugaces') return 'más color y fugas';
  return '';
}

export function sizeHint(label: string) {
  if (label === 'A5') return '14,8 × 21 cm';
  if (label === 'A4') return '21 × 29,7 cm';
  if (label === 'A3') return '29,7 × 42 cm';
  return '';
}
