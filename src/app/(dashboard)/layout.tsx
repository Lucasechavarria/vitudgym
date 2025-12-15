/**
 * Layout for authenticated dashboard pages
 * Shared by: dashboard, booking, access-pass
 */

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dashboard-layout">
            {/* Aquí podrías agregar un navbar común para el dashboard */}
            {children}
        </div>
    );
}
