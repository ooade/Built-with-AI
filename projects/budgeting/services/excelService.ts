import * as XLSX from 'xlsx';
import { generateId } from '../utils';
import { ExtractedTransaction } from './ocrService';
import { guessCategory, UNKNOWN_DESCRIPTION, HEADER_KEYWORDS } from '../constants';
import { TransactionType } from '../types';

export const extractTransactionsFromExcel = async (file: File): Promise<ExtractedTransaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Assume data is in the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays (header: 1) to inspect rows
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (!rawData || rawData.length === 0) {
          resolve([]);
          return;
        }

        // 1. Find the Header Row
        const headerRowIndex = findHeaderRowIndex(rawData);
        if (headerRowIndex === -1) {
          throw new Error('Could not find a valid header row.');
        }

        const headers = rawData[headerRowIndex].map(h => String(h).toLowerCase().trim());
        
        // 2. Identify Column Indices
        // We use specific keywords from constants but also common fallbacks
        const colIndices = {
          date: findColumnIndex(headers, ['date', 'time', 'when', 'transaction date']),
          description: findColumnIndex(headers, ['description', 'details', 'narrative', 'merchant', 'transaction', 'reference', 'payee']),
          amount: findColumnIndex(headers, ['amount', 'value', 'price', 'cost', 'gbp', 'total']),
          moneyIn: findColumnIndex(headers, HEADER_KEYWORDS.moneyIn),
          moneyOut: findColumnIndex(headers, HEADER_KEYWORDS.moneyOut),
          type: findColumnIndex(headers, ['type', 'cr/dr', 'direction'])
        };

        // Fallback for Date: if not found, look for first column with 'date' in values? No, risky. 
        if (colIndices.date === -1) throw new Error('Could not find Date column');

        // Check availability of amount info
        const hasSeparateCols = colIndices.moneyIn !== -1 || colIndices.moneyOut !== -1;
        const hasSingleCol = colIndices.amount !== -1;

        if (!hasSeparateCols && !hasSingleCol) {
          throw new Error('Could not find Amount, Money In, or Money Out columns');
        }

        const transactions: ExtractedTransaction[] = [];

        // 3. Process Data Rows
        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;

          // Extract Date
          let dateStr = '';
          const rawDate = row[colIndices.date];
          if (rawDate instanceof Date) {
            dateStr = rawDate.toISOString().split('T')[0];
          } else if (typeof rawDate === 'number') {
            dateStr = new Date((rawDate - (25567 + 2)) * 86400 * 1000).toISOString().split('T')[0]; 
          } else if (typeof rawDate === 'string') {
             const d = new Date(rawDate);
             if (!isNaN(d.getTime())) {
                dateStr = d.toISOString().split('T')[0];
             }
          }

          if (!dateStr) continue; 

          // Extract Description
          let description = UNKNOWN_DESCRIPTION;
          if (colIndices.description !== -1 && row[colIndices.description]) {
            description = String(row[colIndices.description]).trim();
          }

          let amount = 0;
          let type: TransactionType = 'expense';

          // Strategy 1: Explicit Money In / Money Out Columns
          // We prioritize this if either column is present
          if (hasSeparateCols) {
             const moneyInVal = colIndices.moneyIn !== -1 ? parseAmount(row[colIndices.moneyIn]) : 0;
             const moneyOutVal = colIndices.moneyOut !== -1 ? parseAmount(row[colIndices.moneyOut]) : 0;

             // Logic: If Money In has value > 0, it's income. 
             // If Money Out has value > 0, it's expense.
             // If both, usually net off or it's a mistake, take the larger one? 
             // Or maybe MoneyOut is negative?
             
             if (Math.abs(moneyInVal) > 0) {
               amount = Math.abs(moneyInVal);
               type = 'income';
             } else if (Math.abs(moneyOutVal) > 0) {
               amount = Math.abs(moneyOutVal);
               type = 'expense';
             } else {
               // Try Single Column fallback if Separate Cols yielded nothing for this row
               if (hasSingleCol) {
                  const rawAmount = parseAmount(row[colIndices.amount]);
                  if (rawAmount !== 0) {
                    if (rawAmount < 0) {
                       type = 'expense';
                       amount = Math.abs(rawAmount);
                    } else {
                       type = 'income';
                       amount = rawAmount;
                    }
                  } else {
                    continue;
                  }
               } else {
                  continue; 
               }
             }
          } 
          // Strategy 2: Single Amount Column
          else if (hasSingleCol) {
             const rawAmount = parseAmount(row[colIndices.amount]);
             if (rawAmount === 0) continue;

             // Check Type Column
             if (colIndices.type !== -1) {
                const typeStr = String(row[colIndices.type]).toLowerCase();
                if (['cr', 'credit', 'income', 'deposit'].some(k => typeStr.includes(k))) {
                   type = 'income';
                   amount = Math.abs(rawAmount);
                } else if (['dr', 'debit', 'expense', 'payment'].some(k => typeStr.includes(k))) {
                   type = 'expense';
                   amount = Math.abs(rawAmount);
                } else {
                   // Fallback to sign if type is ambiguous
                   type = rawAmount < 0 ? 'expense' : 'income';
                   amount = Math.abs(rawAmount);
                }
             } else {
                // Infer from sign: Negative is Expense, Positive is Income
                if (rawAmount < 0) {
                   type = 'expense';
                   amount = Math.abs(rawAmount);
                } else {
                   type = 'income';
                   amount = rawAmount;
                }
             }
          }

          if (amount === 0) continue;

          // Clean Description
          description = description.replace(/[^\w\s\-\.]/g, '').trim();
          if (description.length < 3) description = UNKNOWN_DESCRIPTION;

          transactions.push({
            tempId: `imported_xls_${generateId()}`,
            date: dateStr,
            amount,
            description,
            type,
            categoryName: guessCategory(description, type),
            originalText: JSON.stringify(row),
            confidence: 1.0
          });
        }

        resolve(transactions);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const findHeaderRowIndex = (data: any[][]): number => {
  // Check first 15 rows
  for (let i = 0; i < Math.min(data.length, 15); i++) {
    const row = data[i];
    if (!row) continue;
    
    const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
    
    // Check if row has date AND (amount OR money identifiers)
    const hasDate = ['date', 'time', 'transaction'].some(k => rowStr.includes(k));
    
    // Create a comprehensive list of financial keywords
    const financeKeywords = [
      'amount', 'money out', 'money in', 'paid out', 'paid in', 
      'debit', 'credit', 'withdrawal', 'deposit', 'value', 'cost'
    ];
    
    const hasFinance = financeKeywords.some(k => rowStr.includes(k));
    
    if (hasDate && hasFinance) return i;
  }
  return 0; // Default to first row
};

const findColumnIndex = (headers: string[], keywords: string[]): number => {
  return headers.findIndex(h => keywords.some(k => h.includes(k)));
};

const parseAmount = (val: any): number => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  
  if (typeof val === 'string') {
    let clean = val.trim();
    // Handle accounting format (100.00) -> -100.00
    if (clean.startsWith('(') && clean.endsWith(')')) {
      clean = '-' + clean.slice(1, -1);
    }
    
    // Remove currency symbols and thousands separators, but keep decimal point and minus
    clean = clean.replace(/[^\d.\-]/g, '');
    
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};