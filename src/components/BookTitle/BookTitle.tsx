import { useState, useEffect, useContext } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import styles from './BookTitle.module.css';

interface BookTitleProps {
  headerRef: React.MutableRefObject<HTMLDivElement | null>;
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
}

const { container } = styles;

/**
 * For the gap to be consistent with Pico.css.
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

// TODO: BookHeader.
export default function BookTitle({ headerRef, headingRef }: BookTitleProps) {
  const { data, currentLocation } = useContext(AppCtx)!;
  const headingMarginBottom = useMarginBottom<HTMLHeadingElement>(headingRef);

  if (!data) {
    return null;
  }

  const { name, content } = data[currentLocation.bookIndex];
  const isPsalm = currentLocation.bookIndex === 18;
  const hasExtraVerses = content[currentLocation.chapterIndex].content.some(
    (verse) => verse.content.every((word) => word.content.startsWith('<i>')),
  );

  // TODO: Handle name exception(s) (i.e., Psalms) more generically (other languages). Supabase.
  return (
    <div
      ref={headerRef}
      className={container}
      style={
        isPsalm && hasExtraVerses ? { marginBottom: headingMarginBottom } : {}
      }
    >
      <h2
        ref={headingRef}
        style={
          isPsalm && hasExtraVerses
            ? {
                paddingTop: headingMarginBottom * 1.75,
                marginBottom: 0,
              }
            : {
                paddingTop: headingMarginBottom * 1.75,
              }
        }
      >
        {name === 'Księga Psalmów' ? 'Psalm' : name}{' '}
        {currentLocation.chapterIndex + 1}
      </h2>
    </div>
  );
}
