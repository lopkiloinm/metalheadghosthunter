import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_MS = 3600;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, action) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, action }]);
      timers.current[id] = setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss]
  );

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  return { toasts, notify, dismiss };
}
