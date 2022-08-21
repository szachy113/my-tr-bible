import { supabaseUrl } from '@app/supabaseClient';

type Chapter = string[];
type Book = Chapter[];

export async function fetchBook(
  books: Book[] = [],
  id: number = 1,
): Promise<Book[]> {
  if (id > 66) {
    return books;
  }

  const baseUrl = `${supabaseUrl}/storage/v1/object/public/bibles/pl/ubg`;
  const res = await fetch(`${baseUrl}/${id}.json`);
  const book = await res.json();

  return fetchBook([...books, book], id + 1);
}
