import { useContext, useRef, useCallback } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import { useSwipeable } from 'react-swipeable';
import BookHeader from '@components/BookHeader';
import BookContent from '@components/BookContent';
import styles from './Book.module.css';

const { container } = styles;

export default function Book() {
  const {
    setShouldShowReferenceForm,
    currentLocation,
    data,
    setCurrentLocation,
  } = useContext(AppCtx)!;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const selectChapter = useCallback<
    ({ previous, next }: { previous?: boolean; next?: boolean }) => void
  >(
    ({ previous = false, next = false }) => {
      if ((previous && next) || (!previous && !next)) {
        return;
      }

      const selection = document.getSelection();

      if (selection) {
        selection.removeAllRanges();
      }

      setShouldShowReferenceForm(false);
      setCurrentLocation('verseIndex', -1);

      const isFirstChapter = currentLocation.chapterIndex === 0;
      const isLastChapter =
        currentLocation.chapterIndex ===
        data![currentLocation.bookIndex].content.length - 1;

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
      currentLocation.bookIndex,
      currentLocation.chapterIndex,
      data,
      setCurrentLocation,
    ],
  );

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => selectChapter({ previous: true }),
    onSwipedLeft: () => selectChapter({ next: true }),
  });

  // TODO: Context for the refs?
  return (
    <div
      ref={(el) => {
        containerRef.current = el;

        swipeHandlers.ref(el);
      }}
      className={container}
    >
      <BookHeader headerRef={headerRef} headingRef={headingRef} />
      <BookContent
        parentRef={containerRef}
        headerRef={headerRef}
        headingRef={headingRef}
        selectChapter={selectChapter}
      />
    </div>
  );
}
