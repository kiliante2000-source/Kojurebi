import { useEffect } from 'react';

export const PINTEREST_WIDGET_SELECTOR = [
  '[class^="PIN_"]',
  '[class*=" PIN_"]',
  '[id^="PIN_"]',
  '[id*="PIN_"]',
  '[data-pin-log]',
  '[data-pin-href]',
  'iframe[src*="pinterest."]',
  'iframe[src*="pinimg.com"]',
].join(',');

export function isArtworkEventTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return false;
  return Boolean(
    target.closest('.protected-art, .protected-art-shield, .lookbook-art, .brand-mark') ||
      target.tagName === 'IMG',
  );
}

export function isPinterestWidget(node: Node) {
  if (!(node instanceof HTMLElement)) return false;
  if (node.matches(PINTEREST_WIDGET_SELECTOR)) return true;
  const className = typeof node.className === 'string' ? node.className : '';
  if (className.split(/\s+/).some((token) => token.startsWith('PIN_'))) return true;
  if (node.id.startsWith('PIN_')) return true;
  return false;
}

export function stripPinterestWidgets(root: ParentNode = document) {
  const extra: HTMLElement[] = [];
  if (root instanceof Element && isPinterestWidget(root)) extra.push(root);
  root.querySelectorAll(PINTEREST_WIDGET_SELECTOR).forEach((node) => {
    if (node instanceof HTMLElement) extra.push(node);
  });
  extra.forEach((node) => node.remove());
  return extra.length;
}

function stripNode(node: Node) {
  if (isPinterestWidget(node)) {
    node.parentElement?.removeChild(node);
    return;
  }
  if (node instanceof Element || node instanceof DocumentFragment) {
    stripPinterestWidgets(node);
  }
}

export function useArtworkGuard() {
  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      if (isArtworkEventTarget(event.target)) event.preventDefault();
    };
    const onDragStart = (event: DragEvent) => {
      if (isArtworkEventTarget(event.target)) event.preventDefault();
    };
    const onSelectStart = (event: Event) => {
      if (isArtworkEventTarget(event.target)) event.preventDefault();
    };

    document.addEventListener('contextmenu', onContextMenu, true);
    document.addEventListener('dragstart', onDragStart, true);
    document.addEventListener('selectstart', onSelectStart, true);

    stripPinterestWidgets();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(stripNode);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('contextmenu', onContextMenu, true);
      document.removeEventListener('dragstart', onDragStart, true);
      document.removeEventListener('selectstart', onSelectStart, true);
      observer.disconnect();
    };
  }, []);
}
