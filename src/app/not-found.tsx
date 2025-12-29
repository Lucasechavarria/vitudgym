import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="text-9xl font-bold text-orange-500 mb-4">404</div>
                <h1 className="text-4xl font-bold text-white mb-4">Página no encontrada</h1>
                <p className="text-gray-400 mb-8">
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                    Volver al Dashboard
                </Link>
            </div>
        </div>
    );
}
