import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Link as LinkIcon, Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface IntakeSubmission {
  customerName: string;
  company: string;
  phone: string;
  imageUrls: string[];
}

export const PublicIntakeForm: React.FC = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<IntakeSubmission>({
    customerName: '',
    company: '',
    phone: '',
    imageUrls: ['']
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleInputChange = (field: keyof IntakeSubmission, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrls: newUrls }));
  };

  const addUrlField = () => {
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const removeUrlField = (index: number) => {
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    if (newUrls.length === 0) newUrls.push('');
    setFormData(prev => ({ ...prev, imageUrls: newUrls }));
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+36|06)[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}$/;
    return phoneRegex.test(phone.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.company.trim() || !formData.phone.trim()) {
      setErrorMessage(t('intakeForm.errorMissingFields'));
      setStatus('error');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrorMessage(t('intakeForm.errorInvalidPhone'));
      setStatus('error');
      return;
    }

    const cleanUrls = formData.imageUrls.filter(url => url.trim() !== '');
    if (cleanUrls.length === 0) {
      setErrorMessage(t('intakeForm.errorMissingLinks'));
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          imageUrls: cleanUrls
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'A beküldés sikertelen. Kérjük, próbálja újra később.');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Ismeretlen hiba történt.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-10 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('intakeForm.successTitle')}</h2>
            <p className="text-sm text-gray-600 mb-6">
              {t('intakeForm.successMessage')}
            </p>
            <p className="text-xs font-semibold text-gray-500">{t('intakeForm.successSubMessage')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-lg shadow-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h1 className="ml-4 text-3xl font-bold text-gray-900 tracking-tight">{t('intakeForm.title')}</h1>
        </div>
        <p className="text-center text-md text-gray-600 mb-8 max-w-md mx-auto">
          {t('intakeForm.instructions')}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {status === 'error' && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-red-800">{t('intakeForm.errorTitle')}</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{errorMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="customerName" className="block text-sm font-semibold text-gray-900">
                {t('intakeForm.customerName')} <span className="text-red-600">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm transition-colors"
                  disabled={status === 'submitting'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className="block text-sm font-semibold text-gray-900">
                  {t('intakeForm.company')} <span className="text-red-600">*</span>
                </label>
                <div className="mt-1.5">
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm transition-colors"
                    disabled={status === 'submitting'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                  {t('intakeForm.phone')} <span className="text-red-600">*</span>
                </label>
                <div className="mt-1.5">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm transition-colors"
                    placeholder="+36 30 123 4567"
                    disabled={status === 'submitting'}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  {t('intakeForm.evidenceLinks')} <span className="text-red-600">*</span>
                </label>
              </div>

              <div className="space-y-3">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="flex shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      <LinkIcon className="h-5 w-5" />
                    </span>
                    <input
                      type="url"
                      required={index === 0}
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-2 focus:ring-blue-600 sm:text-sm border-gray-300 border transition-colors"
                      placeholder="https://picrights.com/evidence/..."
                      disabled={status === 'submitting'}
                    />
                    {formData.imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlField(index)}
                        disabled={status === 'submitting'}
                        className="ml-2 inline-flex items-center p-2 border border-transparent rounded-md text-gray-400 hover:bg-gray-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addUrlField}
                disabled={status === 'submitting'}
                className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2 text-gray-500" />
                {t('intakeForm.addLink')}
              </button>
            </div>

            <div className="pt-5 border-t border-gray-200 mt-6">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 transition-colors"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    {t('intakeForm.submitting')}
                  </>
                ) : (
                  t('intakeForm.submit')
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6 font-medium">
          {t('intakeForm.gdprNotice')}
        </p>
      </div>
    </div>
  );
};
