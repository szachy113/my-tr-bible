import { useContext } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import Book from '@components/Book';
import styles from './Text.module.css';

const { title } = styles;

export default function Text() {
  const { data, currentLocation } = useContext(AppCtx)!;

  if (!data) {
    return null;
  }

  // TODO: Other name exceptions?
  const { name, content } = data[currentLocation.bookIndex];

  return (
    <div>
      <h2 className={title}>
        {name === 'Księga Psalmów' ? 'Psalm' : name}{' '}
        {currentLocation.chapterIndex + 1}
      </h2>
      <Book content={content} />
    </div>
  );
}
