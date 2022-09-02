import { Chapter } from '@utils/fetchBook';
import { useContext, useCallback } from 'react';
import { CurrentLocation, AppCtx } from '@app/AppContextProvider';
import { useScrollCurrentVerseIntoView } from '@hooks/useScrollCurrentVerseIntoView';
import { useTrackedEffect } from 'ahooks';
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

function useScrollOnLocationChange({
  bookIndex,
  chapterIndex,
  verseIndex,
}: CurrentLocation): void {
  const scrollCurrentVerseIntoView = useScrollCurrentVerseIntoView();

  useTrackedEffect(
    (changes, previousDeps, currentDeps) => {
      if (!changes || !currentDeps) {
        return;
      }

      const didBookChange = previousDeps?.[0] !== currentDeps[0];
      const didChapterChange = previousDeps?.[1] !== currentDeps[1];
      const didVerseChange = previousDeps?.[2] !== currentDeps[2];

      if (didBookChange || didChapterChange) {
        window.scrollTo(0, 0);
      }

      if (
        (!didBookChange && !didChapterChange && didVerseChange) ||
        didBookChange ||
        didChapterChange
      ) {
        scrollCurrentVerseIntoView();
      }
    },
    [bookIndex, chapterIndex, verseIndex],
  );
}

export default function Book({ content, isHeadingInView }: BookProps) {
  const {
    currentLocation,
    currentVerseRef,
    setCurrentLocation,
    setShouldShowReferenceForm,
  } = useContext(AppCtx)!;

  useScrollOnLocationChange(currentLocation);

  const renderChapter = useCallback<(chapter: Chapter) => JSX.Element[]>(
    (chapter) =>
      chapter.map((verse, j) => (
        <p
          ref={currentLocation.verseIndex === j ? currentVerseRef : null}
          className={clsx(verseContainer, {
            [focused]: currentLocation.verseIndex === j,
          })}
          key={verse.id}
          onClick={() => {
            setShouldShowReferenceForm(false);
            setCurrentLocation('verseIndex', j);
          }}
        >
          <b className={verseNumber}>
            {!isHeadingInView
              ? // TODO: Change separator based on the language.
                `${currentLocation.chapterIndex + 1},${j + 1}`
              : j + 1}
          </b>
          {verse.text}
        </p>
      )),
    [
      currentLocation.verseIndex,
      currentVerseRef,
      setShouldShowReferenceForm,
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
