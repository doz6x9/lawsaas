import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('hu') ? 'en' : 'hu';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 mr-2 text-gray-500" />
      <span className="text-xs font-semibold text-gray-900 tracking-wider">
        {i18n.language.startsWith('hu') ? 'HU' : 'EN'}
      </span>
    </button>
  );
};
