import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useTranslation } from 'react-i18next';
import { Search, Download, AlertCircle, Eye, Menu, X } from 'lucide-react';

// Updated interface to match HUNCOURT CSV structure
interface HunCourtCaseData {
  ruling_id: string;
  decision_id: string;
  decision_date: string;
  decision_year: string;
  subject_matter: string;
  keywords: string;
  content: string;
}

interface RawCsvRow {
  [key: string]: string;
}

const CaseSearch: React.FC = () => {
  const { t } = useTranslation();
  const [cases, setCases] = useState<HunCourtCaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [debug, setDebug] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/hunconcourt.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch hunconcourt.csv. Make sure the file is in the public directory.');
        }
        const csvText = await response.text();

        const results = await new Promise<Papa.ParseResult<RawCsvRow>>((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h: string) => h.trim(), // Remove whitespace from headers
            complete: (res) => resolve(res),
            error: (err) => reject(err),
          });
        });

        if (results.errors.length) {
          console.error('CSV Parsing Errors:', results.errors);
          throw new Error(`Error parsing CSV file: ${results.errors[0].message}`);
        }

        if (results.data && results.data.length > 0) {
          const actualHeaders = Object.keys(results.data[0]);
          setCsvHeaders(actualHeaders);
        }

        const mappedCases = results.data.map((row: RawCsvRow) => ({
          ruling_id: row.ruling_id || row['Ruling ID'] || '',
          decision_id: row.decision_id || row['Decision ID'] || '',
          decision_date: row.decision_date || row['Date of decision'] || '',
          decision_year: row.decision_year || row['Year of decision'] || '',
          subject_matter: row.subject_matter || row['Subject matter of the case'] || '',
          keywords: row.keywords || row['Keywords'] || '',
          content: row.content || row['Content of the ruling'] || ''
        }));

        setCases(mappedCases);
      } catch (err) {
        console.error('Error loading CSV:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const yearOptions = useMemo(() => {
    const years = new Set(
      cases
        .map(c => c.decision_year)
        .filter(y => y && y.trim())
    );
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [cases]);

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || searchTerm.length < 2
        ? true
        : (c.decision_id?.toLowerCase().includes(searchTermLower) ||
           c.subject_matter?.toLowerCase().includes(searchTermLower) ||
           c.content?.toLowerCase().includes(searchTermLower) ||
           c.keywords?.toLowerCase().includes(searchTermLower));

      const matchesYear = !yearFilter ? true : c.decision_year === yearFilter;

      return matchesSearch && matchesYear;
    });
  }, [cases, searchTerm, yearFilter]);

  const exportToCsv = () => {
    const csv = Papa.unparse(filteredCases);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'huncourt_filtered.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col overflow-x-hidden">
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
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {t('navigation.conflictSearch') || 'HunCourt Cases'}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Search through the Hungarian Constitutional Court cases dataset.
            </p>
          </header>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setDebug(!debug)}
                className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                <Eye className="w-3 h-3 inline mr-1" />
                {debug ? 'Hide' : 'Show'} Debug
              </button>
            </div>

            {debug && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
                <p><strong>CSV Headers:</strong> {csvHeaders.join(', ') || 'None detected'}</p>
                <p><strong>Total Rows:</strong> {cases.length}</p>
                <p><strong>Filtered Results:</strong> {filteredCases.length}</p>
                {cases.length > 0 && (
                  <p><strong>First Row Sample:</strong> {JSON.stringify(cases[0]).substring(0, 100)}...</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by decision ID, subject, keywords..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm"
                />
              </div>

              <div className="relative">
                <select
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  className="appearance-none w-full sm:w-40 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm rounded-md bg-white"
                >
                  <option value="">All Years</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={exportToCsv}
                disabled={filteredCases.length === 0}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              {loading ? (
                <span>Loading data...</span>
              ) : error ? (
                <span className="text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-2" />{error}</span>
              ) : (
                <span>
                  Showing <strong>{filteredCases.length}</strong> of <strong>{cases.length}</strong> cases
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Matter</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading data...</td></tr>
                      ) : error ? (
                        <tr><td colSpan={5} className="text-center py-8 text-red-500">{error}</td></tr>
                      ) : filteredCases.length > 0 ? (
                        filteredCases.map((c, index) => (
                          <tr key={c.ruling_id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.decision_id || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.decision_year || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{c.subject_matter || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.decision_date || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{c.keywords || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-500">No results found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseSearch;
