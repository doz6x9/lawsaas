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
 * Uses fuzzy matching for company names.
 * @param searchQuery The company name, email domain, or phone number to search for.
 */
export async function runConflictCheck(searchQuery: string): Promise<ConflictReport> {
  if (!searchQuery || searchQuery.trim() === '') {
    throw new Error('Search query cannot be empty.');
  }

  const client = getSupabaseClient();
  const rawQuery = searchQuery.trim();
  const term = `%${rawQuery}%`;
  const report: ConflictReport = {
    query: rawQuery,
    totalConflicts: 0,
    conflicts: []
  };

  try {
    // 1. Search Contacts table (Company Name) - Fuzzy Matching via RPC
    const { data: fuzzyContacts, error: fuzzyError } = await client.rpc('search_conflicts_fuzzy', {
      search_term: rawQuery
    });

    let contactsMatches: any[] = [];
    if (fuzzyError) {
      console.warn('Fuzzy search RPC failed, falling back to standard ilike:', fuzzyError);
      const { data, error } = await client
        .from('Contacts')
        .select('idInfringer, company')
        .ilike('company', term);
      if (error) throw error;
      if (data) contactsMatches = data;
    } else if (fuzzyContacts) {
      contactsMatches = fuzzyContacts;
    }

    // 2. Search in ContactPhones (Phone Number)
    const { data: phonesMatches, error: phonesError } = await client
      .from('ContactPhones')
      .select('idInfringer, phoneNumber')
      .ilike('phoneNumber', term);

    if (phonesError) throw phonesError;

    // Combine unique infringer IDs from both searches
    const infringerIds = new Set<string>();
    contactsMatches?.forEach(c => infringerIds.add(c.idInfringer));
    phonesMatches?.forEach(p => infringerIds.add(p.idInfringer));

    if (infringerIds.size > 0) {
      // Find all associated cases
      const { data: linkedCases, error: linkedCasesError } = await client
        .from('Cases')
        .select('idCase, idInfringer, createdAt')
        .in('idInfringer', Array.from(infringerIds));

      if (linkedCasesError) throw linkedCasesError;

      if (linkedCases) {
        for (const caseRec of linkedCases) {
          const contact = contactsMatches.find(c => c.idInfringer === caseRec.idInfringer);
          const phoneRec = phonesMatches?.find(p => p.idInfringer === caseRec.idInfringer);

          if (contact && contact.company) {
            report.conflicts.push({
              caseId: caseRec.idCase,
              source: 'Company Match',
              matchedText: contact.company + (contact.similarity ? ` (Sim: ${Math.round(contact.similarity * 100)}%)` : ''),
              createdAt: caseRec.createdAt
            });
          }

          if (phoneRec && phoneRec.phoneNumber && phoneRec.phoneNumber.toLowerCase().includes(rawQuery.toLowerCase())) {
            report.conflicts.push({
              caseId: caseRec.idCase,
              source: 'Phone Match',
              matchedText: phoneRec.phoneNumber,
              createdAt: caseRec.createdAt
            });
          }
        }
      }
    }

    // Deduplicate identical matches
    report.conflicts = report.conflicts.filter((result, index, self) =>
      index === self.findIndex((t) => (
        t.caseId === result.caseId && t.source === result.source && t.matchedText === result.matchedText
      ))
    );

    report.totalConflicts = report.conflicts.length;
    return report;

  } catch (err) {
    console.error('[ConflictService] Error running conflict check:', err);
    throw new Error('Failed to execute conflict search against the database.');
  }
}
