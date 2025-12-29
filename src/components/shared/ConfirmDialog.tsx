'use client';

import { ReactNode } from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'success' | 'default';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'default',
    isLoading = false
}: ConfirmDialogProps) {
    const buttonVariants = {
        danger: 'bg-red-500 hover:bg-red-600',
        success: 'bg-green-500 hover:bg-green-600',
        default: 'bg-orange-500 hover:bg-orange-600'
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            variant={variant}
            actions={
                <>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 ${buttonVariants[variant]}`}
                    >
                        {isLoading ? 'Procesando...' : confirmText}
                    </button>
                </>
            }
        >
            <div className="text-gray-300">
                {typeof message === 'string' ? <p>{message}</p> : message}
            </div>
        </Modal>
    );
}
