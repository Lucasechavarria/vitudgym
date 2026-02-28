'use client';

import { useGym } from '@/components/providers/GymProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Hook to check if a specific module is active for the current gym.
 * Can optionally redirect if access is denied.
 */
export function useModuleAccess(moduleName: string, redirectIfDenied = false) {
    const { hasModule, isLoading } = useGym();
    const router = useRouter();

    const isAllowed = hasModule(moduleName);

    useEffect(() => {
        if (!isLoading && !isAllowed && redirectIfDenied) {
            toast.error('Este módulo no está incluido en tu plan actual');
            router.push('/dashboard');
        }
    }, [isAllowed, isLoading, redirectIfDenied, router]);

    return { isAllowed, isLoading };
}
