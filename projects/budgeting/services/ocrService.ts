import * as pdfjsLib from 'pdfjs-dist';
import { Transaction, TransactionType } from '../types';
import { generateId } from '../utils';
import { 
  DATE_PATTERNS, 
  AMOUNT_PATTERN, 
  INCOME_KEYWORDS, 
  HEADER_KEYWORDS,
  guessCategory, 
  UNKNOWN_DESCRIPTION 
} from '../constants';

// Handle ESM default export structure for PDF.js
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export interface ExtractedTransaction extends Omit<Transaction, 'id' | 'createdAt' | 'modifiedAt' | 'categoryId' | 'syncId'> {
  tempId: string;
  originalText: string;
  categoryName?: string;
  confidence: number;
}

interface TextItem {
  str: string;
  transform: number[]; // [scaleX, skewY, skewX, scaleY, x, y]
  width: number;
  height: number;
  hasEOL: boolean;
}

interface Row {
  y: number;
  items: TextItem[];
  fullText: string;
}

interface ColumnLayout {
  moneyOutX?: { min: number; max: number };
  moneyInX?: { min: number; max: number };
}

export const extractTransactionsFromPdf = async (file: File): Promise<ExtractedTransaction[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const transactions: ExtractedTransaction[] = [];

  // Maintain layout detection across pages if found
  let globalLayout: ColumnLayout | null = null;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as TextItem[];

    const rows = groupItemsByRow(items);
    
    // Try to detect layout if not already found
    if (!globalLayout) {
      globalLayout = detectColumnLayout(rows);
    }

    for (const row of rows) {
      const transaction = parseTransactionFromRow(row, globalLayout);
      if (transaction) {
        transactions.push(transaction);
      }
    }
  }

  return transactions;
};

// Helper to group text items into lines based on Y position
const groupItemsByRow = (items: TextItem[]): Row[] => {
  const TOLERANCE = 5; // Vertical tolerance in pixels
  const rows: Row[] = [];

  // Sort items by Y descending (top to bottom), then X ascending (left to right)
  items.sort((a, b) => {
    if (Math.abs(a.transform[5] - b.transform[5]) > TOLERANCE) {
      return b.transform[5] - a.transform[5];
    }
    return a.transform[4] - b.transform[4];
  });

  for (const item of items) {
    const y = item.transform[5];
    const text = item.str.trim();
    
    if (!text) continue;

    const existingRow = rows.find(r => Math.abs(r.y - y) <= TOLERANCE);
    if (existingRow) {
      existingRow.items.push(item);
      existingRow.fullText += ' ' + text;
    } else {
      rows.push({ y, items: [item], fullText: text });
    }
  }

  return rows;
};

const detectColumnLayout = (rows: Row[]): ColumnLayout | null => {
  for (const row of rows) {
    const lowerText = row.fullText.toLowerCase();
    
    // Check for "Money Out" / "Debit" headers
    const hasMoneyOut = HEADER_KEYWORDS.moneyOut.some(k => lowerText.includes(k));
    // Check for "Money In" / "Credit" headers
    const hasMoneyIn = HEADER_KEYWORDS.moneyIn.some(k => lowerText.includes(k));

    if (hasMoneyOut && hasMoneyIn) {
      // Analyze items to find positions
      let moneyOutX: { min: number; max: number } | undefined;
      let moneyInX: { min: number; max: number } | undefined;

      for (const item of row.items) {
        const itemLower = item.str.toLowerCase();
        
        if (HEADER_KEYWORDS.moneyOut.some(k => itemLower.includes(k))) {
          moneyOutX = { min: item.transform[4] - 10, max: item.transform[4] + item.width + 10 };
        } else if (HEADER_KEYWORDS.moneyIn.some(k => itemLower.includes(k))) {
          moneyInX = { min: item.transform[4] - 10, max: item.transform[4] + item.width + 10 };
        }
      }

      if (moneyOutX && moneyInX) {
        // Expand ranges slightly to catch column data which might be wider or slightly offset
        // Typically Money Out is to the left of Money In, or vice versa.
        // We set generous ranges based on the header position.
        return { 
          moneyOutX: { min: moneyOutX.min - 20, max: moneyOutX.max + 20 },
          moneyInX: { min: moneyInX.min - 20, max: moneyInX.max + 20 }
        };
      }
    }
  }
  return null;
};

