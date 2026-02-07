
import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Download, FileJson, FileSpreadsheet, Calendar, TrendingUp, TrendingDown, PieChart, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { TEXTS } from '../textResources';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

export const Reports: React.FC<ReportsProps> = ({ transactions, categories, currency }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      return t.date >= dateRange.start && t.date <= dateRange.end;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, dateRange]);

  const stats = useMemo(() => {
    const income = filteredData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filteredData]);

  const downloadCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredData.map(t => {
      const category = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      return [
        t.date,
        t.type,
        `"${category}"`, // Quote strings to handle commas
        `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
        t.amount.toFixed(2)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', TEXTS.REPORTS.EXPORT.CSV_FILENAME(dateRange.start, dateRange.end));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', TEXTS.REPORTS.EXPORT.JSON_FILENAME(dateRange.start, dateRange.end));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium";

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{TEXTS.REPORTS.TITLE}</h1>
          <p className="text-gray-500 font-medium mt-1">{TEXTS.REPORTS.SUBTITLE}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary-600" />
          {TEXTS.REPORTS.SELECT_PERIOD}
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 items-end">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{TEXTS.REPORTS.FROM}</label>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className={inputClasses}
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{TEXTS.REPORTS.TO}</label>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-primary-50/50 rounded-2xl border border-primary-100">
            <div className="flex items-center space-x-2 text-primary-700 font-semibold mb-2">
               <TrendingUp size={18} />
               <span>{TEXTS.REPORTS.TOTAL_INCOME}</span>
            </div>
            <div className="text-3xl font-extrabold text-primary-900">{formatCurrency(stats.income, currency)}</div>
          </div>
          <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-200">
             <div className="flex items-center space-x-2 text-gray-600 font-semibold mb-2">
               <TrendingDown size={18} />
               <span>{TEXTS.REPORTS.TOTAL_EXPENSES}</span>
            </div>
             <div className="text-3xl font-extrabold text-gray-900">{formatCurrency(stats.expense, currency)}</div>
          </div>
          <div className={`p-6 rounded-2xl border ${stats.net >= 0 ? 'bg-primary-50/50 border-primary-100' : 'bg-red-50/50 border-red-100'}`}>
             <div className={`flex items-center space-x-2 font-semibold mb-2 ${stats.net >= 0 ? 'text-primary-700' : 'text-red-700'}`}>
               <PieChart size={18} />
               <span>{TEXTS.REPORTS.NET_BALANCE}</span>
             </div>
             <div className={`text-3xl font-extrabold ${stats.net >= 0 ? 'text-primary-900' : 'text-red-900'}`}>{formatCurrency(stats.net, currency)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 sm:p-8 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2 text-primary-600" />
            {TEXTS.REPORTS.EXPORT.TITLE}
          </h2>
          <p className="text-gray-500 text-sm mb-8 flex-1">
            {TEXTS.REPORTS.EXPORT.DESCRIPTION}
          </p>
          <div className="flex gap-4">
            <Button onClick={downloadCSV} variant="secondary" className="flex-1">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {TEXTS.REPORTS.EXPORT.CSV}
            </Button>
            <Button onClick={downloadJSON} variant="secondary" className="flex-1">
              <FileJson className="w-4 h-4 mr-2" />
              {TEXTS.REPORTS.EXPORT.JSON}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 sm:p-8 flex flex-col justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-bold mb-2">{TEXTS.REPORTS.SUMMARY.TITLE}</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            {TEXTS.REPORTS.SUMMARY.TEXT_PRE} <strong>{TEXTS.REPORTS.SUMMARY.TEXT_COUNT(filteredData.length)}</strong> {TEXTS.REPORTS.SUMMARY.TEXT_SPAN(formatDate(dateRange.start), formatDate(dateRange.end))}
          </p>
        </div>
      </div>
    </div>
  );
};
