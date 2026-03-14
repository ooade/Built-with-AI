import React, { useState } from 'react';
import { SavedDiagram } from '../types';
import { Trash2, FileText, X, AlertTriangle, Check, X as XIcon } from 'lucide-react';

interface DiagramListProps {
  isOpen: boolean;
  onClose: () => void;
  diagrams: SavedDiagram[];
  onLoad: (diagram: SavedDiagram) => void;
  onDelete: (id: string) => void;
  currentDiagramId: string | null;
}

export const DiagramList: React.FC<DiagramListProps> = ({
  isOpen,
  onClose,
  diagrams,
  onLoad,
  onDelete,
  currentDiagramId,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
    setDeletingId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(null);
  };

  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="relative w-80 bg-white shadow-xl flex flex-col h-full border-r border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            My Diagrams
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {diagrams.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-400 text-sm">
              <p>No saved diagrams yet.</p>
              <p className="mt-1 text-xs">Create a diagram and click Save.</p>
            </div>
          ) : (
            diagrams.map((diagram) => (
              <div 
                key={diagram.id}
                className={`
                  group relative p-3 rounded-lg border transition-all cursor-pointer overflow-hidden
                  ${currentDiagramId === diagram.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }
                `}
                onClick={() => onLoad(diagram)}
              >
                <div className={`flex items-center justify-between w-full ${deletingId === diagram.id ? 'invisible' : ''}`}>
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className={`text-sm font-medium truncate ${currentDiagramId === diagram.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {diagram.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(diagram.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => initiateDelete(diagram.id, e)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {deletingId === diagram.id && (
                  <div className="absolute inset-0 bg-red-50 flex items-center justify-between px-3 z-10 animate-in fade-in duration-200">
                    <span className="text-xs font-medium text-red-700 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Delete?
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleConfirmDelete(diagram.id, e)}
                        className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-sm"
                        title="Confirm Delete"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className="p-1.5 bg-white text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors shadow-sm"
                        title="Cancel"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
