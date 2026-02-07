
import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { formatCurrency, formatDate, getCurrencySymbol } from '../utils';
import { Edit2, Trash2, Plus, Search, Filter, ArrowUp, ArrowDown, ArrowUpDown, User } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { ConfirmModal } from './ui/ConfirmModal';
import { TEXTS } from '../textResources';

interface ExpensesProps {
  expenses: Transaction[];
  categories: Category[];
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'modifiedAt' | 'syncId'>) => void;
  onEdit: (id: number, transaction: Partial<Transaction>) => void;
  onDelete: (id: number) => void;
  onBulkDelete: (ids: number[]) => void;
  currency: string;
}

type SortKey = 'date' | 'category' | 'description' | 'amount' | 'createdBy';
type SortDirection = 'asc' | 'desc';

export const Expenses: React.FC<ExpensesProps> = ({ expenses: transactions, categories, onAdd, onEdit, onDelete, onBulkDelete, currency }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc'
  });
  
  // Deletion States
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'expense' as TransactionType
  });

  const getCategoriesByType = (type: TransactionType) => {
    return categories.filter(c => c.type === type);
  };

  const resetForm = () => {
    const defaultType = 'expense';
    const defaultCats = getCategoriesByType(defaultType);
    setFormData({
      amount: '',
      categoryId: defaultCats[0]?.id?.toString() || '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: defaultType
    });
    setEditingTransaction(null);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      categoryId: transaction.categoryId.toString(),
      date: transaction.date,
      description: transaction.description,
      type: transaction.type
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(formData.amount),
      categoryId: parseInt(formData.categoryId),
      date: formData.date,
      description: formData.description,
      type: formData.type
    };

    if (editingTransaction && editingTransaction.id) {
      onEdit(editingTransaction.id, payload);
    } else {
      onAdd(payload);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || e.categoryId === filterCategory;
      const matchesType = filterType === 'all' || e.type === filterType;
      return matchesSearch && matchesCategory && matchesType;
    });

    return result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortConfig.key) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'category':
          const catA = categories.find(c => c.id === a.categoryId)?.name || '';
          const catB = categories.find(c => c.id === b.categoryId)?.name || '';
          comparison = catA.localeCompare(catB);
          break;
        case 'createdBy':
           const userA = a.createdBy || TEXTS.EXPENSES.TABLE.ME;
           const userB = b.createdBy || TEXTS.EXPENSES.TABLE.ME;
           comparison = userA.localeCompare(userB);
           break;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [transactions, searchTerm, filterCategory, filterType, sortConfig, categories]);

  // Selection Logic
  const allFilteredSelected = filteredTransactions.length > 0 && filteredTransactions.every(t => t.id && selectedIds.has(t.id));

  const handleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    if (allFilteredSelected) {
      filteredTransactions.forEach(t => t.id && newSelected.delete(t.id));
    } else {
      filteredTransactions.forEach(t => t.id && newSelected.add(t.id));
    }
    setSelectedIds(newSelected);
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDeleteConfirm = () => {
    onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsBulkDeleteConfirmOpen(false);
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 text-primary-600" />
      : <ArrowDown className="w-4 h-4 ml-1 text-primary-600" />;
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2";
  const thClasses = "px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-50 hover:text-gray-700 transition-colors group border-b border-gray-100";

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{TEXTS.EXPENSES.TITLE}</h1>
          <p className="text-gray-500 font-medium mt-1">{TEXTS.EXPENSES.SUBTITLE}</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <Button 
              variant="danger" 
              onClick={() => setIsBulkDeleteConfirmOpen(true)}
              className="shadow-lg shadow-red-500/10 flex-1 sm:flex-initial"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {TEXTS.EXPENSES.DELETE_SELECTED(selectedIds.size)}
            </Button>
          )}
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} size="md" className="shadow-lg shadow-primary-500/20 flex-1 sm:flex-initial">
            <Plus className="w-5 h-5 mr-2" />
            {TEXTS.EXPENSES.ADD_TRANSACTION}
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={TEXTS.EXPENSES.SEARCH_PLACEHOLDER}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-xs text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-gray-100 focus:border-gray-300 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0">
             <div className="relative">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
                  className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-xs text-gray-700 font-semibold focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 min-w-[140px] cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="all">{TEXTS.EXPENSES.FILTERS.ALL_TYPES}</option>
                  <option value="expense">{TEXTS.EXPENSES.FILTERS.TYPE_EXPENSE}</option>
                  <option value="income">{TEXTS.EXPENSES.FILTERS.TYPE_INCOME}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
             </div>
             
             <div className="relative">
               <select 
                 value={filterCategory}
                 onChange={(e) => setFilterCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                 className="appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-xs text-gray-700 font-semibold focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 min-w-[160px] cursor-pointer hover:bg-gray-50 transition-colors"
               >
                 <option value="all">{TEXTS.EXPENSES.FILTERS.ALL_CATEGORIES}</option>
                 {categories.map(cat => (
                   <option key={cat.id} value={cat.id}>{cat.name}</option>
                 ))}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                 <Filter className="w-4 h-4" />
               </div>
             </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 w-12 border-b border-gray-100">
                    <input 
                      type="checkbox" 
                      checked={allFilteredSelected}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded-md border-gray-300 bg-white text-primary-600 focus:ring-primary-500 transition-all cursor-pointer accent-primary-600"
                    />
                  </th>
                  <th className={thClasses} onClick={() => handleSort('date')}>
                    <div className="flex items-center">
                      {TEXTS.EXPENSES.TABLE.DATE} {renderSortIcon('date')}
                    </div>
                  </th>
                  <th className={thClasses} onClick={() => handleSort('category')}>
                    <div className="flex items-center">
                      {TEXTS.EXPENSES.TABLE.CATEGORY} {renderSortIcon('category')}
                    </div>
                  </th>
                  <th className={thClasses} onClick={() => handleSort('description')}>
                    <div className="flex items-center">
                      {TEXTS.EXPENSES.TABLE.DESCRIPTION} {renderSortIcon('description')}
                    </div>
                  </th>
                  <th className={thClasses} onClick={() => handleSort('createdBy')}>
                    <div className="flex items-center">
                      {TEXTS.EXPENSES.TABLE.ADDED_BY} {renderSortIcon('createdBy')}
                    </div>
                  </th>
                  <th className={thClasses} onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end">
                      {TEXTS.EXPENSES.TABLE.AMOUNT} {renderSortIcon('amount')}
                    </div>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center border-b border-gray-100">{TEXTS.EXPENSES.TABLE.ACTIONS}</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Search className="w-12 h-12 text-gray-200 mb-4" />
                        <p className="font-medium">{TEXTS.EXPENSES.TABLE.NO_TRANSACTIONS_TITLE}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const category = categories.find(c => c.id === transaction.categoryId);
                    const isIncome = transaction.type === 'income';
                    const isSelected = transaction.id ? selectedIds.has(transaction.id) : false;
                    const createdBy = transaction.createdBy || TEXTS.EXPENSES.TABLE.ME;
                    
                    return (
                      <tr key={transaction.id} className={`group transition-all ${isSelected ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-5 border-b border-gray-100 group-last:border-0">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => transaction.id && handleSelectOne(transaction.id)}
                            className="w-5 h-5 rounded-md border-gray-300 bg-white text-primary-600 focus:ring-primary-500 transition-all cursor-pointer accent-primary-600"
                          />
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-gray-500 whitespace-nowrap border-b border-gray-100 group-last:border-0">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-5 border-b border-gray-100 group-last:border-0">
                          <div className="flex items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold text-xs shadow-sm ring-1 ring-black/5"
                              style={{ backgroundColor: `${category?.color || '#ccc'}20`, color: category?.color || '#666' }}
                            >
                              {category?.name?.charAt(0) || '?'}
                            </div>
                            <span className="font-bold text-gray-700 text-sm">{category?.name || TEXTS.EXPENSES.TABLE.UNKNOWN_CATEGORY}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 border-b border-gray-100 group-last:border-0">
                          <span className="text-gray-900 font-bold text-sm">{transaction.description}</span>
                        </td>
                        <td className="px-6 py-5 border-b border-gray-100 group-last:border-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${createdBy === TEXTS.EXPENSES.TABLE.ME ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                            {createdBy === TEXTS.EXPENSES.TABLE.ME ? TEXTS.EXPENSES.TABLE.ME : TEXTS.EXPENSES.TABLE.PEER}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right border-b border-gray-100 group-last:border-0">
                          <span className={`text-base font-extrabold ${isIncome ? 'text-primary-600' : 'text-gray-900'}`}>
                            {isIncome ? '+' : ''}{formatCurrency(transaction.amount, currency)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center border-b border-gray-100 group-last:border-0">
                          <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <button 
                              type="button"
                              onClick={() => handleEditClick(transaction)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => transaction.id !== undefined && setTransactionToDelete(transaction.id)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? TEXTS.EXPENSES.MODAL.EDIT_TITLE : TEXTS.EXPENSES.MODAL.NEW_TITLE}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex p-1.5 bg-gray-100 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white shadow-sm text-gray-900 ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => {
                const cats = getCategoriesByType('expense');
                setFormData({...formData, type: 'expense', categoryId: cats[0]?.id?.toString() || ''});
              }}
            >
              {TEXTS.EXPENSES.MODAL.EXPENSE}
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-white shadow-sm text-primary-600 ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => {
                const cats = getCategoriesByType('income');
                setFormData({...formData, type: 'income', categoryId: cats[0]?.id?.toString() || ''});
              }}
            >
              {TEXTS.EXPENSES.MODAL.INCOME}
            </button>
          </div>

          <div>
            <label className={labelClasses}>{TEXTS.EXPENSES.MODAL.AMOUNT_LABEL}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">{getCurrencySymbol(currency)}</span>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                required
                className={`${inputClasses} pl-10 text-xl font-bold bg-gray-50`}
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>{TEXTS.EXPENSES.MODAL.CATEGORY_LABEL}</label>
              <select 
                required
                className={inputClasses}
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                {getCategoriesByType(formData.type).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClasses}>{TEXTS.EXPENSES.MODAL.DATE_LABEL}</label>
              <input 
                type="date" 
                required
                className={inputClasses}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>{TEXTS.EXPENSES.MODAL.DESCRIPTION_LABEL}</label>
            <textarea 
              rows={3}
              className={inputClasses}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={TEXTS.EXPENSES.MODAL.DESCRIPTION_PLACEHOLDER}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              {TEXTS.EXPENSES.MODAL.CANCEL}
            </Button>
            <Button type="submit" className="px-8 shadow-lg shadow-primary-500/20">
              {editingTransaction ? TEXTS.EXPENSES.MODAL.SAVE : TEXTS.EXPENSES.MODAL.ADD}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Single Delete Confirmation */}
      <ConfirmModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => transactionToDelete && onDelete(transactionToDelete)}
        title={TEXTS.EXPENSES.CONFIRM.DELETE_SINGLE_TITLE}
        message={TEXTS.EXPENSES.CONFIRM.DELETE_SINGLE_MSG}
        confirmText={TEXTS.EXPENSES.CONFIRM.DELETE_SINGLE_BTN}
        variant="danger"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmModal
        isOpen={isBulkDeleteConfirmOpen}
        onClose={() => setIsBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title={TEXTS.EXPENSES.CONFIRM.DELETE_BULK_TITLE(selectedIds.size)}
        message={TEXTS.EXPENSES.CONFIRM.DELETE_BULK_MSG(selectedIds.size)}
        confirmText={TEXTS.EXPENSES.CONFIRM.DELETE_BULK_BTN}
        variant="danger"
      />
    </div>
  );
};
