export function scrollToPageTop() {
  const jump = { top: 0, left: 0, behavior: 'auto' as const };
  window.scrollTo(jump);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
