/**
 * src/components/utils/ScrollToTop.tsx
 * @description React component that scrolls the window to the top on every route change.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * @description Scrolls the window to the top (0,0) whenever the pathname changes.
 * This component does not render any visible UI.
 * @returns {null} Returns null as it's a side-effect component.
 */
export const ScrollToTop = (): null => {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      requestAnimationFrame(() => {
        document.documentElement.scrollTop = 0;
        // As a fallback for older browsers or specific compatibility modes:
        document.body.scrollTop = 0;
      });
    } catch (e) {
      // In some environments (like Jest/JSDOM), these properties might not be available or writable.
    }
  }, [pathname]);

  return null;
};