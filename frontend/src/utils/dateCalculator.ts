/**
 * Hungarian Legal Deadline Calculator Utility
 * Handles skipping weekends and statutory national holidays under Hungarian Law.
 */

// Static national holidays (Month-Day format)
const STATIC_HOLIDAYS = new Set([
  '01-01', // Újév
  '03-15', // Nemzeti ünnep
  '05-01', // Munka ünnepe
  '08-20', // Államalapítás ünnepe
  '10-23', // Forradalom ünnepe
  '11-01', // Mindenszentek
  '12-25', // Karácsony 1.
  '12-26', // Karácsony 2.
]);

// Dynamic holidays for 2026 (Year-Month-Day format)
const DYNAMIC_HOLIDAYS_2026 = new Set([
  '2026-04-03', // Nagypéntek
  '2026-04-06', // Húsvéthétfő
  '2026-05-25', // Pünkösdhétfő
]);

/**
 * Helper function to format a Date object to MM-DD string
 */
function getMonthDayString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * Helper function to format a Date object to YYYY-MM-DD string
 */
function getFullDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a given date is a Hungarian national holiday or a weekend.
 */
function isNonWorkingDay(date: Date): boolean {
  const dayOfWeek = date.getDay();

  // Check for weekends (0 = Sunday, 6 = Saturday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  }

  // Check for static holidays
  const mmdd = getMonthDayString(date);
  if (STATIC_HOLIDAYS.has(mmdd)) {
    return true;
  }

  // Check for dynamic holidays (currently configured for 2026)
  const yyyymmdd = getFullDateString(date);
  if (DYNAMIC_HOLIDAYS_2026.has(yyyymmdd)) {
    return true;
  }

  return false;
}

/**
 * Calculates a legal deadline by adding a specific number of working days to a start date.
 * Skips weekends and defined Hungarian holidays.
 *
 * @param startDate The date of notice / delivery (Kézbesítés dátuma)
 * @param daysToAdd The number of working days to add
 * @returns The final deadline Date object
 */
export function calculateLegalDeadline(startDate: Date, daysToAdd: number): Date {
  if (daysToAdd < 0) {
    // For i18n, we throw a generic error key or rely on UI to validate. We'll throw an error and let UI handle it.
    throw new Error("negativeDaysError");
  }

  // Create a new Date object to avoid mutating the original
  const resultDate = new Date(startDate.getTime());

  let remainingDays = daysToAdd;

  // The day of notice itself (day 0) is usually excluded from the count in procedural law.
  // The counting starts on the next day.
  while (remainingDays > 0) {
    resultDate.setDate(resultDate.getDate() + 1);

    if (!isNonWorkingDay(resultDate)) {
      remainingDays--;
    }
  }

  // If the deadline falls on a non-working day (which shouldn't happen based on the logic above,
  // but standard practice often dictates moving to the next working day if the deadline was an absolute date),
  // we ensure the final date is a working day.
  while (isNonWorkingDay(resultDate)) {
    resultDate.setDate(resultDate.getDate() + 1);
  }

  return resultDate;
}
