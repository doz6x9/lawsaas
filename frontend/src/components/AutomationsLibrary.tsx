import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { automatedTools } from '../config/automatedTools';
import { ToolConfigurator } from './ToolConfigurator';
import { Search, Settings, FileText, Globe, ChevronRight, LayoutGrid, Clock, ArrowLeft } from 'lucide-react';

export const AutomationsLibrary: React.FC = () => {
  const { t } = useTranslation();
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  if (selectedToolId) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <button
          onClick={() => setSelectedToolId(null)}
          className="mb-6 flex items-center text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('automations.back')}
        </button>
        <ToolConfigurator
          toolId={selectedToolId}
          onCancel={() => setSelectedToolId(null)}
          onSuccess={() => setSelectedToolId(null)}
        />
      </div>
    );
  }

  const getToolIcon = (id: string) => {
    switch(id) {
      case 'demand-letter-generator': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'conflict-check-alert': return <Search className="w-5 h-5 text-red-600" />;
      case 'kyc-onboarding': return <Globe className="w-5 h-5 text-green-600" />;
      case 'court-deadline-alert': return <Clock className="w-5 h-5 text-purple-600" />;
      case 'invoice-reminder': return <Settings className="w-5 h-5 text-blue-600" />;
      case 'evidence-router': return <LayoutGrid className="w-5 h-5 text-teal-600" />;
      default: return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('automations.libraryTitle')}</h2>
        <p className="mt-2 text-lg text-gray-600">
          {t('automations.librarySubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {automatedTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setSelectedToolId(tool.id)}
            className="group flex flex-col bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all h-56"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg">
                {getToolIcon(tool.id)}
              </div>
              <div className="flex space-x-1">
                 {tool.integrations.slice(0, 3).map(int => (
                   <span key={int} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-md border border-gray-200">
                     {int}
                   </span>
                 ))}
                 {tool.integrations.length > 3 && (
                   <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-md border border-gray-200">
                     +{tool.integrations.length - 3}
                   </span>
                 )}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-md font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                {t(tool.titleKey)}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {t(tool.descriptionKey)}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 capitalize">
                {t('automations.trigger')}: {tool.triggerType}
              </span>
              <span className="flex items-center text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                {t('automations.configure')} <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
