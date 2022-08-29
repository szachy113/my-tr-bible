import { useRef, useContext, useCallback, useEffect } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import { useEventListener, useInViewport } from 'ahooks';
import styles from './ReferenceForm.module.css';

const { container } = styles;

function useInputFocus(
  shouldShow: boolean,
): React.MutableRefObject<HTMLInputElement | null> {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (!shouldShow) {
      inputRef.current.blur();

      return;
    }

    if (shouldShow) {
      inputRef.current.focus();
    }
  }, [shouldShow]);

  useEventListener('keydown', (e) => {
    if (!inputRef.current) {
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      inputRef.current.blur();
    }
  });

  return inputRef;
}

export default function ReferenceForm() {
  const {
    data,
    currentLocation,
    setCurrentLocation,
    currentVerseRef,
    shouldShowReferenceForm: shouldShow,
    setShouldShowReferenceForm: setShouldShow,
  } = useContext(AppCtx)!;
  const [isCurrentVerseInView] = useInViewport(currentVerseRef.current, {
    threshold: 1,
  });
  const containerRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useInputFocus(shouldShow);

  useEventListener('keydown', (e) => {
    const navigationKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

    if (navigationKeys.includes(e.key)) {
      return;
    }

    if (shouldShow) {
      if (e.key === 'Escape') {
        setShouldShow(false);
      }

      return;
    }

    setShouldShow(true);
  });

  useEventListener('click', (e) => {
    if (
      !inputRef.current ||
      !currentVerseRef.current ||
      inputRef.current.contains(e.target as Node)
    ) {
      return;
    }

    setShouldShow(false);
  });

  // TODO: Tidy it up.
  const handleSubmit = useCallback<React.ChangeEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      setShouldShow(false);

      const input = e.target[0] as HTMLInputElement;
      const [book, chapter, verse] = input.value.split(/[\s|,|:|.]/g);
      const targetBook = book?.toLowerCase();

      if (!data || !targetBook) {
        return;
      }

      const correspondingBookIndex = data.findIndex(
        ({ abbr }) => abbr.toLowerCase() === targetBook,
      );

      if (correspondingBookIndex < 0) {
        return;
      }

      setCurrentLocation('bookIndex', correspondingBookIndex);

      const targetChapterNumber = Number(chapter);
      const correspondingBook = data[correspondingBookIndex];
      const targetChapterIndex =
        targetChapterNumber > correspondingBook.content.length
          ? correspondingBook.content.length - 1
          : targetChapterNumber - 1;

      if (
        (correspondingBookIndex === currentLocation.bookIndex ||
          targetChapterIndex === currentLocation.chapterIndex) &&
        !verse
      ) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }

      if (!targetChapterNumber) {
        setCurrentLocation('chapterIndex', 0);

        return;
      }

      setCurrentLocation('chapterIndex', targetChapterIndex);

      const targetVerseNumber = Number(verse);

      if (!targetVerseNumber) {
        setCurrentLocation('verseIndex', -1);

        return;
      }

      const targetChapter = correspondingBook.content[targetChapterIndex];
      const targetVerseIndex =
        targetVerseNumber > targetChapter.length
          ? targetChapter.length - 1
          : targetVerseNumber - 1;

      setCurrentLocation('verseIndex', targetVerseIndex);

      if (
        targetVerseIndex !== currentLocation.verseIndex ||
        !currentVerseRef.current
      ) {
        return;
      }

      currentVerseRef.current.scrollIntoView({
        behavior: isCurrentVerseInView ? 'auto' : 'smooth',
        block: 'center',
      });
    },
    [
      data,
      setShouldShow,
      setCurrentLocation,
      currentLocation,
      currentVerseRef,
      isCurrentVerseInView,
    ],
  );

  return (
    <form
      ref={containerRef}
      style={{
        transform: `translateY(${
          !shouldShow ? `-${containerRef.current?.offsetHeight ?? 0}px` : 0
        })`,
      }}
      className={container}
      onSubmit={handleSubmit}
    >
      <input ref={inputRef} type="text" />
    </form>
  );
}
