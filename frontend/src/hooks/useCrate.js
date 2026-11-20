import { useCallback, useMemo, useState } from 'react';

const MAX_QTY = 10;

export function useCrate() {
  const [items, setItems] = useState([]);

  const addMany = useCallback((gear) => {
    setItems((prev) => {
      const next = [...prev];
      gear.forEach((item) => {
        const idx = next.findIndex((c) => c.item.slug === item.slug);
        if (idx >= 0) next[idx] = { ...next[idx], quantity: Math.min(MAX_QTY, next[idx].quantity + 1) };
        else next.push({ item, quantity: 1 });
      });
      return next;
    });
  }, []);

  const add = useCallback((item) => addMany([item]), [addMany]);

  const setQty = useCallback((slug, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((c) => c.item.slug !== slug)
        : prev.map((c) => (c.item.slug === slug ? { ...c, quantity: Math.min(MAX_QTY, qty) } : c))
    );
  }, []);

  const remove = useCallback((slug) => setItems((prev) => prev.filter((c) => c.item.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);
  const count = useMemo(() => items.reduce((sum, c) => sum + c.quantity, 0), [items]);

  return { items, count, add, addMany, setQty, remove, clear };
}
