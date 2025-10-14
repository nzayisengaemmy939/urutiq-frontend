import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { AlertTriangle, Trash2, Play, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  icon?: 'delete' | 'execute' | 'warning';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon = 'warning',
  isLoading = false
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (icon) {
      case 'delete':
        return <Trash2 className="h-6 w-6 text-red-600" />;
      case 'execute':
        return <Play className="h-6 w-6 text-blue-600" />;
      case 'warning':
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getIcon()}
            {title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                {icon === 'delete' && <Trash2 className="h-4 w-4 mr-2" />}
                {icon === 'execute' && <Play className="h-4 w-4 mr-2" />}
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