const parseTransactionFromRow = (row: Row, layout: ColumnLayout | null): ExtractedTransaction | null => {
  const line = row.fullText;
  
  // 1. Attempt to find a date
  let dateStr = '';
  let matchDate: RegExpMatchArray | null = null;
  
  for (const pattern of DATE_PATTERNS) {
    matchDate = line.match(pattern);
    if (matchDate) {
      dateStr = normalizeDate(matchDate);
      break;
    }
  }

  if (!dateStr) return null;

  // 2. Identify Amounts and their positions
  // We need to find amounts in the text items to use spatial logic
  // If we can't map text items to amounts easily (e.g. split across items), we fallback to regex on full line.

  const amounts: { value: number; x: number; width: number }[] = [];
  
  // Regex to find amounts in individual items is tricky because "1,000" might be one item or split.
  // Simple approach: Look at items that look like numbers.
  for (const item of row.items) {
    const itemText = item.str.trim().replace(/,/g, '');
    // Check if item is part of the date, ignore if so (rough check)
    if (matchDate && matchDate[0].includes(item.str.trim())) continue;

    // Check if it's a number
    const val = parseFloat(itemText);
    if (!isNaN(val) && /\d+\.\d{2}/.test(item.str)) { // Must look like currency amount
       amounts.push({ value: val, x: item.transform[4], width: item.width });
    }
  }

  // If spatial detection failed (e.g. items split weirdly), fallback to regex on full line
  if (amounts.length === 0) {
      const lineWithoutDate = line.replace(matchDate![0], '');
      const allAmountMatches = [...lineWithoutDate.matchAll(new RegExp(AMOUNT_PATTERN, 'g'))];
      
      if (!allAmountMatches || allAmountMatches.length === 0) return null;

      // Add found amounts with dummy X (0) since we can't use layout
      for (const match of allAmountMatches) {
          const val = parseFloat(match[1].replace(/,/g, ''));
          amounts.push({ value: val, x: 0, width: 0 });
      }
  }

  if (amounts.length === 0) return null;

  // Logic to pick the right amount and type
  let amount = 0;
  let type: TransactionType = 'expense';
  
  if (layout && layout.moneyInX && layout.moneyOutX) {
      // Spatial Logic
      let bestMatch = null;
      
      // Check for Money In match
      const incomeAmount = amounts.find(a => 
        layout.moneyInX && a.x >= layout.moneyInX.min - 50 && a.x <= layout.moneyInX.max + 50
      );
      
      // Check for Money Out match
      const expenseAmount = amounts.find(a => 
         layout.moneyOutX && a.x >= layout.moneyOutX.min - 50 && a.x <= layout.moneyOutX.max + 50
      );

      if (incomeAmount) {
          amount = incomeAmount.value;
          type = 'income';
      } else if (expenseAmount) {
          amount = expenseAmount.value;
          type = 'expense';
      } else {
          // Fallback if numbers don't align perfectly with headers
          // Heuristic: If we have multiple amounts, usually Balance is last. 
          // If we have 2 amounts, likely one is Trans, one is Balance.
          // If the amount is positioned more to the right, it might be credit? No, inconsistent.
          // Fallback to text analysis.
          amount = amounts[0].value;
      }
  } else {
      // Text/Keyword Logic (Fallback)
      // Usually, if multiple amounts, the first one is the transaction, last is balance.
      amount = amounts[0].value;
      
      // Basic type inference
      const lowerLine = line.toLowerCase();
      if (INCOME_KEYWORDS.some(k => lowerLine.includes(k)) || /\bcr\b/i.test(line)) {
          type = 'income';
      }
  }
  
  // Double check explicit negatives which are always expenses (unless it's a refund in a credit column?)
  // Usually -50.00 is expense.
  if (line.includes(`-${amount}`) || line.includes(`-${amount.toFixed(2)}`)) {
      type = 'expense'; // Although amount is abs, the sign indicates logic
  }

  // 3. Extract Description
  // Remove Date and found Amount from line
  let description = line.replace(matchDate![0], '');
  // Crude removal of amount string
  description = description.replace(amount.toString(), ''); 
  // Also try with formatted amount
  const formattedAmount = amount.toFixed(2);
  description = description.replace(formattedAmount, '');
  
  description = description.trim().replace(/^[\W_]+|[\W_]+$/g, ''); 
  if (description.length < 3) description = UNKNOWN_DESCRIPTION;

  // 5. Guess Category
  const categoryName = guessCategory(description, type);

  return {
    tempId: `imported_${generateId()}`,
    date: dateStr,
    amount: amount,
    description: description,
    type: type,
    categoryName: categoryName,
    originalText: line,
    confidence: layout ? 0.9 : 0.8
  };
};

const normalizeDate = (match: RegExpMatchArray): string => {
  // Try to convert to YYYY-MM-DD
  try {
    let d = match[1];
    let m = match[2];
    let y = match[3];

    if (!d || !m || !y) {
       const dateObj = new Date(match[0]);
       if (!isNaN(dateObj.getTime())) {
         return dateObj.toISOString().split('T')[0];
       }
       return new Date().toISOString().split('T')[0];
    }

    if (/[a-z]/i.test(m)) {
      const months: {[key:string]: string} = {jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12'};
      m = months[m.toLowerCase().substring(0, 3)] || '01';
    }

    if (d.length === 1) d = '0' + d;
    if (m.length === 1) m = '0' + m;
    if (y.length === 2) y = '20' + y;

    return `${y}-${m}-${d}`;
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};