// huncourtSearch.ts
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Represents a single HunCourt case record from the database
 */
export interface HunCourtCase {
  ruling_id: number;
  decision_id: string;
  decision_date: string | null;
  decision_year: number | null;
  subject_matter: string | null;
  keywords: string | null;
  content: string | null;
  created_at?: string;
}

/**
 * Options for searching HunCourt cases
 */
export interface SearchOptions {
  searchQuery: string;           // User-entered search query
  selectedYear?: number | null;  // Optional year filter
  limit?: number;                // Results per page
  offset?: number;               // Pagination offset
}

/**
 * Search result wrapper with metadata
 */
export interface SearchResult {
  data: HunCourtCase[];
  error: Error | null;
  count: number | null;
}

/**
 * Execute a full-text search against huncourt_cases using PostgreSQL FTS with Hungarian configuration.
 *
 * @param supabase - SupabaseClient instance
 * @param opts - Search options (query, year filter, pagination)
 * @returns Promise with data, error, and total count
 */
export async function searchHuncourtCases(
  supabase: SupabaseClient,
  opts: SearchOptions
): Promise<SearchResult> {
  const {
    searchQuery,
    selectedYear = null,
    limit = 25,
    offset = 0
  } = opts;

  // Prevent full-table scans with empty queries
  if (!searchQuery || searchQuery.trim().length === 0) {
    return { data: [], error: null, count: 0 };
  }

  try {
    let query = supabase
      .from('huncourt_cases')
      .select('ruling_id, decision_id, decision_date, decision_year, subject_matter, keywords, content', {
        count: 'estimated'
      })
      // Use textSearch for PostgreSQL full-text search with Hungarian config
      .textSearch('search_vector', searchQuery.trim(), {
        config: 'hungarian',
        type: 'websearch' // Supports natural language: "word1 word2" or "exact phrase"
      })
      .order('decision_date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply year filter if provided
    if (selectedYear && selectedYear > 0) {
      query = query.eq('decision_year', selectedYear);
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: [], error, count: null };
    }

    return {
      data: (data as HunCourtCase[]) ?? [],
      error: null,
      count
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: [], error, count: null };
  }
}

/**
 * Fetch all unique years from huncourt_cases for populating the year filter dropdown.
 *
 * @param supabase - SupabaseClient instance
 * @returns Promise with array of years (descending order)
 */
export async function fetchAvailableYears(
  supabase: SupabaseClient
): Promise<{ years: number[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('huncourt_cases')
      .select('decision_year', { count: 'exact' })
      .not('decision_year', 'is', null)
      .order('decision_year', { ascending: false });

    if (error) {
      return { years: [], error };
    }

    // Extract unique years
    const yearsSet = new Set<number>();
    (data ?? []).forEach((row: any) => {
      const year = Number((row as any).decision_year);
      if (!Number.isNaN(year) && year > 0) {
        yearsSet.add(year);
      }
    });

    const years = Array.from(yearsSet).sort((a, b) => b - a);
    return { years, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { years: [], error };
  }
}

/**
 * Fetch a single case by decision_id for detail view
 */
export async function fetchCaseByDecisionId(
  supabase: SupabaseClient,
  decisionId: string
): Promise<{ data: HunCourtCase | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('huncourt_cases')
      .select('*')
      .eq('decision_id', decisionId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: (data as HunCourtCase) ?? null, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

