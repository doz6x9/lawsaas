import React from 'react';
import { Briefcase, ArrowLeft, BarChart3 } from 'lucide-react';

export const ComplianceOfficers: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F8] text-gray-900 font-sans flex flex-col">
      <header className="h-12 bg-[#0078D4] text-white flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
          <Briefcase className="w-5 h-5 mr-3 text-white" />
          <span className="text-base font-semibold tracking-wide">LegalAct</span>
        </div>
        <a href="/" className="flex items-center text-sm font-medium hover:underline opacity-90 hover:opacity-100">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </a>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="bg-white border border-gray-200 shadow-sm rounded-md p-8 sm:p-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 text-[#0078D4] rounded-md flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">For Compliance Officers</h1>
          </div>
          <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
            <p>
              Track deadlines, maintain audit logs, and generate GDPR compliance reports automatically. LegalAct provides the tools to ensure your organization stays compliant.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Automated tracking of important deadlines.</li>
              <li>Maintain comprehensive audit logs for all activities.</li>
              <li>Generate GDPR compliance reports with ease.</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LegalAct Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
