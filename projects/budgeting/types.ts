
export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id?: number;
  syncId: string; // UUID for P2P sync
  amount: number;
  categoryId: number; // Local ID ref
  categorySyncId?: string; // Sync ID ref for P2P
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  createdAt: number;
  modifiedAt: number;
  type: TransactionType;
  createdBy?: string; // 'Me' or 'Peer'
}

export interface Category {
  id?: number;
  syncId: string; // UUID for P2P sync
  name: string;
  color: string;
  type: TransactionType;
  isDefault?: boolean;
}

export interface UserSettings {
  id?: number;
  currency: string;
  theme: 'light' | 'dark';
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm
}

export type ViewType = 'dashboard' | 'expenses' | 'import' | 'settings' | 'reports' | 'collaboration';

export interface DateRange {
  start: Date;
  end: Date;
}

export type SyncMessageType = 'INITIAL_SYNC' | 'ADD_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION' | 'ADD_CATEGORY' | 'DELETE_CATEGORY';

export interface SyncMessage {
  type: SyncMessageType;
  payload: any;
  timestamp: number;
  sourcePeerId: string;
}
