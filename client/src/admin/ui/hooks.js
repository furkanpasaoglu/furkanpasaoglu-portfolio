import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Non-component exports live here so the UI file can stay components-only
 * and fast refresh keeps working.
 */

export const ToastCtx = createContext(() => {});

export const useToast = () => useContext(ToastCtx);

/** Wiring for a confirm dialog: ask(payload) parks it until you accept. */
export function useConfirm() {
  const [pending, setPending] = useState(null);
  const ask = useCallback((payload) => setPending(payload), []);
  const cancel = useCallback(() => setPending(null), []);
  return useMemo(() => ({ pending, ask, cancel }), [pending, ask, cancel]);
}
