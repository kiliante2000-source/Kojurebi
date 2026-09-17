export type PrintSize = {
  label: string;
  priceCents: number;
};

export type PrintEdition = {
  label: string;
  url: string;
};

export function parsePrintSizes(raw: unknown): PrintSize[] {
  try {
    const list = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (item): item is PrintSize =>
        Boolean(item) &&
        typeof item.label === 'string' &&
        item.label.trim().length > 0 &&
        Number.isInteger(item.priceCents) &&
        item.priceCents >= 100,
    );
  } catch {
    return [];
  }
}

export function parsePrintEditions(raw: unknown): PrintEdition[] {
  try {
    const list = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (item): item is PrintEdition =>
        Boolean(item) &&
        typeof item.label === 'string' &&
        item.label.trim().length > 0 &&
        typeof item.url === 'string' &&
        item.url.trim().length > 0,
    );
  } catch {
    return [];
  }
}

export function resolvePrintSize(
  product: { format: string; priceCents: number; sizes?: unknown },
  sizeLabel?: string,
) {
  const sizes = parsePrintSizes(product.sizes);
  if (!sizes.length) {
    return { label: product.format, priceCents: product.priceCents };
  }
  if (sizeLabel) {
    const match = sizes.find((size) => size.label.toLowerCase() === sizeLabel.trim().toLowerCase());
    if (match) return match;
  }
  return sizes.find((size) => size.label === 'A4') ?? sizes[0];
}

export function resolvePrintEdition(product: { editions?: unknown }, editionLabel?: string) {
  const editions = parsePrintEditions(product.editions);
  if (!editions.length) return null;
  if (editionLabel) {
    const match = editions.find(
      (edition) => edition.label.toLowerCase() === editionLabel.trim().toLowerCase(),
    );
    if (match) return match;
  }
  return editions[0];
}

export function printLineTitle(title: string, editionLabel?: string | null, sizeLabel?: string | null) {
  return [title, editionLabel, sizeLabel].filter(Boolean).join(' · ');
}
