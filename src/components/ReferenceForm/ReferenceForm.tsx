import { useContext, useRef, useCallback, useEffect } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import styles from './ReferenceForm.module.css';

interface ReferenceFormProps {
  setShouldShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const { container } = styles;

function useFocusOnMount(): React.MutableRefObject<HTMLInputElement | null> {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const executedRef = useRef(false);

  useEffect(() => {
    if (!inputRef.current || executedRef.current) {
      return;
    }

    inputRef.current.focus();

    executedRef.current = true;
  }, []);

  return inputRef;
}

export default function ReferenceForm({ setShouldShow }: ReferenceFormProps) {
  const { data, setCurrentLocation } = useContext(AppCtx)!;
  const inputRef = useFocusOnMount();

  const handleSubmit = useCallback<React.ChangeEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      inputRef.current!.blur();
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

      window.scrollTo(0, 0);
      setCurrentLocation('bookIndex', correspondingBookIndex);

      const targetChapterNumber = Number(chapter);

      if (!targetChapterNumber) {
        setCurrentLocation('chapterIndex', 0);

        return;
      }

      const correspondingBook = data[correspondingBookIndex];
      const targetChapterIndex =
        targetChapterNumber > correspondingBook.content.length
          ? correspondingBook.content.length - 1
          : targetChapterNumber - 1;

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

      // TODO: Trigger scrollIntoView (same verse).
      setCurrentLocation('verseIndex', targetVerseIndex);
    },
    [data, inputRef, setShouldShow, setCurrentLocation],
  );

  return (
    <form className={container} onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" />
    </form>
  );
}
