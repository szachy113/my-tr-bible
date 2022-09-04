import { useState, useEffect, useContext } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import styles from './BookTitle.module.css';

interface BookTitleProps {
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
}

const { title } = styles;

/**
 * For the gap to be consistent when the form is hidden.
 */
function useMarginBottom<T>(
  elementRef: React.MutableRefObject<(T & HTMLElement) | null>,
): number {
  const [elementMarginBottom, setElementMarginBottom] = useState(0);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const { marginBottom } = getComputedStyle(elementRef.current);

    setElementMarginBottom(parseFloat(marginBottom));
  }, [elementRef]);

  return elementMarginBottom;
}

export default function BookTitle({ headingRef }: BookTitleProps) {
  const { data, currentLocation } = useContext(AppCtx)!;
  const headingMarginBottom = useMarginBottom<HTMLHeadingElement>(headingRef);

  if (!data) {
    return null;
  }

  const { name } = data[currentLocation.bookIndex];

  // TODO: Handle name exception(s) (i.e., Psalms) more generically (other languages).
  return (
    <h2
      ref={headingRef}
      className={title}
      style={{
        paddingTop: headingMarginBottom * 1.75,
      }}
    >
      {name === 'Księga Psalmów' ? 'Psalm' : name}{' '}
      {currentLocation.chapterIndex + 1}
    </h2>
  );
}
