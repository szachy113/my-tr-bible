import { Chapter } from '@utils/fetchBook';
import { useRef, useContext, useEffect, useCallback } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import clsx from 'clsx';
import styles from './Book.module.css';

interface BookProps {
  content: Chapter[];
}

const {
  container,
  'verse-container': verseContainer,
  'verse-number': verseNumber,
  focused,
} = styles;

export default function Book({ content }: BookProps) {
  const verseRef = useRef<HTMLParagraphElement | null>(null);
  const { currentLocation, setCurrentLocation } = useContext(AppCtx)!;

  useEffect(() => {
    if (!verseRef.current) {
      return;
    }

    verseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentLocation.verseIndex]);

  const renderChapter = useCallback<(chaper: Chapter) => JSX.Element[]>(
    (chapter) =>
      chapter.map((verse, j) => (
        <p
          ref={currentLocation.verseIndex === j ? verseRef : null}
          className={clsx(verseContainer, {
            [focused]: currentLocation.verseIndex === j,
          })}
          key={verse.id}
          onClick={() => setCurrentLocation('verseIndex', j)}
        >
          <b className={verseNumber}>{j + 1}</b>
          {verse.text}
        </p>
      )),
    [currentLocation.verseIndex, setCurrentLocation],
  );

  return (
    <div className={container}>
      {currentLocation.chapterIndex >= content.length
        ? renderChapter(content[content.length - 1])
        : content.map((chapter, i) => {
            if (i !== currentLocation.chapterIndex) {
              return null;
            }

            return renderChapter(chapter);
          })}
    </div>
  );
}
