
import { TEXTS } from './textResources';
import { Category } from './types';

export const INCOME_KEYWORDS = [
  'credit', 
  'deposit', 
  'refund', 
  'salary', 
  'fps credit', 
  'faster payments receipt', 
  'interest', 
  'dividend'
];

// Use keys from TEXTS to ensure consistency between Rules and Display Names
export const EXPENSE_CATEGORY_RULES: Record<string, string[]> = {
  [TEXTS.DATA.CATEGORIES.GROCERIES]: [
    'sainsbury', 'tesco', 'asda', 'waitrose', 'lidl', 'aldi', 'morrisons', 'co-op', 
    'iceland', 'whole foods', 'marks&spencer', 'm&s'
  ],
  [TEXTS.DATA.CATEGORIES.TRANSPORT]: [
    'uber', 'train', 'bus', 'tfl', 'petrol', 'shell', 'bp ', ' Esso ', 
    'transport', 'rail', 'ticket', 'parking'
  ],
  [TEXTS.DATA.CATEGORIES.ENTERTAINMENT]: [
    'netflix', 'spotify', 'cinema', 'prime video', 'odean', 'vue', 
    'theatre', 'concert', 'hbo', 'disney'
  ],
  [TEXTS.DATA.CATEGORIES.HEALTHCARE]: [
    'pharmacy', 'boots', 'doctor', 'nhs', 'dentist', 'optician', 
    'superdrug', 'hospital', 'medical'
  ],
  [TEXTS.DATA.CATEGORIES.DINING]: [
    'restaurant', 'cafe', 'coffee', 'starbucks', 'costa', 'mcdonalds', 
    'kfc', 'burger king', 'nandos', 'pret', 'eat', 'food', 'delivery', 'just eat', 'deliveroo'
  ],
  [TEXTS.DATA.CATEGORIES.SHOPPING]: [
    'amzn', 'amazon', 'ebay', 'shop', 'asos', 'zara', 'h&m', 
    'clothing', 'store', 'retail'
  ],
  [TEXTS.DATA.CATEGORIES.UTILITIES]: [
    'water', 'energy', 'gas', 'electric', 'council', 'bt group', 
    'virgin media', 'sky', 'broadband', 'mobile', 'vodafone', 'o2', 'ee', 'three'
  ],
  [TEXTS.DATA.CATEGORIES.TRANSFER]: [
    'transfer', 'savings', 'isa', 'investment', 'pension', 'sent to', 'monzo pot', 'vault'
  ]
};

export const INCOME_CATEGORY_RULES: Record<string, string[]> = {
  [TEXTS.DATA.CATEGORIES.SALARY]: [
    'salary', 'wage', 'payroll', 'employer', 'dwp'
  ],
  [TEXTS.DATA.CATEGORIES.FREELANCE]: [
    'invoice', 'contract', 'freelance', 'consulting', 'upwork', 'fiverr'
  ],
  [TEXTS.DATA.CATEGORIES.INVESTMENTS]: [
    'dividend', 'interest', 'capital', 'vanguard', 'trading', 'etoro', 'wealthify', 'nutmeg'
  ],
  [TEXTS.DATA.CATEGORIES.GIFTS]: [
    'gift', 'birthday', 'christmas'
  ],
  [TEXTS.DATA.CATEGORIES.TRANSFER]: [
    'transfer', 'from savings', 'monzo pot', 'received from'
  ]
};

export const HEADER_KEYWORDS = {
  moneyOut: ['money out', 'paid out', 'debit', 'withdrawal', 'payments', 'amount debited'],
  moneyIn: ['money in', 'paid in', 'credit', 'deposit', 'receipts', 'amount credited']
};

export const DEFAULT_EXPENSE_CATEGORY = TEXTS.DATA.CATEGORIES.OTHER_EXPENSE;
export const DEFAULT_INCOME_CATEGORY = TEXTS.DATA.CATEGORIES.OTHER_INCOME;
export const UNKNOWN_DESCRIPTION = TEXTS.DATA.UNKNOWN_TRANSACTION;

export const DATE_PATTERNS = [
  /\b(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\b/, // DD/MM/YYYY
  /\b(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{2})\b/, // DD/MM/YY
  /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})\b/i // DD Mon YYYY
];

export const AMOUNT_PATTERN = /(?:£|\$|€)?\s?(\d{1,3}(?:,\d{3})*\.\d{2})/;

export const guessCategory = (text: string, type: 'expense' | 'income' = 'expense'): string => {
  const lower = text.toLowerCase();
  const rules = type === 'income' ? INCOME_CATEGORY_RULES : EXPENSE_CATEGORY_RULES;
  const defaultCat = type === 'income' ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY;

  for (const [category, keywords] of Object.entries(rules)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      return category;
    }
  }
  return defaultCat;
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { name: TEXTS.DATA.CATEGORIES.GROCERIES, color: '#10b981', type: 'expense', isDefault: true, syncId: 'default-exp-1' }, // Emerald
  { name: TEXTS.DATA.CATEGORIES.TRANSPORT, color: '#3b82f6', type: 'expense', isDefault: true, syncId: 'default-exp-2' }, // Blue
  { name: TEXTS.DATA.CATEGORIES.UTILITIES, color: '#f59e0b', type: 'expense', isDefault: true, syncId: 'default-exp-3' }, // Amber
  { name: TEXTS.DATA.CATEGORIES.ENTERTAINMENT, color: '#8b5cf6', type: 'expense', isDefault: true, syncId: 'default-exp-4' }, // Violet
  { name: TEXTS.DATA.CATEGORIES.HEALTHCARE, color: '#ef4444', type: 'expense', isDefault: true, syncId: 'default-exp-5' }, // Red
  { name: TEXTS.DATA.CATEGORIES.DINING, color: '#f97316', type: 'expense', isDefault: true, syncId: 'default-exp-6' }, // Orange
  { name: TEXTS.DATA.CATEGORIES.SHOPPING, color: '#ec4899', type: 'expense', isDefault: true, syncId: 'default-exp-7' }, // Pink
  { name: TEXTS.DATA.CATEGORIES.TRANSFER, color: '#6366f1', type: 'expense', isDefault: true, syncId: 'default-exp-8' }, // Indigo
  { name: TEXTS.DATA.CATEGORIES.OTHER_EXPENSE, color: '#6b7280', type: 'expense', isDefault: true, syncId: 'default-exp-9' }, // Gray
  
  // Income
  { name: TEXTS.DATA.CATEGORIES.SALARY, color: '#059669', type: 'income', isDefault: true, syncId: 'default-inc-1' }, // Green
  { name: TEXTS.DATA.CATEGORIES.FREELANCE, color: '#0ea5e9', type: 'income', isDefault: true, syncId: 'default-inc-2' }, // Sky
  { name: TEXTS.DATA.CATEGORIES.INVESTMENTS, color: '#7c3aed', type: 'income', isDefault: true, syncId: 'default-inc-3' }, // Violet
  { name: TEXTS.DATA.CATEGORIES.GIFTS, color: '#db2777', type: 'income', isDefault: true, syncId: 'default-inc-4' }, // Pink
  { name: TEXTS.DATA.CATEGORIES.TRANSFER, color: '#6366f1', type: 'income', isDefault: true, syncId: 'default-inc-5' }, // Indigo
  { name: TEXTS.DATA.CATEGORIES.OTHER_INCOME, color: '#4b5563', type: 'income', isDefault: true, syncId: 'default-inc-6' }, // Gray
];
