
import React, { useState, useEffect } from 'react';
import { UserSettings, Category, TransactionType } from '../types';
import { db } from '../db';
import { generateUUID } from '../utils';
import { Button } from './ui/Button';
import { Save, Trash2, Plus, RefreshCw, AlertTriangle, ShieldCheck, Palette, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from './ui/ConfirmModal';
import { TEXTS } from '../textResources';

interface SettingsProps {
  settings: UserSettings;
  categories: Category[];
}

export const Settings: React.FC<SettingsProps> = ({ settings, categories }) => {
  const [currency, setCurrency] = useState(settings?.currency || 'GBP');
  const [reminderTime, setReminderTime] = useState(settings?.reminderTime || '20:00');
  const [reminderEnabled, setReminderEnabled] = useState(settings?.reminderEnabled || false);
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<TransactionType>('expense');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  // Confirmation States
  const [categoryToDelete, setCategoryToDelete] = useState<{id: number, count: number} | null>(null);
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);

  // Sync state with props when settings load or change
  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency);
      setReminderTime(settings.reminderTime);
      setReminderEnabled(settings.reminderEnabled);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      if (settings?.id) {
        await db.settings.update(settings.id, {
          currency,
          reminderTime,
          reminderEnabled
        });
        toast.success(TEXTS.SETTINGS.TOAST.SAVED);
        
        if (reminderEnabled && Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
      }
    } catch (e) {
      toast.error(TEXTS.SETTINGS.TOAST.SAVE_ERROR);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await db.categories.add({
        syncId: generateUUID(),
        name: newCatName,
        type: newCatType,
        color: newCatColor,
        isDefault: false
      });
      setNewCatName('');
      toast.success(TEXTS.SETTINGS.TOAST.CAT_ADDED);
    } catch (e) {
      toast.error(TEXTS.SETTINGS.TOAST.CAT_ADD_ERROR);
    }
  };

  const initiateDeleteCategory = async (id: number) => {
    const used = await db.transactions.where('categoryId').equals(id).count();
    setCategoryToDelete({ id, count: used });
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const cat = categories.find(c => c.id === categoryToDelete.id);
      
      // If transactions are using this category, reassign them
      if (cat && categoryToDelete.count > 0) {
         const fallback = categories.find(c => c.isDefault && c.type === cat.type && c.name.includes('Other')) 
                       || categories.find(c => c.isDefault && c.type === cat.type);
         
         if (fallback && fallback.id) {
            await db.transactions.where('categoryId').equals(categoryToDelete.id).modify({ categoryId: fallback.id });
            toast.success(TEXTS.SETTINGS.TOAST.TRANS_MOVED(fallback.name));
         }
      }

      await db.categories.delete(categoryToDelete.id);
      toast.success(TEXTS.SETTINGS.TOAST.CAT_DELETED);
    } catch (e) {
      toast.error(TEXTS.SETTINGS.TOAST.CAT_DELETE_ERROR);
    }
  };

  const confirmClearData = async () => {
    try {
      await db.transactions.clear();
      // Use filter because isDefault is not indexed in the DB schema
      await db.categories.filter(c => c.isDefault === false).delete(); 
      toast.success(TEXTS.SETTINGS.TOAST.DATA_CLEARED);
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast.error(TEXTS.SETTINGS.TOAST.DATA_CLEAR_ERROR);
    }
  };

  const getDeleteMessage = () => {
    if (!categoryToDelete) return "";
    if (categoryToDelete.count === 0) return TEXTS.SETTINGS.CONFIRM.DELETE_CAT_MSG_EMPTY;
    
    const cat = categories.find(c => c.id === categoryToDelete.id);
    const fallback = cat ? (categories.find(c => c.isDefault && c.type === cat.type && c.name.includes('Other')) 
                     || categories.find(c => c.isDefault && c.type === cat.type)) : null;
    
    return TEXTS.SETTINGS.CONFIRM.DELETE_CAT_MSG_USED(categoryToDelete.count, fallback?.name || 'Unknown Category');
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2";

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in-up pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{TEXTS.SETTINGS.TITLE}</h1>
        <p className="text-gray-500 font-medium mt-1">{TEXTS.SETTINGS.SUBTITLE}</p>
      </div>

      {/* General Settings */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 text-primary-600" />
          {TEXTS.SETTINGS.GENERAL.TITLE}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={labelClasses}>{TEXTS.SETTINGS.GENERAL.CURRENCY}</label>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className={inputClasses}
            >
              <option value="GBP">{TEXTS.SETTINGS.GENERAL.OPTIONS.GBP}</option>
              <option value="USD">{TEXTS.SETTINGS.GENERAL.OPTIONS.USD}</option>
              <option value="EUR">{TEXTS.SETTINGS.GENERAL.OPTIONS.EUR}</option>
              <option value="JPY">{TEXTS.SETTINGS.GENERAL.OPTIONS.JPY}</option>
            </select>
          </div>

          <div>
             <label className={labelClasses}>{TEXTS.SETTINGS.GENERAL.REMINDER}</label>
             <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <div className="pl-2">
                  <Bell size={20} className="text-gray-400" />
                </div>
                <input 
                  type="time" 
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  disabled={!reminderEnabled}
                  className="bg-transparent border-none focus:ring-0 text-gray-900 font-bold disabled:text-gray-400"
                />
                <div className="flex-1 text-right pr-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={reminderEnabled} 
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveSettings} className="shadow-lg shadow-primary-500/20">
            <Save className="w-4 h-4 mr-2" />
            {TEXTS.SETTINGS.GENERAL.SAVE}
          </Button>
        </div>
      </section>

      {/* Category Management */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <RefreshCw className="w-5 h-5 mr-2 text-primary-600" />
          {TEXTS.SETTINGS.CATEGORIES.TITLE}
        </h2>

        <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
           <div className="flex-1">
             <input 
               type="text" 
               placeholder={TEXTS.SETTINGS.CATEGORIES.NEW_PLACEHOLDER}
               value={newCatName}
               onChange={(e) => setNewCatName(e.target.value)}
               className={inputClasses}
             />
           </div>
           <div className="w-full md:w-40">
             <select 
               value={newCatType}
               onChange={(e) => setNewCatType(e.target.value as TransactionType)}
               className={inputClasses}
             >
               <option value="expense">{TEXTS.SETTINGS.CATEGORIES.TYPE_EXPENSE}</option>
               <option value="income">{TEXTS.SETTINGS.CATEGORIES.TYPE_INCOME}</option>
             </select>
           </div>
           <div className="w-full md:w-auto flex items-center gap-2">
             <div className="relative w-full md:w-14 h-[46px]">
               <input 
                 type="color" 
                 value={newCatColor}
                 onChange={(e) => setNewCatColor(e.target.value)}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
               <div 
                className="w-full h-full rounded-xl border border-gray-200 shadow-sm flex items-center justify-center"
                style={{ backgroundColor: newCatColor }}
               >
                 <Palette size={16} className="text-white mix-blend-difference" />
               </div>
             </div>
             <Button type="submit" disabled={!newCatName}>
               <Plus className="w-5 h-5" />
             </Button>
           </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50/80 group bg-white shadow-xs transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full ring-2 ring-gray-50 shadow-sm" style={{ backgroundColor: cat.color }} />
                <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
              </div>
              {!cat.isDefault && (
                <button 
                  type="button"
                  onClick={() => initiateDeleteCategory(cat.id!)}
                  className="text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title={TEXTS.SETTINGS.CATEGORIES.DELETE_TOOLTIP}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50/30 rounded-2xl shadow-sm border border-red-100 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-red-900 mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {TEXTS.SETTINGS.DANGER.TITLE}
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900">{TEXTS.SETTINGS.DANGER.RESET_TITLE}</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              {TEXTS.SETTINGS.DANGER.RESET_DESC}
            </p>
          </div>
          <Button variant="danger" onClick={() => setIsClearDataOpen(true)}>
            {TEXTS.SETTINGS.DANGER.RESET_BTN}
          </Button>
        </div>
      </section>

      {/* Modals */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
        title={TEXTS.SETTINGS.CONFIRM.DELETE_CAT_TITLE}
        message={getDeleteMessage()}
        confirmText={TEXTS.SETTINGS.CONFIRM.DELETE_CAT_BTN}
        variant="danger"
      />

      <ConfirmModal
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
        onConfirm={confirmClearData}
        title={TEXTS.SETTINGS.CONFIRM.RESET_TITLE}
        message={TEXTS.SETTINGS.CONFIRM.RESET_MSG}
        confirmText={TEXTS.SETTINGS.CONFIRM.RESET_BTN}
        variant="danger"
      />
    </div>
  );
};
