import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout, TabType } from './components/DashboardLayout';
import { FileDropZone } from './components/FileDropZone';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ContactsDirectory } from './components/ContactsDirectory';
import { ConflictSearch } from './components/ConflictSearch';
import { DeadlineCalculator } from './components/DeadlineCalculator';
import { RedactionPreview } from './components/RedactionPreview';
import { LandingPage } from './components/LandingPage';
import ServiceConfigurator from './components/ServiceConfigurator';
import { DocumentGenerationLibrary } from './components/DocumentGenerationLibrary'; // Updated import
import { PublicIntakeForm } from './pages/PublicIntakeForm';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Contact } from './pages/Contact';
import { ProcessingState, FileState, ProcessingStep, ProcessedFile } from './types';
import { Play, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

interface InternalAppProps {
  onLogout: () => void;
}

const InternalApp: React.FC<InternalAppProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  // Set default tab to 'home' where the automations library lives
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const INITIAL_STEPS: ProcessingStep[] = [
    { id: 'upload', label: t('dashboard.uploading'), status: 'pending' },
    { id: 'generate', label: t('dashboard.generating'), status: 'pending' }
  ];

  const [fileState, setFileState] = useState<FileState>({ excelFile: null, outputFormat: 'both', importContacts: false });
  const [processState, setProcessState] = useState<ProcessingState>('idle');
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<Set<string>>(new Set());

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
    setProcessedFiles([]);
    setSelectedFileNames(new Set());

    try {
      const formData = new FormData();
      formData.append('excel', fileState.excelFile);
      formData.append('outputFormat', fileState.outputFormat);
      formData.append('importContacts', String(fileState.importContacts));

      updateStep('upload', 'current');

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      updateStep('upload', 'completed');
      setProcessState('processing');
      updateStep('generate', 'current');

      if (!response.ok) {
        let errorMessage = `Server processing failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const files: ProcessedFile[] = responseData.files || [];

      setProcessedFiles(files);
      // Select all by default
      setSelectedFileNames(new Set(files.map(f => f.filename)));

      updateStep('generate', 'completed');
      setProcessState('readyToDownload');

    } catch (err) {
      setProcessState('error');
      setErrorMsg(err instanceof Error ? err.message : t('dashboard.errorGeneric'));
    }
  };

  // Utility to decode base64 to Blob
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

  const handleDownloadSelected = async () => {
    const filesToDownload = processedFiles.filter(f => selectedFileNames.has(f.filename));
    if (filesToDownload.length === 0) return;

    if (filesToDownload.length === 1) {
      // Single file download
      const file = filesToDownload[0];
      const blob = base64ToBlob(file.base64Content, file.mimeType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      // Multiple files - combine into ZIP
      const zip = new JSZip();
      for (const file of filesToDownload) {
        zip.file(file.filename, file.base64Content, { base64: true });
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'selected_documents.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleDownloadSingle = (filename: string) => {
    const file = processedFiles.find(f => f.filename === filename);
    if (!file) return;
    const blob = base64ToBlob(file.base64Content, file.mimeType);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const toggleSelection = (filename: string) => {
    setSelectedFileNames(prev => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFileNames.size === processedFiles.length) {
      setSelectedFileNames(new Set()); // deselect all
    } else {
      setSelectedFileNames(new Set(processedFiles.map(f => f.filename))); // select all
    }
  };

  const handleRedactionComplete = (updatedFiles: ProcessedFile[]) => {
    setProcessedFiles(updatedFiles);
  };

  const resetState = () => {
    setFileState({ excelFile: null, outputFormat: 'both', importContacts: false });
    setProcessState('idle');
    setSteps(INITIAL_STEPS);
    setProcessedFiles([]);
    setSelectedFileNames(new Set());
  };

  const isProcessing = processState === 'uploading' || processState === 'processing';
  const isDone = processState === 'readyToDownload' || processState === 'success' || processState === 'error';

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>

      {activeTab === 'home' && (
        <DocumentGenerationLibrary />
      )}

      {activeTab === 'batch' && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.batchTitle')}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('dashboard.batchSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <FileDropZone
                fileState={fileState}
                setFileState={setFileState}
                disabled={isProcessing || isDone}
              />

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleProcessBatch}
                  disabled={!fileState.excelFile || isProcessing || isDone}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#0078D4] hover:bg-[#005A9E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      {t('fileDrop.processing')}
                    </>
                  ) : (
                    <>
                      <Play className="-ml-1 mr-3 h-5 w-5" />
                      {t('fileDrop.processBatch')}
                    </>
                  )}
                </button>
              </div>

              {isDone && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetState}
                    className="text-sm font-medium text-[#0078D4] hover:text-[#005A9E] transition-colors"
                  >
                    {t('dashboard.startNewBatch')}
                  </button>
                </div>
              )}
            </div>

            <div className="xl:col-span-1">
              <div className="sticky top-8 space-y-6">
                <ProcessingStatus
                  state={processState}
                  steps={steps}
                  error={errorMsg}
                  processedFiles={processedFiles}
                  selectedFileNames={selectedFileNames}
                  onToggleSelection={toggleSelection}
                  onToggleSelectAll={toggleSelectAll}
                  onDownloadSelected={handleDownloadSelected}
                  onDownloadSingle={handleDownloadSingle}
                />

                {(processState === 'readyToDownload' || processState === 'success') && processedFiles.length > 0 && (
                  <RedactionPreview
                    files={processedFiles}
                    onRedactionComplete={handleRedactionComplete}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'contacts' && (
        <ContactsDirectory />
      )}

      {activeTab === 'conflict' && (
        <ConflictSearch />
      )}

      {activeTab === 'deadline' && (
        <DeadlineCalculator />
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-medium text-slate-900 mb-4">{t('navigation.settings')}</h2>
          <p className="text-slate-500">Settings dashboard coming soon.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.pathname);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (route === '/intake') {
    return <PublicIntakeForm />;
  }

  if (route === '/services') {
    return <ServiceConfigurator />;
  }

  if (route === '/privacy') {
    return <PrivacyPolicy />;
  }

  if (route === '/terms') {
    return <TermsOfService />;
  }

  if (route === '/contact') {
    return <Contact />;
  }

  // If not logged in and on the root route, show landing page
  if (!isLoggedIn) {
    return <LandingPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return <InternalApp onLogout={() => setIsLoggedIn(false)} />;
};
