import { Transaction } from '../types';

export interface ExtractedTransaction extends Omit<Transaction, 'id' | 'createdAt' | 'modifiedAt' | 'categoryId' | 'syncId'> {
  tempId: string;
  originalText: string;
  categoryName?: string; // Guessed category
  confidence: number;
}

export const simulatePdfExtraction = async (file: File): Promise<ExtractedTransaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return dummy data mimicking a bank statement scan
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      resolve([
        {
          tempId: 'temp_1',
          date: today,
          description: 'Tesco Superstore',
          amount: 45.20,
          type: 'expense',
          categoryName: 'Groceries',
          originalText: 'TESCO STORES 4829 - £45.20',
          confidence: 0.9
        },
        {
          tempId: 'temp_2',
          date: yesterday,
          description: 'Uber Trip',
          amount: 12.50,
          type: 'expense',
          categoryName: 'Transport',
          originalText: 'UBER *TRIP 2810 - £12.50',
          confidence: 0.85
        },
        {
          tempId: 'temp_3',
          date: yesterday,
          description: 'Costa Coffee',
          amount: 3.80,
          type: 'expense',
          categoryName: 'Dining',
          originalText: 'COSTA COFFEE - £3.80',
          confidence: 0.95
        },
         {
          tempId: 'temp_4',
          date: today,
          description: 'Amazon Prime',
          amount: 8.99,
          type: 'expense',
          categoryName: 'Entertainment',
          originalText: 'AMZNPRIME MEMBER - £8.99',
          confidence: 0.99
        },
        {
          tempId: 'temp_5',
          date: today,
          description: 'Monthly Salary',
          amount: 2850.00,
          type: 'income',
          categoryName: 'Salary',
          originalText: 'FPS CREDIT - ACME CORP SALARY - £2850.00',
          confidence: 0.99
        },
        {
          tempId: 'temp_6',
          date: yesterday,
          description: 'Refund - eBay',
          amount: 24.99,
          type: 'income',
          categoryName: 'Other Income',
          originalText: 'REFUND EBAY COMMERCE - £24.99',
          confidence: 0.8
        }
      ]);
    }, 1500); // Simulate processing delay
  });
};