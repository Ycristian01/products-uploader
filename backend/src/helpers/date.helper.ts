/**
 * @param dateStr - date with format MM/DD/YYYY
 * @returns date in ISO format YYYY-MM-DD
 */
export function formatDateToISO(dateStr: string): string {
  const [month, day, year] = dateStr.split('/');

  if (!month || !day || !year) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return isoDate;
}
