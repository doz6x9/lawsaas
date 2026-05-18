export interface EuMutualNda {
  PartyAName: string;
  PartyACompanyReg: string;
  PartyBName: string;
  PartyBCompanyReg: string;
  EffectiveDate: string;
  PurposeOfDisclosure: string;
  GoverningLawCountry: string; // Must be an EU Member State
  ExclusiveJurisdictionCity: string;
}

export interface EuStandardContractualClauses {
  DataExporterName: string;
  DataExporterVAT: string;
  DataImporterName: string;
  DataImporterVAT: string;
  CategoriesOfData: string;
  SpecialCategories: string;
  CompetentSupervisoryAuthority: string;
}

export interface EuClientEngagementLetter {
  LawFirmEntity: string;
  LawFirmVAT: string;
  LawFirmIBAN: string;
  ClientEntity: string;
  ClientCommunityVAT: string;
  ScopeOfRepresentation: string;
  HourlyRateEUR: number | string;
  RetainerAmountEUR: number | string;
}

export interface EuipoCeaseAndDesist {
  TrademarkOwner: string;
  InfringingEntity: string;
  EUIPORegistrationNumber: string;
  DateOfDiscovery: string;
  LinksToInfringement: string[]; // Array of strings
  ComplianceDeadline: string;
}

export interface EuLatePaymentDemand {
  CreditorName: string;
  DebtorName: string;
  InvoiceNumber: string;
  PrincipalAmountDue: number | string;
  StatutoryInterestRate: string;
  FixedRecoveryCosts: string;
  TotalDue: number | string;
}

export interface EuEmploymentAgreement {
  CompanyName: string;
  EmployeeName: string;
  JobTitle: string;
  StartDate: string;
  GrossBaseSalary: number | string;
  ProbationPeriodMonths: number;
  NoticePeriodDays: number;
  WorkingTimeDirectiveOptOut: boolean;
}

export type TemplatePayload =
  | EuMutualNda
  | EuStandardContractualClauses
  | EuClientEngagementLetter
  | EuipoCeaseAndDesist
  | EuLatePaymentDemand
  | EuEmploymentAgreement;

export const SUPPORTED_TEMPLATES = [
  'EuMutualNda',
  'EuStandardContractualClauses',
  'EuClientEngagementLetter',
  'EuipoCeaseAndDesist',
  'EuLatePaymentDemand',
  'EuEmploymentAgreement',
];

export type OutputFormat = 'docx' | 'pdf';
