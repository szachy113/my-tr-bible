import { Verse } from '@utils/fetchBooks';

export const isExtraVerse = (verse: Verse): boolean =>
  verse.content.every((word) => word.content.startsWith('<i>'));
