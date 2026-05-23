import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TEMPLATE_CONFIGS } from '../config/documentTemplates';
import { TemplateForm } from './TemplateForm';
import { FileText, Globe, Search, CheckCircle2, ChevronRight, Clock, ShieldAlert, ArrowLeft } from 'lucide-react';

export const DocumentGenerationLibrary: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  if (selectedTemplateId) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto h-full">
        <button
          onClick={() => setSelectedTemplateId(null)}
          className="mb-6 flex items-center text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('documentGen.back')}
        </button>
        <TemplateForm templateId={selectedTemplateId} onCancel={() => setSelectedTemplateId(null)} />
      </div>
    );
  }

  const getTemplateIcon = (id: string) => {
    switch(id) {
      case 'EuMutualNda': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'EuStandardContractualClauses': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'EuClientEngagementLetter': return <Globe className="w-5 h-5 text-green-600" />;
      case 'EuipoCeaseAndDesist': return <Search className="w-5 h-5 text-purple-600" />;
      case 'EuLatePaymentDemand': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'EuEmploymentAgreement': return <CheckCircle2 className="w-5 h-5 text-teal-600" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"> {/* Removed h-full from here */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('documentGen.libraryTitle')}</h2>
        <p className="mt-2 text-lg text-gray-600">
          {t('documentGen.librarySubtitle')}
        </p>
      </div>

      {/* This div will now handle the scrolling */}
      <div className="overflow-y-auto h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_CONFIGS.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplateId(template.id)}
              className="group flex flex-col bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all h-56"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg">
                  {getTemplateIcon(template.id)}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-md font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                  {template.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {template.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700 capitalize">
                  Generate
                </span>
                <span className="flex items-center text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Customize <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
