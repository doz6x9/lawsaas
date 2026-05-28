import Papa from 'papaparse';

export interface HunCourtCase {
  ruling_id: number;
  decision_id: string;
  decision_date: string | null;
  decision_year: number | null;
  decision_type: string | null;
  case_id: string | null;
  petitioner: string | null;
  competence: string | null;
  challenged_legal_norm: string | null;
  challenged_legal_provision: string | null;
  challenged_norm_type: string | null;
  government_in_office: string | null;
  constitutional_provision: string | null;
  subject_matter: string | null;
  field_of_law: string | null;
  keywords: string | null;
  ruling: string | null;
  ruling_type: string | null;
  violation: string | null;
  violated_provision: string | null;
  content: string | null;
}

export interface HunCourtFilters {
  query: string;
  year: number | null;
  decisionType: string;
  competence: string;
  fieldOfLaw: string;
  petitioner: string;
}

export interface HunCourtFilterOptions {
  years: number[];
  decisionTypes: string[];
  competences: string[];
  fieldsOfLaw: string[];
  petitioners: string[];
}

type CsvRow = Record<string, string | undefined>;

let cachedCases: Promise<HunCourtCase[]> | null = null;

function text(value: string | undefined): string | null {
  const trimmed = (value || '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

function numberValue(value: string | undefined): number | null {
  const parsed = Number((value || '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function normalize(value: string | null | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('hu-HU');
}

function csvCase(row: CsvRow): HunCourtCase {
  return {
    ruling_id: numberValue(row['Ruling ID']) || 0,
    decision_id: text(row['Decision ID']) || 'Unknown decision',
    decision_date: text(row['Date of decision']),
    decision_year: numberValue(row['Year of decision']),
    decision_type: text(row['Type of decision']),
    case_id: text(row['Case ID']),
    petitioner: text(row['Petitioner']),
    competence: text(row['Competence']),
    challenged_legal_norm: text(row['Legal norm challanged']),
    challenged_legal_provision: text(row['Legal provision challanged']),
    challenged_norm_type: text(row['Type of the challanged legal norm']),
    government_in_office: text(row['Governement in office']),
    constitutional_provision: text(row['Constitutional provision']),
    subject_matter: text(row['Subject matter of the case']),
    field_of_law: text(row['Field of law']),
    keywords: text(row['Keywords']),
    ruling: text(row['Ruling']),
    ruling_type: text(row['Type of ruling']),
    violation: text(row['Violation']),
    violated_provision: text(row['Violated provision']),
    content: text(row['Content of the ruling'])
  };
}

export async function loadHuncourtCases(csvUrl = `${import.meta.env.BASE_URL}hunconcourt.csv`): Promise<HunCourtCase[]> {
  if (!cachedCases) {
    cachedCases = fetch(csvUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Could not load HUN court CSV (${response.status}).`);
        }
        return response.text();
      })
      .then(csvText => {
        const parsed = Papa.parse<CsvRow>(csvText, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: header => header.trim()
        });

        if (parsed.errors.length > 0) {
          console.warn('HUN court CSV parse warnings:', parsed.errors.slice(0, 5));
        }

        return parsed.data
          .map(csvCase)
          .filter(row => row.ruling_id > 0 || row.decision_id !== 'Unknown decision')
          .sort((a, b) => {
            const yearA = a.decision_year || 0;
            const yearB = b.decision_year || 0;
            if (yearA !== yearB) return yearB - yearA;
            return (b.ruling_id || 0) - (a.ruling_id || 0);
          });
      });
  }

  return cachedCases;
}

export function getHuncourtFilterOptions(cases: HunCourtCase[]): HunCourtFilterOptions {
  const years = new Set<number>();
  const decisionTypes = new Set<string>();
  const competences = new Set<string>();
  const fieldsOfLaw = new Set<string>();
  const petitioners = new Set<string>();

  cases.forEach(item => {
    if (item.decision_year) years.add(item.decision_year);
    if (item.decision_type) decisionTypes.add(item.decision_type);
    if (item.competence) competences.add(item.competence);
    if (item.field_of_law) fieldsOfLaw.add(item.field_of_law);
    if (item.petitioner) petitioners.add(item.petitioner);
  });

  return {
    years: Array.from(years).sort((a, b) => b - a),
    decisionTypes: Array.from(decisionTypes).sort(),
    competences: Array.from(competences).sort(),
    fieldsOfLaw: Array.from(fieldsOfLaw).sort(),
    petitioners: Array.from(petitioners).sort()
  };
}

export function filterHuncourtCases(cases: HunCourtCase[], filters: HunCourtFilters): HunCourtCase[] {
  const terms = normalize(filters.query)
    .split(/\s+/)
    .filter(Boolean);

  return cases.filter(item => {
    if (filters.year && item.decision_year !== filters.year) return false;
    if (filters.decisionType && item.decision_type !== filters.decisionType) return false;
    if (filters.competence && item.competence !== filters.competence) return false;
    if (filters.fieldOfLaw && item.field_of_law !== filters.fieldOfLaw) return false;
    if (filters.petitioner && item.petitioner !== filters.petitioner) return false;

    if (terms.length === 0) return true;

    const searchable = normalize([
      item.decision_id,
      item.case_id,
      item.petitioner,
      item.competence,
      item.subject_matter,
      item.field_of_law,
      item.keywords,
      item.ruling,
      item.content,
      item.decision_type,
      item.challenged_legal_norm,
      item.challenged_legal_provision
    ].filter(Boolean).join(' '));

    return terms.every(term => searchable.includes(term));
  });
}

export function buildSnippet(item: HunCourtCase, query: string, maxLength = 360): string {
  const source = item.content || item.ruling || item.subject_matter || 'No ruling content available.';
  const normalizedSource = normalize(source);
  const firstTerm = normalize(query).split(/\s+/).find(Boolean);

  if (!firstTerm) {
    return source.length > maxLength ? `${source.slice(0, maxLength).trim()}...` : source;
  }

  const index = normalizedSource.indexOf(firstTerm);
  if (index < 0) {
    return source.length > maxLength ? `${source.slice(0, maxLength).trim()}...` : source;
  }

  const start = Math.max(0, index - 120);
  const end = Math.min(source.length, start + maxLength);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < source.length ? '...' : '';
  return `${prefix}${source.slice(start, end).trim()}${suffix}`;
}
