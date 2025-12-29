export interface Rank {
    id: number;
    name: string;
    minPoints: number;
    icon: string;
    color: string; // Tailwind class for text/bg colors
    benefits: string[];
}

export const RANKS: Rank[] = [
    { id: 1, name: 'Novato I', minPoints: 0, icon: '🌱', color: 'from-gray-400 to-gray-500', benefits: ['Acceso a la app'] },
    { id: 2, name: 'Novato II', minPoints: 500, icon: '🌿', color: 'from-gray-400 to-green-500', benefits: ['Avatar básico'] },
    { id: 3, name: 'Novato III', minPoints: 1000, icon: '🌳', color: 'from-green-400 to-green-600', benefits: ['Insignia de constancia'] },

    { id: 4, name: 'Aprendiz I', minPoints: 1500, icon: '🔨', color: 'from-orange-300 to-orange-400', benefits: ['Acceso a desafíos individuales'] },
    { id: 5, name: 'Aprendiz II', minPoints: 2200, icon: '⚒️', color: 'from-orange-400 to-orange-500', benefits: ['Seguimiento de RM'] },
    { id: 6, name: 'Aprendiz III', minPoints: 3000, icon: '⚔️', color: 'from-orange-500 to-red-500', benefits: ['Personalización de perfil'] },

    { id: 7, name: 'Guerrero I', minPoints: 4000, icon: '🛡️', color: 'from-red-400 to-red-600', benefits: ['Acceso a desafíos globales'] },
    { id: 8, name: 'Guerrero II', minPoints: 5200, icon: '🤺', color: 'from-red-500 to-rose-600', benefits: ['Descuento 5% en suplementos'] },
    { id: 9, name: 'Guerrero III', minPoints: 6500, icon: '🗡️', color: 'from-rose-500 to-pink-600', benefits: ['Insignia de Guerrero'] },

    { id: 10, name: 'Veterano I', minPoints: 8000, icon: '🏅', color: 'from-purple-400 to-purple-500', benefits: ['Clase gratuita mensual'] },
    { id: 11, name: 'Veterano II', minPoints: 9700, icon: '🎖️', color: 'from-purple-500 to-indigo-500', benefits: ['Prioridad en lista de espera'] },
    { id: 12, name: 'Veterano III', minPoints: 11500, icon: '🎗️', color: 'from-indigo-500 to-blue-600', benefits: ['Acceso a eventos exclusivos'] },

    { id: 13, name: 'Maestro I', minPoints: 13500, icon: '🥋', color: 'from-blue-400 to-cyan-400', benefits: ['Asesoría nutricional básica'] },
    { id: 14, name: 'Maestro II', minPoints: 15700, icon: '🧘', color: 'from-cyan-400 to-teal-400', benefits: ['Acceso a zona VIP'] },
    { id: 15, name: 'Maestro III', minPoints: 18000, icon: '🧠', color: 'from-teal-400 to-emerald-500', benefits: ['Título de Mentor'] },

    { id: 16, name: 'Campeón I', minPoints: 20500, icon: '🥉', color: 'from-yellow-600 to-yellow-700', benefits: ['Merchandising exclusivo'] },
    { id: 17, name: 'Campeón II', minPoints: 23200, icon: '🥈', color: 'from-gray-300 to-gray-400', benefits: ['Descuento 10% cuota'] },
    { id: 18, name: 'Campeón III', minPoints: 26000, icon: '🥇', color: 'from-yellow-400 to-yellow-500', benefits: ['Pase para un amigo'] },

    { id: 19, name: 'Titán I', minPoints: 29000, icon: '🗿', color: 'from-indigo-600 to-purple-700', benefits: ['Masaje deportivo mensual'] },
    { id: 20, name: 'Titán II', minPoints: 32500, icon: '🌋', color: 'from-purple-700 to-pink-700', benefits: ['Invitación a Galas Virtud'] },
    { id: 21, name: 'Titán III', minPoints: 36500, icon: '⚡', color: 'from-pink-600 to-rose-600', benefits: ['Suscripción Pro Gratis'] },

    { id: 22, name: 'Leyenda', minPoints: 41000, icon: '👑', color: 'from-yellow-300 via-orange-400 to-red-500', benefits: ['Foto en el Hall of Fame'] },
    { id: 23, name: 'Semidiós', minPoints: 46000, icon: '🌟', color: 'from-blue-400 via-purple-500 to-pink-500', benefits: ['Acceso ilimitado Medicina China'] },
    { id: 24, name: 'Deidad', minPoints: 52000, icon: '🌌', color: 'from-indigo-900 via-purple-900 to-black', benefits: ['Estacionamiento Preferencial'] },
    { id: 25, name: 'VIRTUD ABSOLUTA', minPoints: 60000, icon: '♾️', color: 'from-white via-blue-100 to-white text-black', benefits: ['Membresía Vitalicia'] },
];

export const POINT_EVENTS = {
    ATTENDANCE: 50,
    ROUTINE_COMPLETE: 100,
    STREAK_3_DAYS: 100,
    STREAK_7_DAYS: 300,
    STREAK_30_DAYS: 1500,
    NEW_PR: 150,
    BOOKING_MADE: 10,
    CHALLENGE_WON: 500,
    SOCIAL_SHARE: 25,
    PENALTY_MISSED_CLASS: -200,
    PENALTY_BROKEN_STREAK: -500,
};

export function getRankByPoints(points: number): Rank {
    // Find the highest rank where rank.minPoints <= points
    // Reverse loop to find the highest match efficiently
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (points >= RANKS[i].minPoints) {
            return RANKS[i];
        }
    }
    return RANKS[0]; // Default to first rank
}

export function getNextRank(currentRank: Rank): Rank | null {
    const currentIndex = RANKS.findIndex(r => r.id === currentRank.id);
    if (currentIndex === -1 || currentIndex === RANKS.length - 1) return null;
    return RANKS[currentIndex + 1];
}
