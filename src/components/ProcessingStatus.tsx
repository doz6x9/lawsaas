import React from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ProcessingState, ProcessingStep } from '../types';

interface ProcessingStatusProps {
  state: ProcessingState;
  steps: ProcessingStep[];
  error?: string | null;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ state, steps, error }) => {
  if (state === 'idle') return null;

  if (state === 'error') {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 mt-8 flex items-start">
        <AlertCircle className="h-6 w-6 text-red-600 mr-4 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-medium text-red-800">Processing Failed</h3>
          <p className="mt-2 text-sm text-red-700">{error || 'An unexpected error occurred during processing.'}</p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="p-8 bg-green-50 rounded-lg border border-green-200 mt-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-green-900">Batch Processing Complete!</h3>
        <p className="mt-2 text-sm text-green-700">
          The documents have been generated and successfully emailed to your inbox.
        </p>
      </div>
    );
  }

  // Uploading or Processing state (Stepper)
  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-medium text-slate-900 mb-6">Pipeline Status</h3>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full border-2 mr-4 ${
              step.status === 'completed' ? 'bg-blue-500 border-blue-500' :
              step.status === 'current' ? 'border-blue-500' : 'border-slate-300'
            }`}>
              {step.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-white" />
              ) : step.status === 'current' ? (
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              ) : (
                <span className="text-slate-400 text-sm">{index + 1}</span>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${
                step.status === 'completed' ? 'text-slate-900' :
                step.status === 'current' ? 'text-blue-700' : 'text-slate-500'
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
