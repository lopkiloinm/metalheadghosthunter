() => {
  const vw = document.documentElement.clientWidth;
  const over = [];
  document.querySelectorAll('main *, header *, footer *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.right <= vw + 1) return;
    let p = el.parentElement;
    let clipped = false;
    while (p) {
      const cs = getComputedStyle(p);
      if (['auto', 'scroll', 'hidden', 'clip'].includes(cs.overflowX) && p.getBoundingClientRect().right <= vw + 1) {
        clipped = true;
        break;
      }
      p = p.parentElement;
    }
    if (!clipped) over.push(`${el.dataset.testid || el.tagName}:${Math.round(r.right)}`);
  });
  const small = [];
  document.querySelectorAll('button, a[href], select, input:not([type=hidden])').forEach((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width === 0 || cs.visibility === 'hidden' || el.closest('[aria-hidden=true]') || el.closest('.leaflet-control-attribution')) return;
    if (r.height < 43.5) small.push(`${el.dataset.testid || el.textContent.trim().slice(0, 18) || el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`);
  });
  return { scrollW: document.documentElement.scrollWidth, vw, over: over.slice(0, 8), small: small.slice(0, 14), smallCount: small.length };
}
