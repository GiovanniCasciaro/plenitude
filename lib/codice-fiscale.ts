const CF_BODY_PATTERN =
  /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;

const MONTH_LETTERS: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  H: 6,
  L: 7,
  M: 8,
  P: 9,
  R: 10,
  S: 11,
  T: 12,
};

const OMOCODIA_DIGITS: Record<string, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  L: 0,
  M: 1,
  N: 2,
  P: 3,
  Q: 4,
  R: 5,
  S: 6,
  T: 7,
  U: 8,
  V: 9,
};

const ODD_MAP: Record<string, number> = {
  "0": 1,
  "1": 0,
  "2": 5,
  "3": 7,
  "4": 9,
  "5": 13,
  "6": 15,
  "7": 17,
  "8": 19,
  "9": 21,
  A: 1,
  B: 0,
  C: 5,
  D: 7,
  E: 9,
  F: 13,
  G: 15,
  H: 17,
  I: 19,
  J: 21,
  K: 2,
  L: 4,
  M: 18,
  N: 20,
  O: 11,
  P: 3,
  Q: 6,
  R: 8,
  S: 12,
  T: 14,
  U: 16,
  V: 10,
  W: 22,
  X: 25,
  Y: 24,
  Z: 23,
};

const EVEN_MAP: Record<string, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
  Q: 16,
  R: 17,
  S: 18,
  T: 19,
  U: 20,
  V: 21,
  W: 22,
  X: 23,
  Y: 24,
  Z: 25,
};

export function normalizeCodiceFiscale(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function checksumChar(cf: string) {
  let sum = 0;
  for (let index = 0; index < 15; index += 1) {
    const char = cf[index];
    const value = index % 2 === 0 ? ODD_MAP[char] : EVEN_MAP[char];
    if (value === undefined) return null;
    sum += value;
  }
  return String.fromCharCode(65 + (sum % 26));
}

function decodeCfDigit(char: string) {
  return OMOCODIA_DIGITS[char];
}

export function extractBirthDateFromCf(value: string) {
  const cf = normalizeCodiceFiscale(value);
  if (cf.length !== 16) return null;

  const yearTens = decodeCfDigit(cf[6]);
  const yearUnits = decodeCfDigit(cf[7]);
  const month = MONTH_LETTERS[cf[8]];
  const dayTens = decodeCfDigit(cf[9]);
  const dayUnits = decodeCfDigit(cf[10]);

  if (
    yearTens === undefined ||
    yearUnits === undefined ||
    !month ||
    dayTens === undefined ||
    dayUnits === undefined
  ) {
    return null;
  }

  let day = dayTens * 10 + dayUnits;
  if (day > 40) day -= 40;
  if (day < 1 || day > 31) return null;

  return {
    day,
    month,
    yearLastTwo: yearTens * 10 + yearUnits,
  };
}

export function isValidCodiceFiscale(value: string) {
  const cf = normalizeCodiceFiscale(value);
  if (!CF_BODY_PATTERN.test(cf)) return false;
  return checksumChar(cf) === cf[15];
}

export function codiceFiscaleMatchesBirthDate(
  codiceFiscale: string,
  birthDate: { day: number; month: number; year: number },
) {
  const extracted = extractBirthDateFromCf(codiceFiscale);
  if (!extracted) return false;
  return (
    extracted.day === birthDate.day &&
    extracted.month === birthDate.month &&
    extracted.yearLastTwo === birthDate.year % 100
  );
}
