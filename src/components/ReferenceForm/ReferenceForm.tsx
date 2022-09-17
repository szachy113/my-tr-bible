import { DebouncedFunc } from 'lodash';
import { useRef, useContext, useCallback, useEffect } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import { useEventListener } from 'ahooks';
import { useScrollCurrentVerseIntoView } from '@hooks/useScrollCurrentVerseIntoView';
import styles from './ReferenceForm.module.css';

const { container } = styles;

function useInputFocus(
  shouldShow: boolean,
  setShouldShow: DebouncedFunc<(value: boolean) => void>,
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

    const scrollKeys = ['ArrowUp', 'ArrowDown'];

    if (!scrollKeys.includes(e.key)) {
      return;
    }

    inputRef.current.blur();

    if (e.key === 'ArrowUp') {
      // TODO: Maybe reset a timeout?
      setShouldShow(true);

      return;
    }

    setShouldShow(false);
  });

  return inputRef;
}

export default function ReferenceForm() {
  const {
    data,
    currentLocation,
    setCurrentLocation,
    shouldShowReferenceForm: shouldShow,
    setShouldShowReferenceForm: setShouldShow,
  } = useContext(AppCtx)!;
  const containerRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useInputFocus(shouldShow, setShouldShow);
  const scrollCurrentVerseIntoView = useScrollCurrentVerseIntoView();

  useEventListener('keydown', (e) => {
    const navigationKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

    if (
      navigationKeys.includes(e.key) ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey
    ) {
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
    if (!inputRef.current || inputRef.current.contains(e.target as Node)) {
      return;
    }

    setShouldShow(false);
  });

  // TODO: Tidy it up.
  // TODO: Throttle (?) (Enter spam case).
  const handleSubmit = useCallback<React.ChangeEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();

      const input = e.target[0] as HTMLInputElement;
      const trimmedInputValue = input.value.trim();

      input.value = trimmedInputValue;

      const [bookInput, chapterInput, verseInput] =
        trimmedInputValue.split(/[\s|,|:|.]/g);

      if (!data || !bookInput) {
        return;
      }

      const targetBookIndex = data.findIndex(
        ({ abbreviation }) =>
          abbreviation.toLowerCase() === bookInput.toLowerCase(),
      );

      if (targetBookIndex < 0) {
        return;
      }

      setShouldShow(false);
      setCurrentLocation('bookIndex', targetBookIndex);

      const targetChapterNumber = Number(chapterInput);
      const targetBook = data[targetBookIndex];

      const targetChapterIndex =
        targetChapterNumber > targetBook.content.length
          ? targetBook.content.length - 1
          : targetChapterNumber - 1;

      if (
        ((targetBookIndex === currentLocation.bookIndex && !chapterInput) ||
          targetChapterIndex === currentLocation.chapterIndex) &&
        !verseInput
      ) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

        return;
      }

      if (!targetChapterNumber) {
        setCurrentLocation('chapterIndex', 0);

        return;
      }

      setCurrentLocation('chapterIndex', targetChapterIndex);

      const targetVerseNumber = Number(verseInput);

      if (!targetVerseNumber) {
        setCurrentLocation('verseIndex', -1);

        return;
      }

      const targetChapter = targetBook.content[targetChapterIndex];

      let targetVerseIndex =
        targetVerseNumber > targetChapter.content.length
          ? targetChapter.content.length - 1
          : targetVerseNumber - 1;

      const isLastChapter =
        targetChapterIndex === targetBook.content.length - 1;
      const isLastVerse = targetVerseIndex === targetChapter.content.length - 1;
      const isPaulineEpistle = targetBookIndex >= 44 && targetBookIndex <= 58;

      if (isLastChapter && isLastVerse && isPaulineEpistle) {
        targetVerseIndex -= 1;
      }

      const isPsalm = targetBookIndex === 18;

      if (!isLastVerse && isPsalm) {
        // TODO: Should be shared by some context!!
        // NOTE: Since there won't be more than two extra verses.
        const firstTwoVerses = targetChapter.content.slice(0, 2);
        const extraVersesCount = firstTwoVerses.reduce(
          (total, curr) =>
            curr.content.every((word) => word.content.startsWith('<i>'))
              ? total + 1
              : total,
          0,
        );
        const hasExtraVerses = extraVersesCount > 0;

        if (hasExtraVerses) {
          const isInExtraVersesRange =
            targetVerseIndex >= targetChapter.content.length - extraVersesCount;

          targetVerseIndex += isInExtraVersesRange
            ? targetChapter.content.length - targetVerseNumber
            : extraVersesCount;
        }
      }

      setCurrentLocation('verseIndex', targetVerseIndex);

      if (targetVerseIndex !== currentLocation.verseIndex) {
        return;
      }

      scrollCurrentVerseIntoView();
    },
    [
      data,
      setShouldShow,
      setCurrentLocation,
      currentLocation,
      scrollCurrentVerseIntoView,
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
