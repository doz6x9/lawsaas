import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TEMPLATE_CONFIGS } from '../config/documentTemplates';
import { TemplateForm } from './TemplateForm';
import { FileText, Globe, Search, CheckCircle2, ChevronRight, Clock, ShieldAlert } from 'lucide-react';

export const DocumentGenerationLibrary: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  if (selectedTemplateId) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <button
          onClick={() => setSelectedTemplateId(null)}
          className="mb-6 flex items-center text-sm font-semibold text-[#0078D4] hover:underline"
        >
          &larr; {t('documentGen.back')}
        </button>
        <TemplateForm templateId={selectedTemplateId} onCancel={() => setSelectedTemplateId(null)} />
      </div>
    );
  }

  // Icon mapping helper
  const getTemplateIcon = (id: string) => {
    switch(id) {
      case 'EuMutualNda': return <FileText className="w-5 h-5 text-[#0078D4]" />;
      case 'EuStandardContractualClauses': return <ShieldAlert className="w-5 h-5 text-[#D83B01]" />;
      case 'EuClientEngagementLetter': return <Globe className="w-5 h-5 text-[#107C10]" />;
      case 'EuipoCeaseAndDesist': return <Search className="w-5 h-5 text-[#8764B8]" />;
      case 'EuLatePaymentDemand': return <Clock className="w-5 h-5 text-[#0078D4]" />;
      case 'EuEmploymentAgreement': return <CheckCircle2 className="w-5 h-5 text-[#038387]" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-2">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('documentGen.libraryTitle')}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('documentGen.librarySubtitle')}
        </p>
      </div>

      {/* Template Grid mimicking Power Automate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATE_CONFIGS.map((template) => ( // Using TEMPLATE_CONFIGS
          <div
            key={template.id}
            onClick={() => setSelectedTemplateId(template.id)}
            className="flex flex-col bg-white border border-gray-200 rounded-md p-5 cursor-pointer hover:shadow-sm hover:border-gray-300 transition-shadow h-56"
          >
            {/* Top Icons */}
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
                {getTemplateIcon(template.id)}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                {template.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-3">
                {template.description}
              </p>
            </div>

            {/* Footer Metadata */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 capitalize">
                Generate
              </span>
              <span className="flex items-center text-[#0078D4] text-xs font-semibold group-hover:underline">
                Customize <ChevronRight className="w-4 h-4 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
