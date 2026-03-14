import { SavedDiagram } from '../types';

const STORAGE_KEY = 'flowsketch_diagrams';

export const saveDiagram = (diagram: SavedDiagram): void => {
  const diagrams = getSavedDiagrams();
  const existingIndex = diagrams.findIndex((d) => d.id === diagram.id);

  if (existingIndex >= 0) {
    diagrams[existingIndex] = diagram;
  } else {
    diagrams.push(diagram);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams));
};

export const getSavedDiagrams = (): SavedDiagram[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored).sort((a: SavedDiagram, b: SavedDiagram) => b.lastModified - a.lastModified);
  } catch (e) {
    console.error('Failed to parse saved diagrams', e);
    return [];
  }
};

export const deleteDiagram = (id: string): void => {
  const diagrams = getSavedDiagrams();
  const filtered = diagrams.filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const loadDiagram = (id: string): SavedDiagram | undefined => {
  const diagrams = getSavedDiagrams();
  return diagrams.find((d) => d.id === id);
};
