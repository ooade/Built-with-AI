import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div 
        ref={modalRef}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-gray-100"
        role="dialog" 
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};