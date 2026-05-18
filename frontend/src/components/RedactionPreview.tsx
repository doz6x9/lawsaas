import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eraser, Loader2, CheckCircle2, Shield, Plus, X } from 'lucide-react';
import { ProcessedFile } from '../types';

interface RedactionPreviewProps {
  files: ProcessedFile[];
  onRedactionComplete: (updatedFiles: ProcessedFile[]) => void;
}

export const RedactionPreview: React.FC<RedactionPreviewProps> = ({ files, onRedactionComplete }) => {
  const { t } = useTranslation();
  const [redactPhones, setRedactPhones] = useState(false);
  const [redactEmails, setRedactEmails] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [customWordsList, setCustomWordsList] = useState<string[]>([]);

  const [isRedacting, setIsRedacting] = useState(false);
  const [redactionDone, setRedactionDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docxFiles = files.filter(f => f.mimeType.includes('wordprocessingml.document') || f.filename.endsWith('.docx'));

  const handleAddCustomWord = () => {
    if (customWord.trim() && !customWordsList.includes(customWord.trim())) {
      setCustomWordsList([...customWordsList, customWord.trim()]);
      setCustomWord('');
    }
  };

  const handleRemoveCustomWord = (word: string) => {
    setCustomWordsList(customWordsList.filter(w => w !== word));
  };

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const applyRedaction = async () => {
    if (docxFiles.length === 0) return;

    let targets: string[] = [...customWordsList];
    if (redactPhones) targets.push('__PHONE_PATTERN__');
    if (redactEmails) targets.push('__EMAIL_PATTERN__');

    if (targets.length === 0) {
      setRedactionDone(true);
      return;
    }

    setIsRedacting(true);
    setError(null);

    try {
      const updatedFiles = [...files];

      for (let i = 0; i < updatedFiles.length; i++) {
        const file = updatedFiles[i];
        if (file.filename.endsWith('.docx')) {
          const blob = base64ToBlob(file.base64Content, file.mimeType);

          const formData = new FormData();
          formData.append('document', blob, file.filename);
          formData.append('targets', JSON.stringify(targets));

          const response = await fetch('http://localhost:3000/api/redact-document', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Failed to redact ${file.filename}`);
          }

          const redactedBlob = await response.blob();
          const base64Content = await blobToBase64(redactedBlob);

          updatedFiles[i] = {
            ...file,
            base64Content
          };
        }
      }

      setRedactionDone(true);
      onRedactionComplete(updatedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply redaction.');
    } finally {
      setIsRedacting(false);
    }
  };

  if (docxFiles.length === 0) {
    return null;
  }

  if (redactionDone) {
    return (
      <div className="mt-4 bg-[#F3F2F1] border border-gray-200 rounded-md p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
          <span className="text-sm font-semibold text-gray-900">{t('redaction.success')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
      <div className="p-3 bg-[#F3F2F1] border-b border-gray-200 flex items-center">
        <Shield className="h-4 w-4 text-gray-600 mr-2" />
        <h4 className="text-sm font-semibold text-gray-900">{t('redaction.title')}</h4>
      </div>

      <div className="p-4 space-y-5">
        <p className="text-xs text-gray-600">
          {t('redaction.subtitle')}
        </p>

        {error && (
          <div className="p-3 bg-[#FDE7E9] text-[#A80000] text-xs font-medium rounded-sm border border-[#FDE7E9]">
            {error}
          </div>
        )}

        {/* Preset Toggles */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={redactPhones}
                onChange={() => setRedactPhones(!redactPhones)}
                disabled={isRedacting}
              />
              <div className={`block w-9 h-5 rounded-full transition-colors ${redactPhones ? 'bg-[#0078D4]' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${redactPhones ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm font-semibold text-gray-700">
              {t('redaction.redactPhones')}
            </div>
          </label>

          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={redactEmails}
                onChange={() => setRedactEmails(!redactEmails)}
                disabled={isRedacting}
              />
              <div className={`block w-9 h-5 rounded-full transition-colors ${redactEmails ? 'bg-[#0078D4]' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${redactEmails ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm font-semibold text-gray-700">
              {t('redaction.redactEmails')}
            </div>
          </label>
        </div>

        {/* Custom Words */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('redaction.customTextLabel')}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomWord()}
              placeholder={t('redaction.customTextPlaceholder')}
              className="flex-1 block w-full px-2.5 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#0078D4] focus:border-[#0078D4] disabled:opacity-50"
              disabled={isRedacting}
            />
            <button
              onClick={handleAddCustomWord}
              disabled={!customWord.trim() || isRedacting}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-semibold rounded-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {customWordsList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {customWordsList.map((word, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-[#E1DFDD] text-gray-800">
                  {word}
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomWord(word)}
                    disabled={isRedacting}
                    className="flex-shrink-0 ml-1 h-3 w-3 inline-flex items-center justify-center text-gray-500 hover:text-gray-900 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={applyRedaction}
            disabled={isRedacting || (!redactPhones && !redactEmails && customWordsList.length === 0)}
            className="w-full inline-flex justify-center items-center px-4 py-1.5 border border-transparent text-sm font-semibold rounded-sm shadow-sm text-white bg-[#0078D4] hover:bg-[#005A9E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D4] disabled:opacity-50 transition-colors"
          >
            {isRedacting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                {t('redaction.applying')}
              </>
            ) : (
              <>
                <Eraser className="-ml-1 mr-2 h-4 w-4" />
                {t('redaction.apply')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
