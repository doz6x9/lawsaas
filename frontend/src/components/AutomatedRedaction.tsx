import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UploadCloud,
  File as FileIcon,
  XCircle,
  Eraser,
  Loader2,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { RedactionPreview } from './RedactionPreview';
import { ProcessedFile } from '../types';

export const AutomatedRedaction: React.FC = () => {
  const { t } = useTranslation();

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [redactionDone, setRedactionDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;

    if (!droppedFiles || droppedFiles.length === 0) return;

    setFiles(prev => [...prev, ...Array.from(droppedFiles)]);

    setProcessedFiles([]);
    setRedactionDone(false);
    setError(null);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;

    if (!selectedFiles || selectedFiles.length === 0) return;

    setFiles(prev => [...prev, ...Array.from(selectedFiles)]);

    setProcessedFiles([]);
    setRedactionDone(false);
    setError(null);

    // Optional: allows selecting the same file again later
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));

    setProcessedFiles([]);
    setRedactionDone(false);
    setError(null);
  };

  const handleRedactionComplete = (updatedFiles: ProcessedFile[]) => {
    setProcessedFiles(updatedFiles);
    setRedactionDone(true);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result;

        if (typeof result !== 'string') {
          reject(new Error('Failed to convert file to base64.'));
          return;
        }

        const base64String = result.split(',')[1];

        if (!base64String) {
          reject(new Error('Invalid base64 file content.'));
          return;
        }

        resolve(base64String);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };

      reader.readAsDataURL(blob);
    });
  };

  const filesToProcessedFiles = async (
    inputFiles: File[]
  ): Promise<ProcessedFile[]> => {
    const processed: ProcessedFile[] = [];

    for (const file of inputFiles) {
      const base64Content = await blobToBase64(file);

      processed.push({
        filename: file.name,
        base64Content,
        mimeType: file.type,
        url: URL.createObjectURL(file),
      });
    }

    return processed;
  };

  const startRedactionProcess = async () => {
    setIsProcessingFiles(true);
    setError(null);
    setRedactionDone(false);
    setProcessedFiles([]);

    try {
      const processed = await filesToProcessedFiles(files);
      setProcessedFiles(processed);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to process files for redaction.'
      );
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const resetAll = () => {
    setFiles([]);
    setProcessedFiles([]);
    setRedactionDone(false);
    setError(null);
    setIsProcessingFiles(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Automated Document Redaction
        </h2>

        <p className="mt-2 text-lg text-gray-600">
          Drop multiple DOCX files to redact sensitive information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleFileDrop}
          >
            <UploadCloud
              className={`mx-auto h-12 w-12 ${
                isDragging ? 'text-blue-600' : 'text-gray-400'
              }`}
            />

            <p className="mt-4 text-sm text-gray-600 font-semibold">
              Drag and drop files here
            </p>

            <p className="mt-1 text-xs text-gray-500">or</p>

            <input
              type="file"
              accept=".docx"
              multiple
              className="hidden"
              id="file-upload"
              onChange={handleFileInput}
            />

            <label
              htmlFor="file-upload"
              className="mt-4 inline-block px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Browse files
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selected Files
              </h3>

              <ul className="space-y-2">
                {files.map(file => (
                  <li
                    key={`${file.name}-${file.lastModified}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center">
                      <FileIcon className="h-5 w-5 text-blue-600 mr-3" />

                      <span className="text-sm text-gray-700 font-medium">
                        {file.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={startRedactionProcess}
                  disabled={
                    isProcessingFiles ||
                    files.length === 0 ||
                    processedFiles.length > 0
                  }
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessingFiles ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Eraser className="-ml-1 mr-2 h-4 w-4" />
                      Start Redaction
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          {processedFiles.length > 0 && !redactionDone && (
            <RedactionPreview
              files={processedFiles}
              onRedactionComplete={handleRedactionComplete}
            />
          )}
        </div>
      </div>

      {redactionDone && (
        <div className="mt-8">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle2
                  className="h-5 w-5 text-green-600"
                  aria-hidden="true"
                />
              </div>

              <div className="ml-3 w-full">
                <h3 className="text-sm font-semibold text-green-800">
                  Redaction Complete
                </h3>

                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your documents have been redacted and are ready for download.
                  </p>
                </div>

                <div className="mt-4">
                  <ul className="space-y-2">
                    {processedFiles.map((file, index) => (
                      <li
                        key={`${file.filename}-${index}`}
                        className="flex items-center justify-between p-2 bg-white rounded-md border"
                      >
                        <span className="text-sm font-medium text-gray-800">
                          {file.filename}
                        </span>

                        <a
                          href={file.url}
                          download={`redacted_${file.filename}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4 mr-1.5" />
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};