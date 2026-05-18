import { getSupabaseClient } from '../utils/supabaseClient';

export interface ConflictMatch {
  caseId: string;
  source: 'Company Match' | 'Phone Match';
  matchedText: string;
  createdAt: string;
}

export interface ConflictReport {
  query: string;
  totalConflicts: number;
  conflicts: ConflictMatch[];
}

/**
 * Executes a full-text search across the Contacts and Cases tables to identify potential conflicts.
 * @param searchQuery The company name, email domain, or phone number to search for.
 */
export async function runConflictCheck(searchQuery: string): Promise<ConflictReport> {
  if (!searchQuery || searchQuery.trim() === '') {
    throw new Error('Search query cannot be empty.');
  }

  const client = getSupabaseClient();
  const term = `%${searchQuery.trim()}%`;
  const report: ConflictReport = {
    query: searchQuery,
    totalConflicts: 0,
    conflicts: []
  };

  try {
    // 1. Search Contacts table
    const { data: contactsMatches, error: contactsError } = await client
      .from('Contacts')
      .select('idInfringer, company, phone, phone1')
      .or(`company.ilike.${term},phone.ilike.${term},phone1.ilike.${term}`);

    if (contactsError) throw contactsError;

    if (contactsMatches && contactsMatches.length > 0) {
      const infringerIds = contactsMatches.map(c => c.idInfringer);

      // 2. For every matched contact, find associated cases
      const { data: linkedCases, error: linkedCasesError } = await client
        .from('Cases')
        .select('idCase, idInfringer, createdAt')
        .in('idInfringer', infringerIds);

      if (linkedCasesError) throw linkedCasesError;

      if (linkedCases) {
        for (const caseRec of linkedCases) {
          const contact = contactsMatches.find(c => c.idInfringer === caseRec.idInfringer);
          if (!contact) continue;

          const queryLower = searchQuery.toLowerCase();

          if (contact.company && contact.company.toLowerCase().includes(queryLower)) {
            report.conflicts.push({
              caseId: caseRec.idCase,
              source: 'Company Match',
              matchedText: contact.company,
              createdAt: caseRec.createdAt
            });
          }

          if ((contact.phone && contact.phone.toLowerCase().includes(queryLower)) ||
              (contact.phone1 && contact.phone1.toLowerCase().includes(queryLower))) {
            report.conflicts.push({
              caseId: caseRec.idCase,
              source: 'Phone Match',
              matchedText: contact.phone || contact.phone1,
              createdAt: caseRec.createdAt
            });
          }
        }
      }
    }

    // Deduplicate identical matches
    report.conflicts = report.conflicts.filter((result, index, self) =>
      index === self.findIndex((t) => (
        t.caseId === result.caseId && t.source === result.source
      ))
    );

    report.totalConflicts = report.conflicts.length;
    return report;

  } catch (err) {
    console.error('[ConflictService] Error running conflict check:', err);
    throw new Error('Failed to execute conflict search against the database.');
  }
}
