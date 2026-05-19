import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Download, Users, Loader2, AlertCircle } from 'lucide-react';
import { DirectoryContact } from '../types';

export const ContactsDirectory: React.FC = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<DirectoryContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3000/api/contacts');
        if (!response.ok) {
          throw new Error(`Failed to fetch contacts: ${response.statusText}`);
        }
        const data = await response.json();
        setContacts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const lowerSearch = searchTerm.toLowerCase();
    return contacts.filter(c =>
      c.company.toLowerCase().includes(lowerSearch) ||
      c.idInfringer.toLowerCase().includes(lowerSearch) ||
      (c.clientNames && c.clientNames.toLowerCase().includes(lowerSearch)) ||
      (c.phones && c.phones.some(p => p.toLowerCase().includes(lowerSearch)))
    );
  }, [contacts, searchTerm]);

  const downloadCSV = () => {
    if (filteredContacts.length === 0) return;

    const headers = [
      t('contacts.colId'),
      t('contacts.colCompany'),
      t('contacts.colPhone'),
      t('contacts.colClientNames'),
      t('contacts.colCases')
    ];

    const rows = filteredContacts.map(c => [
      `"${c.idInfringer.replace(/"/g, '""')}"`,
      `"${c.company.replace(/"/g, '""')}"`,
      `"${(c.phones ? c.phones.join('; ') : '').replace(/"/g, '""')}"`,
      `"${(c.clientNames || '').replace(/"/g, '""')}"`,
      c.caseCount.toString()
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'infringer_directory.csv';
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-gray-700" />
            {t('contacts.title')}
          </h2>
          <p className="mt-0.5 text-sm text-gray-600">
            {t('contacts.subtitle')}
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder={t('contacts.searchPlaceholder')}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={downloadCSV}
            disabled={filteredContacts.length === 0 || loading}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('contacts.exportCsv')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
            <p className="text-sm">{t('contacts.loading')}</p>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg max-w-md text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-red-800 mb-1">{t('contacts.failedToLoad')}</h3>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
            <Users className="h-10 w-10 text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">{t('contacts.noContacts')}</h3>
            <p className="text-sm text-gray-500 text-center">
              {searchTerm ? t('contacts.noContactsSearch') : t('contacts.noContactsEmpty')}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  {t('contacts.colId')}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  {t('contacts.colCompany')}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  {t('contacts.colPhone')}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  {t('contacts.colClientNames')}
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  {t('contacts.colCases')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.idInfringer} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.idInfringer}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {contact.company || <span className="text-gray-400 italic">{t('contacts.unknown')}</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {contact.phones && contact.phones.length > 0 ? contact.phones.join(', ') : <span className="text-gray-400 italic">{t('contacts.unknown')}</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                    {contact.clientNames || <span className="text-gray-400 italic">{t('contacts.unknown')}</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {contact.caseCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
