import { useEffect, useRef } from 'react';

/**
 * useReveal — attaches an IntersectionObserver to a container ref.
 * Adds the `visible` class to every child with a `reveal` class
 * when they scroll into view, triggering the fade-slide-up entrance
 * animation defined in index.css.
 *
 * Usage:
 *   const sectionRef = useReveal();
 *   <section ref={sectionRef}>
 *     <div className="reveal">...</div>
 *     <div className="reveal reveal-delay-1">...</div>
 *   </section>
 */
export function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>('.reveal');
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
