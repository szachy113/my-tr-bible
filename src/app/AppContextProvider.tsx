import { DebouncedFunc } from 'lodash';
import { Book, fetchBook } from '@utils/fetchBook';
import {
  createContext,
  PropsWithChildren,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useQuery } from 'react-query';
import Spinner from '@components/Spinner';

export interface CurrentLocation {
  bookIndex: number;
  chapterIndex: number;
  verseIndex: number;
}

interface AppContextProviderProps {
  shouldShowReferenceForm: boolean;
  setShouldShowReferenceForm: DebouncedFunc<(value: boolean) => void>;
}

interface AppContext extends AppContextProviderProps {
  data: Book[] | null;
  currentLocation: CurrentLocation;
  setCurrentLocation: (key: string, value: number) => void;
  currentVerseRef: React.MutableRefObject<HTMLParagraphElement | null>;
}

export const AppCtx = createContext<AppContext | null>(null);

export default function AppContextProvider({
  shouldShowReferenceForm,
  setShouldShowReferenceForm,
  children,
}: PropsWithChildren<AppContextProviderProps>) {
  const { isLoading, data } = useQuery('books', () => fetchBook());
  const [currentLocation, _setCurrentLocation] = useState<CurrentLocation>({
    bookIndex: 42, // NOTE: John
    chapterIndex: 0,
    verseIndex: -1,
  });
  const currentVerseRef = useRef<HTMLParagraphElement | null>(null);

  const setCurrentLocation = useCallback<(key: string, value: number) => void>(
    (key, value) =>
      _setCurrentLocation((prev) => ({
        ...prev,
        [key]: value,
      })),
    [],
  );

  const value = useMemo(
    (): AppContext => ({
      data: data ?? null,
      currentLocation,
      setCurrentLocation,
      currentVerseRef,
      shouldShowReferenceForm,
      setShouldShowReferenceForm,
    }),
    [
      data,
      currentLocation,
      setCurrentLocation,
      shouldShowReferenceForm,
      setShouldShowReferenceForm,
    ],
  );

  // TODO: Handle error.

  if (isLoading) {
    return <Spinner />;
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
