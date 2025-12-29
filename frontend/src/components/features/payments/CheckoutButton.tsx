'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CheckoutButtonProps {
    userId: string;
    userEmail: string;
    amount: number;
    concept: string;
}

/**
 * Botón para iniciar checkout de MercadoPago
 * Soporta todos los métodos de pago incluyendo transferencias bancarias
 */
export default function CheckoutButton({
    userId,
    userEmail,
    amount,
    concept
}: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/payments/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    userEmail,
                    title: concept,
                    price: amount,
                    quantity: 1
                })
            });

            const data = await response.json();

            if (data.success && data.init_point) {
                // Redirigir al checkout de MercadoPago
                window.location.href = data.init_point;
            } else {
                alert('Error al crear el checkout: ' + data.error);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar el pago');
            setLoading(false);
        }
    };

    return (
        <motion.button
            onClick={handleCheckout}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            className={`px-8 py-4 rounded-xl font-bold text-lg ${loading
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500'
                }`}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando...
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    💳 Pagar ${amount.toLocaleString('es-AR')}
                </span>
            )}
        </motion.button>
    );
}
