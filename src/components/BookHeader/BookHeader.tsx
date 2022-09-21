import { useContext } from 'react';
import { AppCtx } from '@app/ContextProvider';
import { BookCtx } from '@components/Book/ContextProvider';
import { useMarginBottom } from '@hooks/useMarginBottom';
import { isPsalmWithExtraVerse } from '@utils/extraVerses';
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

  const { name } = data[currentLocation.bookIndex];
  const isPsalm = currentLocation.bookIndex === 18;
  const isPsalmAndHasExtraVerse =
    isPsalm && isPsalmWithExtraVerse(currentLocation.chapterIndex);
  const headingPaddingTop = getHeadingPaddingTop(headingMarginBottom);

  // TODO: Handle name exception(s) (i.e., Psalms) more generically (other languages). Supabase.
  return (
    <div
      ref={headerRef}
      className={container}
      style={
        isPsalmAndHasExtraVerse ? { marginBottom: headingMarginBottom } : {}
      }
    >
      <h2
        ref={headingRef}
        style={
          isPsalmAndHasExtraVerse
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
