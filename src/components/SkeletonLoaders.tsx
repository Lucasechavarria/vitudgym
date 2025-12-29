export function SkeletonCard() {
    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="h-12 bg-gray-700 rounded flex-1"></div>
                        <div className="h-12 bg-gray-700 rounded w-32"></div>
                        <div className="h-12 bg-gray-700 rounded w-24"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
                    <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-700 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-700 rounded w-1/3"></div>
                </div>
            ))}
        </div>
    );
}
