import { useState } from 'react';
import { useEventListener } from 'ahooks';
import ReferenceForm from '@components/ReferenceForm';
import Text from '@components/Text';
import AppContextProvider from './AppContextProvider';
import styles from './App.module.css';
import '@picocss/pico';
import '../overwritten.css';

const { container } = styles;

export default function App() {
  const [shouldShowReferenceForm, setShouldShowReferenceForm] = useState(true);
  const [previousYPos, setPreviousYPos] = useState(0);

  useEventListener('scroll', () => {
    const currentYPos = window.pageYOffset;

    if (currentYPos === previousYPos) {
      return;
    }

    if (currentYPos > previousYPos) {
      setShouldShowReferenceForm(false);
    }

    // NOTE: Condition. So that it doesn't pop.
    if (currentYPos && currentYPos < previousYPos) {
      setShouldShowReferenceForm(true);
    }

    setPreviousYPos(currentYPos);
  });

  useEventListener('wheel', () => {
    const currentYPos = window.pageYOffset;

    if (!currentYPos && !previousYPos) {
      setShouldShowReferenceForm(true);
    }
  });

  // TODO: Navigation.
  return (
    <div className={container}>
      <AppContextProvider>
        {shouldShowReferenceForm && <ReferenceForm />}
        <Text />
      </AppContextProvider>
    </div>
  );
}
