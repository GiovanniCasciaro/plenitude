const ITALIAN_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export type ParsedItalianDate = {
  day: number;
  month: number;
  year: number;
  date: Date;
};

/**
 * Formats a birth-date input as GG/MM/AAAA while typing (digits only, max 8).
 * Inserts `/` right after day (2 digits) and month (2 digits) when typing forward.
 * `previous` avoids re-adding `/` when the user deletes.
 */
export function formatItalianDateInput(
  value: string,
  previous = "",
): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const previousDigits = previous.replace(/\D/g, "");
  const isAddingDigits = digits.length > previousDigits.length;

  let formatted: string;
  if (digits.length <= 2) {
    formatted = digits;
  } else if (digits.length <= 4) {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  // Add trailing `/` only while typing forward after day or month is complete.
  if (
    isAddingDigits &&
    (digits.length === 2 || digits.length === 4) &&
    !formatted.endsWith("/")
  ) {
    formatted += "/";
  }

  return formatted;
}

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
