import { LanguageCode } from 'iso-639-1';
import { supabase, supabaseUrl } from '@app/supabaseClient';

export type Word = { id: string; content: string };
export type Verse = { id: string; content: Word[] };
export type Chapter = { id: string; content: Verse[] };
export interface Book {
  name: string;
  abbreviation: string;
  content: Chapter[];
}

export async function fetchBooks({
  language,
  version,
}: {
  language: LanguageCode;
  version?: string;
}): Promise<Book[]> {
  const { data: bibleVersions, error: bibleVersionsError } = await supabase
    .from<{
      id: number;
      abbreviation: string;
      name: string;
      language: {
        id: number;
        code: LanguageCode;
      };
    }>('bible_version')
    .select('id, abbreviation, name, language(*)');

  if (bibleVersionsError) {
    throw new Error(bibleVersionsError.message);
  }

  const targetVersion = bibleVersions.find((bibleVersion) => {
    if (language && version) {
      return (
        bibleVersion.language.code === language.toLowerCase() &&
        bibleVersion.abbreviation.toLowerCase() === version.toLowerCase()
      );
    }

    return bibleVersion.language.code === language.toLowerCase();
  });

  if (!targetVersion) {
    const errorSubject = language && version ? 'Bible version' : 'language';

    throw new Error(
      `There is nothing here! Please check the link for supported ${errorSubject}s.`,
    );
  }

  const url = `${supabaseUrl}/storage/v1/object/public/bibles/${language}/${targetVersion.abbreviation.toLowerCase()}.json`;
  const res = await fetch(url);
  const { data } = (await res.json()) as { data: string[][][] };

  const { data: booksInformation, error: booksInformationError } =
    await supabase
      .from<{
        book_id: number;
        language_id: number;
        name: string;
        abbreviation: string;
      }>('book_translation')
      .select('book_id, language_id, name, abbreviation')
      .eq('language_id', targetVersion.language.id)
      .order('book_id');

  if (booksInformationError) {
    throw new Error(booksInformationError.message);
  }

  return data.map((book, i) => {
    const { name, abbreviation } = booksInformation[i];

    const content: Chapter[] = book.map((verses, j) => ({
      id: `${j}`,
      content: verses.map((verse, k) => ({
        id: `${j}.${k}`,
        content: verse.split(' ').map((word, l) => ({
          id: `${j}.${k}.${l}`,
          content: word,
        })),
      })),
    }));

    return {
      name,
      abbreviation,
      content,
    };
  });
}
