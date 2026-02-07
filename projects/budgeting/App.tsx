
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { ViewType, Transaction, Category, SyncMessage, UserSettings } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Expenses } from './components/Expenses';
import { ImportView } from './components/ImportView';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Collaboration } from './components/Collaboration';
import { Toaster, toast } from 'react-hot-toast';
import { generateUUID } from './utils';
import { peerService } from './services/peerService';
import { TEXTS } from './textResources';

// Define Backup Interface
interface BackupData {
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings | undefined;
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);

  // Session State
  const [isHost, setIsHost] = useState(false);
  // Ref to track host status inside event listeners without dependency issues
  const isHostRef = useRef(false);
  const backupRef = useRef<BackupData | null>(null);
  // Ref to track the loading toast ID so we can dismiss it programmatically
  const loadingToastIdRef = useRef<string | null>(null);

  // Load Data from IndexedDB
  const allTransactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const allCategories = useLiveQuery(() => db.categories.toArray()) || [];
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  
  const currentCurrency = settings?.currency || 'GBP';

  // Unified Data View
  const { transactions, categories } = useMemo(() => {
    return { transactions: allTransactions, categories: allCategories };
  }, [allTransactions, allCategories]);

  // --- Sync Logic (Defined before useEffect to be captured) ---

  const sendInitialSync = async () => {
    const t = await db.transactions.toArray();
    const c = await db.categories.toArray();
    const s = await db.settings.toCollection().first();

    peerService.broadcast({
      type: 'INITIAL_SYNC',
      payload: { transactions: t, categories: c, settings: s },
      timestamp: Date.now(),
      sourcePeerId: peerService.peerId!
    });
  };

  const resolveCategoryId = async (remoteTx: Transaction): Promise<number> => {
    if (remoteTx.categorySyncId) {
       const localCat = await db.categories.where('syncId').equals(remoteTx.categorySyncId).first();
       if (localCat && localCat.id) return localCat.id;
    }
    // Fallback if syncId not present (legacy) or not found: 
    // Try to match by name and type
    // This is risky if names are edited, but better than nothing
    return remoteTx.categoryId; 
  };

  const handleSyncMessage = async (msg: SyncMessage) => {
    try {
      switch (msg.type) {
        case 'INITIAL_SYNC':
          const { transactions: remoteTransactions, categories: remoteCategories, settings: remoteSettings } = msg.payload;
          
          await (db as any).transaction('rw', db.transactions, db.categories, db.settings, async () => {
             // 1. Upsert categories first to ensure we can map IDs
             for (const c of remoteCategories) {
               const existing = await db.categories.where('syncId').equals(c.syncId).first();
               if (!existing) {
                 const { id, ...data } = c;
                 await db.categories.add(data);
               }
             }

             // 2. Upsert transactions with corrected category IDs and 'Peer' attribution
             for (const t of remoteTransactions) {
               // Find local category ID based on syncId
               let localCategoryId = t.categoryId;
               if (t.categorySyncId) {
                  const localCat = await db.categories.where('syncId').equals(t.categorySyncId).first();
                  if (localCat && localCat.id) localCategoryId = localCat.id;
               }

               const txData = {
                  ...t,
                  categoryId: localCategoryId,
                  createdBy: 'Peer' // Mark as peer data
               };

               const existing = await db.transactions.where('syncId').equals(t.syncId).first();
               if (existing) {
                 await db.transactions.update(existing.id!, { ...txData, id: existing.id });
               } else {
                 const { id, ...data } = txData; // Drop remote ID
                 await db.transactions.add(data);
               }
             }
             
             // 3. Update settings if needed
             if (remoteSettings) {
                const localSettings = await db.settings.toCollection().first();
                if (localSettings) {
                    await db.settings.update(localSettings.id!, { 
                        currency: remoteSettings.currency, 
                        theme: remoteSettings.theme 
                    });
                } else {
                    const { id, ...data } = remoteSettings;
                    await db.settings.add(data);
                }
             }
          });
          toast.success(TEXTS.COLLABORATION.TOAST.SYNC_SUCCESS);
          break;

        case 'ADD_TRANSACTION':
        case 'UPDATE_TRANSACTION':
          // Wrap in transaction for atomicity to prevent race conditions
          await (db as any).transaction('rw', db.transactions, db.categories, async () => {
              const remoteTx = msg.payload;
              
              // Resolve Category ID
              let localCategoryId = remoteTx.categoryId;
              if (remoteTx.categorySyncId) {
                  const localCat = await db.categories.where('syncId').equals(remoteTx.categorySyncId).first();
                  if (localCat && localCat.id) localCategoryId = localCat.id;
              }

              const txData = {
                  ...remoteTx,
                  categoryId: localCategoryId,
                  createdBy: 'Peer'
              };

              const existingT = await db.transactions.where('syncId').equals(remoteTx.syncId).first();
              if (existingT) {
                 await db.transactions.update(existingT.id!, { ...txData, id: existingT.id });
              } else {
                 const { id, ...data } = txData; 
                 await db.transactions.add(data);
              }
          });
          break;
          
        case 'DELETE_TRANSACTION':
           await (db as any).transaction('rw', db.transactions, async () => {
               const toDelete = await db.transactions.where('syncId').equals(msg.payload.syncId).first();
               if (toDelete) {
                  await db.transactions.delete(toDelete.id!);
               }
           });
           break;

         case 'ADD_CATEGORY':
            await (db as any).transaction('rw', db.categories, async () => {
                const existingCat = await db.categories.where('syncId').equals(msg.payload.syncId).first();
                if (!existingCat) {
                    const { id, ...data } = msg.payload;
                    await db.categories.add(data);
                }
            });
            break;
      }
    } catch (e) {
      console.error('Sync error', e);
    }
  };

  // Setup Peer Service Listeners
  // Optimized to run only once to avoid duplicate listeners
  useEffect(() => {
    const handleConnected = (remoteId: string) => {
      // Dismiss loading toast if exists
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = null;
      }

      setIsConnected(true);
      setConnectedPeerId(remoteId);
      toast.success(TEXTS.COLLABORATION.TOAST.CONNECTED);

      // Only host sends the initial state
      if (isHostRef.current && peerService.peerId) {
        sendInitialSync();
      }
    };

    const handleData = (msg: SyncMessage) => {
      handleSyncMessage(msg);
    };

    const handleError = (err: any) => {
      // Dismiss loading toast if exists
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = null;
      }

      console.error(err);
      toast.error(TEXTS.COLLABORATION.TOAST.CONN_ERROR);
      setIsConnected(false);
    };

    peerService.on('connected', handleConnected);
    peerService.on('data', handleData);
    peerService.on('error', handleError);

    return () => {
      peerService.off('connected', handleConnected);
      peerService.off('data', handleData);
      peerService.off('error', handleError);
    };
  }, []); // Empty dependency array ensures listeners are attached only once

  // --- Session Management & Backup ---

  const createBackup = async () => {
    const t = await db.transactions.toArray();
    const c = await db.categories.toArray();
    const s = await db.settings.toCollection().first();
    backupRef.current = { transactions: t, categories: c, settings: s };
    console.log('Local backup created');
  };

  const restoreBackup = async () => {
    if (!backupRef.current) return;
    
    try {
      await (db as any).transaction('rw', db.transactions, db.categories, db.settings, async () => {
        await db.transactions.clear();
        await db.categories.clear();
        await db.settings.clear();

        await db.transactions.bulkAdd(backupRef.current!.transactions);
        await db.categories.bulkAdd(backupRef.current!.categories);
        if (backupRef.current!.settings) {
          await db.settings.add(backupRef.current!.settings);
        }
      });
      console.log('Restored local data successfully');
    } catch (e) {
      console.error('Restore failed', e);
      toast.error('Failed to restore backup');
    }
  };

  const handleEndSession = async () => {
    // Dismiss loading toast if exists (e.g. user cancelled before connect)
    if (loadingToastIdRef.current) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }

    peerService.destroy();
    setPeerId(null);
    setIsConnected(false);
    setConnectedPeerId(null);

    if (!isHost) {
      // Collaborator: Auto restore original data
      await restoreBackup();
      toast.success(TEXTS.COLLABORATION.TOAST.RESTORE_SUCCESS);
    } else {
      // Host: Keep data as is (merged)
      toast.success(TEXTS.COLLABORATION.TOAST.SESSION_ENDED);
    }
    
    backupRef.current = null; // Clear backup
    setIsHost(false);
    isHostRef.current = false;
  };

  // Broadcast Helpers
  const broadcastChange = (type: any, payload: any) => {
    if (isConnected || peerService.peerId) {
      peerService.broadcast({
        type,
        payload,
        timestamp: Date.now(),
        sourcePeerId: peerService.peerId || 'client'
      });
    }
  };

  // CRUD Operations
  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'modifiedAt' | 'syncId'>) => {
    try {
      // Get category to find syncId
      const category = await db.categories.get(data.categoryId);
      
      const newTx: any = {
        ...data,
        syncId: generateUUID(),
        categorySyncId: category?.syncId, // Important: Add sync ref
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        createdBy: 'Me' // Mark as local
      };
      await db.transactions.add(newTx);
      broadcastChange('ADD_TRANSACTION', newTx);
      
      const typeLabel = data.type === 'income' ? TEXTS.EXPENSES.MODAL.INCOME : TEXTS.EXPENSES.MODAL.EXPENSE;
      toast.success(TEXTS.EXPENSES.TOAST.ADD_SUCCESS(typeLabel));
    } catch (error) {
      console.error(error);
      toast.error(TEXTS.EXPENSES.TOAST.ADD_ERROR);
    }
  };

  const editTransaction = async (id: number, data: Partial<Transaction>) => {
    try {
      // If categoryId changed, update categorySyncId
      let updateData: any = { ...data, modifiedAt: Date.now() };
      
      if (data.categoryId) {
          const category = await db.categories.get(data.categoryId);
          if (category) {
              updateData.categorySyncId = category.syncId;
          }
      }

      await db.transactions.update(id, updateData);
      const updated = await db.transactions.get(id);
      if (updated) broadcastChange('UPDATE_TRANSACTION', updated);
      toast.success(TEXTS.EXPENSES.TOAST.UPDATE_SUCCESS);
    } catch (error) {
      toast.error(TEXTS.EXPENSES.TOAST.UPDATE_ERROR);
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      const tx = await db.transactions.get(id);
      if (tx) {
        await db.transactions.delete(id);
        broadcastChange('DELETE_TRANSACTION', { syncId: tx.syncId });
        toast.success(TEXTS.EXPENSES.TOAST.DELETE_SUCCESS);
      }
    } catch (error) {
      toast.error(TEXTS.EXPENSES.TOAST.DELETE_ERROR);
    }
  };

  const bulkDeleteTransactions = async (ids: number[]) => {
    try {
      const txs = await db.transactions.where('id').anyOf(ids).toArray();
      await db.transactions.bulkDelete(ids);
      txs.forEach(tx => broadcastChange('DELETE_TRANSACTION', { syncId: tx.syncId }));
      toast.success(TEXTS.EXPENSES.TOAST.BULK_DELETE_SUCCESS(ids.length));
    } catch (error) {
      console.error(error);
      toast.error(TEXTS.EXPENSES.TOAST.BULK_DELETE_ERROR);
    }
  };

  const handleBulkImport = async (newTransactions: Omit<Transaction, 'id' | 'createdAt' | 'modifiedAt' | 'syncId'>[]) => {
    try {
      const now = Date.now();
      
      // We need to resolve category sync IDs for all imports
      const enrichedTransactions = [];
      for (const t of newTransactions) {
          const category = await db.categories.get(t.categoryId);
          enrichedTransactions.push({
            ...t,
            syncId: generateUUID(),
            categorySyncId: category?.syncId,
            createdAt: now,
            modifiedAt: now,
            createdBy: 'Me'
          });
      }
      
      await db.transactions.bulkAdd(enrichedTransactions as any);
      enrichedTransactions.forEach(tx => broadcastChange('ADD_TRANSACTION', tx));
      toast.success(TEXTS.EXPENSES.TOAST.IMPORT_SUCCESS(newTransactions.length));
      setCurrentView('expenses');
    } catch (error) {
      console.error(error);
      toast.error(TEXTS.EXPENSES.TOAST.IMPORT_ERROR);
    }
  };

  // Collaboration Handlers
  const handleStartSession = async () => {
    setIsHost(true);
    isHostRef.current = true;
    await createBackup(); // Backup before starting
    
    try {
      // Await the promise to ensure we have an ID or catch an error
      const id = await peerService.initialize();
      setPeerId(id);
      toast.success(TEXTS.COLLABORATION.TOAST.STARTED);
    } catch (e) {
      console.error("Failed to start session:", e);
      toast.error("Could not generate connection code. Please check your internet connection.");
      setIsHost(false);
      isHostRef.current = false;
      throw e; // Re-throw to allow component to stop loading
    }
  };

  const handleJoinSession = async (remoteId: string) => {
    setIsHost(false);
    isHostRef.current = false;
    await createBackup(); // Backup before joining

    // Clear local DB to show only peer data
    await (db as any).transaction('rw', db.transactions, db.categories, db.settings, async () => {
        await db.transactions.clear();
        await db.categories.clear();
        await db.settings.clear();
    });

    try {
      const id = await peerService.initialize();
      setPeerId(id); 
      peerService.connect(remoteId);
      // Store the toast ID so we can dismiss it later
      loadingToastIdRef.current = toast.loading(TEXTS.COLLABORATION.TOAST.CONNECTING);
    } catch (e) {
      console.error("Failed to join session:", e);
      toast.error("Could not connect to peer server. Please try again.");
      await restoreBackup();
    }
  };

  // Notification Check
  useEffect(() => {
    if (settings?.reminderEnabled && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, [settings?.reminderEnabled]);

  const renderView = () => {
    if (!allCategories.length && !backupRef.current) return <div className="p-8 text-center text-gray-500">{TEXTS.APP.LOADING_DB}</div>;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard expenses={transactions} categories={categories} currency={currentCurrency} />;
      case 'expenses':
        return (
          <Expenses 
            expenses={transactions} 
            categories={categories}
            onAdd={addTransaction}
            onEdit={editTransaction}
            onDelete={deleteTransaction}
            onBulkDelete={bulkDeleteTransactions}
            currency={currentCurrency}
          />
        );
      case 'import':
        return <ImportView categories={categories} onImport={handleBulkImport} />;
      case 'reports':
        return <Reports transactions={transactions} categories={categories} currency={currentCurrency} />;
      case 'collaboration':
        return (
          <Collaboration 
            onStartSession={handleStartSession}
            onJoinSession={handleJoinSession}
            onEndSession={handleEndSession}
            peerId={peerId}
            isConnected={isConnected}
            connectedPeerId={connectedPeerId}
          />
        );
      case 'settings':
         // In empty state (collaborator before sync), show basic loading or null
         return settings ? <Settings settings={settings} categories={categories} /> : <div className="p-8 text-center text-gray-400">{TEXTS.APP.LOADING_SETTINGS}</div>;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <h2 className="text-xl font-medium mb-2">{TEXTS.APP.PAGE_NOT_FOUND}</h2>
          </div>
        );
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <Layout currentView={currentView} onNavigate={setCurrentView}>
        {renderView()}
      </Layout>
    </>
  );
}

export default App;
