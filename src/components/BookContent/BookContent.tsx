import { Chapter, Verse, Word } from '@utils/fetchBooks';
import { useContext, useCallback, useMemo, useRef } from 'react';
import { CurrentLocation, AppCtx } from '@app/ContextProvider';
import isMobile from 'ismobilejs';
import { BookCtx } from '@components/Book/ContextProvider';
import { useScrollCurrentVerseIntoView } from '@hooks/useScrollCurrentVerseIntoView';
import { useEventListener, useInViewport, useTrackedEffect } from 'ahooks';
import { useMarginBottom } from '@hooks/useMarginBottom';
import { getHeadingPaddingTop } from '@components/BookHeader/BookHeader';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import {
  getHebrewLetter,
  isHebrewLetterVerse,
  isPaulineEpistleExtraVerse,
  isPsalmWithExtraVerse,
} from '@utils/extraVerses';
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
  verse: verseStyle,
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

const isWordExtra = (word?: Word) =>
  word
    ? word.content.startsWith('<i>') || word.content.endsWith('</i>')
    : !!word;

function renderVerse(verse: Verse): (string | JSX.Element)[] {
  const { wordsToRender } = verse.content.reduce<{
    extraWordsInARow: string[];
    wordsToRender: (string | JSX.Element)[];
  }>(
    (prev, currentWord, i, arr) => {
      const isLastWord = i === arr.length - 1;
      const wordToRender = `${currentWord.content}${isLastWord ? '' : ' '}`;
      const isCurrentWordExtra = isWordExtra(currentWord);

      if (isCurrentWordExtra) {
        const nextWord = arr[i + 1];
        const isNextWordExtra = isWordExtra(nextWord);
        // NOTE: Not using the dangerouslySetInnerHTML attribute.
        const currentWordContent = wordToRender.replace(/<i>|<\/i>/g, '');

        if (isNextWordExtra) {
          return {
            ...prev,
            extraWordsInARow: [...prev.extraWordsInARow, currentWordContent],
          };
        }

        const extraWordsContent = [
          ...prev.extraWordsInARow,
          currentWordContent,
        ].join(' ');

        return {
          ...prev,
          wordsToRender: [
            ...prev.wordsToRender,
            <i key={currentWord.id}>{extraWordsContent}</i>,
          ],
        };
      }

      return {
        extraWordsInARow: [],
        wordsToRender: [...prev.wordsToRender, wordToRender],
      };
    },
    {
      extraWordsInARow: [],
      wordsToRender: [],
    },
  );

  return wordsToRender;
}

function useScrollOnCurrentLocationChange({
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
  const headingMarginBottom = useMarginBottom<HTMLHeadingElement>(headingRef);

  const heightHeadingTextStartsAt = headingRef.current
    ? parseFloat(getComputedStyle(headingRef.current).fontSize)
    : 0;
  const headingHeight = headingRef.current?.offsetHeight ?? 0;
  const headingPaddingTop = getHeadingPaddingTop(headingMarginBottom);
  const headingTextThreshold =
    heightHeadingTextStartsAt / (headingHeight + headingPaddingTop);

  const [isHeadingTextInView] = useInViewport(headingRef.current, {
    threshold: headingTextThreshold,
  });

  useScrollOnCurrentLocationChange(currentLocation);

  const renderChapter = useCallback<
    (chapter: Chapter) => (JSX.Element | null)[]
  >(
    (chapter) => {
      const isPsalm = currentLocation.bookIndex === 18;
      const isPsalm119 = isPsalm && currentLocation.chapterIndex === 118;
      const isPaulineEpistle =
        currentLocation.bookIndex >= 44 && currentLocation.bookIndex <= 58;
      const verseSeparator = /pl/g.test(language) ? ',' : ':';

      return chapter.content.map((verse, j, arr) => {
        if (isPsalm) {
          if (isPsalm119) {
            if (isHebrewLetterVerse(verse.id)) {
              const hebrewLetterIndex = j / 9;
              const hebrewLetter = getHebrewLetter(hebrewLetterIndex);
              const hebrewLetterName = verse.content[0].content;

              return (
                <li className={verseStyle} key={verse.id}>
                  <div className={clsx(verseContent, verseContentHebrewLetter)}>
                    <p>{`${hebrewLetter} ${hebrewLetterName}`}</p>
                  </div>
                </li>
              );
            }
          }

          if (
            j === 0 &&
            isPsalmWithExtraVerse(currentLocation.chapterIndex) &&
            headerRef.current
          ) {
            return createPortal(
              <h3 className={verseExtra}>{renderVerse(verse)}</h3>,
              headerRef.current,
            );
          }
        }

        const isLastVerse = j === arr.length - 1;

        if (isLastVerse && isPaulineEpistle && parentRef.current) {
          if (isPaulineEpistleExtraVerse(verse.id)) {
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

        const isPsalmAndHasExtraVerse =
          isPsalm && isPsalmWithExtraVerse(currentLocation.chapterIndex);

        let verseNumber = j + 1;

        if (isPsalmAndHasExtraVerse) {
          verseNumber -= 1;
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
                {!isHeadingTextInView
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
      isHeadingTextInView,
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
    (direction) => {
      const isRight = direction === 'right';
      const isLeft = direction === 'left';

      return (
        <button
          type="button"
          className={clsx(arrow, {
            [arrowRight]: isRight,
            [arrowLeft]: isLeft,
          })}
          onClick={() =>
            selectChapter({
              next: isRight,
              previous: isLeft,
            })
          }
        >
          <Icon
            className={arrowIcon}
            icon={isRight ? faAngleRight : faAngleLeft}
          />
        </button>
      );
    },
    [selectChapter],
  );

  // TODO: Should initially HIDE arrows on desktop.
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
