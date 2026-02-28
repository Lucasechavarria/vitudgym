import React from 'react';
import BrandingSettings from '@/components/features/admin/BrandingSettings';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Personalización de Marca | Virtud Gym',
    description: 'Configura la identidad visual de tu gimnasio y la experiencia PWA.',
};

export default function BrandingPage() {
    return (
        <div className="p-6">
            <BrandingSettings />
        </div>
    );
}
