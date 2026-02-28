import React from 'react';
import CrmKanban from '@/components/features/crm/CrmKanban';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CRM | Virtud Gym',
    description: 'Gestión de prospectos y embudo de ventas.',
};

export default function CrmPage() {
    return (
        <div className="p-6">
            <CrmKanban />
        </div>
    );
}
