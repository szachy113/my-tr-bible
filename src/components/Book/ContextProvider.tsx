import { createContext, PropsWithChildren, useRef, useMemo } from 'react';

interface BookContext {
  headerRef: React.MutableRefObject<HTMLDivElement | null>;
  headingRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const BookCtx = createContext<BookContext | null>(null);

export default function ContextProvider({ children }: PropsWithChildren) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const value = useMemo(
    (): BookContext => ({
      headerRef,
      headingRef,
    }),
    [],
  );

  return <BookCtx.Provider value={value}>{children}</BookCtx.Provider>;
}
