import { Book, Chapter, Verse } from '@utils/fetchBooks';
import { useContext, useCallback, useMemo, useRef } from 'react';
import {
  CurrentLocation,
  AppCtx,
  SetCurrentLocation,
} from '@app/ContextProvider';
import isMobile from 'ismobilejs';
import { BookCtx } from '@components/Book/ContextProvider';
import { useScrollCurrentVerseIntoView } from '@hooks/useScrollCurrentVerseIntoView';
import { useEventListener, useInViewport, useTrackedEffect } from 'ahooks';
import { useMarginBottom } from '@hooks/useMarginBottom';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import styles from './BookContent.module.css';

interface BookContentProps {
  parentRef: React.MutableRefObject<HTMLDivElement | null>;
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
  'verse-content--hebrew-letter': verseContentHebrewLetter,
  'verse-number': verseNumberStyle,
  'verse--focused': verseFocused,
  'verse--extra': verseExtra,
  list,
  arrow,
  'arrow--right': arrowRight,
  'arrow--left': arrowLeft,
  'arrow-icon': arrowIcon,
} = styles;
const HEBREW_ALPHABET: string = 'אבגדהוזחטיכלמנסעפצקרשת';

function useCurrentLocationChange(
  { bookIndex, chapterIndex, verseIndex }: CurrentLocation,
  setCurrentLocation: SetCurrentLocation,
  data: Book[],
): void {
  const scrollCurrentVerseIntoView = useScrollCurrentVerseIntoView();

  useTrackedEffect(
    (changes, previousDeps, currentDeps) => {
      if (!changes || !currentDeps) {
        return;
      }

      const didBookChange = previousDeps?.[0] !== currentDeps[0];
      const didChapterChange = previousDeps?.[1] !== currentDeps[1];
      const didVerseChange = previousDeps?.[2] !== currentDeps[2];

      if (didChapterChange) {
        setCurrentLocation('chapterExtraVersesCount', 0);

        const isPsalm = bookIndex === 18;
        const currentBook = data[bookIndex];

        if (isPsalm) {
          // NOTE: Since there won't be more than two extra verses.
          const firstTwoVerses = currentBook.content[
            chapterIndex
          ].content.slice(0, 2);
          const extraVersesCount = firstTwoVerses.reduce(
            (total, curr) =>
              curr.content.every((word) => word.content.startsWith('<i>'))
                ? total + 1
                : total,
            0,
          );

          setCurrentLocation('chapterExtraVersesCount', extraVersesCount);
        }

        const isPaulineEpistle = bookIndex >= 44 && bookIndex <= 58;

        if (isPaulineEpistle) {
          const isLastChapter = chapterIndex === currentBook.content.length - 1;

          if (isLastChapter) {
            setCurrentLocation('chapterExtraVersesCount', 1);
          }
        }
      }

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

const isExtraVerse = (verse: Verse): boolean =>
  verse.content.every((word) => word.content.startsWith('<i>'));

const renderVerse = (verse: Verse): (string | JSX.Element)[] =>
  verse.content.map((word) => {
    const wordToRender = `${word.content} `;

    if (word.content.startsWith('<i>')) {
      // NOTE: Don't use dangerouslySetInnerHTML attribute.

      return <i key={word.id}>{wordToRender.replace(/<i>|<\/i>/g, '')}</i>;
    }

    return wordToRender;
  });

export default function BookContent({
  parentRef,
  selectChapter,
}: BookContentProps) {
  const {
    data,
    currentLocation,
    setCurrentLocation,
    currentVerseRef,
    shouldShowReferenceForm,
    language,
  } = useContext(AppCtx)!;
  const content = useMemo<Chapter[]>(
    () => data?.[currentLocation.bookIndex].content ?? [],
    [data, currentLocation.bookIndex],
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDesktop = !isMobile().any;
  const { headingRef, headerRef } = useContext(BookCtx)!;
  const heightHeadingTextStartsAt = headingRef.current
    ? parseFloat(getComputedStyle(headingRef.current).fontSize)
    : 0;
  const headingHeight = headingRef.current?.offsetHeight ?? 0;
  const headingTextThreshold = heightHeadingTextStartsAt / headingHeight;
  const [isHeadingInView] = useInViewport(headingRef.current, {
    threshold: headingTextThreshold,
  });

  const headingMarginBottom = useMarginBottom<HTMLHeadingElement>(headingRef);

  useCurrentLocationChange(currentLocation, setCurrentLocation, data!);

  const renderChapter = useCallback<
    (chapter: Chapter) => (JSX.Element | null)[]
  >(
    (chapter) => {
      const isPsalm = currentLocation.bookIndex === 18;
      const isPsalm119 = isPsalm && currentLocation.chapterIndex === 118;
      const verseSeparator = /pl/g.test(language) ? ',' : ':';

      let didRenderExtraVerses = false;

      const isPaulineEpistle =
        currentLocation.bookIndex >= 44 && currentLocation.bookIndex <= 58;

      return chapter.content.map((verse, j) => {
        if (isPsalm) {
          if (isPsalm119) {
            const isHebrewLetterVerse =
              verse.content.length === 1 &&
              !verse.content[verse.content.length - 1].content.includes('.');

            if (isHebrewLetterVerse) {
              const hebrewLetterIndex = j / 9;
              const hebrewLetterName = verse.content[0].content;

              return (
                <li className={verseStyle} key={verse.id}>
                  <div className={clsx(verseContent, verseContentHebrewLetter)}>
                    <p>{`${HEBREW_ALPHABET[hebrewLetterIndex]} ${hebrewLetterName}`}</p>
                  </div>
                </li>
              );
            }
          }

          if (isExtraVerse(verse)) {
            if (didRenderExtraVerses) {
              return null;
            }

            if (headerRef.current) {
              const nextVerse = chapter.content[j + 1];
              const isNextVerseExtra =
                currentLocation.chapterExtraVersesCount === 2;

              didRenderExtraVerses = true;

              return createPortal(
                <h3 className={verseExtra}>
                  {renderVerse(verse)}
                  {isNextVerseExtra && renderVerse(nextVerse)}
                </h3>,
                headerRef.current,
              );
            }
          }
        }

        const isLastVerse = j === chapter.content.length - 1;

        if (isLastVerse && isPaulineEpistle && parentRef.current) {
          if (isExtraVerse(verse)) {
            return createPortal(
              <h3
                className={verseExtra}
                style={{ marginBottom: headingMarginBottom }}
              >
                {renderVerse(verse)}
              </h3>,
              parentRef.current,
            );
          }
        }

        const hasExtraVerses = currentLocation.chapterExtraVersesCount > 0;

        let verseNumber = j + 1;

        if (hasExtraVerses) {
          verseNumber -= currentLocation.chapterExtraVersesCount;
        }

        if (isPsalm119) {
          const excess = Math.ceil(j / 9);

          verseNumber -= excess;
        }

        return (
          <li
            ref={currentLocation.verseIndex === j ? currentVerseRef : null}
            className={clsx(verseStyle, {
              [verseFocused]: currentLocation.verseIndex === j,
            })}
            key={verse.id}
            onClick={() => setCurrentLocation('verseIndex', j)}
          >
            <div className={verseContent}>
              <b className={verseNumberStyle}>
                {!isHeadingInView
                  ? `${
                      currentLocation.chapterIndex + 1
                    }${verseSeparator}${verseNumber}`
                  : verseNumber}
              </b>
              <p>{renderVerse(verse)}</p>
            </div>
          </li>
        );
      });
    },
    [
      language,
      currentLocation,
      headerRef,
      parentRef,
      headingMarginBottom,
      currentVerseRef,
      setCurrentLocation,
      isHeadingInView,
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
      {content.map((chapter, i) => {
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
