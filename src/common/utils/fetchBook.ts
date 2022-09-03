import { supabaseUrl } from '@app/supabaseClient';

export type Verse = { id: string; text: string };
export type Chapter = { id: string; content: Verse[] };
export interface Book {
  name: string;
  abbr: string;
  content: Chapter[];
}

// TODO: Supabase translation.
const polishBooksNamesAndAbbreviations: {
  name: string;
  abbr: string;
}[] = [
  { name: 'Księga Rodzaju', abbr: 'Rdz' },
  { name: 'Księga Wyjścia', abbr: 'Wj' },
  { name: 'Księga Kapłańska', abbr: 'Kpł' },
  { name: 'Księga Liczb', abbr: 'Lb' },
  { name: 'Księga Powtórzonego Prawa', abbr: 'Pwt' },
  { name: 'Księga Sędziów', abbr: 'Sdz' },
  { name: 'Księga Jozuego', abbr: 'Joz' },
  { name: 'Księga Rut', abbr: 'Rt' },
  { name: 'I Księga Samuela', abbr: '1Sm' },
  { name: 'II Księga Samuela', abbr: '2Sm' },
  { name: 'I Księga Królewska', abbr: '1Krl' },
  { name: 'II Księga Królewska', abbr: '2Krl' },
  { name: 'I Księga Kronik', abbr: '1Krn' },
  { name: 'II Księga Kronik', abbr: '2Krn' },
  { name: 'Księga Ezdrasza', abbr: 'Ezd' },
  { name: 'Księga Nehemiasza', abbr: 'Ne' },
  { name: 'Księga Estery', abbr: 'Est' },
  { name: 'Księga Hioba', abbr: 'Hi' },
  { name: 'Księga Psalmów', abbr: 'Ps' },
  { name: 'Księga Przysłów', abbr: 'Prz' },
  { name: 'Księga Kaznodziei', abbr: 'Kaz' },
  { name: 'Pieśń nad Pieśniami', abbr: 'Pnp' },
  { name: 'Księga Izajasza', abbr: 'Iz' },
  { name: 'Księga Jeremiasza', abbr: 'Jr' },
  { name: 'Lamentacje', abbr: 'Lm' },
  { name: 'Księga Ezechiela', abbr: 'Ez' },
  { name: 'Księga Daniela', abbr: 'Dn' },
  { name: 'Księga Ozeasza', abbr: 'Oz' },
  { name: 'Księga Joela', abbr: 'Jl' },
  { name: 'Księga Amosa', abbr: 'Am' },
  { name: 'Księga Abdiasza', abbr: 'Ab' },
  { name: 'Księga Jonasza', abbr: 'Jon' },
  { name: 'Księga Micheasza', abbr: 'Mi' },
  { name: 'Księga Nahuma', abbr: 'Na' },
  { name: 'Księga Habakuka', abbr: 'Ha' },
  { name: 'Księga Sofoniasza', abbr: 'So' },
  { name: 'Księga Aggeusza', abbr: 'Ag' },
  { name: 'Księga Zachariasza', abbr: 'Za' },
  { name: 'Księga Malachiasza', abbr: 'Ml' },
  { name: 'Ewangelia Mateusza', abbr: 'Mt' },
  { name: 'Ewangelia Marka', abbr: 'Mk' },
  { name: 'Ewangelia Łukasza', abbr: 'Łk' },
  { name: 'Ewangelia Jana', abbr: 'J' },
  { name: 'Dzieje Apostolskie', abbr: 'Dz' },
  { name: 'List do Rzymian', abbr: 'Rz' },
  { name: 'I List do Koryntian', abbr: '1Kor' },
  { name: 'II List do Koryntian', abbr: '2Kor' },
  { name: 'List do Galacjan', abbr: 'Ga' },
  { name: 'List do Efezjan', abbr: 'Ef' },
  { name: 'List do Filipian', abbr: 'Flp' },
  { name: 'List do Kolosan', abbr: 'Kol' },
  { name: 'I List do Tesaloniczan', abbr: '1Tes' },
  { name: 'II List do Tesaloniczan', abbr: '2Tes' },
  { name: 'I List do Tymoteusza', abbr: '1Tm' },
  { name: 'II List do Tymoteusza', abbr: '2Tm' },
  { name: 'List do Tytusa', abbr: 'Tt' },
  { name: 'List do Filemona', abbr: 'Flm' },
  { name: 'List do Hebrajczyków', abbr: 'Hbr' },
  { name: 'List Jakuba', abbr: 'Jk' },
  { name: 'I List Piotra', abbr: '1P' },
  { name: 'II List Piotra', abbr: '2P' },
  { name: 'I List Jana', abbr: '1J' },
  { name: 'II List Jana', abbr: '2J' },
  { name: 'III List Jana', abbr: '3J' },
  { name: 'List Judy', abbr: 'Jud' },
  { name: 'Objawienie Jana', abbr: 'Obj' },
];

export async function fetchBook(
  books: Book[] = [],
  id: number = 1,
): Promise<Book[]> {
  if (id > 66) {
    return books;
  }

  const baseUrl = `${supabaseUrl}/storage/v1/object/public/bibles/pl/ubg`;
  const res = await fetch(`${baseUrl}/${id}.json`);

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const { name, abbr } = polishBooksNamesAndAbbreviations[id - 1];
  const chapters = (await res.json()) as string[][];
  const content: Chapter[] = chapters.map((verses, i) => ({
    id: `${i}`,
    content: verses.map((text, j) => ({
      id: `${i}${j}`,
      text,
    })),
  }));
  const book: Book = {
    name,
    abbr,
    content,
  };

  return fetchBook([...books, book], id + 1);
}

// TODO: Make it fetch books w/ their information.
// export async function fetchBooks() {}
