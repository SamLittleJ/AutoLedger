// Calendar dates are "YYYY-MM-DD" strings, matching the database `date` type.
// The current day comes from the phone's local clock, never toISOString()
// (which is UTC and can be off by one day around midnight).

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toLocalIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

// "2026-10-05" -> "05.10.2026"
export function formatDisplayDate(value: string): string {
  const match = ISO_DATE.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}
