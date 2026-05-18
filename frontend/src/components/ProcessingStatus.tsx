import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, AlertCircle, Download, FileArchive, TableProperties, File as FileIcon } from 'lucide-react';
import { ProcessingState, ProcessingStep, ProcessedFile } from '../types';

interface ProcessingStatusProps {
  state: ProcessingState;
  steps: ProcessingStep[];
  error?: string | null;
  processedFiles?: ProcessedFile[];
  selectedFileNames?: Set<string>;
  onToggleSelection?: (filename: string) => void;
  onToggleSelectAll?: () => void;
  onDownloadSelected?: () => void;
  onDownloadSingle?: (filename: string) => void;
}

const FileTypeIcon = ({ filename }: { filename: string }) => {
  if (filename.endsWith('.xlsx')) {
    return <TableProperties className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />;
  }
  if (filename.endsWith('.docx')) {
    return <FileIcon className="h-5 w-5 text-[#0078D4] mr-3 flex-shrink-0" />;
  }
  return <FileIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />;
};

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  state,
  steps,
  error,
  processedFiles = [],
  selectedFileNames = new Set(),
  onToggleSelection,
  onToggleSelectAll,
  onDownloadSelected,
  onDownloadSingle
}) => {
  const { t } = useTranslation();

  if (state === 'idle') return null;

  if (state === 'error') {
    return (
      <div className="p-4 bg-[#FDE7E9] border border-[#FDE7E9] rounded-md mt-6 flex items-start">
        <AlertCircle className="h-5 w-5 text-[#A80000] mr-3 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-[#A80000]">{t('dashboard.processingFailed')}</h3>
          <p className="mt-1 text-sm text-[#A80000]">{error || t('dashboard.errorGeneric')}</p>
        </div>
      </div>
    );
  }

  if (state === 'readyToDownload' || state === 'success') {
    const allSelected = selectedFileNames.size === processedFiles.length;
    const selectedCount = selectedFileNames.size;

    return (
      <div className="p-5 bg-white rounded-md border border-gray-200 mt-6 shadow-sm">
        <div className="flex items-center mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h3 className="text-base font-semibold text-gray-900">{t('dashboard.processingComplete')}</h3>
            <p className="text-sm text-gray-500">
              {processedFiles.length === 1
                ? t('dashboard.filesGenerated_one', { count: processedFiles.length })
                : t('dashboard.filesGenerated_other', { count: processedFiles.length })
              }
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded-sm border-gray-300 text-[#0078D4] focus:ring-[#0078D4]"
                checked={allSelected}
                onChange={onToggleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="ml-2 text-sm font-semibold text-gray-700">
                Select All
              </label>
            </div>
            <button
              onClick={onDownloadSelected}
              disabled={selectedCount === 0}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-sm text-white bg-[#0078D4] hover:bg-[#005A9E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D4] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileArchive className="h-4 w-4 mr-2" />
              {selectedCount > 1 ? `Download ${selectedCount} as ZIP` : 'Download Selected'}
            </button>
          </div>

          <ul className="space-y-1 max-h-80 overflow-y-auto border-t border-b border-gray-200 py-2">
            {processedFiles.length === 0 && (
               <li className="p-4 text-center text-sm text-gray-500">No files generated.</li>
            )}
            {processedFiles.map(file => (
              <li key={file.filename} className="flex items-center justify-between p-2 rounded-sm hover:bg-[#F3F2F1]">
                <div className="flex items-center flex-1 min-w-0">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded-sm border-gray-300 text-[#0078D4] focus:ring-[#0078D4]"
                    checked={selectedFileNames.has(file.filename)}
                    onChange={() => onToggleSelection?.(file.filename)}
                  />
                  <div className="ml-3 flex items-center min-w-0">
                    <FileTypeIcon filename={file.filename} />
                    <span className="text-sm text-gray-900 truncate font-medium">{file.filename}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDownloadSingle?.(file.filename)}
                  className="ml-2 text-gray-400 hover:text-[#0078D4]"
                  title="Download this file"
                >
                  <Download className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white p-5 rounded-md shadow-sm border border-gray-200">
      <h3 className="text-base font-semibold text-gray-900 mb-5">{t('dashboard.pipelineStatus')}</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center h-6 w-6 rounded-full border mr-3 ${
              step.status === 'completed' ? 'bg-[#0078D4] border-[#0078D4]' :
              step.status === 'current' ? 'border-[#0078D4]' : 'border-gray-300'
            }`}>
              {step.status === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 text-white" />
              ) : step.status === 'current' ? (
                <Loader2 className="h-3 w-3 text-[#0078D4] animate-spin" />
              ) : (
                <span className="text-gray-400 text-xs font-semibold">{index + 1}</span>
              )}
            </div>
            <div>
              <p className={`text-sm font-semibold ${
                step.status === 'completed' ? 'text-gray-900' :
                step.status === 'current' ? 'text-[#0078D4]' : 'text-gray-500'
              }`}>
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
