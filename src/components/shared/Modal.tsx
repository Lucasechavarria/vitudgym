'use client';

import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'danger' | 'success';
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    actions,
    size = 'md',
    variant = 'default'
}: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg'
    };

    const variantClasses = {
        default: 'border-gray-700',
        danger: 'border-red-500/30',
        success: 'border-green-500/30'
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className={`bg-gray-800 rounded-lg p-6 w-full ${sizeClasses[size]} border ${variantClasses[variant]}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="mb-6">{children}</div>
                {actions && <div className="flex gap-4">{actions}</div>}
            </div>
        </div>
    );
}
