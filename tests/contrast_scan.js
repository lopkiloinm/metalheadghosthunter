// Contrast audit: for every visible element with its own text, composite background colours up the tree and compute WCAG ratio.
() => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const over = (top, under) => ({
    r: top.r * top.a + under.r * (1 - top.a),
    g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a),
    a: 1,
  });
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const bgOf = (el) => {
    const stack = [];
    let imageBg = false;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('url(')) imageBg = true;
      if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; }
    }
    let bg = { r: 7, g: 7, b: 10, a: 1 };
    for (let i = stack.length - 1; i >= 0; i -= 1) bg = over(stack[i], bg);
    return { bg, imageBg };
  };
  const effOpacity = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o; };
  const fails = [];
  let checked = 0;
  document.querySelectorAll('body *').forEach((el) => {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'svg'].includes(el.tagName) || el.closest('svg') || el.closest('[aria-hidden="true"]')) return;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    const isField = ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
    if (!own && !isField) return;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none') return;
    if (el.closest('.sr-only') || cs.clip === 'rect(0px, 0px, 0px, 0px)') return;
    const op = effOpacity(el);
    if (op < 0.2) return;
    const fg = parse(cs.color);
    if (!fg) return;
    if (fg.a === 0 && (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text')) return;
    const { bg, imageBg } = bgOf(el);
    const fgC = over({ ...fg, a: fg.a * op }, bg);
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const cr = ratio(fgC, bg);
    checked += 1;
    if (cr < need) {
      const id = el.closest('[data-testid]')?.dataset.testid || el.tagName;
      fails.push({ where: id, tag: el.tagName, text: (el.textContent || el.placeholder || '').trim().slice(0, 40), ratio: +cr.toFixed(2), need, color: cs.color, imageBg });
    }
  });
  const badSvg = [];
  document.querySelectorAll('svg text').forEach((t) => {
    const f = getComputedStyle(t).fill;
    const m = f.match(/url\("?#([^")]+)"?\)/);
    if (m && !document.getElementById(m[1])) badSvg.push(t.textContent.slice(0, 30));
    const c = parse(f);
    if (c && lum(c) < 0.05 && Number(getComputedStyle(t).fillOpacity) > 0.5) badSvg.push(`dark fill: ${t.textContent.slice(0, 30)}`);
  });
  return { checked, failCount: fails.length, fails: fails.slice(0, 40), badSvg };
}
