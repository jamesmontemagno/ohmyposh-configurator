import { useCallback, useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const mediaQuery = window.matchMedia?.(query);
    if (!mediaQuery) return () => undefined;

    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [query]);

  const getSnapshot = useCallback(
    () => window.matchMedia?.(query).matches ?? false,
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
