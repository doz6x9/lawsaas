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
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">{t('fileDrop.optionsTitle')}</h3>

        <div className="mb-6 pb-6 border-b border-gray-200">
          <label className="flex items-start cursor-pointer group">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={fileState.importContacts}
                onChange={handleImportContactsToggle}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-600 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
            <div className="ml-3 flex flex-col">
              <span className={`block text-sm font-semibold ${fileState.importContacts ? 'text-blue-600' : 'text-gray-900'} group-hover:text-blue-600 transition-colors`}>
                <Database className={`inline-block w-4 h-4 mr-2 mb-0.5 ${fileState.importContacts ? 'text-blue-600' : 'text-gray-400'}`} />
                {t('fileDrop.importContacts')}
              </span>
              <span className="block text-xs mt-1 text-gray-500">
                {t('fileDrop.importContactsSub')}
              </span>
            </div>
          </label>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('fileDrop.formatRequired')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleFormatChange('both')}
            disabled={disabled}
            className={`relative flex flex-col items-start p-4 rounded-lg border transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white hover:shadow-md ${
              fileState.outputFormat === 'both'
                ? 'border-blue-600 ring-2 ring-blue-600'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-center w-full mb-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md">
                <Files className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type="radio"
                name="outputFormat"
                checked={fileState.outputFormat === 'both'}
                onChange={() => handleFormatChange('both')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-600 cursor-pointer disabled:cursor-not-allowed"
                disabled={disabled}
              />
            </div>
            <span className="block text-sm font-bold text-gray-900 mb-1 text-left">
              {t('fileDrop.genBoth')}
            </span>
            <span className="block text-xs text-gray-500 text-left line-clamp-2">
              {t('fileDrop.genBothSub')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('docx')}
            disabled={disabled}
            className={`relative flex flex-col items-start p-4 rounded-lg border transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white hover:shadow-md ${
              fileState.outputFormat === 'docx'
                ? 'border-blue-600 ring-2 ring-blue-600'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-center w-full mb-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md">
                <FileArchive className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type="radio"
                name="outputFormat"
                checked={fileState.outputFormat === 'docx'}
                onChange={() => handleFormatChange('docx')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-600 cursor-pointer disabled:cursor-not-allowed"
                disabled={disabled}
              />
            </div>
            <span className="block text-sm font-bold text-gray-900 mb-1 text-left">
              {t('fileDrop.wordOnly')}
            </span>
            <span className="block text-xs text-gray-500 text-left line-clamp-2">
              {t('fileDrop.wordOnlySub')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('excel')}
            disabled={disabled}
            className={`relative flex flex-col items-start p-4 rounded-lg border transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white hover:shadow-md ${
              fileState.outputFormat === 'excel'
                ? 'border-blue-600 ring-2 ring-blue-600'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-center w-full mb-3">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md">
                <TableProperties className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type="radio"
                name="outputFormat"
                checked={fileState.outputFormat === 'excel'}
                onChange={() => handleFormatChange('excel')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-600 cursor-pointer disabled:cursor-not-allowed"
                disabled={disabled}
              />
            </div>
            <span className="block text-sm font-bold text-gray-900 mb-1 text-left">
              {t('fileDrop.excelOnly')}
            </span>
            <span className="block text-xs text-gray-500 text-left line-clamp-2">
              {t('fileDrop.excelOnlySub')}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' :
          isDragging ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud className={`mx-auto h-8 w-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
        <p className="mt-2 text-sm text-gray-600 font-semibold">
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
          className={`mt-4 inline-block px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}
        >
          {t('fileDrop.selectFile')}
        </label>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      {fileState.excelFile && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('fileDrop.uploadedDataset')}</h3>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
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
