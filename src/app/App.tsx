import { useState, useEffect } from 'react';
import { useEventListener, useScroll } from 'ahooks';
import ReferenceForm from '@components/ReferenceForm';
import Text from '@components/Text';
import AppContextProvider from './AppContextProvider';
import styles from './App.module.css';
import '@picocss/pico';
import '../overwritten.css';

const { container } = styles;

export default function App() {
  const [shouldShowReferenceForm, setShouldShowReferenceForm] = useState(true);
  const [previousTopPos, setPreviousTopPos] = useState(0);
  const scroll = useScroll();

  useEffect(() => {
    if (!scroll) {
      return;
    }

    const { top: currentTopPos } = scroll;

    if (currentTopPos === previousTopPos) {
      return;
    }

    if (currentTopPos > previousTopPos) {
      setShouldShowReferenceForm(false);
    }

    if (currentTopPos < previousTopPos) {
      setShouldShowReferenceForm(true);
    }

    setPreviousTopPos(currentTopPos);
  }, [scroll, previousTopPos]);

  useEventListener('keydown', (e) => {
    const scrollNavigationKeys = ['ArrowDown', 'J', 'ArrowUp', 'K'];

    if (scrollNavigationKeys.includes(e.key)) {
      return;
    }

    if (shouldShowReferenceForm) {
      // TODO: Toggle focus.

      const escapeKeys = ['Escape'];

      if (escapeKeys.includes(e.key)) {
        setShouldShowReferenceForm(false);
      }

      return;
    }

    setShouldShowReferenceForm(true);
  });

  // TODO: Navigation.
  return (
    <div className={container}>
      <AppContextProvider>
        {shouldShowReferenceForm && (
          <ReferenceForm setShouldShow={setShouldShowReferenceForm} />
        )}
        <Text shouldShowReferenceForm={shouldShowReferenceForm} />
      </AppContextProvider>
    </div>
  );
}
