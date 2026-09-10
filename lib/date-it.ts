const ITALIAN_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export type ParsedItalianDate = {
  day: number;
  month: number;
  year: number;
  date: Date;
};

export function parseItalianDate(value: string): ParsedItalianDate | null {
  const match = value.trim().match(ITALIAN_DATE_PATTERN);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { day, month, year, date };
}

export function isValidBirthDate(value: string) {
  const parsed = parseItalianDate(value);
  if (!parsed) return false;

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  if (parsed.date.getTime() > todayUtc) return false;
  if (parsed.year < 1920) return false;

  return true;
}
