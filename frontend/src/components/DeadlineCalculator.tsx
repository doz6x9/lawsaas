import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, AlertCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { calculateLegalDeadline } from '../utils/dateCalculator';

export const DeadlineCalculator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [startDateStr, setStartDateStr] = useState<string>('');
  const [daysToAdd, setDaysToAdd] = useState<number | ''>('');
  const [customDays, setCustomDays] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [calculatedDeadline, setCalculatedDeadline] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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
        return;
      }

      setIsCalculating(true);
      try {
        const [year, month, day] = startDateStr.split('-').map(Number);
        const startDate = new Date(year, month - 1, day);

        const deadlineDate = await calculateLegalDeadline(startDate, daysToAdd as number);

        const locale = i18n.language.startsWith('hu') ? 'hu-HU' : 'en-US';
        const formatted = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }).format(deadlineDate);

        setCalculatedDeadline(formatted);
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

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden flex flex-col max-w-3xl mx-auto my-6">
      <div className="p-6 border-b border-gray-200 bg-[#FAF9F8]">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-1">
          <Calendar className="w-5 h-5 mr-2 text-[#0078D4]" />
          {t('calculator.title')}
        </h2>
        <p className="text-xs text-gray-600">
          {t('calculator.subtitle')}
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
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
                className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-sm leading-5 text-gray-900 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] sm:text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              {t('calculator.duration')}
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => handlePresetSelect(8)}
                className={`py-1.5 px-3 text-sm font-semibold rounded-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:ring-offset-1 ${
                  daysToAdd === 8 && customDays === ''
                    ? 'bg-[#0078D4] border-[#0078D4] text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('calculator.days8')}
              </button>
              <button
                onClick={() => handlePresetSelect(15)}
                className={`py-1.5 px-3 text-sm font-semibold rounded-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:ring-offset-1 ${
                  daysToAdd === 15 && customDays === ''
                    ? 'bg-[#0078D4] border-[#0078D4] text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('calculator.days15')}
              </button>
              <button
                onClick={() => handlePresetSelect(30)}
                className={`py-1.5 px-3 text-sm font-semibold rounded-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:ring-offset-1 ${
                  daysToAdd === 30 && customDays === ''
                    ? 'bg-[#0078D4] border-[#0078D4] text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('calculator.days30')}
              </button>
            </div>

            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-3">{t('calculator.orCustom')}</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder={t('calculator.daysInputPlaceholder')}
                  value={customDays}
                  onChange={handleCustomDaysChange}
                  className={`block w-full pl-3 pr-10 py-1.5 bg-white border rounded-sm leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm transition-colors ${error ? 'border-[#A80000] focus:border-[#A80000] focus:ring-[#A80000]' : 'border-gray-300 focus:border-[#0078D4] focus:ring-[#0078D4]'}`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xs font-semibold">{t('calculator.daysSuffix')}</span>
                </div>
              </div>
            </div>
            {error && <p className="mt-1 text-xs text-[#A80000]">{error}</p>}
          </div>
        </div>

        {/* Right Column: Result */}
        <div className="flex flex-col border-l border-gray-200 pl-8">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t('calculator.finalDeadline')}
          </label>
          <div className={`flex-1 flex flex-col items-center justify-center p-6 rounded-sm border transition-all ${
            calculatedDeadline
              ? 'bg-[#FFF4CE] border-[#D83B01]'
              : 'bg-[#F3F2F1] border-transparent'
          }`}>
            {isCalculating ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-[#0078D4] mx-auto mb-2 animate-spin" />
                <p className="text-gray-500 text-sm font-semibold">Calculating...</p>
              </div>
            ) : !startDateStr ? (
              <div className="text-center">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm font-semibold">{t('calculator.selectStartDate')}</p>
              </div>
            ) : daysToAdd === '' ? (
              <div className="text-center">
                <ArrowRight className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm font-semibold">{t('calculator.enterDays')}</p>
              </div>
            ) : calculatedDeadline ? (
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-[#D83B01] mx-auto mb-2" />
                <p className="text-xs text-gray-700 font-semibold mb-1 uppercase tracking-wider">{t('calculator.lastDayOfDeadline')}</p>
                <h3 className="text-xl font-bold text-[#D83B01] leading-tight mb-2">
                  {calculatedDeadline}
                </h3>
                <p className="text-[11px] text-[#A80000] font-medium max-w-[200px] mx-auto leading-relaxed">
                  {t('calculator.deadlineWarning')}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
