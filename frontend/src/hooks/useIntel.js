import { useCallback, useRef, useState } from 'react';
import { searchIntel } from '../services/api';

export function useIntel() {
  const [state, setState] = useState({ status: 'idle', data: null, query: '' });
  const requestId = useRef(0);

  const search = useCallback(async (query) => {
    const id = ++requestId.current;
    setState({ status: 'loading', data: null, query });
    try {
      const data = await searchIntel(query);
      if (id === requestId.current) setState({ status: data.results.length ? 'success' : 'empty', data, query });
    } catch {
      if (id === requestId.current) setState({ status: 'error', data: null, query });
    }
  }, []);

  return { ...state, search };
}
