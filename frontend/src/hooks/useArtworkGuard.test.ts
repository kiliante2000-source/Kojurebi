import { describe, expect, it } from 'vitest';
import { isArtworkEventTarget, isPinterestWidget, stripPinterestWidgets } from './useArtworkGuard';

describe('artwork guard', () => {
  it('treats protected art and images as undownloadable targets', () => {
    const wrap = document.createElement('span');
    wrap.className = 'protected-art';
    const shield = document.createElement('span');
    shield.className = 'protected-art-shield';
    wrap.append(shield);
    document.body.append(wrap);

    expect(isArtworkEventTarget(shield)).toBe(true);
    expect(isArtworkEventTarget(wrap)).toBe(true);

    const viewer = document.createElement('div');
    viewer.className = 'artwork-lightbox';
    document.body.append(viewer);
    expect(isArtworkEventTarget(viewer)).toBe(true);
    viewer.remove();

    const field = document.createElement('input');
    wrap.append(field);
    expect(isArtworkEventTarget(field)).toBe(false);
    wrap.remove();
  });

  it('removes injected Pinterest widgets', () => {
    const pin = document.createElement('div');
    pin.className = 'PIN_1234';
    pin.textContent = 'Guardar';
    document.body.append(pin);

    expect(isPinterestWidget(pin)).toBe(true);
    expect(stripPinterestWidgets()).toBeGreaterThan(0);
    expect(document.querySelector('.PIN_1234')).toBeNull();
  });
});
