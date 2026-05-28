import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Loader,
  Menu,
  RotateCcw,
  Search,
  X
} from 'lucide-react';
import {
  buildSnippet,
  filterHuncourtCases,
  getHuncourtFilterOptions,
  HunCourtCase,
  HunCourtFilters,
  loadHuncourtCases
} from '../utils/huncourtSearch';

const INITIAL_FILTERS: HunCourtFilters = {
  query: '',
  year: null,
  decisionType: '',
  competence: '',
  fieldOfLaw: '',
  petitioner: ''
};

const PAGE_SIZES = [10, 25, 50, 100, 250];

interface HunCourtSearchProps {
  embedded?: boolean;
  title?: string;
  subtitle?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <>{text}</>;

  const expression = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  const matcher = new RegExp(`^(${terms.map(escapeRegExp).join('|')})$`, 'i');

  return (
    <>
      {text.split(expression).map((part, index) =>
        matcher.test(part) ? (
          <mark key={`${part}-${index}`} className="rounded-sm bg-yellow-200 px-0.5 text-gray-950">
            {part}
          </mark>
        ) : (
          <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  className = ''
}: {
  id: string;
  label: string;
  value: string | number;
  options: Array<string | number>;
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-11 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pr-9 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={String(option)} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
    </label>
  );
}

export const HunCourtSearch: React.FC<HunCourtSearchProps> = ({
  embedded = false,
  title = 'Case Law Search',
  subtitle = 'Search and filter Hungarian Constitutional Court rulings from the HUNCOURT dataset bundled with this app.'
}) => {
  const [cases, setCases] = useState<HunCourtCase[]>([]);
  const [filters, setFilters] = useState<HunCourtFilters>(INITIAL_FILTERS);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRulings, setExpandedRulings] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadHuncourtCases()
      .then(data => {
        if (!mounted) return;
        setCases(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load HUN court CSV.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  const filterOptions = useMemo(() => getHuncourtFilterOptions(cases), [cases]);
  const filteredCases = useMemo(() => filterHuncourtCases(cases, filters), [cases, filters]);
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageItems = filteredCases.slice(pageStart, pageStart + pageSize);
  const visibleStart = filteredCases.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, filteredCases.length);

  const updateFilter = <K extends keyof HunCourtFilters>(key: K, value: HunCourtFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setExpandedRulings({});
  };

  const toggleExpanded = (rulingId: number) => {
    setExpandedRulings(prev => ({
      ...prev,
      [rulingId]: !prev[rulingId]
    }));
  };

  return (
    <div className={`${embedded ? 'min-h-full' : 'min-h-screen'} bg-gray-50 text-gray-800 font-sans`}>
      {!embedded && (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <a href="/" className="text-xl font-bold text-gray-900">LegalAct</a>
            <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
              <a href="/" className="text-gray-600 transition-colors hover:text-blue-600">Home</a>
              <a href="/huncourt" className="text-blue-700">Case Law Search</a>
              <a href="/pricing" className="text-gray-600 transition-colors hover:text-blue-600">Pricing</a>
              <a href="/intake" className="text-gray-600 transition-colors hover:text-blue-600">Portal</a>
            </nav>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {isMenuOpen && (
            <nav className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 text-sm font-medium md:hidden">
              <a href="/" className="text-gray-600">Home</a>
              <a href="/huncourt" className="text-blue-700">Case Law Search</a>
              <a href="/pricing" className="text-gray-600">Pricing</a>
              <a href="/intake" className="text-gray-600">Portal</a>
            </nav>
          )}
        </header>
      )}

      <main className={embedded ? 'w-full' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}>
        <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              <Database className="h-3.5 w-3.5" />
              Local CSV source: hunconcourt.csv
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
              {subtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-md border border-gray-200 bg-white p-3 text-sm shadow-sm sm:grid-cols-3">
            <div>
              <div className="text-xs text-gray-500">Rows loaded</div>
              <div className="font-semibold text-gray-950">{cases.length.toLocaleString('hu-HU')}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Matching</div>
              <div className="font-semibold text-gray-950">{filteredCases.length.toLocaleString('hu-HU')}</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-gray-500">Page</div>
              <div className="font-semibold text-gray-950">{safePage} / {totalPages}</div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <label htmlFor="huncourt-query" className="block lg:col-span-5">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="huncourt-query"
                  type="text"
                  value={filters.query}
                  onChange={(event) => updateFilter('query', event.target.value)}
                  placeholder="Decision ID, keywords, petitioner, ruling text..."
                  className="h-11 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </label>

            <SelectField
              id="huncourt-year"
              label="Year"
              value={filters.year ?? ''}
              options={filterOptions.years}
              placeholder="All years"
              className="lg:col-span-2"
              disabled={loading}
              onChange={(value) => updateFilter('year', value ? Number(value) : null)}
            />

            <SelectField
              id="huncourt-type"
              label="Decision type"
              value={filters.decisionType}
              options={filterOptions.decisionTypes}
              placeholder="All types"
              className="lg:col-span-3"
              disabled={loading}
              onChange={(value) => updateFilter('decisionType', value)}
            />

            <SelectField
              id="huncourt-page-size"
              label="Rows per page"
              value={pageSize}
              options={PAGE_SIZES}
              placeholder="25"
              className="lg:col-span-2"
              onChange={(value) => setPageSize(Number(value) || 25)}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SelectField
              id="huncourt-competence"
              label="Competence"
              value={filters.competence}
              options={filterOptions.competences}
              placeholder="All competences"
              disabled={loading}
              onChange={(value) => updateFilter('competence', value)}
            />
            <SelectField
              id="huncourt-field"
              label="Field of law"
              value={filters.fieldOfLaw}
              options={filterOptions.fieldsOfLaw}
              placeholder="All fields"
              disabled={loading}
              onChange={(value) => updateFilter('fieldOfLaw', value)}
            />
            <SelectField
              id="huncourt-petitioner"
              label="Petitioner"
              value={filters.petitioner}
              options={filterOptions.petitioners}
              placeholder="All petitioners"
              disabled={loading}
              onChange={(value) => updateFilter('petitioner', value)}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{visibleStart}</span>-<span className="font-semibold text-gray-900">{visibleEnd}</span> of <span className="font-semibold text-gray-900">{filteredCases.length.toLocaleString('hu-HU')}</span> matching rows
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex gap-3 rounded-md border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h2 className="font-semibold text-red-900">Could not load HUN court data</h2>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500">
            <Loader className="mb-3 h-8 w-8 animate-spin" />
            <p>Loading CSV data...</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-md border border-gray-200 bg-white text-center text-gray-500">
            <FileText className="mb-3 h-8 w-8" />
            <p className="text-lg font-medium text-gray-800">No matching rulings</p>
            <p className="mt-1 text-sm">Try clearing a filter or searching with fewer terms.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {pageItems.map((ruling, index) => {
              const isExpanded = !!expandedRulings[ruling.ruling_id];
              const snippet = buildSnippet(ruling, filters.query);
              const rowNumber = pageStart + index + 1;

              return (
                <li key={`${ruling.ruling_id}-${ruling.decision_id}`} className="rounded-md border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-semibold text-gray-700">
                          {rowNumber}
                        </span>
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                          {ruling.decision_id}
                        </span>
                        {ruling.decision_year && (
                          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {ruling.decision_year}
                          </span>
                        )}
                        {ruling.decision_type && (
                          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                            {ruling.decision_type}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold leading-7 text-gray-950">
                        {ruling.subject_matter || 'Untitled ruling'}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        {ruling.case_id && <span>Case ID: <strong className="font-medium text-gray-700">{ruling.case_id}</strong></span>}
                        {ruling.petitioner && <span>Petitioner: <strong className="font-medium text-gray-700">{ruling.petitioner}</strong></span>}
                        {ruling.competence && <span>Competence: <strong className="font-medium text-gray-700">{ruling.competence}</strong></span>}
                      </div>
                    </div>
                    {ruling.decision_date && (
                      <div className="text-sm text-gray-500 lg:text-right">
                        {new Date(ruling.decision_date).toLocaleDateString('hu-HU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>

                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-700">
                    <HighlightedText text={isExpanded ? (ruling.content || ruling.ruling || snippet) : snippet} query={filters.query} />
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 text-xs text-gray-600 md:grid-cols-2">
                    {ruling.field_of_law && (
                      <div>
                        <span className="font-semibold text-gray-700">Field of law:</span> {ruling.field_of_law}
                      </div>
                    )}
                    {ruling.keywords && (
                      <div>
                        <span className="font-semibold text-gray-700">Keywords:</span> {ruling.keywords}
                      </div>
                    )}
                    {ruling.constitutional_provision && (
                      <div>
                        <span className="font-semibold text-gray-700">Constitutional provision:</span> {ruling.constitutional_provision}
                      </div>
                    )}
                    {ruling.ruling_type && (
                      <div>
                        <span className="font-semibold text-gray-700">Ruling type:</span> {ruling.ruling_type}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(ruling.ruling_id)}
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      {isExpanded ? 'Collapse ruling text' : 'Read full ruling text'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-6 flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold text-gray-900">{safePage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={safePage <= 1}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={safePage >= totalPages}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HunCourtSearch;
