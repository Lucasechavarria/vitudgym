export interface ChatParticipant {
    id: string;
    rol: string;
    nombre_completo?: string;
    url_avatar?: string;
}

export interface ChatMessage {
    id: string;
    remitente_id: string;
    receptor_id: string;
    contenido: string;
    creado_en: string;
    is_pending?: boolean;
}
