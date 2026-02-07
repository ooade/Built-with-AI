
import Dexie, { type Table } from 'dexie';
import { Transaction, Category, UserSettings } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { generateUUID } from './utils';

export class BudgetDB extends Dexie {
  transactions!: Table<Transaction, number>;
  categories!: Table<Category, number>;
  settings!: Table<UserSettings, number>;

  constructor() {
    super('BudgetMasterDB');
    
    // Previous versions
    (this as any).version(1).stores({
      transactions: '++id, categoryId, date, type, createdAt',
      categories: '++id, name, type',
      settings: '++id'
    });

    (this as any).version(2).stores({
      transactions: '++id, categoryId, date, type, createdAt',
      categories: '++id, name, type',
      settings: '++id'
    });
    
    (this as any).version(3).stores({
      transactions: '++id, categoryId, date, type, createdAt',
      categories: '++id, name, type',
      settings: '++id'
    });

    // Version 4: Add syncId for P2P synchronization
    (this as any).version(4).stores({
      transactions: '++id, syncId, categoryId, date, type, createdAt',
      categories: '++id, syncId, name, type',
      settings: '++id'
    }).upgrade(async (trans: any) => {
      // Migrate existing records to have a syncId
      await trans.table('transactions').toCollection().modify((t: any) => {
        if (!t.syncId) t.syncId = generateUUID();
      });
      await trans.table('categories').toCollection().modify((c: any) => {
        if (!c.syncId) c.syncId = generateUUID();
      });
    });

    // Version 5: Add unique constraint to syncId to prevent duplicates during sync
    (this as any).version(5).stores({
      transactions: '++id, &syncId, categoryId, date, type, createdAt',
      categories: '++id, &syncId, name, type',
      settings: '++id'
    });

    // Version 6: Add createdBy field
    (this as any).version(6).stores({
      transactions: '++id, &syncId, categoryId, date, type, createdAt, createdBy',
      categories: '++id, &syncId, name, type',
      settings: '++id'
    }).upgrade(async (trans: any) => {
      await trans.table('transactions').toCollection().modify((t: any) => {
        if (!t.createdBy) t.createdBy = 'Me';
      });
    });

    (this as any).on('populate', this.populate.bind(this));
  }

  async populate() {
    await this.categories.bulkAdd(DEFAULT_CATEGORIES);
    await this.settings.add({
      currency: 'GBP',
      theme: 'light',
      reminderEnabled: false,
      reminderTime: '20:00'
    });
  }
}

export const db = new BudgetDB();
