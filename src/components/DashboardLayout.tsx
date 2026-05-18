import React from 'react';
import { Briefcase, FileText, Settings, User } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <Briefcase className="w-6 h-6 mr-3 text-blue-500" />
          <span className="text-lg font-bold text-white tracking-wide">LegalAct</span>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center px-6 py-3 text-white bg-slate-800 border-l-4 border-blue-500">
                <FileText className="w-5 h-5 mr-3" />
                Batch Processing
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </a>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center">
            <div className="bg-slate-700 p-2 rounded-full">
              <User className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Staff Member</p>
              <p className="text-xs text-slate-400">Firm Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Document Automation Dashboard</h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
