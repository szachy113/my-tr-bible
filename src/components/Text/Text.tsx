import { useContext, useEffect, useRef, useState } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import Book from '@components/Book';
import styles from './Text.module.css';

const { title } = styles;

function useElementMarginBottom<T>(): [
  elementRef: React.MutableRefObject<(T & HTMLElement) | null>,
  elementMarginBottom: string,
] {
  const elementRef = useRef<(T & HTMLElement) | null>(null);
  const [elementMarginBottom, setElementMarginBottom] = useState('0px');

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const { marginBottom } = getComputedStyle(elementRef.current);

    setElementMarginBottom(marginBottom);
  }, []);

  return [elementRef, elementMarginBottom];
}

export default function Text() {
  const { data, currentLocation } = useContext(AppCtx)!;

  // NOTE: For the gap to be consistent when the form is hidden.
  const [headingRef, headingMarginBottom] =
    useElementMarginBottom<HTMLHeadingElement>();

  if (!data) {
    return null;
  }

  // TODO: Handle name exception (i.e., Psalms) more generically.
  const { name, content } = data[currentLocation.bookIndex];

  return (
    <div>
      <h2
        ref={headingRef}
        className={title}
        style={{
          marginTop: headingMarginBottom,
        }}
      >
        {name === 'Księga Psalmów' ? 'Psalm' : name}{' '}
        {currentLocation.chapterIndex + 1}
      </h2>
      <Book content={content} />
    </div>
  );
}
