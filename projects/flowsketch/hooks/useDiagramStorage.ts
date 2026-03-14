import { useState, useEffect, useCallback, useRef } from 'react';
import { SavedDiagram } from '../types';
import { saveDiagram, getSavedDiagrams, deleteDiagram } from '../services/storageService';
import { INITIAL_DIAGRAM_CODE } from '../constants';

export const useDiagramStorage = () => {
  const [savedDiagrams, setSavedDiagrams] = useState<SavedDiagram[]>([]);
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const [diagramName, setDiagramName] = useState<string>('Untitled Diagram');
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load diagrams on mount
  useEffect(() => {
    setSavedDiagrams(getSavedDiagrams());
  }, []);

  const save = useCallback((code: string, name: string, id: string | null) => {
    const newId = id || crypto.randomUUID();
    const newDiagram: SavedDiagram = {
      id: newId,
      name,
      code,
      lastModified: Date.now(),
    };
    
    try {
      saveDiagram(newDiagram);
      setCurrentDiagramId(newId);
      setSavedDiagrams(getSavedDiagrams()); // Refresh list
      setLastSaved(Date.now());
      return newId;
    } catch (error) {
      console.error("Failed to save diagram:", error);
      alert("Failed to save diagram. Storage might be full.");
      return null;
    }
  }, []);

  const remove = useCallback((id: string) => {
    try {
      deleteDiagram(id);
      setSavedDiagrams((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete diagram:", error);
      alert("Failed to delete diagram.");
    }
  }, []);

  const createNew = useCallback(() => {
    setCurrentDiagramId(null);
    setDiagramName('Untitled Diagram');
    setLastSaved(null);
  }, []);

  const load = useCallback((diagram: SavedDiagram) => {
    setCurrentDiagramId(diagram.id);
    setDiagramName(diagram.name);
    setLastSaved(diagram.lastModified);
  }, []);

  return {
    savedDiagrams,
    currentDiagramId,
    diagramName,
    setDiagramName,
    lastSaved,
    autoSaveEnabled,
    setAutoSaveEnabled,
    save,
    remove,
    createNew,
    load,
    autoSaveTimerRef
  };
};
