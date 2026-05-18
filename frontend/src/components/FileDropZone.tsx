import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, FileSpreadsheet, XCircle, FileArchive, TableProperties, Files, Database } from 'lucide-react';
import { FileState, OutputFormat } from '../types';

interface FileDropZoneProps {
  fileState: FileState;
  setFileState: React.Dispatch<React.SetStateAction<FileState>>;
  disabled?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ fileState, setFileState, disabled }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFiles = (files: File[]) => {
    setErrorMsg(null);
    let newExcel: File | null = fileState.excelFile;
    let hasError = false;

    files.forEach((file) => {
      if (file.name.endsWith('.xlsx')) {
        if (newExcel) {
          setErrorMsg(t('fileDrop.onlyOneExcel'));
          hasError = true;
        } else {
          newExcel = file;
        }
      } else {
        setErrorMsg(t('fileDrop.unsupportedFile', { name: file.name }));
        hasError = true;
      }
    });

    if (!hasError) {
      setFileState(prev => ({ ...prev, excelFile: newExcel }));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [fileState, disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeExcel = () => setFileState(prev => ({ ...prev, excelFile: null }));

  const handleFormatChange = (format: OutputFormat) => {
    setFileState(prev => ({ ...prev, outputFormat: format }));
  };

  const handleImportContactsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileState(prev => ({ ...prev, importContacts: e.target.checked }));
  };

  return (
    <div className="space-y-6">
      {/* Format Selection Card */}
      <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-5">{t('fileDrop.optionsTitle')}</h3>

        <div className="mb-6 pb-6 border-b border-gray-200">
          <label className="flex items-start cursor-pointer group">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={fileState.importContacts}
                onChange={handleImportContactsToggle}
                disabled={disabled}
                className="w-4 h-4 text-[#0078D4] border-gray-300 rounded-sm focus:ring-[#0078D4] cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
            <div className="ml-3 flex flex-col">
              <span className={`block text-sm font-semibold ${fileState.importContacts ? 'text-[#0078D4]' : 'text-gray-900'} group-hover:text-[#0078D4] transition-colors`}>
                <Database className={`inline-block w-4 h-4 mr-2 mb-0.5 ${fileState.importContacts ? 'text-[#0078D4]' : 'text-gray-400'}`} />
                {t('fileDrop.importContacts')}
              </span>
              <span className="block text-xs mt-1 text-gray-500">
                {t('fileDrop.importContactsSub')}
              </span>
            </div>
          </label>
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-4">{t('fileDrop.formatRequired')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleFormatChange('both')}
            disabled={disabled}
            className={`relative flex flex-col items-start p-4 rounded-md border transition-shadow focus:outline-none focus:ring-1 focus:ring-[#0078D4] bg-white hover:shadow-sm ${
              fileState.outputFormat === 'both'
                ? 'border-[#0078D4] ring-1 ring-[#0078D4]'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-center w-full mb-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
                <Files className="w-4 h-4 text-[#0078D4]" />
              </div>
              <input
                type="radio"
                name="outputFormat"
                checked={fileState.outputFormat === 'both'}
                onChange={() => handleFormatChange('both')}
                className="h-4 w-4 text-[#0078D4] border-gray-300 focus:ring-[#0078D4] cursor-pointer disabled:cursor-not-allowed"
                disabled={disabled}
              />
            </div>
            <span className="block text-sm font-bold text-gray-900 mb-1 text-left">
              {t('fileDrop.genBoth')}
            </span>
            <span className="block text-[11px] text-gray-500 text-left line-clamp-2">
              {t('fileDrop.genBothSub')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('docx')}
            disabled={disabled}
            className={`relative flex flex-col items-start p-4 rounded-md border transition-shadow focus:outline-none focus:ring-1 focus:ring-[#0078D4] bg-white hover:shadow-sm ${
              fileState.outputFormat === 'docx'
                ? 'border-[#0078D4] ring-1 ring-[#0078D4]'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-center w-full mb-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
                <FileArchive className="w-4 h-4 text-[#0078D4]" />
              </div>
              <input
                type="radio"
                name="outputFormat"
                checked={fileState.outputFormat === 'docx'}
                onChange={() => handleFormatChange('docx')}
                className="h-4 w-4 text-[#0078D4] border-gray-300 focus:ring-[#0078D4] cursor-pointer disabled:cursor-not-allowed"
                disabled={disabled}
              />
            </div>
            <span className="block text-sm font-bold text-gray-900 mb-1 text-left">
              {t('fileDrop.wordOnly')}
            </span>
            <span className="block text-[11px] text-gray-500 text-left line-clamp-2">
              {t('fileDrop.wordOnlySub')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('excel')}
            disabled={disabled}
            className={`relative flex flex-col items-start p-4 rounded-md border transition-shadow focus:outline-none focus:ring-1 focus:ring-[#0078D4] bg-white hover:shadow-sm ${
              fileState.outputFormat === 'excel'
                ? 'border-[#0078D4] ring-1 ring-[#0078D4]'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-center w-full mb-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
                <TableProperties className="w-4 h-4 text-[#0078D4]" />
              </div>
              <input
                type="radio"
                name="outputFormat"
                checked={fileState.outputFormat === 'excel'}
                onChange={() => handleFormatChange('excel')}
                className="h-4 w-4 text-[#0078D4] border-gray-300 focus:ring-[#0078D4] cursor-pointer disabled:cursor-not-allowed"
                disabled={disabled}
              />
            </div>
            <span className="block text-sm font-bold text-gray-900 mb-1 text-left">
              {t('fileDrop.excelOnly')}
            </span>
            <span className="block text-[11px] text-gray-500 text-left line-clamp-2">
              {t('fileDrop.excelOnlySub')}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`border border-dashed rounded-md p-10 text-center transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' :
          isDragging ? 'border-[#0078D4] bg-[#F3F2F1]' : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud className={`mx-auto h-12 w-12 ${isDragging ? 'text-[#0078D4]' : 'text-gray-400'}`} />
        <p className="mt-4 text-sm text-gray-600 font-semibold">
          {t('fileDrop.dragDrop')}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {t('fileDrop.browse')}
        </p>
        <input
          type="file"
          accept=".xlsx"
          className="hidden"
          id="file-upload"
          onChange={handleFileInput}
          disabled={disabled}
        />
        <label
          htmlFor="file-upload"
          className={`mt-6 inline-block px-4 py-1.5 border border-gray-300 rounded-sm shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D4] ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}
        >
          {t('fileDrop.selectFile')}
        </label>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#FDE7E9] border border-[#FDE7E9] text-[#A80000] text-sm rounded-sm">
          {errorMsg}
        </div>
      )}

      {fileState.excelFile && (
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('fileDrop.uploadedDataset')}</h3>

          <div className="flex items-center justify-between p-3 bg-[#F3F2F1] rounded-sm border border-gray-200">
            <div className="flex items-center">
              <FileSpreadsheet className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm text-gray-700 font-medium">{fileState.excelFile.name}</span>
            </div>
            {!disabled && (
              <button onClick={removeExcel} className="text-gray-400 hover:text-red-600 transition-colors">
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
