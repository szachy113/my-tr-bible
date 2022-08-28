import { useContext, useEffect, useRef, useState } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import { useInViewport } from 'ahooks';
import Book from '@components/Book';
import styles from './Text.module.css';

const { title } = styles;

function useMarginBottom<T>(): [
  elementRef: React.MutableRefObject<(T & HTMLElement) | null>,
  elementMarginBottom: number,
] {
  const elementRef = useRef<(T & HTMLElement) | null>(null);
  const [elementMarginBottom, setElementMarginBottom] = useState(0);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const { marginBottom } = getComputedStyle(elementRef.current);

    setElementMarginBottom(parseFloat(marginBottom));
  }, []);

  return [elementRef, elementMarginBottom];
}

export default function Text() {
  const { data, currentLocation } = useContext(AppCtx)!;
  // NOTE: For the gap to be consistent when the form is hidden.
  const [headingRef, headingMarginBottom] =
    useMarginBottom<HTMLHeadingElement>();
  const [isHeadingInView] = useInViewport(headingRef.current, {
    threshold: 1,
  });

  if (!data) {
    return null;
  }

  const { name, content } = data[currentLocation.bookIndex];

  // TODO: Handle name exception(s) (i.e., Psalms) more generically.
  return (
    <div>
      <h2
        ref={headingRef}
        className={title}
        style={{
          marginTop: headingMarginBottom * 1.75,
        }}
      >
        {name === 'Księga Psalmów' ? 'Psalm' : name}{' '}
        {currentLocation.chapterIndex + 1}
      </h2>
      <Book content={content} isHeadingInView={isHeadingInView} />
    </div>
  );
}
