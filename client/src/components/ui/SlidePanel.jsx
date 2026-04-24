import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import './SlidePanel.css';

export default function SlidePanel({ open, onClose, children, ariaLabel = 'Panel' }) {
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={`slide-panel ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-hidden={!open}
    >
      <div className="slide-panel-backdrop" onClick={onClose} />
      <aside className="slide-panel-body">
        <button type="button" onClick={onClose} className="slide-panel-close" aria-label="Close">
          <FiX />
        </button>
        <div className="slide-panel-scroll">{children}</div>
      </aside>
    </div>
  );
}
