import { useCallback, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * Handles slide-in/out animation, body scroll lock, and Escape key
 * for right-sliding panels (ExperiencePanel, ProjectPanel, BlogPostPanel).
 *
 * @param {React.RefObject} panelRef   - ref to the panel element
 * @param {React.RefObject} overlayRef - ref to the overlay element
 * @param {Function}        onClose    - callback to close the panel
 * @param {string|null}     animClass  - CSS selector for stagger-animate children (e.g. '.ep-animate')
 * @returns {{ handleClose: Function }}
 */
export function useSlidePanelAnimation(panelRef, overlayRef, onClose, animClass) {
  const handleClose = useCallback(() => {
    gsap.to(panelRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: onClose,
    });
  }, [panelRef, overlayRef, onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;

    document.body.style.overflow = 'hidden';

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    gsap.fromTo(panel, { x: '100%' }, { x: '0%', duration: 0.5, ease: 'power3.out', delay: 0.05 });

    if (animClass) {
      const animEls = panel.querySelectorAll(animClass);
      if (animEls.length) {
        gsap.fromTo(
          animEls,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out', delay: 0.3 }
        );
      }
    }

    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [panelRef, overlayRef, animClass, handleClose]);

  return { handleClose };
}
