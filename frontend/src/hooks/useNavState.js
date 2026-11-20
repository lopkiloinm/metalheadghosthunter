import { useEffect, useState } from 'react';

export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

// Tracks which chapter section sits under the upper third of the viewport.
export function useActiveSection(ids) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const visible = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        setActive(ids.find((id) => visible.get(id)) || '');
      },
      { rootMargin: '-35% 0px -60% 0px' }
    );
    const observe = () => ids.forEach((id) => document.getElementById(id) && io.observe(document.getElementById(id)));
    observe();
    const retry = setTimeout(observe, 1500);
    return () => {
      clearTimeout(retry);
      io.disconnect();
    };
  }, [ids]);
  return active;
}
