import React, { useState, useEffect, useRef } from 'react';
import { DiagramPreview, DiagramPreviewRef } from './components/DiagramPreview';
import { CodeEditor } from './components/CodeEditor';
import { DiagramList } from './components/DiagramList';
import { SyntaxReferencePanel } from './components/SyntaxHelper';
import { INITIAL_DIAGRAM_CODE } from './constants';
import { Undo, Redo, Github, Save, FolderOpen, Plus, CheckCircle2, Share2 } from 'lucide-react';
import { SavedDiagram } from './types';
import { useDiagramStorage } from './hooks/useDiagramStorage';
import { useHistory } from './hooks/useHistory';
import { encodeState, decodeState } from './utils/share';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

const App: React.FC = () => {
  // Initialize state from URL (Hash preferred, fallback to Query)
  const [diagramCode, setDiagramCode] = useState<string>(() => {
    // Check Hash first (new format)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const state = hashParams.get('state');
      if (state) {
        const decoded = decodeState(state);
        if (decoded) return decoded.code;
      }
    }
    
    // Check Query (legacy format)
    const searchParams = new URLSearchParams(window.location.search);
    const queryState = searchParams.get('state');
    if (queryState) {
      const decoded = decodeState(queryState);
      if (decoded) return decoded.code;
    }

    return INITIAL_DIAGRAM_CODE;
  });
  
  const [isDiagramListOpen, setIsDiagramListOpen] = useState(false);
  const diagramPreviewRef = useRef<DiagramPreviewRef>(null);

  const {
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
  } = useDiagramStorage();

  const {
    history,
    historyIndex,
    addToHistory,
    updateHistory,
    undo,
    redo,
    resetHistory,
    canUndo,
    canRedo,
    currentHistoryItem
  } = useHistory(diagramCode);

  // Sync state to URL Hash when diagramCode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const state = encodeState({ code: diagramCode });
      const newHash = `state=${state}`;
      window.history.replaceState(null, '', `${window.location.pathname}#${newHash}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [diagramCode]);

  const handleSave = () => {
    const inputName = prompt('Enter a name for this diagram:', diagramName);
    if (inputName === null) return; // User cancelled
    
    const name = inputName.trim() || 'Untitled Diagram';
    setDiagramName(name);
    
    const newId = save(diagramCode, name, currentDiagramId);
    if (newId) {
      alert('Diagram saved successfully!');
    }
  };

  const handleLoad = (diagram: SavedDiagram) => {
    setDiagramCode(diagram.code);
    load(diagram);
    resetHistory(diagram.code);
    setIsDiagramListOpen(false);
  };

  const handleDelete = (id: string) => {
    remove(id);
    if (currentDiagramId === id) {
      handleNew();
    }
  };

  const handleNew = () => {
    setDiagramCode('');
    createNew();
    resetHistory('');
  };

  const updateDiagram = (newCode: string, saveToHistory = true) => {
    setDiagramCode(newCode);
    updateHistory(newCode, saveToHistory);
  };

  const handleUndo = () => {
    if (diagramCode !== currentHistoryItem) {
      setDiagramCode(currentHistoryItem);
      return;
    }

    const previousCode = undo();
    if (previousCode !== null) {
      setDiagramCode(previousCode);
    }
  };

  const handleRedo = () => {
    const nextCode = redo();
    if (nextCode !== null) {
      setDiagramCode(nextCode);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(diagramCode);
      // Optional: Show toast
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-gray-900 font-sans overflow-hidden">
      <DiagramList 
        isOpen={isDiagramListOpen}
        onClose={() => setIsDiagramListOpen(false)}
        diagrams={savedDiagrams}
        onLoad={handleLoad}
        onDelete={handleDelete}
        currentDiagramId={currentDiagramId}
      />
      
      {/* Header - Mermaid Live Style */}
      <header className="h-14 bg-[#2D3142] border-b border-gray-700 flex items-center justify-between px-4 shrink-0 z-20 shadow-md text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold font-mono shadow-lg">
              FS
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden sm:block text-gray-100">FlowSketch</h1>
          </div>
          
          <div className="h-6 w-px bg-gray-600 mx-2 hidden sm:block"></div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDiagramListOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <FolderOpen size={16} />
              <span className="hidden sm:inline">Diagrams</span>
            </button>
            <button 
              onClick={handleNew}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1">
             <button 
               onClick={handleUndo} 
               disabled={!canUndo && diagramCode === currentHistoryItem}
               className="p-1.5 rounded-md hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-gray-300"
               title="Undo"
             >
               <Undo size={18} />
             </button>
             <button 
               onClick={handleRedo} 
               disabled={!canRedo}
               className="p-1.5 rounded-md hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-gray-300"
               title="Redo"
             >
               <Redo size={18} />
             </button>
             <button 
               onClick={() => handleSave(true)}
               className="p-1.5 rounded-md hover:bg-gray-700 transition-all text-gray-300 relative"
               title="Save"
             >
               <Save size={18} />
               {!autoSaveEnabled && (
                 (currentDiagramId && diagramCode !== savedDiagrams.find(d => d.id === currentDiagramId)?.code) ||
                 (!currentDiagramId && (diagramCode !== INITIAL_DIAGRAM_CODE || diagramName !== 'Untitled Diagram'))
               ) && (
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-gray-800"></span>
               )}
             </button>
           </div>

           <div className="h-6 w-px bg-gray-600 mx-1 hidden sm:block"></div>

           <a 
             href="https://github.com" 
             target="_blank" 
             rel="noreferrer"
             className="text-gray-400 hover:text-white transition-colors p-1"
           >
             <Github size={20} />
           </a>
        </div>
      </header>

      {/* Main Content - Resizable Panels with Allotment */}
      <main className="flex-1 overflow-hidden relative bg-gray-100">
        <Allotment>
          <Allotment.Pane minSize={300} preferredSize="40%">
            <div className="flex flex-col h-full bg-white border-r border-gray-200">
              <Allotment vertical>
                <Allotment.Pane minSize={100}>
                  <div className="flex flex-col h-full">
                    <div className="flex-1 relative overflow-hidden">
                      <CodeEditor 
                        code={diagramCode} 
                        onChange={(code) => updateDiagram(code, false)}
                        onClear={() => updateDiagram('', true)}
                        onCopy={handleCopyCode}
                      />
                    </div>
                  </div>
                </Allotment.Pane>
                
                <Allotment.Pane 
                  minSize={150} 
                  preferredSize={250}
                  maxSize={500}
                >
                  <SyntaxReferencePanel 
                    onInsert={(code) => updateDiagram(code)} 
                  />
                </Allotment.Pane>
              </Allotment>
            </div>
          </Allotment.Pane>
          
          <Allotment.Pane minSize={300}>
            <div className="flex flex-col h-full bg-white">
              <div className="h-10 border-b border-gray-200 flex items-center justify-between px-3 bg-gray-50 shrink-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</span>
                <div className="flex items-center gap-2">
                   {lastSaved && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden bg-slate-50">
                <DiagramPreview 
                  ref={diagramPreviewRef}
                  code={diagramCode} 
                />
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </main>
    </div>
  );
};

export default App;