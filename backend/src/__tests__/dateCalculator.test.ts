import { calculateLegalDeadline, clearHolidayCache } from '../../../frontend/src/utils/dateCalculator';

// Mock the global fetch function
global.fetch = jest.fn();

describe('dateCalculator Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearHolidayCache(); // Ensure no cross-test pollution
  });

  it('should correctly calculate an 8-day deadline without holidays (only weekends)', async () => {
    // Setup a mock to return no dynamic holidays
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // Start on Monday, April 13, 2026
    const startDate = new Date(2026, 3, 13); // Note: Month is 0-indexed

    // Adding 8 working days.
    // M T W T F S S M T W T F
    // 0 1 2 3 4 x x 5 6 7 8
    // Start 13th.
    // +1: 14th
    // +2: 15th
    // +3: 16th
    // +4: 17th
    // (18th, 19th are weekend)
    // +5: 20th
    // +6: 21st
    // +7: 22nd
    // +8: 23rd
    const deadline = await calculateLegalDeadline(startDate, 8);

    expect(deadline.getFullYear()).toBe(2026);
    expect(deadline.getMonth()).toBe(3); // April
    expect(deadline.getDate()).toBe(23);
  });

  it('should skip standard Hungarian statutory holidays (March 15)', async () => {
    // Setup a mock to return no dynamic holidays, testing the static fallback logic implicitly
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Down'));

    // Start on March 12, 2026 (Thursday)
    const startDate = new Date(2026, 2, 12);

    // Add 2 working days.
    // Mar 13 (Fri) -> Day 1
    // Mar 14 (Sat) -> Weekend
    // Mar 15 (Sun) -> Weekend AND Static Holiday
    // Mar 16 (Mon) -> Day 2
    const deadline = await calculateLegalDeadline(startDate, 2);

    expect(deadline.getDate()).toBe(16);
  });

  it('should skip dynamic holidays fetched from the API (Good Friday, Easter Monday)', async () => {
    // Mock the API returning Easter 2026 dates
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { date: '2026-04-03', name: 'Nagypéntek' },
        { date: '2026-04-06', name: 'Húsvéthétfő' }
      ],
    });

    // Start on April 2, 2026 (Thursday)
    const startDate = new Date(2026, 3, 2);

    // Add 1 working day.
    // April 3 (Fri) -> Good Friday (Skip)
    // April 4 (Sat) -> Weekend (Skip)
    // April 5 (Sun) -> Weekend (Skip)
    // April 6 (Mon) -> Easter Monday (Skip)
    // April 7 (Tue) -> Day 1
    const deadline = await calculateLegalDeadline(startDate, 1);

    expect(deadline.getDate()).toBe(7);
    expect(deadline.getMonth()).toBe(3);
  });

  it('should fall back to the internal cache if the Nager.Date API is down', async () => {
    // Force the API to fail
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    // We know 2026-05-25 is in the FALLBACK_DYNAMIC_HOLIDAYS_2026
    // Start on May 22, 2026 (Friday)
    const startDate = new Date(2026, 4, 22);

    // Add 1 working day.
    // May 23 (Sat) -> Skip
    // May 24 (Sun) -> Skip
    // May 25 (Mon) -> Whit Monday (Fallback Cache Skip)
    // May 26 (Tue) -> Day 1
    const deadline = await calculateLegalDeadline(startDate, 1);

    expect(deadline.getDate()).toBe(26);
    expect(deadline.getMonth()).toBe(4);
  });

  it('should throw an error if daysToAdd is negative', async () => {
    const startDate = new Date();
    await expect(calculateLegalDeadline(startDate, -5)).rejects.toThrow("negativeDaysError");
  });

});
