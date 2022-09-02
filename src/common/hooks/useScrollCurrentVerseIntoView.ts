import { useContext, useCallback } from 'react';
import { AppCtx } from '@app/AppContextProvider';
import scrollIntoView from 'scroll-into-view';

type ScrollCurrentVerseIntoViewCallback = (
  settings?: __ScrollIntoView.Settings,
) => void;

/**
 * The native solution doesn't work properly in my case and scroll-into-view package works even better (i.e., more accurate at the end).
 */
export function useScrollCurrentVerseIntoView(): ScrollCurrentVerseIntoViewCallback {
  const { currentVerseRef } = useContext(AppCtx)!;

  const scrollCurrentVerseIntoView =
    useCallback<ScrollCurrentVerseIntoViewCallback>(
      (settings) => {
        if (!currentVerseRef.current) {
          return;
        }

        scrollIntoView(currentVerseRef.current, {
          // NOTE: Default value for time. Twice the form animation duration.
          time: 500,
          ...settings,
        });
      },
      [currentVerseRef],
    );

  return scrollCurrentVerseIntoView;
}
