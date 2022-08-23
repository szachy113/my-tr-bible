import ReferenceForm from '@components/ReferenceForm';
import Text from '@components/Text';
import AppContextProvider from './AppContextProvider';
import styles from './App.module.css';
import '@picocss/pico';
import '../main.css';

const { container } = styles;

export default function App() {
  // TODO: Navigation.
  return (
    <div className={container}>
      <AppContextProvider>
        <ReferenceForm />
        <Text />
      </AppContextProvider>
    </div>
  );
}
