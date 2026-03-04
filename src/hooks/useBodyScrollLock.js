import { useEffect } from 'react';

/**
 * Locks document body scroll on mount and restores it on unmount.
 * Used by panels/modals that need to prevent background scrolling.
 */
export function useBodyScrollLock() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
}
