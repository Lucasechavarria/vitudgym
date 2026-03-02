import { redirect } from 'next/navigation';

export default function SaaSAdminRoot() {
    // Redirigir por defecto a la gestión de gimnasios para superadmins
    redirect('/saas-admin/gyms');
}
