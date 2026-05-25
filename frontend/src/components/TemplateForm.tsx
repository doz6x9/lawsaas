import React, { useState, useEffect } from 'react';
import { TEMPLATE_CONFIGS, TemplateField, OutputFormat } from '../config/documentTemplates';
import { Loader2, FileText, FileType, AlertCircle, CheckCircle2, RefreshCcw, ArrowLeft, X, Plus } from 'lucide-react';

interface TemplateFormProps {
  templateId: string;
  onCancel: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({ templateId, onCancel }) => {
  const templateConfig = TEMPLATE_CONFIGS.find((config) => config.id === templateId);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const initializeForm = () => {
    if (templateConfig) {
      const initialData: Record<string, any> = {};
      templateConfig.fields.forEach(field => {
        if (field.type === 'array') {
          initialData[field.id] = [''];
        } else if (field.type === 'boolean') {
          initialData[field.id] = false;
        } else {
          initialData[field.id] = '';
        }
      });
      setFormData(initialData);
      setStatus('idle');
      setErrorMessage('');
    }
  };

  useEffect(() => {
    initializeForm();
  }, [templateConfig]);

  if (!templateConfig) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-start">
        <AlertCircle className="h-5 w-5 text-red-600 mr-3 shrink-0" />
        <p className="text-sm text-red-800">Template configuration not found.</p>
      </div>
    );
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleArrayInputChange = (fieldId: string, index: number, value: string) => {
    const currentArray = formData[fieldId] || [''];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData((prev) => ({
      ...prev,
      [fieldId]: newArray,
    }));
  };

  const addArrayField = (fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || ['']), ''],
    }));
  };

  const removeArrayField = (fieldId: string, index: number) => {
    const currentArray = formData[fieldId] || [''];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    setFormData((prev) => ({
      ...prev,
      [fieldId]: newArray.length > 0 ? newArray : [''],
    }));
  };

  const generateDocument = async (outputFormat: OutputFormat) => {
    setStatus('generating');
    setErrorMessage('');

    for (const field of templateConfig.fields) {
      if (field.required) {
        if (field.type === 'array') {
          const cleanArray = (formData[field.id] || []).filter((item: string) => item.trim() !== '');
          if (cleanArray.length === 0) {
            setErrorMessage(`Missing required field: ${field.label}`);
            setStatus('error');
            return;
          }
        } else if (!formData[field.id] || String(formData[field.id]).trim() === '') {
          setErrorMessage(`Missing required field: ${field.label}`);
            setStatus('error');
            return;
          }
        }
      }

    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: templateId,
          payload: formData,
          outputFormat: outputFormat,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Document generation failed.');
      }

      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.split('filename="')[1]?.slice(0, -1) || `${templateId}.${outputFormat}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unknown error occurred during document generation.');
    }
  };

  const renderField = (field: TemplateField) => {
    const commonProps = {
      id: field.id,
      className: 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm',
      disabled: status === 'generating',
      required: field.required,
    };

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <input
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            {...commonProps}
          />
        );
      case 'boolean':
        return (
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
            <input
              type="checkbox"
              checked={formData[field.id] || false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-600"
              disabled={status === 'generating'}
            />
            <span>{field.label}</span>
          </label>
        );
      case 'select':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            {...commonProps}
          >
            <option value="" disabled>-- Select --</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'array':
        const currentArray = formData[field.id] || [''];
        return (
          <div className="space-y-2">
            {currentArray.map((item: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayInputChange(field.id, index, e.target.value)}
                  placeholder={field.placeholder}
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm"
                  disabled={status === 'generating'}
                  required={field.required && index === 0}
                />
                {currentArray.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField(field.id, index)}
                    disabled={status === 'generating'}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField(field.id)}
              disabled={status === 'generating'}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1 text-gray-500" /> Add Item
            </button>
          </div>
        );
      default:
        return <input type="text" value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)} {...commonProps} />;
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col max-w-4xl mx-auto py-12 px-6 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Document Generated Successfully!</h2>
        <p className="text-gray-600 mb-10 max-w-md mx-auto">
          Your requested document has been compiled and downloaded to your computer. What would you like to do next?
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={initializeForm}
            className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors w-full sm:w-auto"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Generate Another {templateConfig.title}
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors w-full sm:w-auto shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col max-w-4xl mx-auto">
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-900">{templateConfig.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{templateConfig.description}</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 shrink-0" />
            <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-5">
          {templateConfig.fields.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-semibold text-gray-900 mb-1.5">
                {field.label} {field.required && <span className="text-red-600">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 shrink-0">
        <button
          onClick={onCancel}
          disabled={status === 'generating'}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-sm font-semibold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => generateDocument('docx')}
          disabled={status === 'generating'}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-colors"
        >
          {status === 'generating' && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />}
          Generate DOCX <FileText className="w-4 h-4 ml-2" />
        </button>
        <button
          onClick={() => generateDocument('pdf')}
          disabled={status === 'generating'}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 transition-colors"
        >
          {status === 'generating' && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />}
          Generate PDF <FileType className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};
