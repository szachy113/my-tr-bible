import { Chapter } from '@utils/fetchBook';
import { useContext, useEffect, useCallback } from 'react';
import { CurrentLocation, AppCtx } from '@app/AppContextProvider';
import clsx from 'clsx';
import styles from './Book.module.css';

interface BookProps {
  content: Chapter[];
  isHeadingInView: boolean | undefined;
}

const {
  container,
  'verse-container': verseContainer,
  'verse-number': verseNumber,
  focused,
} = styles;

function useScrollOnLocationChange(
  { bookIndex, chapterIndex, verseIndex }: CurrentLocation,
  currentVerseRef: React.MutableRefObject<HTMLParagraphElement | null>,
): void {
  useEffect(() => window.scrollTo(0, 0), [bookIndex, chapterIndex]);

  useEffect(() => {
    if (!currentVerseRef.current) {
      return;
    }

    // FIXME: It doesn't center the verse properly.
    const currentVerseRect = currentVerseRef.current.getBoundingClientRect();
    const absoluteCurrentVerseTop = currentVerseRect.top + window.pageYOffset;
    const center = absoluteCurrentVerseTop - window.innerHeight / 2;

    window.scrollTo({
      top: center,
      behavior: 'smooth',
    });

    // currentVerseRef.current.scrollIntoView({
    //   behavior: 'smooth',
    //   block: 'center',
    // });
  }, [currentVerseRef, verseIndex]);
}

export default function Book({ content, isHeadingInView }: BookProps) {
  const { currentLocation, currentVerseRef, setCurrentLocation } =
    useContext(AppCtx)!;

  useScrollOnLocationChange(currentLocation, currentVerseRef);

  const renderChapter = useCallback<(chapter: Chapter) => JSX.Element[]>(
    (chapter) =>
      chapter.map((verse, j) => (
        <p
          ref={currentLocation.verseIndex === j ? currentVerseRef : null}
          className={clsx(verseContainer, {
            [focused]: currentLocation.verseIndex === j,
          })}
          key={verse.id}
          onClick={() => setCurrentLocation('verseIndex', j)}
        >
          <b className={verseNumber}>
            {!isHeadingInView
              ? `${currentLocation.chapterIndex + 1}:${j + 1}`
              : j + 1}
          </b>
          {verse.text}
        </p>
      )),
    [
      currentLocation.verseIndex,
      currentVerseRef,
      setCurrentLocation,
      isHeadingInView,
      currentLocation.chapterIndex,
    ],
  );

  return (
    <div className={container}>
      {currentLocation.chapterIndex >= content.length
        ? renderChapter(content[content.length - 1])
        : content.map((chapter, i) => {
            if (i !== currentLocation.chapterIndex) {
              return null;
            }

            return renderChapter(chapter);
          })}
    </div>
  );
}
