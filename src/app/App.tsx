import { DebouncedFunc } from 'lodash';
import { useState } from 'react';
import { useEventListener, useDebounceFn } from 'ahooks';
import ReferenceForm from '@components/ReferenceForm';
import Book from '@components/Book';
import ContextProvider from './ContextProvider';
import styles from './App.module.css';
import '@picocss/pico';
import '../overwritten.css';

const { container } = styles;

function useToggleReferenceFormOnScroll(
  setter: DebouncedFunc<(value: boolean) => void>,
): void {
  const [previousTopPos, setPreviousTopPos] = useState(0);

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
        setter(false);
      }

      if (currentTopPos < previousTopPos) {
        setter(true);
      }
    }

    setPreviousTopPos(currentTopPos);
  });
}

export default function App() {
  const [shouldShowReferenceForm, _setShouldShowReferenceForm] = useState(true);

  const { run: setShouldShowReferenceForm } = useDebounceFn<
    (value: boolean) => void
  >(
    (value) => _setShouldShowReferenceForm(value),
    // NOTE: Half the animation duration.
    { wait: 125 },
  );

  useToggleReferenceFormOnScroll(setShouldShowReferenceForm);

  // TODO: Navigation etc.
  return (
    <div className={container}>
      <ContextProvider
        shouldShowReferenceForm={shouldShowReferenceForm}
        setShouldShowReferenceForm={setShouldShowReferenceForm}
      >
        <ReferenceForm />
        <Book />
      </ContextProvider>
    </div>
  );
}
