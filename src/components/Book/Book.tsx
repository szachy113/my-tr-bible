import { Chapter } from '@utils/fetchBook';
import { useContext, useCallback, useRef, useState } from 'react';
import { CurrentLocation, AppCtx } from '@app/AppContextProvider';
import { useScrollCurrentVerseIntoView } from '@hooks/useScrollCurrentVerseIntoView';
import { useEventListener, useTrackedEffect } from 'ahooks';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import styles from './Book.module.css';

interface BookProps {
  content: Chapter[];
  isHeadingInView: boolean | undefined;
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

export default function Book({ content, isHeadingInView }: BookProps) {
  const {
    data,
    currentLocation,
    currentVerseRef,
    setCurrentLocation,
    setShouldShowReferenceForm,
  } = useContext(AppCtx)!;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chapterArrowToRender, setChapterArrowToRender] = useState<
    ('right' | 'left') | null
  >(null);

  useScrollOnLocationChange(currentLocation);

  useEventListener('mouseover', (e) => {
    if (!containerRef.current) {
      return;
    }

    const documentWidth = document.documentElement.clientWidth;
    const containerStyle = getComputedStyle(containerRef.current);
    const containerPaddingInline = parseFloat(containerStyle.paddingInline);
    const isOnRightSide =
      e.x >= documentWidth - containerPaddingInline && e.x < documentWidth;
    const isOnLeftSide = e.x <= containerPaddingInline && e.x > 0;

    if (isOnRightSide) {
      setChapterArrowToRender('right');

      return;
    }

    if (isOnLeftSide) {
      setChapterArrowToRender('left');

      return;
    }

    setChapterArrowToRender(null);
  });

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

  const selectChapter = useCallback<
    ({ previous, next }: { previous?: boolean; next?: boolean }) => void
  >(
    ({ previous = false, next = false }) => {
      if ((previous && next) || (!previous && !next)) {
        return;
      }

      setShouldShowReferenceForm(false);
      setCurrentLocation('verseIndex', -1);

      const isFirstChapter = currentLocation.chapterIndex === 0;
      const isLastChapter = currentLocation.chapterIndex === content.length - 1;

      if (previous && isFirstChapter) {
        const isFirstBook = currentLocation.bookIndex === 0;
        const targetBookIndex = isFirstBook
          ? data!.length - 1
          : currentLocation.bookIndex - 1;

        setCurrentLocation('bookIndex', targetBookIndex);

        const lastChapterIndex = data![targetBookIndex].content.length - 1;

        setCurrentLocation('chapterIndex', lastChapterIndex);

        return;
      }

      if (next && isLastChapter) {
        const isLastBook = currentLocation.bookIndex === data!.length - 1;
        const targetBookIndex = isLastBook ? 0 : currentLocation.bookIndex + 1;

        setCurrentLocation('bookIndex', targetBookIndex);
        setCurrentLocation('chapterIndex', 0);

        return;
      }

      setCurrentLocation('chapterIndex', (prev) =>
        next ? prev + 1 : prev - 1,
      );
    },
    [
      setShouldShowReferenceForm,
      content.length,
      currentLocation.bookIndex,
      currentLocation.chapterIndex,
      data,
      setCurrentLocation,
    ],
  );

  useEventListener('keydown', (e) => {
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
          icon={direction === 'right' ? faChevronRight : faChevronLeft}
        />
      </button>
    ),
    [selectChapter],
  );

  return (
    <div ref={containerRef} className={container}>
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
      {chapterArrowToRender && renderChapterArrow(chapterArrowToRender)}
    </div>
  );
}
