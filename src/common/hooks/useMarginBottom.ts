import { useState, useLayoutEffect } from 'react';

/**
 * For the gap to be consistent with Pico.css.
 */
export function useMarginBottom<T extends HTMLElement>(
  elementRef: React.MutableRefObject<T | null>,
): number {
  const [elementMarginBottom, setElementMarginBottom] = useState(0);

  useLayoutEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const { marginBottom } = getComputedStyle(elementRef.current);

    setElementMarginBottom(parseFloat(marginBottom));
  }, [elementRef]);

  return elementMarginBottom;
}
