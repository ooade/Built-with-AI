
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, ArrowUpCircle, ArrowDownCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from './ui/Button';
import { extractTransactionsFromPdf, ExtractedTransaction } from '../services/ocrService';
import { extractTransactionsFromExcel } from '../services/excelService';
import { Category, Transaction, TransactionType } from '../types';
import { TEXTS } from '../textResources';

interface ImportViewProps {
  categories: Category[];
  onImport: (transactions: Omit<Transaction, 'id' | 'createdAt' | 'modifiedAt' | 'syncId'>[]) => void;
}

export const ImportView: React.FC<ImportViewProps> = ({ categories, onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedTransaction[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      processFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      let results: ExtractedTransaction[] = [];
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (fileType === 'pdf') {
        results = await extractTransactionsFromPdf(file);
      } else if (['xlsx', 'xls', 'csv'].includes(fileType || '')) {
        results = await extractTransactionsFromExcel(file);
      } else {
        alert(TEXTS.IMPORT.ERRORS.UNSUPPORTED);
        setIsProcessing(false);
        return;
      }

      if (results.length === 0) {
        alert(TEXTS.IMPORT.ERRORS.NO_VALID_DATA);
      }
      setExtractedData(results);
    } catch (error) {
      console.error('Extraction failed', error);
      alert(TEXTS.IMPORT.ERRORS.FAILED);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataChange = (index: number, field: keyof ExtractedTransaction, value: any) => {
    const newData = [...extractedData];
    
    // Special handling when changing type to update category defaults
    if (field === 'type' && value !== newData[index].type) {
        const newType = value as TransactionType;
        const defaultCat = categories.find(c => c.type === newType);
        newData[index] = { 
            ...newData[index], 
            type: newType,
            categoryName: defaultCat?.name || ''
        };
    } else {
        newData[index] = { ...newData[index], [field]: value };
    }

    setExtractedData(newData);
  };

  const removeRow = (index: number) => {
    setExtractedData(extractedData.filter((_, i) => i !== index));
  };

  const handleConfirmImport = () => {
    const transactionsToImport = extractedData.map(item => {
      // Find category by name AND type to avoid mismatch
      const cat = categories.find(c => c.name === item.categoryName && c.type === item.type) 
               || categories.find(c => c.type === item.type) 
               || categories[0];
               
      return {
        amount: Math.abs(Number(item.amount)), // Ensure positive number
        date: item.date,
        description: item.description,
        categoryId: cat.id!,
        type: item.type
      };
    });
    
    onImport(transactionsToImport);
    setExtractedData([]);
    setFile(null);
  };

  const tableInputClasses = "bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 text-gray-900 px-2 py-1.5 w-full outline-none transition-colors font-medium rounded-sm";

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col max-w-2xl">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{TEXTS.IMPORT.TITLE}</h1>
        <p className="text-gray-500 mt-2 font-medium">{TEXTS.IMPORT.SUBTITLE}</p>
      </div>

      {extractedData.length === 0 ? (
        <div 
          className={`
            border-3 border-dashed rounded-[32px] h-80 flex flex-col items-center justify-center text-center transition-all duration-300
            ${isDragging ? 'border-primary-500 bg-primary-50/50 scale-[1.01]' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${isDragging ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-900'}`}>
            <Upload size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isProcessing ? TEXTS.IMPORT.DRAG_DROP.PROCESSING : TEXTS.IMPORT.DRAG_DROP.DEFAULT}
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm font-medium">
            {TEXTS.IMPORT.DRAG_DROP.SUPPORT}
          </p>
          <input 
            type="file" 
            accept=".pdf,.xlsx,.xls,.csv"
            className="hidden"
            id="file-upload"
            onChange={handleFileInput}
            disabled={isProcessing}
          />
          <label 
            htmlFor="file-upload"
            className={`
              cursor-pointer inline-flex items-center px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
              ${isProcessing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'}
            `}
          >
            {isProcessing ? TEXTS.IMPORT.DRAG_DROP.BUTTON_PROCESSING : TEXTS.IMPORT.DRAG_DROP.BUTTON_DEFAULT}
          </label>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center border border-primary-100">
                {file?.name.endsWith('.pdf') ? <FileText size={24} /> : <FileSpreadsheet size={24} />}
              </div>
              <div>
                <span className="block font-bold text-gray-900 text-lg">{file?.name}</span>
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wide bg-primary-50 px-2 py-0.5 rounded-md">{TEXTS.IMPORT.PREVIEW.ITEMS_FOUND(extractedData.length)}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={() => setExtractedData([])}>
                {TEXTS.IMPORT.PREVIEW.DISCARD}
              </Button>
              <Button onClick={handleConfirmImport} className="shadow-lg shadow-primary-500/20">
                <CheckCircle className="w-4 h-4 mr-2" />
                {TEXTS.IMPORT.PREVIEW.ADD_TO_PORTFOLIO}
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">{TEXTS.IMPORT.PREVIEW.TABLE.TYPE}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{TEXTS.IMPORT.PREVIEW.TABLE.DATE}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{TEXTS.IMPORT.PREVIEW.TABLE.DESCRIPTION}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{TEXTS.IMPORT.PREVIEW.TABLE.CATEGORY}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{TEXTS.IMPORT.PREVIEW.TABLE.AMOUNT}</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {extractedData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                       <button 
                         onClick={() => handleDataChange(index, 'type', item.type === 'expense' ? 'income' : 'expense')}
                         className={`p-1.5 rounded-lg transition-colors ${item.type === 'expense' ? 'text-gray-500 hover:text-gray-700 bg-gray-100' : 'text-primary-600 hover:text-primary-700 bg-primary-50'}`}
                         title={TEXTS.IMPORT.PREVIEW.TABLE.SWITCH_TOOLTIP(item.type === 'expense' ? 'Income' : 'Expense')}
                       >
                         {item.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                       </button>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="date" 
                        value={item.date}
                        onChange={(e) => handleDataChange(index, 'date', e.target.value)}
                        className={tableInputClasses}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => handleDataChange(index, 'description', e.target.value)}
                        className={tableInputClasses}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={categories.find(c => c.name === item.categoryName && c.type === item.type)?.id || ''}
                        onChange={(e) => {
                          const catName = categories.find(c => c.id === parseInt(e.target.value))?.name;
                          handleDataChange(index, 'categoryName', catName);
                        }}
                        className={`${tableInputClasses} bg-transparent cursor-pointer`}
                      >
                        {categories
                            .filter(c => c.type === item.type)
                            .map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))
                        }
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input 
                        type="number" 
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => handleDataChange(index, 'amount', e.target.value)}
                        className={`${tableInputClasses} text-right font-bold ${item.type === 'income' ? 'text-primary-600' : 'text-gray-900'}`}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => removeRow(index)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-primary-50/50 text-primary-800 text-xs font-bold flex items-center justify-center border-t border-primary-100">
            <AlertCircle className="w-4 h-4 mr-2 text-primary-600" />
            {TEXTS.IMPORT.PREVIEW.WARNING}
          </div>
        </div>
      )}
    </div>
  );
};
