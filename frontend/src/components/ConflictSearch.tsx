import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShieldAlert, Loader2, AlertCircle, ChevronRight, Menu, X } from 'lucide-react';
import { ConflictSearchResult } from '../types';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedSearchTerm)}`);
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
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900">LegalAct</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#usecases" className="text-gray-600 hover:text-blue-600 transition-colors">Use Cases</a>
            <a href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
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
              <a href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="/intake" className="text-gray-600 hover:text-blue-600 transition-colors">Portal</a>
            </nav>
          </div>
        )}
      </header>
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center">
            <ShieldAlert className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('conflict.title')}</h2>
              <p className="mt-1 text-md text-gray-600">
                {t('conflict.subtitle')}
              </p>
            </div>
          </div>

          <div className="relative group max-w-2xl mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {loading ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <Search className={`h-5 w-5 ${searchTerm ? 'text-blue-600' : 'text-gray-400'} transition-colors`} />
              )}
            </div>
            <input
              type="text"
              placeholder={t('conflict.searchPlaceholder')}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 sm:text-sm transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-red-800">{t('conflict.searchError')}</h4>
                <p className="text-xs text-red-800 mt-1">{error}</p>
              </div>
            </div>
          )}

          {!error && !loading && hasSearched && results.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('conflict.noConflictsTitle')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('conflict.noConflictsMessage', { term: debouncedSearchTerm })}</p>
            </div>
          )}

          {!error && !loading && hasSearched && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h3 className="text-base font-semibold text-gray-900">
                  {t('conflict.foundPotential')} <span className="font-bold text-red-600">{results.length}</span> {t('conflict.potentialConflict', { count: results.length })}
                </h3>
              </div>

              <div className="space-y-3">
                {results.map((result, idx) => (
                  <div key={`${result.idCase}-${idx}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors flex justify-between items-start group">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {result.matchType}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {t('conflict.matched')} <span className="text-red-600 bg-red-100 px-1 rounded-md ml-1">{result.matchedText}</span>
                      </h4>
                    </div>
                    <div className="text-right flex items-center">
                      <div className="mr-4 text-right">
                        <span className="text-xs text-gray-500 uppercase font-semibold">{t('conflict.caseId')}</span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          {result.idCase}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!error && !hasSearched && !loading && (
            <div className="text-center py-16 opacity-70">
              <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-md text-gray-500 font-medium">{t('conflict.enterQuery')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
