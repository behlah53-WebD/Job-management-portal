import { useEffect } from 'react';

/* Dev-only guardrail: warns in console when <main> is narrower than 70% of the
   viewport on mobile, which means the desktop sidebar offset (margin-left: 260px
   / 270px on .mainContent) is still being applied below the 1024px (lg) breakpoint. */
export default function useMobileLayoutCheck() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    let warned = false;
    const check = () => {
      if (window.innerWidth >= 1024) return;
      const main = document.querySelector('main');
      if (!main) return;
      const rect = main.getBoundingClientRect();
      if (rect.width < 0.7 * window.innerWidth && !warned) {
        warned = true;
        console.warn(
          `[Verdant Mobile Layout] main is ${Math.round(
            rect.width
          )}px wide (< 70% of ${window.innerWidth}px viewport) at left=${Math.round(
            rect.left
          )}px — sidebar offset may still be applied on mobile.`
        );
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
}
