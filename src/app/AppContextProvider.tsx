import { Book, fetchBook } from '@utils/fetchBook';
import {
  createContext,
  PropsWithChildren,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useQuery } from 'react-query';
import Spinner from '@components/Spinner';

interface CurrentLocation {
  bookIndex: number;
  chapterIndex: number;
  verseIndex: number;
}

interface AppContext {
  data: Book[] | null;
  currentLocation: CurrentLocation;
  setCurrentLocation: (key: string, value: number) => void;
}

export const AppCtx = createContext<AppContext | null>(null);

export default function AppContextProvider({ children }: PropsWithChildren) {
  const { isLoading, data } = useQuery('books', () => fetchBook());
  const [currentLocation, _setCurrentLocation] = useState<CurrentLocation>({
    bookIndex: 42, // NOTE: John
    chapterIndex: 0,
    verseIndex: -1,
  });

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
    }),
    [data, currentLocation, setCurrentLocation],
  );

  // TODO: Handle error.

  if (isLoading) {
    return <Spinner />;
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
