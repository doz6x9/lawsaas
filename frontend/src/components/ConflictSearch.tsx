import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShieldAlert, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { ConflictSearchResult } from '../types';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const ConflictSearch: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [results, setResults] = useState<ConflictSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchTerm.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(debouncedSearchTerm)}`);
        if (!response.ok) {
          throw new Error('Search failed. Please check the backend connection.');
        }

        const data = await response.json();
        setResults(data);
        setHasSearched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & Search Bar */}
      <div className="p-6 border-b border-gray-200 bg-[#FAF9F8]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center">
            <ShieldAlert className="h-6 w-6 text-[#0078D4] mr-3" />
            <div>
               <h2 className="text-xl font-semibold text-gray-900">{t('conflict.title')}</h2>
               <p className="mt-1 text-xs text-gray-600">
                 {t('conflict.subtitle')}
               </p>
            </div>
          </div>

          <div className="relative group max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {loading ? (
                <Loader2 className="h-4 w-4 text-[#0078D4] animate-spin" />
              ) : (
                <Search className={`h-4 w-4 ${searchTerm ? 'text-[#0078D4]' : 'text-gray-400'} transition-colors`} />
              )}
            </div>
            <input
              type="text"
              placeholder={t('conflict.searchPlaceholder')}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-sm leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] sm:text-sm transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-auto bg-white p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="p-4 bg-[#FDE7E9] border border-[#FDE7E9] rounded-sm flex items-start">
              <AlertCircle className="h-5 w-5 text-[#A80000] mr-3 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-[#A80000]">{t('conflict.searchError')}</h4>
                <p className="text-xs text-[#A80000] mt-1">{error}</p>
              </div>
            </div>
          )}

          {!error && !loading && hasSearched && results.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">{t('conflict.noConflictsTitle')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('conflict.noConflictsMessage', { term: debouncedSearchTerm })}</p>
            </div>
          )}

          {!error && !loading && hasSearched && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h3 className="text-base font-semibold text-gray-900">
                  {t('conflict.foundPotential')} <span className="font-bold text-[#D83B01]">{results.length}</span> {t('conflict.potentialConflict', { count: results.length })}
                </h3>
              </div>

              <div className="space-y-3">
                {results.map((result, idx) => (
                  <div key={`${result.idCase}-${idx}`} className="bg-white border border-gray-200 rounded-sm p-4 hover:bg-[#F3F2F1] transition-colors flex justify-between items-start group">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          {result.matchType}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {t('conflict.matched')} <span className="text-[#D83B01] bg-[#FDE7E9] px-1 rounded-sm ml-1">{result.matchedText}</span>
                      </h4>
                    </div>
                    <div className="text-right flex items-center">
                      <div className="mr-4 text-right">
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">{t('conflict.caseId')}</span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          {result.idCase}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#0078D4]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!error && !hasSearched && !loading && (
            <div className="text-center py-16 opacity-70">
              <ShieldAlert className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">{t('conflict.enterQuery')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
