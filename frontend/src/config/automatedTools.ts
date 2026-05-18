export type IntegrationType = 'Forms' | 'Word' | 'SharePoint' | 'Email' | 'PostgreSQL' | 'Teams' | 'PDF'; // Changed 'Outlook' to 'Email'
export type TriggerType = 'webhook' | 'schedule' | 'manual';
export type FieldType = 'select' | 'text' | 'time' | 'number';

export interface SetupField {
  id: string;
  labelKey: string; // Refactored to use i18n keys
  type: FieldType;
  options?: string[]; // Used if type is 'select'
  placeholderKey?: string; // Refactored to use i18n keys
}

export interface AutomatedTool {
  id: string;
  titleKey: string; // Refactored to use i18n keys
  descriptionKey: string; // Refactored to use i18n keys
  triggerType: TriggerType;
  integrations: IntegrationType[];
  setupFields: SetupField[];
}

export const automatedTools: AutomatedTool[] = [
  {
    id: 'demand-letter-generator',
    titleKey: 'automations.demandLetter.title',
    descriptionKey: 'automations.demandLetter.desc',
    triggerType: 'webhook',
    integrations: ['Forms', 'Word', 'SharePoint'],
    setupFields: [
      {
        id: 'intakeForm',
        labelKey: 'automations.demandLetter.fields.intakeForm.label',
        type: 'select',
        options: ['LegalAct Public Intake', 'Internal Client Form', 'Custom Form']
      },
      {
        id: 'outputFolder',
        labelKey: 'automations.demandLetter.fields.outputFolder.label',
        type: 'select',
        options: ['/Shared Documents/Demands', '/Shared Documents/Generated']
      }
    ]
  },
  {
    id: 'conflict-check-alert',
    titleKey: 'automations.conflictCheck.title',
    descriptionKey: 'automations.conflictCheck.desc',
    triggerType: 'webhook',
    integrations: ['Email', 'PostgreSQL', 'Teams'], // Changed 'Outlook' to 'Email'
    setupFields: [
      {
        id: 'monitoredInbox',
        labelKey: 'automations.conflictCheck.fields.monitoredInbox.label',
        type: 'select',
        options: ['info@lawfirm.com', 'intake@lawfirm.com', 'partners@lawfirm.com']
      },
      {
        id: 'teamsChannel',
        labelKey: 'automations.conflictCheck.fields.teamsChannel.label',
        type: 'select',
        options: ['Lawyers - General', 'Conflict Alerts', 'Secretariat']
      }
    ]
  },
  {
    id: 'kyc-onboarding',
    titleKey: 'automations.kyc.title',
    descriptionKey: 'automations.kyc.desc',
    triggerType: 'manual',
    integrations: ['Forms', 'PDF', 'Email'], // Changed 'Outlook' to 'Email'
    setupFields: [
      {
        id: 'kycTemplate',
        labelKey: 'automations.kyc.fields.kycTemplate.label',
        type: 'select',
        options: ['Corporate Client KYC 2026', 'Private Individual KYC']
      },
      {
        id: 'senderEmail',
        labelKey: 'automations.kyc.fields.senderEmail.label',
        type: 'select',
        options: ['noreply@lawfirm.com', 'admin@lawfirm.com']
      }
    ]
  },
  {
    id: 'court-deadline-alert',
    titleKey: 'automations.courtAlert.title',
    descriptionKey: 'automations.courtAlert.desc',
    triggerType: 'schedule',
    integrations: ['PostgreSQL', 'Teams', 'Email'], // Added 'Email'
    setupFields: [
      {
        id: 'caseDatabase',
        labelKey: 'automations.courtAlert.fields.caseDatabase.label',
        type: 'select',
        options: ['LegalAct Primary DB', 'Archive']
      },
      {
        id: 'alertTime',
        labelKey: 'automations.courtAlert.fields.alertTime.label',
        type: 'time',
        placeholderKey: 'automations.courtAlert.fields.alertTime.placeholder'
      },
      {
        id: 'partnerEmail',
        labelKey: 'automations.courtAlert.fields.partnerEmail.label',
        type: 'text',
        placeholderKey: 'automations.courtAlert.fields.partnerEmail.placeholder'
      }
    ]
  },
  {
    id: 'invoice-reminder',
    titleKey: 'automations.invoiceReminder.title',
    descriptionKey: 'automations.invoiceReminder.desc',
    triggerType: 'schedule',
    integrations: ['PostgreSQL', 'Email'], // Changed 'Outlook' to 'Email'
    setupFields: [
      {
        id: 'overdueThreshold',
        labelKey: 'automations.invoiceReminder.fields.overdueThreshold.label',
        type: 'number',
        placeholderKey: 'automations.invoiceReminder.fields.overdueThreshold.placeholder'
      },
      {
        id: 'replyTo',
        labelKey: 'automations.invoiceReminder.fields.replyTo.label',
        type: 'text',
        placeholderKey: 'automations.invoiceReminder.fields.replyTo.placeholder'
      }
    ]
  },
  {
    id: 'evidence-router',
    titleKey: 'automations.evidenceRouter.title',
    descriptionKey: 'automations.evidenceRouter.desc',
    triggerType: 'webhook',
    integrations: ['Email', 'SharePoint'], // Changed 'Outlook' to 'Email'
    setupFields: [
      {
        id: 'inboxToMonitor',
        labelKey: 'automations.evidenceRouter.fields.inboxToMonitor.label',
        type: 'select',
        options: ['evidence@lawfirm.com', 'lawyer1@lawfirm.com']
      },
      {
        id: 'masterSite',
        labelKey: 'automations.evidenceRouter.fields.masterSite.label',
        type: 'select',
        options: ['LawFirm Intranet', 'Client Portal']
      }
    ]
  }
];
