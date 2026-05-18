import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { automatedTools } from '../config/automatedTools';
import { ToolConfigurator } from './ToolConfigurator';
import { Search, Settings, FileText, Globe, CheckCircle2, ChevronRight, LayoutGrid, Clock } from 'lucide-react';

export const AutomationsLibrary: React.FC = () => {
  const { t } = useTranslation();
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  if (selectedToolId) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <button
          onClick={() => setSelectedToolId(null)}
          className="mb-6 flex items-center text-sm font-semibold text-[#0078D4] hover:underline"
        >
          &larr; {t('automations.back')}
        </button>
        <ToolConfigurator
          toolId={selectedToolId}
          onCancel={() => setSelectedToolId(null)}
          onSuccess={() => setSelectedToolId(null)}
        />
      </div>
    );
  }

  // Icon mapping helper since we didn't store icons in the config array directly to keep it pure data
  const getToolIcon = (id: string) => {
    switch(id) {
      case 'demand-letter-generator': return <FileText className="w-5 h-5 text-[#0078D4]" />;
      case 'conflict-check-alert': return <Search className="w-5 h-5 text-[#D83B01]" />;
      case 'kyc-onboarding': return <Globe className="w-5 h-5 text-[#107C10]" />;
      case 'court-deadline-alert': return <Clock className="w-5 h-5 text-[#8764B8]" />;
      case 'invoice-reminder': return <Settings className="w-5 h-5 text-[#0078D4]" />;
      case 'evidence-router': return <LayoutGrid className="w-5 h-5 text-[#038387]" />;
      default: return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-2">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('automations.libraryTitle')}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('automations.librarySubtitle')}
        </p>
      </div>

      {/* Template Grid mimicking Power Automate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {automatedTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setSelectedToolId(tool.id)}
            className="flex flex-col bg-white border border-gray-200 rounded-md p-5 cursor-pointer hover:shadow-sm hover:border-gray-300 transition-shadow h-56"
          >
            {/* Top Icons */}
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
                {getToolIcon(tool.id)}
              </div>
              <div className="flex space-x-1">
                 {/* Visual hint of integrations */}
                 {tool.integrations.slice(0, 3).map(int => (
                   <span key={int} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-sm border border-gray-200">
                     {int}
                   </span>
                 ))}
                 {tool.integrations.length > 3 && (
                   <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-sm border border-gray-200">
                     +{tool.integrations.length - 3}
                   </span>
                 )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                {t(tool.titleKey)}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-3">
                {t(tool.descriptionKey)}
              </p>
            </div>

            {/* Footer Metadata */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 capitalize">
                {t('automations.trigger')}: {tool.triggerType}
              </span>
              <span className="flex items-center text-[#0078D4] text-xs font-semibold group-hover:underline">
                {t('automations.configure')} <ChevronRight className="w-4 h-4 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
