type Range = [from: number, to: number];

const PSALMS_WITH_SUPERSCRIPTIONS: Range[] = [
  [3, 9],
  [11, 32],
  [34, 42],
  [44, 53],
  [54, 59],
  [60, 70],
  [72, 90],
  [92, 92],
  [98, 98],
  [100, 103],
  [108, 110],
  [120, 134],
  [138, 145],
];

export const isPsalmWithExtraVerse = (index: number) =>
  PSALMS_WITH_SUPERSCRIPTIONS.some(
    ([from, to]) => index + 1 >= from && index + 1 <= to,
  );

const PSALM_119_HEBREW_LETTERS_VERSES_IDS: string[] = [
  '0',
  '9',
  '18',
  '27',
  '36',
  '45',
  '54',
  '63',
  '72',
  '81',
  '90',
  '99',
  '108',
  '117',
  '126',
  '135',
  '144',
  '153',
  '162',
  '171',
  '180',
  '189',
];

export const isHebrewLetterVerse = (id: string): boolean =>
  PSALM_119_HEBREW_LETTERS_VERSES_IDS.includes(id.slice(id.indexOf('.') + 1));

const HEBREW_ALPHABET: string = 'אבגדהוזחטיכלמנסעפצקרשת';

export const getHebrewLetter = (index: number) => HEBREW_ALPHABET[index];

const PAULINE_EPISTLES_EXTRA_VERSES_IDS: string[] = [
  '15.27',
  '15.24',
  '12.14',
  '5.18',
  '5.24',
  '3.23',
  '3.18',
  '4.28',
  '2.18',
  '5.21',
  '3.22',
  '2.15',
  '0.25',
  '12.25',
];

export const isPaulineEpistleExtraVerse = (id: string): boolean =>
  PAULINE_EPISTLES_EXTRA_VERSES_IDS.includes(id);
