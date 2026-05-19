import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Search, ChevronDown, AlertCircle, Loader, Menu, X } from 'lucide-react';
import {
  HunCourtCase,
  SearchOptions,
  searchHuncourtCases,
  fetchAvailableYears
} from '../utils/huncourtSearch';

export interface HunCourtSearchProps {
  supabase: SupabaseClient;
}

export const HunCourtSearch: React.FC<HunCourtSearchProps> = ({ supabase }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [results, setResults] = useState<HunCourtCase[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [expandedRulings, setExpandedRulings] = useState<Record<number, boolean>>({});
  const [yearsLoading, setYearsLoading] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setYearsLoading(true);
      const { years: fetchedYears, error: yearsError } = await fetchAvailableYears(supabase);
      if (mounted) {
        if (yearsError) {
          console.error('Failed to load years:', yearsError);
          setYears([]);
        } else {
          setYears(fetchedYears);
        }
        setYearsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const performSearch = useCallback(
    async (page: number = 0) => {
      const trimmedQuery = searchQuery.trim();

      if (!trimmedQuery) {
        setResults([]);
        setTotalCount(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: searchError, count } = await searchHuncourtCases(supabase, {
        searchQuery: trimmedQuery,
        selectedYear,
        limit: 25,
        offset: page * 25
      });

      if (searchError) {
        setError(searchError.message);
        setResults([]);
        setTotalCount(null);
      } else {
        setResults(data);
        setTotalCount(count);
      }

      setLoading(false);
    },
    [supabase, searchQuery, selectedYear]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(0);
    }
  };

  const handleSearchClick = () => {
    performSearch(0);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedYear(null);
    setResults([]);
    setTotalCount(null);
    setError(null);
  };

  const toggleExpanded = (rulingId: number) => {
    setExpandedRulings(prev => ({
      ...prev,
      [rulingId]: !prev[rulingId]
    }));
  };

  const truncateText = (text: string | null, maxLength: number = 400): string => {
    if (!text) return 'No content available.';
    return text.length > maxLength ? text.substring(0, maxLength) + '…' : text;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900">LegalAct</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#usecases" className="text-gray-600 hover:text-blue-600 transition-colors">Use Cases</a>
            <a href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
            <a href="/intake" className="text-gray-600 hover:text-blue-600 transition-colors">Portal</a>
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <nav className="flex flex-col items-center gap-4 py-4 text-sm font-medium">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#usecases" className="text-gray-600 hover:text-blue-600 transition-colors">Use Cases</a>
              <a href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="/intake" className="text-gray-600 hover:text-blue-600 transition-colors">Portal</a>
            </nav>
          </div>
        )}
      </header>

      <div className="relative mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-2">
            Hungarian Constitutional Court
          </h1>
          <p className="text-gray-600 max-w-2xl text-lg">
            Search HUNCOURT decisions with full-text Hungarian language support. Explore historical rulings, precedents, and constitutional interpretations.
          </p>
        </header>

        <div className="bg-white backdrop-blur border border-gray-200 rounded-lg p-5 mb-8 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label htmlFor="search-query" className="sr-only">
                Search query
              </label>
              <div className="relative">
                <input
                  id="search-query"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter keywords, phrases, or legal terms..."
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <button
                  onClick={handleSearchClick}
                  disabled={loading}
                  aria-label="Search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="year-filter" className="sr-only">
                Filter by year
              </label>
              <div className="relative">
                <select
                  id="year-filter"
                  value={selectedYear ?? ''}
                  onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                  disabled={yearsLoading}
                  className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none"
                >
                  <option value="">All years</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {totalCount !== null && (
                <span>
                  Found <span className="font-semibold text-gray-800">{totalCount}</span> result
                  {totalCount === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 border border-gray-300 hover:bg-gray-300 text-gray-800 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSearchClick}
                disabled={loading || !searchQuery.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                {loading ? 'Searching…' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Search Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <main>
          {loading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader className="h-8 w-8 animate-spin mb-3" />
              <p>Searching HUNCOURT database…</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">
                {searchQuery.trim() ? 'No results found. Try adjusting your search.' : 'Enter a search query to begin.'}
              </p>
            </div>
          ) : (
            <ol className="space-y-4">
              {results.map((ruling, index) => {
                const isExpanded = !!expandedRulings[ruling.ruling_id];
                const year = ruling.decision_year ?? (ruling.decision_date ? new Date(ruling.decision_date).getFullYear() : null);

                return (
                  <li
                    key={ruling.ruling_id}
                    className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 flex-shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-800">
                                {ruling.decision_id}
                              </span>
                              {year && (
                                <span className="text-sm text-gray-500">Year: {year}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {ruling.subject_matter || 'Untitled Case'}
                      </h3>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {isExpanded ? ruling.content : truncateText(ruling.content)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {ruling.keywords && (
                          <div>
                            <span className="font-semibold text-gray-600">Keywords:</span> {ruling.keywords}
                          </div>
                        )}
                        {ruling.decision_date && (
                          <div className="mt-1">
                            <span className="font-semibold text-gray-600">Date:</span>{' '}
                            {new Date(ruling.decision_date).toLocaleDateString('hu-HU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleExpanded(ruling.ruling_id)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-800 transition-colors whitespace-nowrap"
                      >
                        {isExpanded ? 'Collapse' : 'Read Full Content'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </main>
      </div>
    </div>
  );
};

export default HunCourtSearch;
