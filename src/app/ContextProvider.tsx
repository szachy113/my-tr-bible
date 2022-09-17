import { DebouncedFunc } from 'lodash';
import { Book, fetchBooks } from '@utils/fetchBooks';
import {
  createContext,
  PropsWithChildren,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useParams } from 'react-router-dom';
import { LanguageCode } from 'iso-639-1';
import { useQuery } from 'react-query';
import Spinner from '@components/Spinner';

interface ContextProviderProps {
  shouldShowReferenceForm: boolean;
  setShouldShowReferenceForm: DebouncedFunc<(value: boolean) => void>;
}

export interface CurrentLocation {
  bookIndex: number;
  chapterIndex: number;
  verseIndex: number;
  chapterExtraVersesCount: number;
}

export type SetCurrentLocation = (
  key: keyof CurrentLocation,
  value: number | ((prevState: number) => number),
) => void;

interface AppContext extends ContextProviderProps {
  data: Book[] | null;
  currentLocation: CurrentLocation;
  setCurrentLocation: SetCurrentLocation;
  currentVerseRef: React.MutableRefObject<HTMLLIElement | null>;
  language: LanguageCode;
}

export const AppCtx = createContext<AppContext | null>(null);

export default function ContextProvider({
  shouldShowReferenceForm,
  setShouldShowReferenceForm,
  children,
}: PropsWithChildren<ContextProviderProps>) {
  const params = useParams() as {
    language?: LanguageCode;
    version?: string;
  };
  // TODO: Default language should be based on user's browser preferences.
  const language = useMemo(() => params.language ?? 'en', [params.language]);
  const { isLoading, data } = useQuery('books', () =>
    fetchBooks({
      language,
      version: params.version,
    }),
  );

  const [currentLocation, _setCurrentLocation] = useState<CurrentLocation>({
    bookIndex: 42, // NOTE: John
    chapterIndex: 0,
    verseIndex: -1,
    chapterExtraVersesCount: 0,
  });
  const currentVerseRef = useRef<HTMLLIElement | null>(null);

  const setCurrentLocation = useCallback<SetCurrentLocation>(
    (key, value) =>
      _setCurrentLocation((prev) => ({
        ...prev,
        [key]: typeof value === 'function' ? value(prev[key]) : value,
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
      language,
    }),
    [
      data,
      currentLocation,
      setCurrentLocation,
      shouldShowReferenceForm,
      setShouldShowReferenceForm,
      language,
    ],
  );

  // TODO: Handle error.

  if (isLoading) {
    return <Spinner language={language} />;
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
