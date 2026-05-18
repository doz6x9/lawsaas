export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'array' | 'select';
export type OutputFormat = 'docx' | 'pdf';

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[]; // For select type
  required?: boolean;
}

export interface TemplateConfig {
  id: string;
  title: string;
  description: string;
  fields: TemplateField[];
}

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'EuMutualNda',
    title: 'EU Mutual NDA',
    description: 'Standard Mutual Non-Disclosure Agreement compliant with EU regulations.',
    fields: [
      { id: 'PartyAName', label: 'Party A Name', type: 'text', required: true },
      { id: 'PartyACompanyReg', label: 'Party A Company Registration No.', type: 'text', required: true },
      { id: 'PartyBName', label: 'Party B Name', type: 'text', required: true },
      { id: 'PartyBCompanyReg', label: 'Party B Company Registration No.', type: 'text', required: true },
      { id: 'EffectiveDate', label: 'Effective Date', type: 'date', required: true },
      { id: 'PurposeOfDisclosure', label: 'Purpose of Disclosure', type: 'text', required: true, placeholder: 'e.g., Evaluation of potential business cooperation' },
      { id: 'GoverningLawCountry', label: 'Governing Law Country (EU Member State)', type: 'select', options: ['Hungary', 'Germany', 'France', 'Spain', 'Italy'], required: true },
      { id: 'ExclusiveJurisdictionCity', label: 'Exclusive Jurisdiction City', type: 'text', required: true, placeholder: 'e.g., Budapest' },
    ],
  },
  {
    id: 'EuStandardContractualClauses',
    title: 'EU Standard Contractual Clauses (GDPR DPA)',
    description: 'Standard Contractual Clauses for data transfers to third countries under GDPR.',
    fields: [
      { id: 'DataExporterName', label: 'Data Exporter Name', type: 'text', required: true },
      { id: 'DataExporterVAT', label: 'Data Exporter VAT', type: 'text', required: true },
      { id: 'DataImporterName', label: 'Data Importer Name', type: 'text', required: true },
      { id: 'DataImporterVAT', label: 'Data Importer VAT', type: 'text', required: true },
      { id: 'CategoriesOfData', label: 'Categories of Data', type: 'text', required: true, placeholder: 'e.g., Personal identification data, financial data' },
      { id: 'SpecialCategories', label: 'Special Categories of Data (if any)', type: 'text', placeholder: 'e.g., Health data, biometric data' },
      { id: 'CompetentSupervisoryAuthority', label: 'Competent Supervisory Authority', type: 'text', required: true, placeholder: 'e.g., Hungarian National Authority for Data Protection and Freedom of Information' },
    ],
  },
  {
    id: 'EuClientEngagementLetter',
    title: 'EU Client Engagement Letter',
    description: 'Standard engagement letter for legal services within the EU.',
    fields: [
      { id: 'LawFirmEntity', label: 'Law Firm Entity Name', type: 'text', required: true },
      { id: 'LawFirmVAT', label: 'Law Firm VAT Number', type: 'text', required: true },
      { id: 'LawFirmIBAN', label: 'Law Firm IBAN', type: 'text', required: true },
      { id: 'ClientEntity', label: 'Client Entity Name', type: 'text', required: true },
      { id: 'ClientCommunityVAT', label: 'Client Community VAT Number', type: 'text', required: true },
      { id: 'ScopeOfRepresentation', label: 'Scope of Representation', type: 'text', required: true, placeholder: 'e.g., Legal advice on corporate law matters' },
      { id: 'HourlyRateEUR', label: 'Hourly Rate (EUR)', type: 'number', required: true },
      { id: 'RetainerAmountEUR', label: 'Retainer Amount (EUR)', type: 'number', required: true },
    ],
  },
  {
    id: 'EuipoCeaseAndDesist',
    title: 'EUIPO Cease and Desist Letter',
    description: 'Cease and Desist letter for trademark infringement within the EU, referencing EUIPO registration.',
    fields: [
      { id: 'TrademarkOwner', label: 'Trademark Owner Name', type: 'text', required: true },
      { id: 'InfringingEntity', label: 'Infringing Entity Name', type: 'text', required: true },
      { id: 'EUIPORegistrationNumber', label: 'EUIPO Registration Number', type: 'text', required: true },
      { id: 'DateOfDiscovery', label: 'Date of Discovery of Infringement', type: 'date', required: true },
      { id: 'LinksToInfringement', label: 'Links to Infringement (one per line)', type: 'array', required: true, placeholder: 'e.g., https://example.com/infringement' },
      { id: 'ComplianceDeadline', label: 'Compliance Deadline', type: 'date', required: true },
    ],
  },
  {
    id: 'EuLatePaymentDemand',
    title: 'EU Late Payment Demand (Directive 2011/7/EU)',
    description: 'Demand letter for late commercial payments, compliant with EU Directive 2011/7/EU.',
    fields: [
      { id: 'CreditorName', label: 'Creditor Name', type: 'text', required: true },
      { id: 'DebtorName', label: 'Debtor Name', type: 'text', required: true },
      { id: 'InvoiceNumber', label: 'Invoice Number', type: 'text', required: true },
      { id: 'PrincipalAmountDue', label: 'Principal Amount Due', type: 'number', required: true },
      { id: 'StatutoryInterestRate', label: 'Statutory Interest Rate (%)', type: 'text', required: true, placeholder: 'e.g., ECB Ref. Rate + 8%' },
      { id: 'FixedRecoveryCosts', label: 'Fixed Recovery Costs (EUR)', type: 'number', required: true },
      { id: 'TotalDue', label: 'Total Amount Due', type: 'number', required: true },
    ],
  },
  {
    id: 'EuEmploymentAgreement',
    title: 'EU Employment Agreement',
    description: 'Standard employment agreement compliant with EU labor laws.',
    fields: [
      { id: 'CompanyName', label: 'Company Name', type: 'text', required: true },
      { id: 'EmployeeName', label: 'Employee Name', type: 'text', required: true },
      { id: 'JobTitle', label: 'Job Title', type: 'text', required: true },
      { id: 'StartDate', label: 'Start Date', type: 'date', required: true },
      { id: 'GrossBaseSalary', label: 'Gross Base Salary (EUR)', type: 'number', required: true },
      { id: 'ProbationPeriodMonths', label: 'Probation Period (Months)', type: 'number', required: true },
      { id: 'NoticePeriodDays', label: 'Notice Period (Days)', type: 'number', required: true },
      { id: 'WorkingTimeDirectiveOptOut', label: 'Opt-out of Working Time Directive (if applicable)', type: 'boolean', required: true },
    ],
  },
];
