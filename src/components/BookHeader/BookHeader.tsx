import { useContext } from 'react';
import { AppCtx } from '@app/ContextProvider';
import { BookCtx } from '@components/Book/ContextProvider';
import { useMarginBottom } from '@hooks/useMarginBottom';
import { isExtraVerse } from '@utils/isExtraVerse';
import styles from './BookHeader.module.css';

export const getHeadingPaddingTop = (headingMarginBottom: number): number =>
  headingMarginBottom * 1.75;

const { container } = styles;

export default function BookHeader() {
  const { data, currentLocation } = useContext(AppCtx)!;
  const { headingRef, headerRef } = useContext(BookCtx)!;
  const headingMarginBottom = useMarginBottom<HTMLHeadingElement>(headingRef);

  if (!data) {
    return null;
  }

  const { name, content } = data[currentLocation.bookIndex];
  const isPsalm = currentLocation.bookIndex === 18;
  const hasExtraVerses =
    content[currentLocation.chapterIndex].content.some(isExtraVerse);
  const headingPaddingTop = getHeadingPaddingTop(headingMarginBottom);

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
                paddingTop: headingPaddingTop,
                marginBottom: 0,
              }
            : {
                paddingTop: headingPaddingTop,
              }
        }
      >
        {name === 'Księga Psalmów' ? 'Psalm' : name}{' '}
        {currentLocation.chapterIndex + 1}
      </h2>
    </div>
  );
}
