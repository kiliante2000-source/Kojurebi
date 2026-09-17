export function formatMoney(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function shippingCentsFor(subtotalCents: number) {
  return subtotalCents >= 4000 ? 0 : 490;
}

export function eurosToCents(value: string) {
  const n = Number(value.replace(',', '.').trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

export function centsToEurosInput(cents: number) {
  return (cents / 100).toFixed(2);
}

export function categoryLabel(id: string) {
  const map: Record<string, string> = {
    print: 'Print',
    sticker: 'Sticker',
    pack: 'Pack',
    original: 'Original',
  };
  return map[id] ?? id;
}
