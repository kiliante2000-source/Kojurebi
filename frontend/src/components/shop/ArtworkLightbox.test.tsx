import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ArtworkLightbox, ExpandArtButton } from './ArtworkLightbox';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

describe('ArtworkLightbox', () => {
  it('does not render when closed', () => {
    render(
      <ArtworkLightbox
        open={false}
        images={[{ url: '/shop/prints/howl.png', alt: 'Howl' }]}
        title="Howl"
        onClose={() => {}}
      />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the drawing behind the protection shield and can close', () => {
    const onClose = vi.fn();
    render(
      <ArtworkLightbox
        open
        images={[{ url: '/shop/prints/opalo.png', alt: 'Ópalo' }]}
        title="Ópalo"
        onClose={onClose}
      />,
    );
    const dialog = screen.getByRole('dialog', { name: 'Ópalo' });
    expect(dialog).toBeTruthy();
    expect(dialog.className).toContain('artwork-lightbox');
    const img = dialog.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/shop/prints/opalo.png');
    expect(img?.getAttribute('data-pin-nopin')).toBe('true');
    expect(dialog.querySelector('.protected-art-shield')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('steps through several photos', () => {
    const onIndexChange = vi.fn();
    render(
      <ArtworkLightbox
        open
        images={[
          { url: '/shop/prints/howl-noche.png', alt: 'Noche' },
          { url: '/shop/prints/howl-estrellas.png', alt: 'Estrellas' },
        ]}
        index={0}
        title="Howl"
        onClose={() => {}}
        onIndexChange={onIndexChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }));
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });
});

describe('ExpandArtButton', () => {
  it('stays off the desktop layout', () => {
    const onClick = vi.fn();
    render(<ExpandArtButton onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'ver grande' });
    expect(button.className).toContain('lg:hidden');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});
