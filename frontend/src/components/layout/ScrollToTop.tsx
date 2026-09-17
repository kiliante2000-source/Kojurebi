import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToPageTop } from '../../utils/scroll';

export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    scrollToPageTop();
  }, [pathname, search, hash]);

  return null;
}
