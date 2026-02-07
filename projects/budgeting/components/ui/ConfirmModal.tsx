
import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';
import { TEXTS } from '../../textResources';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = TEXTS.COMMON.CONFIRM,
  cancelText = TEXTS.COMMON.CANCEL,
  variant = 'danger'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6 py-2">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl flex-shrink-0 ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'}`}>
            <AlertTriangle size={24} strokeWidth={2.5} />
          </div>
          <p className="text-gray-600 font-medium leading-relaxed pt-1">
            {message}
          </p>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
