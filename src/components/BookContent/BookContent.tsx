import { Chapter, Verse, Word } from '@utils/fetchBooks';
import { useContext, useCallback, useMemo, useRef } from 'react';
import { CurrentLocation, AppCtx } from '@app/AppContextProvider';
import isMobile from 'ismobilejs';
import { useScrollCurrentVerseIntoView } from '@hooks/useScrollCurrentVerseIntoView';
import { useEventListener, useInViewport, useTrackedEffect } from 'ahooks';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import styles from './BookContent.module.css';

interface BookContentProps {
  headerRef: React.MutableRefObject<HTMLDivElement | null>;
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
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
  'verse-number': verseNumberStyle,
  'verse--focused': verseFocused,
  'verse--extra': verseExtra,
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

const isExtraWord = (word: Word) => word.content.startsWith('<i>');

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
  headerRef,
  headingRef,
  selectChapter,
}: BookContentProps) {
  const {
    data,
    currentLocation,
    currentVerseRef,
    setCurrentLocation,
    shouldShowReferenceForm,
    language,
  } = useContext(AppCtx)!;
  const content = useMemo<Chapter[]>(
    () => data?.[currentLocation.bookIndex].content ?? [],
    [data, currentLocation.bookIndex],
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDesktop = !isMobile().any;
  const heightHeadingTextStartsAt = headingRef.current
    ? parseFloat(getComputedStyle(headingRef.current).fontSize)
    : 0;
  const headingHeight = headingRef.current?.offsetHeight ?? 0;
  const headingTextThreshold = heightHeadingTextStartsAt / headingHeight;
  const [isHeadingInView] = useInViewport(headingRef.current, {
    threshold: headingTextThreshold,
  });

  useScrollOnLocationChange(currentLocation);

  const renderChapter = useCallback<
    (chapter: Chapter) => (JSX.Element | null)[]
  >(
    (chapter) => {
      const isPsalm = currentLocation.bookIndex === 18;
      const verseSeparator = ['pl'].includes(language) ? ',' : ':';

      let extraVersesCount = 0;
      let didRenderExtraVerses = false;

      return chapter.content.map((verse, j) => {
        if (isPsalm) {
          const isExtraVerse = verse.content.every(isExtraWord);

          if (isExtraVerse) {
            if (didRenderExtraVerses) {
              return null;
            }

            if (headerRef.current) {
              extraVersesCount += 1;

              // NOTE: There probably won't be more than two extra verses.
              const nextVerse = chapter.content[j + 1];
              const isNextVerseExtra = nextVerse.content.every(isExtraWord);

              if (isNextVerseExtra) {
                extraVersesCount += 1;
              }

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

        const verseNumber =
          extraVersesCount > 0 ? j + 1 - extraVersesCount : j + 1;

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
