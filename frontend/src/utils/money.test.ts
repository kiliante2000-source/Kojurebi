import { describe, expect, it } from 'vitest';
import { categoryLabel, centsToEurosInput, eurosToCents, formatMoney, shippingCentsFor } from './money';

describe('money helpers', () => {
  it('formats euros', () => {
    expect(formatMoney(2200)).toContain('22');
  });

  it('converts euros to cents', () => {
    expect(eurosToCents('18,50')).toBe(1850);
    expect(centsToEurosInput(1850)).toBe('18.50');
  });

  it('applies free shipping from 40€', () => {
    expect(shippingCentsFor(3999)).toBe(490);
    expect(shippingCentsFor(4000)).toBe(0);
  });

  it('labels print products as Print', () => {
    expect(categoryLabel('print')).toBe('Print');
  });
});
