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
import { LoadingErrorMessageProps as FetchError } from '@components/LoadingError/LoadingError';
import Spinner from '@components/Spinner';
import LoadingError from '@components/LoadingError';

interface ContextProviderProps {
  shouldShowReferenceForm: boolean;
  setShouldShowReferenceForm: DebouncedFunc<(value: boolean) => void>;
}

export interface CurrentLocation {
  bookIndex: number;
  chapterIndex: number;
  verseIndex: number;
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
  const language = params.language ?? 'en';
  const { data, isLoading, isError, error } = useQuery<Book[], FetchError>(
    'books',
    () =>
      fetchBooks({
        language,
        version: params.version,
      }),
    {
      retry: 1,
    },
  );
  const [currentLocation, _setCurrentLocation] = useState<CurrentLocation>({
    bookIndex: 42, // NOTE: John
    chapterIndex: 0,
    verseIndex: -1,
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

  if (isLoading) {
    return <Spinner language={language} />;
  }

  if (isError) {
    return <LoadingError message={error.message} />;
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
