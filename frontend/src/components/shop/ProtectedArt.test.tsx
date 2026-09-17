import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProtectedImg } from './ProtectedArt';

describe('ProtectedImg', () => {
  it('marks drawings as unpinnable and covers them with a shield', () => {
    const { container } = render(
      <ProtectedImg src="/shop/prints/lilimon.png" alt="Lilimon" className="h-full w-full" />,
    );
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('data-pin-nopin')).toBe('true');
    expect(img?.getAttribute('nopin')).toBe('nopin');
    expect(img?.draggable).toBe(false);
    expect(container.querySelector('.protected-art-shield')).toBeTruthy();
  });
});
