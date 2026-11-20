export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const formatGbp = (value) => `£${Number(value || 0).toFixed(2)}`;

export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// 'K-II "DOOMSPIKE" EMF METER' -> 'DOOMSPIKE'
export const shortName = (name) => name.split('"')[1] || name;

export function scrollToSection(id, reducedMotion = false) {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}
