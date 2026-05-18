import React, { useCallback, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Image as ImageIcon, XCircle } from 'lucide-react';
import { FileState } from '../types';

interface FileDropZoneProps {
  fileState: FileState;
  setFileState: React.Dispatch<React.SetStateAction<FileState>>;
  disabled?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ fileState, setFileState, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFiles = (files: File[]) => {
    setErrorMsg(null);
    let newExcel: File | null = fileState.excelFile;
    const newImages: File[] = [...fileState.imageFiles];
    let hasError = false;

    files.forEach((file) => {
      if (file.name.endsWith('.xlsx')) {
        if (newExcel) {
          setErrorMsg('Only one Excel file is allowed.');
          hasError = true;
        } else {
          newExcel = file;
        }
      } else if (file.type.startsWith('image/')) {
        newImages.push(file);
      } else {
        setErrorMsg(`Unsupported file type: ${file.name}. Please upload .xlsx or image files.`);
        hasError = true;
      }
    });

    if (!hasError) {
      setFileState({ excelFile: newExcel, imageFiles: newImages });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [fileState, disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeExcel = () => setFileState(prev => ({ ...prev, excelFile: null }));
  const removeImage = (index: number) => setFileState(prev => ({
    ...prev,
    imageFiles: prev.imageFiles.filter((_, i) => i !== index)
  }));

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' :
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
        <p className="mt-4 text-sm text-slate-600 font-medium">
          Drag and drop your dataset (.xlsx) and evidence images here
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Or click to browse files
        </p>
        <input
          type="file"
          multiple
          accept=".xlsx, image/*"
          className="hidden"
          id="file-upload"
          onChange={handleFileInput}
          disabled={disabled}
        />
        <label
          htmlFor="file-upload"
          className={`mt-6 inline-block px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}
        >
          Select Files
        </label>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Uploaded Files Summary */}
      {(fileState.excelFile || fileState.imageFiles.length > 0) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Uploaded Files</h3>

          <div className="space-y-4">
            {/* Excel File */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dataset (Required)</h4>
              {fileState.excelFile ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm text-slate-700 font-medium">{fileState.excelFile.name}</span>
                  </div>
                  {!disabled && (
                    <button onClick={removeExcel} className="text-slate-400 hover:text-red-500 transition-colors">
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200 border-dashed">
                  No Excel dataset uploaded yet.
                </div>
              )}
            </div>

            {/* Image Files */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Evidence Images ({fileState.imageFiles.length})</h4>
              {fileState.imageFiles.length > 0 ? (
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {fileState.imageFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-200">
                      <div className="flex items-center">
                        <ImageIcon className="h-4 w-4 text-blue-500 mr-3" />
                        <span className="text-sm text-slate-600 truncate max-w-xs">{file.name}</span>
                      </div>
                      {!disabled && (
                        <button onClick={() => removeImage(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 bg-slate-50 text-slate-500 text-sm rounded-md border border-slate-200 border-dashed">
                  No images uploaded.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
