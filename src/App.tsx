import React, { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { FileDropZone } from './components/FileDropZone';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ProcessingState, FileState, ProcessingStep } from './types';
import { Play } from 'lucide-react';

const INITIAL_STEPS: ProcessingStep[] = [
  { id: 'upload', label: 'Uploading files...', status: 'pending' },
  { id: 'parse', label: 'Parsing dataset...', status: 'pending' },
  { id: 'generate', label: 'Generating Word documents...', status: 'pending' },
  { id: 'email', label: 'Packaging and sending email...', status: 'pending' }
];

export const App: React.FC = () => {
  const [fileState, setFileState] = useState<FileState>({ excelFile: null, imageFiles: [] });
  const [processState, setProcessState] = useState<ProcessingState>('idle');
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateStep = (id: string, status: 'pending' | 'current' | 'completed') => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, status } : step));
  };

  const handleProcessBatch = async () => {
    if (!fileState.excelFile) {
      setErrorMsg('Please upload an Excel dataset before processing.');
      setProcessState('error');
      return;
    }

    setProcessState('uploading');
    setSteps(INITIAL_STEPS);
    setErrorMsg(null);

    try {
      // --- MOCK API INTEGRATION ---
      // In reality, you'd use FormData to send files to your backend endpoint.
      /*
      const formData = new FormData();
      formData.append('excelFile', fileState.excelFile);
      fileState.imageFiles.forEach(file => formData.append('images', file));
      formData.append('recipientEmail', 'user@lawfirm.com');

      updateStep('upload', 'current');
      const response = await fetch('/api/process-legal-batch', {
        method: 'POST',
        body: formData
      });
      // Handle response streams or polling for status updates...
      */

      // Simulating the backend pipeline for demonstration

      // 1. Upload
      updateStep('upload', 'current');
      await new Promise(res => setTimeout(res, 1500));
      updateStep('upload', 'completed');

      // 2. Parse
      setProcessState('processing');
      updateStep('parse', 'current');
      await new Promise(res => setTimeout(res, 1000));
      updateStep('parse', 'completed');

      // 3. Generate
      updateStep('generate', 'current');
      await new Promise(res => setTimeout(res, 2500));
      updateStep('generate', 'completed');

      // 4. Email
      updateStep('email', 'current');
      await new Promise(res => setTimeout(res, 1500));
      updateStep('email', 'completed');

      setProcessState('success');

    } catch (err) {
      setProcessState('error');
      setErrorMsg(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  const isProcessing = processState === 'uploading' || processState === 'processing';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Batch Document Processor</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload your client dataset and evidence images to automatically generate and email the document batch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FileDropZone
            fileState={fileState}
            setFileState={setFileState}
            disabled={isProcessing || processState === 'success'}
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleProcessBatch}
              disabled={!fileState.excelFile || isProcessing || processState === 'success'}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="-ml-1 mr-3 h-5 w-5" />
                  Process Batch
                </>
              )}
            </button>
          </div>

          {(processState === 'success' || processState === 'error') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFileState({ excelFile: null, imageFiles: [] });
                  setProcessState('idle');
                  setSteps(INITIAL_STEPS);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Start New Batch
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <ProcessingStatus state={processState} steps={steps} error={errorMsg} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
