import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const getCurrencySymbol = (currency: string = 'GBP') => {
  try {
    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    });
    const parts = formatter.formatToParts(0);
    const currencyPart = parts.find(part => part.type === 'currency');
    return currencyPart ? currencyPart.value : currency;
  } catch (e) {
    return currency;
  }
};

export const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch (e) {
    return dateString;
  }
};

export const hexToRgba = (hex: string, alpha: number = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const generateId = () => Math.floor(Math.random() * 1000000);

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};