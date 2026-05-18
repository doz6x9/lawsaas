import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grip,
  Search,
  Settings,
  HelpCircle,
  User,
  Home,
  FileText,
  Users,
  ShieldAlert,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export type TabType = 'batch' | 'contacts' | 'conflict' | 'deadline' | 'settings' | 'home';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-[#FAF9F8] text-gray-900 font-sans">

      {/* 1. The Header (Top) */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-[#0078D4] text-white flex items-center justify-between px-4 z-50 shadow-sm">

        {/* Left: App Launcher & Brand */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.location.href = '/'}
            className="p-2 hover:bg-white/10 rounded-sm focus:outline-none focus:ring-2 focus:ring-white"
            title="Go to Home Page"
          >
            <Grip className="w-5 h-5 text-white" />
          </button>
          <span className="text-base font-semibold tracking-wide">{t('navigation.brandName')}</span>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#0078D4]" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="block w-full pl-10 pr-3 py-1.5 border border-transparent rounded-md leading-5 bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-white sm:text-sm transition-colors"
            />
          </div>
        </div>

        {/* Right: Environment, Settings, Help, Avatar */}
        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center px-3 hover:bg-white/10 cursor-pointer h-12">
            <span className="text-sm font-medium">Default Environment</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </div>
          <button className="p-2 hover:bg-white/10 rounded-sm focus:outline-none focus:ring-2 focus:ring-white h-12">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-sm focus:outline-none focus:ring-2 focus:ring-white h-12">
            <HelpCircle className="w-5 h-5" />
          </button>

          <div className="flex items-center h-12 px-2 hover:bg-white/10 cursor-pointer relative group">
             <div className="w-8 h-8 rounded-full bg-blue-800 border border-white/20 flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-white" />
             </div>

             {/* Simple Dropdown for Logout */}
             {onLogout && (
               <div className="absolute right-0 top-12 mt-1 w-48 bg-white border border-gray-200 shadow-md rounded-md py-1 hidden group-hover:block text-gray-900">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold">{t('navigation.staffMember')}</p>
                    <p className="text-xs text-gray-500">{t('navigation.firmAdmin')}</p>
                  </div>
                  <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    {t('navigation.logout')}
                  </button>
               </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Layout Container (Below Header) */}
      <div className="flex flex-1 pt-12 w-full h-full overflow-hidden">

        {/* 2. The Sidebar (Left) */}
        <aside className="w-[250px] bg-[#F3F2F1] border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
          <nav className="flex-1 py-4">
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => onTabChange('home')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${
                    activeTab === 'home'
                      ? 'bg-white font-semibold border-l-4 border-[#0078D4] text-gray-900'
                      : 'text-gray-700 hover:bg-gray-200 font-normal border-l-4 border-transparent'
                  }`}
                >
                  <Home className={`w-5 h-5 mr-3 shrink-0 ${activeTab === 'home' ? 'text-[#0078D4]' : 'text-gray-600'}`} />
                  {t('documentGen.libraryTitle')}
                </button>
              </li>

              <li className="pt-4 pb-2 px-4">
                <div className="h-px bg-gray-300 w-full mb-4"></div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My flows</span>
              </li>

              <li>
                <button
                  onClick={() => onTabChange('batch')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${
                    activeTab === 'batch'
                      ? 'bg-white font-semibold border-l-4 border-[#0078D4] text-gray-900'
                      : 'text-gray-700 hover:bg-gray-200 font-normal border-l-4 border-transparent'
                  }`}
                >
                  <FileText className={`w-5 h-5 mr-3 shrink-0 ${activeTab === 'batch' ? 'text-[#0078D4]' : 'text-gray-600'}`} />
                  {t('navigation.batchProcessing')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('contacts')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${
                    activeTab === 'contacts'
                      ? 'bg-white font-semibold border-l-4 border-[#0078D4] text-gray-900'
                      : 'text-gray-700 hover:bg-gray-200 font-normal border-l-4 border-transparent'
                  }`}
                >
                  <Users className={`w-5 h-5 mr-3 shrink-0 ${activeTab === 'contacts' ? 'text-[#0078D4]' : 'text-gray-600'}`} />
                  {t('navigation.contactsDirectory')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('conflict')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${
                    activeTab === 'conflict'
                      ? 'bg-white font-semibold border-l-4 border-[#0078D4] text-gray-900'
                      : 'text-gray-700 hover:bg-gray-200 font-normal border-l-4 border-transparent'
                  }`}
                >
                  <ShieldAlert className={`w-5 h-5 mr-3 shrink-0 ${activeTab === 'conflict' ? 'text-[#0078D4]' : 'text-gray-600'}`} />
                  {t('navigation.conflictSearch')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('deadline')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${
                    activeTab === 'deadline'
                      ? 'bg-white font-semibold border-l-4 border-[#0078D4] text-gray-900'
                      : 'text-gray-700 hover:bg-gray-200 font-normal border-l-4 border-transparent'
                  }`}
                >
                  <Calendar className={`w-5 h-5 mr-3 shrink-0 ${activeTab === 'deadline' ? 'text-[#0078D4]' : 'text-gray-600'}`} />
                  {t('navigation.deadlineCalculator')}
                </button>
              </li>

              <li className="pt-4 pb-2 px-4">
                <div className="h-px bg-gray-300 w-full mb-4"></div>
              </li>

              <li>
                <button
                  onClick={() => onTabChange('settings')}
                  className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-white font-semibold border-l-4 border-[#0078D4] text-gray-900'
                      : 'text-gray-700 hover:bg-gray-200 font-normal border-l-4 border-transparent'
                  }`}
                >
                  <Settings className={`w-5 h-5 mr-3 shrink-0 ${activeTab === 'settings' ? 'text-[#0078D4]' : 'text-gray-600'}`} />
                  {t('navigation.settings')}
                </button>
              </li>
            </ul>
          </nav>

          <div className="p-4 flex justify-center border-t border-gray-200">
             <LanguageSwitcher />
          </div>
        </aside>

        {/* 3. The Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9F8]">
          <div className="w-full h-full overflow-y-auto">
             {children}
          </div>
        </main>

      </div>
    </div>
  );
};
