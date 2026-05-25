import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Clock, ArrowRight, Loader2, Plus, X, Bell } from 'lucide-react';
import { calculateLegalDeadline } from '../utils/dateCalculator.ts'; // Corrected to named import with .ts extension

interface DeadlineReminder {
  id: string;
  startDate: string;
  duration: number;
  deadline: string;
  totalDays: number;
}

export const DeadlineCalculator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [startDateStr, setStartDateStr] = useState<string>('');
  const [daysToAdd, setDaysToAdd] = useState<number | ''>('');
  const [customDays, setCustomDays] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [calculatedDeadline, setCalculatedDeadline] = useState<string | null>(null);
  const [totalCalendarDays, setTotalCalendarDays] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const [reminders, setReminders] = useState<DeadlineReminder[]>([]);

  const handlePresetSelect = (days: number) => {
    setDaysToAdd(days);
    setCustomDays('');
    setError(null);
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDays(val);
    setError(null);
    if (val === '') {
      setDaysToAdd('');
    } else {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) {
        if (parsed < 0) {
           setError(t('calculator.negativeDaysError'));
           setDaysToAdd('');
        } else {
           setDaysToAdd(parsed);
        }
      }
    }
  };

  useEffect(() => {
    const calculate = async () => {
      if (!startDateStr || daysToAdd === '' || error) {
        setCalculatedDeadline(null);
        setTotalCalendarDays(0);
        return;
      }

      setIsCalculating(true);
      try {
        const [year, month, day] = startDateStr.split('-').map(Number);
        const startDate = new Date(year, month - 1, day);

        const deadlineDate = await calculateLegalDeadline(startDate, daysToAdd as number); // Directly use named import

        const locale = i18n.language.startsWith('hu') ? 'hu-HU' : 'en-US';
        const formatted = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }).format(deadlineDate);

        setCalculatedDeadline(formatted);

        const diffTime = Math.abs(deadlineDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTotalCalendarDays(diffDays);

      } catch (err) {
        if (err instanceof Error && err.message === 'negativeDaysError') {
          setError(t('calculator.negativeDaysError'));
        }
        setCalculatedDeadline(null);
      } finally {
        setIsCalculating(false);
      }
    };

    calculate();
  }, [startDateStr, daysToAdd, i18n.language, error, t]);

  const addReminder = () => {
    if (calculatedDeadline && startDateStr && daysToAdd !== '') {
      const newReminder: DeadlineReminder = {
        id: new Date().toISOString(),
        startDate: startDateStr,
        duration: daysToAdd,
        deadline: calculatedDeadline,
        totalDays: totalCalendarDays
      };
      setReminders(prev => [newReminder, ...prev]);
    }
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('calculator.title')}</h2>
        <p className="mt-2 text-lg text-gray-600">
          {t('calculator.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    {t('calculator.dateOfNotice')}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="startDate"
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md leading-5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    {t('calculator.duration')}
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button onClick={() => handlePresetSelect(8)} className={`py-2 px-3 text-sm font-semibold rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${daysToAdd === 8 && customDays === '' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{t('calculator.days8')}</button>
                    <button onClick={() => handlePresetSelect(15)} className={`py-2 px-3 text-sm font-semibold rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${daysToAdd === 15 && customDays === '' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{t('calculator.days15')}</button>
                    <button onClick={() => handlePresetSelect(30)} className={`py-2 px-3 text-sm font-semibold rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${daysToAdd === 30 && customDays === '' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{t('calculator.days30')}</button>
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-3">{t('calculator.orCustom')}</span>
                    <div className="relative flex-1">
                      <input type="number" placeholder={t('calculator.daysInputPlaceholder')} value={customDays} onChange={handleCustomDaysChange} className={`block w-full pl-3 pr-12 py-2 bg-white border rounded-md leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors ${error ? 'border-red-600 focus:border-red-600 focus:ring-red-600' : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600'}`} />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 text-sm font-semibold">{t('calculator.daysSuffix')}</span></div>
                    </div>
                  </div>
                  {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                </div>
              </div>

              <div className="flex flex-col border-l border-gray-200 pl-8">
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('calculator.finalDeadline')}</label>
                <div className={`flex-1 flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${calculatedDeadline ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-transparent'}`}>
                  {isCalculating ? <div className="text-center"><Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" /><p className="text-gray-500 text-sm font-semibold">Calculating...</p></div> : !startDateStr ? <div className="text-center"><Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-500 text-sm font-semibold">{t('calculator.selectStartDate')}</p></div> : daysToAdd === '' ? <div className="text-center"><ArrowRight className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-500 text-sm font-semibold">{t('calculator.enterDays')}</p></div> : calculatedDeadline ? <div className="text-center"><AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" /><p className="text-xs text-gray-700 font-semibold mb-1 uppercase tracking-wider">{t('calculator.lastDayOfDeadline')}</p><h3 className="text-xl font-bold text-yellow-600 leading-tight mb-2">{calculatedDeadline}</h3><p className="text-xs text-gray-600">Total calendar days elapsed: <strong>{totalCalendarDays}</strong></p></div> : null}
                </div>
                <button onClick={() => addReminder()} disabled={!calculatedDeadline || isCalculating} className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 transition-colors">
                  <Plus className="w-4 h-4 mr-2" /> Add to Reminders
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-gray-500" />
              Saved Deadlines
            </h3>
            {reminders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No reminders saved yet.</p>
            ) : (
              <ul className="space-y-3">
                {reminders.map(reminder => (
                  <li key={reminder.id} className="bg-gray-100 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-blue-600">{reminder.deadline}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {reminder.duration} working days from {reminder.startDate}
                      </p>
                    </div>
                    <button onClick={() => removeReminder(reminder.id)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
