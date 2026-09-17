export function slugify(input: string, suffix = true): string {
  const base = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  if (!suffix) return base || 'ilustracion';
  const extra = Math.random().toString(36).slice(2, 8);
  return `${base || 'ilustracion'}-${extra}`;
}

export function makeOrderNumber(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `KOJ-${code}`;
}

export function shippingCentsFor(subtotalCents: number): number {
  return subtotalCents >= 4000 ? 0 : 490;
}

export function formatMoney(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
