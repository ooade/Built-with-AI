import { useState, useCallback, useRef } from 'react';

export const useHistory = (initialState: string) => {
  const [history, setHistory] = useState<string[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToHistory = useCallback((newCode: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newCode);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const updateHistory = useCallback((newCode: string, immediate = false) => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }

    if (immediate) {
      addToHistory(newCode);
    } else {
      historyTimeoutRef.current = setTimeout(() => {
        addToHistory(newCode);
      }, 700);
    }
  }, [addToHistory]);

  const undo = useCallback(() => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
    
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }

    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  const resetHistory = useCallback((code: string) => {
    setHistory([code]);
    setHistoryIndex(0);
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }
  }, []);

  const currentHistoryItem = history[historyIndex];

  return {
    history,
    historyIndex,
    addToHistory,
    updateHistory,
    undo,
    redo,
    resetHistory,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    currentHistoryItem
  };
};
