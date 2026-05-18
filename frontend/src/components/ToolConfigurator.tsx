import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { automatedTools } from '../config/automatedTools';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface ToolConfiguratorProps {
  toolId: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const ToolConfigurator: React.FC<ToolConfiguratorProps> = ({ toolId, onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const tool = automatedTools.find((t) => t.id === toolId);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!tool) {
    return (
      <div className="p-6 bg-[#FDE7E9] border border-[#FDE7E9] rounded-sm flex items-start">
        <AlertCircle className="h-5 w-5 text-[#A80000] mr-3 shrink-0" />
        <p className="text-sm text-[#A80000]">{t('automations.toolNotFound')}</p>
      </div>
    );
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSave = async () => {
    const missingFields = tool.setupFields.filter((f) => !formData[f.id] || formData[f.id].trim() === '');
    if (missingFields.length > 0) {
      setStatus('error');
      setErrorMessage(t('automations.errorMissingFields'));
      return;
    }

    setStatus('saving');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/automations/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: tool.id,
          configuration: formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t('automations.saveError'));
      }

      setStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t('automations.saveError'));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-900">{t(tool.titleKey)}</h2>
        <p className="mt-1 text-sm text-gray-600">{t(tool.descriptionKey)}</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {/* Error Alert */}
        {status === 'error' && (
          <div className="mb-6 p-4 bg-[#FDE7E9] border border-[#FDE7E9] rounded-sm flex items-start">
            <AlertCircle className="h-5 w-5 text-[#A80000] mr-3 shrink-0" />
            <p className="text-sm font-semibold text-[#A80000]">{errorMessage}</p>
          </div>
        )}

        {/* Success Alert */}
        {status === 'success' && (
          <div className="mb-6 p-4 bg-[#DFF6DD] border border-[#DFF6DD] rounded-sm flex items-center">
            <CheckCircle2 className="h-5 w-5 text-[#107C10] mr-3 shrink-0" />
            <p className="text-sm font-semibold text-[#107C10]">{t('automations.successMessage')}</p>
          </div>
        )}

        {/* Integrations Status */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">{t('automations.activeIntegrations')}</h3>
          <div className="space-y-2">
            {tool.integrations.map((integration) => (
              <div key={integration} className="flex items-center text-sm text-gray-700 bg-[#F3F2F1] px-3 py-2 rounded-sm border border-gray-200">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 shrink-0" />
                <span>{t('automations.connectedTo')} <span className="font-semibold">{integration}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Form */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">{t('automations.configuration')}</h3>
          <div className="space-y-5">
            {tool.setupFields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-semibold text-gray-900 mb-1.5">
                  {t(field.labelKey)}
                </label>

                {field.type === 'select' ? (
                  <select
                    id={field.id}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    disabled={status === 'saving' || status === 'success'}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 border focus:outline-none focus:ring-1 focus:ring-[#0078D4] focus:border-[#0078D4] sm:text-sm rounded-sm bg-white"
                  >
                    <option value="" disabled>{t('automations.selectDefault')}</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    placeholder={field.placeholderKey ? t(field.placeholderKey) : ''}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    disabled={status === 'saving' || status === 'success'}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0078D4] focus:border-[#0078D4] sm:text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-[#F3F2F1] border-t border-gray-200 flex items-center justify-end space-x-3 shrink-0">
        <button
          onClick={onCancel}
          disabled={status === 'saving' || status === 'success'}
          className="px-4 py-2 border border-transparent text-sm font-semibold rounded-sm text-gray-700 bg-transparent hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
        >
          {t('automations.cancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={status === 'saving' || status === 'success'}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-sm shadow-sm text-white bg-[#0078D4] hover:bg-[#005A9E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D4] disabled:opacity-50 transition-colors"
        >
          {status === 'saving' && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />}
          {t('automations.saveAndTurnOn')}
        </button>
      </div>
    </div>
  );
};
