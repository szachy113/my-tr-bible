import { Chapter } from '@utils/fetchBook';
import { useContext, useCallback, useRef, useMemo } from 'react';
import { CurrentLocation, AppCtx } from '@app/AppContextProvider';
import { useMediaQuery } from 'react-responsive';
import { useScrollCurrentVerseIntoView } from '@hooks/useScrollCurrentVerseIntoView';
import { useEventListener, useTrackedEffect } from 'ahooks';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import styles from './BookContent.module.css';

interface BookContentProps {
  isHeadingInView: boolean | undefined;
  selectChapter: ({
    previous,
    next,
  }: {
    previous?: boolean;
    next?: boolean;
  }) => void;
}

const {
  container,
  'verse-style': verseStyle,
  'verse-content': verseContent,
  'verse-number': verseNumber,
  'verse--focused': focused,
  list,
  arrow,
  'arrow--right': arrowRight,
  'arrow--left': arrowLeft,
  'arrow-icon': arrowIcon,
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

export default function BookContent({
  isHeadingInView,
  selectChapter,
}: BookContentProps) {
  const {
    data,
    currentLocation,
    currentVerseRef,
    setCurrentLocation,
    shouldShowReferenceForm,
    setShouldShowReferenceForm,
  } = useContext(AppCtx)!;
  const content = useMemo<Chapter[]>(
    () => data?.[currentLocation.bookIndex].content ?? [],
    [data, currentLocation.bookIndex],
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDesktop = useMediaQuery({
    query: '(min-width: 1024px)',
  });

  useScrollOnLocationChange(currentLocation);

  const renderChapter = useCallback<(chapter: Chapter) => JSX.Element[]>(
    (chapter) =>
      chapter.content.map((verse, j) => (
        <li
          ref={currentLocation.verseIndex === j ? currentVerseRef : null}
          className={clsx(verseStyle, {
            [focused]: currentLocation.verseIndex === j,
          })}
          key={verse.id}
          onClick={() => {
            setShouldShowReferenceForm(false);
            setCurrentLocation('verseIndex', j);
          }}
        >
          <p className={verseContent}>
            <b className={verseNumber}>
              {!isHeadingInView
                ? // TODO: Change separator based on the language.
                  `${currentLocation.chapterIndex + 1},${j + 1}`
                : j + 1}
            </b>
            {verse.text}
          </p>
        </li>
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

  useEventListener('keydown', (e) => {
    if (shouldShowReferenceForm) {
      return;
    }

    if (e.key === 'ArrowRight') {
      selectChapter({ next: true });

      return;
    }

    if (e.key === 'ArrowLeft') {
      selectChapter({ previous: true });
    }
  });

  const renderChapterArrow = useCallback<
    (direction: 'right' | 'left') => JSX.Element | null
  >(
    (direction) => (
      <button
        type="button"
        className={clsx(arrow, {
          [arrowRight]: direction === 'right',
          [arrowLeft]: direction === 'left',
        })}
        onClick={() =>
          selectChapter({
            next: direction === 'right',
            previous: direction === 'left',
          })
        }
      >
        <Icon
          className={arrowIcon}
          icon={direction === 'right' ? faAngleRight : faAngleLeft}
        />
      </button>
    ),
    [selectChapter],
  );

  return (
    <div ref={containerRef} className={container}>
      {isDesktop && renderChapterArrow('left')}
      {currentLocation.chapterIndex >= content.length
        ? renderChapter(content[content.length - 1])
        : content.map((chapter, i) => {
            if (i !== currentLocation.chapterIndex) {
              return null;
            }

            return (
              <ul className={list} key={chapter.id}>
                {renderChapter(chapter)}
              </ul>
            );
          })}
      {isDesktop && renderChapterArrow('right')}
    </div>
  );
}
