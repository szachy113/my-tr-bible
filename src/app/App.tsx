import { useState } from 'react';
import { useEventListener, useDebounceFn } from 'ahooks';
import ReferenceForm from '@components/ReferenceForm';
import Book from '@components/Book';
import AppContextProvider from './AppContextProvider';
import styles from './App.module.css';
import '@picocss/pico';
import '../overwritten.css';

const { container } = styles;

export default function App() {
  const [shouldShowReferenceForm, _setShouldShowReferenceForm] = useState(true);
  const [previousTopPos, setPreviousTopPos] = useState(0);

  const { run: setShouldShowReferenceForm } = useDebounceFn<
    (value: boolean) => void
  >(
    (value) => _setShouldShowReferenceForm(value),
    // NOTE: Half the animation duration.
    { wait: 125 },
  );

  useEventListener('scroll', () => {
    const currentTopPos = document.documentElement.scrollTop;
    const diff = Math.abs(currentTopPos - previousTopPos);

    if (
      currentTopPos === previousTopPos ||
      (diff === previousTopPos && diff > 13)
    ) {
      return;
    }

    const hasUserOrigin = diff >= 12;

    if (hasUserOrigin) {
      if (currentTopPos > previousTopPos) {
        setShouldShowReferenceForm(false);
      }

      if (currentTopPos < previousTopPos) {
        setShouldShowReferenceForm(true);
      }
    }

    setPreviousTopPos(currentTopPos);
  });

  // TODO: Navigation etc.
  return (
    <div className={container}>
      <AppContextProvider
        shouldShowReferenceForm={shouldShowReferenceForm}
        setShouldShowReferenceForm={setShouldShowReferenceForm}
      >
        <ReferenceForm />
        <Book />
      </AppContextProvider>
    </div>
  );
}
