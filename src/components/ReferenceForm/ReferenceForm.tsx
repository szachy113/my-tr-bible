import { useContext, useCallback } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import styles from './ReferenceForm.module.css';

const { container } = styles;

export default function ReferenceForm() {
  const { data, setCurrentLocation } = useContext(AppCtx)!;

  const handleSubmit = useCallback<React.ChangeEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();

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

      // TODO: Trigger scrollIntoView.
      setCurrentLocation('verseIndex', targetVerseIndex);
    },
    [data, setCurrentLocation],
  );

  return (
    <form className={container} onSubmit={handleSubmit}>
      <input type="text" />
    </form>
  );
}
