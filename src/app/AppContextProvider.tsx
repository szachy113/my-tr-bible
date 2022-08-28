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

interface AppContext {
  data: Book[] | null;
  currentLocation: CurrentLocation;
  setCurrentLocation: (key: string, value: number) => void;
  currentVerseRef: React.MutableRefObject<HTMLParagraphElement | null>;
}

export const AppCtx = createContext<AppContext | null>(null);

export default function AppContextProvider({ children }: PropsWithChildren) {
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
    () => ({
      data: data ?? null,
      currentLocation,
      setCurrentLocation,
      currentVerseRef,
    }),
    [data, currentLocation, setCurrentLocation],
  );

  // TODO: Handle error.

  if (isLoading) {
    return <Spinner />;
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
