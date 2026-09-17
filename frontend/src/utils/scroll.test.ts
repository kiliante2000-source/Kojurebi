import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrollToPageTop } from './scroll';

describe('scrollToPageTop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });

  it('jumps the window to the top of the page', () => {
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    document.documentElement.scrollTop = 800;
    document.body.scrollTop = 800;
    scrollToPageTop();
    expect(spy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);
  });
});
