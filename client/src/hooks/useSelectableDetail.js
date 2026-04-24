import { useState, useCallback } from 'react';

export function useSelectableDetail() {
  const [selected, setSelected] = useState(null);
  const close = useCallback(() => setSelected(null), []);
  return {
    selected,
    select: setSelected,
    panelProps: { open: !!selected, onClose: close },
  };
}
