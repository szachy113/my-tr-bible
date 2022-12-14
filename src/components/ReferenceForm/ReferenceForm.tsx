import { DebouncedFunc } from 'lodash';
import { useRef, useContext, useCallback, useEffect } from 'react';
import { AppCtx } from '@app/ContextProvider';
import { useEventListener } from 'ahooks';
import { useScrollCurrentVerseIntoView } from '@hooks/useScrollCurrentVerseIntoView';
import {
  isPaulineEpistleExtraVerse,
  isPsalmWithExtraVerse,
} from '@utils/extraVerses';
import styles from './ReferenceForm.module.css';

const { container, input } = styles;

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
      inputRef.current.removeAttribute('aria-invalid');

      return;
    }

    if (shouldShow) {
      inputRef.current.focus();
    }
  }, [shouldShow]);

  useEventListener('keydown', (e) => {
    const scrollKeys = ['ArrowUp', 'ArrowDown'];

    if (!inputRef.current || !scrollKeys.includes(e.key)) {
      return;
    }

    inputRef.current.blur();
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

  const handleSubmit = useCallback<React.ChangeEventHandler<HTMLFormElement>>(
    (e) => {
      if (!inputRef.current) {
        return;
      }

      e.preventDefault();
      setCurrentLocation('verseIndex', -1);

      const { current: inputEl } = inputRef;
      const trimmedInputValue = inputEl.value.trim().replace(/\s+/g, ' ');

      inputEl.value = trimmedInputValue;

      const splitInput = trimmedInputValue
        .toLowerCase()
        .split(/[\s|,|:|.]/g)
        .filter((inputValue) => inputValue);
      const separatedInput =
        Number(splitInput[0]) || ['i', 'ii', 'iii'].includes(splitInput[0])
          ? [`${splitInput[0]} ${splitInput[1]}`, ...splitInput.slice(2)]
          : splitInput;
      const [bookInput, chapterInput, verseInput] = separatedInput;

      if (!data || !bookInput) {
        inputEl.setAttribute('aria-invalid', 'true');

        return;
      }

      const targetBookIndex = data.findIndex(({ name, abbreviation }) => {
        const makeComparable = (value: string): string =>
          value.toLowerCase().replace(/[\s|.]/g, '');

        const [potentialRomanNumeral] = name.split(' ');
        const [potentialArabicNumeral] = bookInput.split(' ');
        const doesNameHaveRomanNumeral =
          potentialRomanNumeral.length <= 3 &&
          potentialRomanNumeral.split('').every((char) => char === 'I');
        const doesInputHaveArabicNumeral =
          potentialArabicNumeral.length === 1 &&
          !!Number(potentialArabicNumeral);

        let comparableInput = makeComparable(bookInput);

        if (doesNameHaveRomanNumeral && doesInputHaveArabicNumeral) {
          comparableInput = `${'i'.repeat(
            Number(potentialArabicNumeral),
          )}${comparableInput.slice(1)}`;
        }

        const comparableNames = [makeComparable(name)];

        // TODO: Handle name exception(s) (i.e., Psalms) more generically (other languages). Supabase. x2
        if (comparableNames[0].includes('psalm')) {
          comparableNames.push('psalm');
        }

        const comparableAbbreviation = makeComparable(abbreviation);

        return [comparableAbbreviation, ...comparableNames].includes(
          comparableInput,
        );
      });

      if (targetBookIndex < 0) {
        inputEl.setAttribute('aria-invalid', 'true');

        return;
      }

      const isPsalm = targetBookIndex === 18;

      if (
        (separatedInput[0] === 'psalm??w' || separatedInput[0] === 'psalms') &&
        isPsalm
      ) {
        separatedInput[0] = 'psalm';
      }

      inputRef.current.setAttribute('aria-invalid', 'false');
      setCurrentLocation('bookIndex', targetBookIndex);
      setShouldShow(false);

      const targetChapterNumber = Number(chapterInput);
      const targetBook = data[targetBookIndex];

      let targetChapterIndex = targetChapterNumber - 1;

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
        inputEl.value = bookInput;

        setCurrentLocation('chapterIndex', 0);

        return;
      }

      const usedVerseSeparator = trimmedInputValue.match(/[,|:]/g)?.[0];

      if (targetChapterNumber > targetBook.content.length) {
        separatedInput[1] = ` ${targetBook.content.length}${
          usedVerseSeparator ?? ''
        }`;

        inputEl.value = separatedInput.join('');

        targetChapterIndex = targetBook.content.length - 1;
      }

      setCurrentLocation('chapterIndex', targetChapterIndex);

      const targetVerseNumber = Number(verseInput);

      if (!targetVerseNumber) {
        inputEl.value = `${bookInput} ${chapterInput}`;

        setCurrentLocation('verseIndex', -1);

        return;
      }

      const targetChapter = targetBook.content[targetChapterIndex];

      let targetVerseIndex = targetVerseNumber - 1;

      const isLastVerse = targetVerseIndex === targetChapter.content.length - 1;
      const isPsalm119 = isPsalm && targetChapterNumber === 119;

      if (
        targetVerseNumber > targetChapter.content.length ||
        (isPsalm119 && targetVerseNumber > 176)
      ) {
        if (targetChapterNumber <= targetBook.content.length) {
          separatedInput[0] += ' ';
        }

        targetVerseIndex = targetChapter.content.length - 1;

        const isPaulineEpistle = targetBookIndex >= 44 && targetBookIndex <= 58;
        const verseId = `${targetChapterIndex}.${targetVerseIndex}`;
        const isPaulineEpistleAndHasExtraVerse =
          isPaulineEpistle && isPaulineEpistleExtraVerse(verseId);

        if (isPaulineEpistleAndHasExtraVerse) {
          targetVerseIndex -= 1;
        }

        let correctedVerseNumber = targetChapter.content.length;

        if (isPaulineEpistleAndHasExtraVerse) {
          correctedVerseNumber = targetChapter.content.length - 1;
        }

        if (isPsalm119) {
          correctedVerseNumber = 176;
        }

        separatedInput[2] = `${
          targetChapterNumber > targetBook.content.length
            ? ''
            : usedVerseSeparator
        }${correctedVerseNumber}`;

        inputEl.value = separatedInput.join('');
      }

      if (
        !isLastVerse &&
        isPsalm &&
        isPsalmWithExtraVerse(targetChapterIndex)
      ) {
        targetVerseIndex += 1;
      }

      if (!isLastVerse && isPsalm119) {
        const isSectionBeginningVerse = (targetVerseNumber - 9) % 8 === 0;
        const shortage = Math.ceil(targetVerseIndex / 8);

        targetVerseIndex += isSectionBeginningVerse ? shortage + 1 : shortage;

        if (targetVerseIndex > targetChapter.content.length) {
          targetVerseIndex = targetChapter.content.length - 1;
        }
      }

      setCurrentLocation('verseIndex', targetVerseIndex);

      if (targetVerseIndex !== currentLocation.verseIndex) {
        return;
      }

      scrollCurrentVerseIntoView();
    },
    [
      inputRef,
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
          !shouldShow
            ? `calc(${containerRef.current?.offsetHeight ?? 0}px * -1)`
            : 0
        })`,
      }}
      className={container}
      onSubmit={handleSubmit}
    >
      <input ref={inputRef} className={input} type="text" />
    </form>
  );
}
